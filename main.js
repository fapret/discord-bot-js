const Discord = require('discord.js');
const {Intents} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

/* Interfaz de lectura de consola */
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/* Clientes Discord */
const DiscordClients = new Map;
DiscordClients.set("main", new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] }));
const mainClient = DiscordClients.get("main");

/* Carga los modulos */
d = new Date();
console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['module-load-started']);
mainClient.modules = new Discord.Collection();
const getModules = function(dirPath, arrayOfModules){
    files = fs.readdirSync(dirPath);
    arrayOfModules = arrayOfModules || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()){
            arrayOfModules = getModules(dirPath + '/' + file, arrayOfModules);
        } else if(file == 'main.js'){
            arrayOfModules.push(path.join(__dirname, dirPath, '/', file));
            const module = require(dirPath + '/' + file);
            mainClient.modules.set(module.name, module);
        }
    });

    return arrayOfModules;
};
getModules('./bot_modules');
d = new Date();
console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['modules-loaded']);
mainClient.modules.forEach(key =>{
    console.log('-' + key.name);
});
console.log('--------------------');

/* Obtiene la informacion de la guild que se le pasa como parametro, si no existe la crea */
const getguild = function(guild){
    var getguilddata;
    if (!fs.existsSync('./guilds/')) {
        fs.mkdirSync("./guilds/");
        d = new Date();
        console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['created-guilds-directory']);
    }
    try {
        getguilddata = fs.readFileSync('./guilds/' + guild + '.json');
    } catch (error){
        if (error.code === 'ENOENT') {
            d = new Date();
            console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['guild-not-registered']+ ' ' + guild);
            let newguild = {
                ID: guild,
                prefix: config['default-prefix'],
                operatorRole: '00000000000000000',
                DisabledModules: ['welcome'],
                Aliases: ['t!']
            }
            try {
                fs.writeFileSync('./guilds/' + guild + '.json', JSON.stringify(newguild, null, 4));
                getguilddata = fs.readFileSync('./guilds/' + guild + '.json');
            } catch (err){
                console.log(err);
                return undefined;
            }
        } else {
            console.log(error);
            return undefined;
        }
    }
    return getguilddata;
};

/* comandos */
mainClient.on('messageCreate', message => {
    if(message.author.bot){return};
    if((message.guild == undefined) || (message.guild == null)){return};
    const guild = message.guild.id;
    var getguilddata = getguild(guild);
    if (getguilddata == undefined){
        return;
    };
    var guilddata = JSON.parse(getguilddata);
    var prefix = guilddata.prefix;
    guilddata.Aliases.forEach(alias => {
        if(message.content.startsWith(alias)){
            prefix = alias;
        }
    });
    if(message.content.startsWith(prefix)){
        var args = message.content.slice(prefix.length).split(/ +/);
        var command = args.shift().toLowerCase();
        if(guilddata.DisabledModules.includes(command)){
            message.reply(config.Messages['disabled-module']);
        } else if(mainClient.modules.has(command)){
            mainClient.modules.get(command).execute(message, guilddata, args);
        } else {
            message.reply(config.Messages['unknown-command']);
        }
    } else {
        //estos modulos tienen comportamientos especiales y tienen su propio manejo de comandos cuando no inician con el prefix
        if(!guilddata.DisabledModules.includes('custommsg')){
            mainClient.modules.get('custommsg').execute(message, guilddata);
        }
    }
});

/* Acciones cuando un usuario hace algo en un canal de voz */
mainClient.on('voiceStateUpdate', (oldstate, newstate) => {
    if(oldstate.guild.id != newstate.guild.id){
        d = new Date();
        console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] error >> ' + 'newstate tiene diferente guild que oldstate, REVISAR CODIGO');
        console.log('oldstate guild: ' + oldstate.guild.id);
        console.log('newstate guild: ' + newstate.guild.id);
        return;
    };
    
    const guild = oldstate.guild.id;
    var getguilddata = getguild(guild);
    if (getguilddata == undefined){
        return;
    };
    var guilddata = JSON.parse(getguilddata);

    mainClient.modules.forEach(module => {
        if(!guilddata.DisabledModules.includes(module.name)){
            module.voiceStateUpdate(guilddata, oldstate, newstate);
        }
    });
});

/* Se ejecuta cuando alguien se une a la guild */
mainClient.on('guildMemberAdd', member => {
    const guild = member.guild.id;
    var getguilddata = getguild(guild);
    if (getguilddata == undefined){
        return;
    };
    var guilddata = JSON.parse(getguilddata);

    mainClient.modules.forEach(module => {
        if(!guilddata.DisabledModules.includes(module.name)){
            module.OnMemberJoin(guilddata, member);
        }
    });
});

/* Se ejecuta cuando alguien presiona un boton */
mainClient.on('interactionCreate', button => {
    if((button.guild == undefined) || (button.guild == null)){return};
    const guild = button.guild.id;
    var getguilddata = getguild(guild);
    if (getguilddata == undefined){
        return;
    };
    var guilddata = JSON.parse(getguilddata);

    mainClient.modules.forEach(module => {
        if(!guilddata.DisabledModules.includes(module.name)){
            module.onButtonClick(guilddata, button);
        }
    });
});

/* Se ejecuta cuando el bot ya esta activo */
mainClient.on('ready', () => {
    d = new Date();
    console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['bot-loaded']);
    mainClient.user.setActivity(config.activity.value, { type: config.activity.type });
    d = new Date();
    console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['activity-setted'] + config.activity.value + ', type: ' + config.activity.type);
});

/* Inicia sesion con los bots */
mainClient.login(config['bot-token']);

/* Comandos de la consola */
rl.on('line', (input) => {
    if(input.toLowerCase().startsWith("help")){
        d = new Date();
        console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + "Comandos de consola disponibles:");
        console.log("help : Este mensaje");
        console.log("updateActivity : Actualiza la actividad con la que se encuentra en config.json");
        console.log("flushModules : Recarga todos los modulos");
    } else if(input.toLowerCase().startsWith("updateactivity")){
        mainClient.user.setActivity(config.activity.value, { type: config.activity.type });
        d = new Date();
        console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['activity-setted'] + config.activity.value + ', type: ' + config.activity.type);
    } else if(input.toLowerCase().startsWith("flushmodules")){
        d = new Date();
        console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['module-load-started']);
        mainClient.modules = new Discord.Collection();
        getModules('./bot_modules');
        d = new Date();
        console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['modules-loaded']);
        mainClient.modules.forEach(key =>{
            console.log('-' + key.name);
        });
        console.log('--------------------');
    }
});