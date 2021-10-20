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

/* Parser de fechas */
const timeParser = function(date){
    day = (date.getDay() < 10 ? '0' : '') + date.getDay();
    month = (date.getMonth() < 10 ? '0' : '') + date.getMonth();
    hour = (date.getHours() < 10 ? '0' : '') + date.getHours();
    minute = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    second = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    return day + "/" + month + ' ' + hour + ':' + minute + ':' + second;
}

/* Clientes Discord */
const DiscordClients = new Map;
DiscordClients.set("main", new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] }));
const mainClient = DiscordClients.get("main");

/* Carga los modulos */
d = new Date();
console.log('[' + timeParser(d) + '] ' + config.Messages['module-load-started']);
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
console.log('[' + timeParser(d) + '] ' + config.Messages['modules-loaded']);
mainClient.modules.forEach(key =>{
    console.log('- ' + key.name);
});
console.log('--------------------');

/* Obtiene la informacion de la guild que se le pasa como parametro, si no existe la crea */
const getguild = function(guild){
    var getguilddata;
    if (!fs.existsSync('./guilds/')) {
        fs.mkdirSync("./guilds/");
        d = new Date();
        console.log('[' + timeParser(d) + '] ' + config.Messages['created-guilds-directory']);
    }
    try {
        getguilddata = fs.readFileSync('./guilds/' + guild + '.json');
    } catch (error){
        if (error.code === 'ENOENT') {
            d = new Date();
            console.log('[' + timeParser(d) + '] ' + config.Messages['guild-not-registered']+ ' ' + guild);
            let newguild = {
                ID: guild,
                prefix: config['default-prefix'],
                operatorRole: '00000000000000000',
                DisabledModules: ['welcome','newworld'],
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

/* Funcion para registrar y/o actualizar comandos en una guild en especifico */
const flushSlashCommands = async function(guildId){
    let commands;
    const guild = mainClient.guilds.cache.get(guildId);
    if(guild){
        commands = guild?.commands;
    } else {
        return;
    }
    var getguilddata = getguild(guild);
    if (getguilddata == undefined){
        return;
    };
    var guilddata = JSON.parse(getguilddata);
    try{
        commandstodelete = await commands.fetch();
        commandstodelete.forEach(async cmd => {
            await commands.delete(cmd);
        });
        mainClient.modules.forEach(key => {
            if(!guilddata.DisabledModules.includes(key.name)){
                if(key.slashCommands != undefined && key.slashCommands != null){
                    key.slashCommands.forEach(command => {
                        command.name = command.name.toLowerCase();
                        commands.create(command);
                    })
                }
            }
        });
        d = new Date();
        console.log('[' + timeParser(d) + '] ' + config.Messages['slashCommands-loaded'] + guildId);
    } catch {
        d = new Date();
        console.log('[' + timeParser(d) + '] ' + config.Messages['guild-has-no-permission-for-slashCommands'] + guildId);
    }
}

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
        console.log('[' + timeParser(d) + '] error >> ' + 'newstate tiene diferente guild que oldstate, REVISAR CODIGO');
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

/* Se ejecuta cuando alguien genera una interaccion como presionar un boton */
mainClient.on('interactionCreate', async (interaction) => {
    if((interaction.guild == undefined) || (interaction.guild == null)){return};
    const guild = interaction.guild.id;
    var getguilddata = getguild(guild);
    if (getguilddata == undefined){
        return;
    };
    var guilddata = JSON.parse(getguilddata);

    mainClient.modules.forEach(module => {
        if(!guilddata.DisabledModules.includes(module.name)){
            if(interaction.isButton()){
                module.onButtonClick(guilddata, interaction);
            } else if(interaction.isCommand()){
                if (module.onSlashCommand != undefined){
                    module.onSlashCommand(guilddata, interaction);
                }
            }
        }
    });
});

/* Se ejecuta cuando el bot ya esta activo */
mainClient.on('ready', () => {
    d = new Date();
    console.log('[' + timeParser(d) + '] ' + config.Messages['bot-loaded']);
    mainClient.user.setActivity(config.activity.value, { type: config.activity.type });
    d = new Date();
    console.log('[' + timeParser(d) + '] ' + config.Messages['activity-setted'] + config.activity.value + ', type: ' + config.activity.type);
    d = new Date();
    console.log('[' + timeParser(d) + '] ' + config.Messages['loading-slashcommands']);
    mainClient.guilds.cache.forEach(guild => {
        flushSlashCommands(guild.id);
    });
});

/* Inicia sesion con los bots */
mainClient.login(config['bot-token']);

/* Comando de consola flushmodules */
const cmdflushmodules = function(){
    d = new Date();
    console.log('[' + timeParser(d) + '] ' + config.Messages['module-load-started']);
    //delete mainClient.modules;
    mainClient.modules = new Discord.Collection();
    const deleteModules = function(dirPath, arrayOfModules){
        files = fs.readdirSync(dirPath);
        arrayOfModules = arrayOfModules || [];
    
        files.forEach(function(file) {
            if (fs.statSync(dirPath + '/' + file).isDirectory()){
                arrayOfModules = deleteModules(dirPath + '/' + file, arrayOfModules);
            } else if(file == 'main.js'){
                arrayOfModules.push(path.join(__dirname, dirPath, '/', file));
                delete require.cache[require.resolve(dirPath + '/' + file)];
            }
        });
    
        return arrayOfModules;
    };
    deleteModules('./bot_modules');
    getModules('./bot_modules');
    d = new Date();
    console.log('[' + timeParser(d) + '] ' + config.Messages['modules-loaded']);
    mainClient.modules.forEach(key =>{
        console.log('-' + key.name);
    });
    console.log(config.Messages['flushmodules-doesnt-refresh-slashcommands']);
    console.log('--------------------');
}

/* Comandos de la consola */
rl.on('line', (input) => {
    switch (input.toLowerCase()){
        case 'help':
            d = new Date();
            console.log('[' + timeParser(d) + '] ' + "Comandos de consola disponibles:");
            for(helpCommandText of config.Messages['console-help']){
                console.log(helpCommandText);
            }
            console.log('--------------------');
            break;
        case 'updateactivity':
            mainClient.user.setActivity(config.activity.value, { type: config.activity.type });
            d = new Date();
            console.log('[' + timeParser(d) + '] ' + config.Messages['activity-setted'] + config.activity.value + ', type: ' + config.activity.type);    
            break;
        case 'flushmodules':
            cmdflushmodules();
            break;
        case 'flushallslashcommands':
            mainClient.guilds.cache.forEach(guild => {
                flushSlashCommands(guild.id);
            });
            break;
        default:
            break;
    }
});