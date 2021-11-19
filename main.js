const Discord = require('discord.js');
const {Intents} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const { DataInterface } = require('./modules/datamanager.js');

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
console.log('[' + timeParser(d) + '] ' + config.Messages['plugin-load-started']);
mainClient.plugins = new Discord.Collection();
const getPlugins = function(dirPath, arrayOfPlugins){
    files = fs.readdirSync(dirPath);
    arrayOfPlugins = arrayOfPlugins || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()){
            arrayOfPlugins = getPlugins(dirPath + '/' + file, arrayOfPlugins);
        } else if(file == 'main.js'){
            arrayOfPlugins.push(path.join(__dirname, dirPath, '/', file));
            const plugin = require(dirPath + '/' + file);
            mainClient.plugins.set(plugin.name, plugin);
        }
    });

    return arrayOfPlugins;
};
getPlugins('./plugins');
d = new Date();
console.log('[' + timeParser(d) + '] ' + config.Messages['plugins-loaded']);
mainClient.plugins.forEach(key =>{
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
                DisabledPlugins: ['welcome','newworld'],
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
    var getguilddata = getguild(guildId);
    if (getguilddata == undefined){
        return;
    };
    var guilddata = JSON.parse(getguilddata);
    try{
        commandstodelete = await commands.fetch();
        commandstodelete.forEach(async cmd => {
            await commands.delete(cmd);
        });
        mainClient.plugins.forEach(key => {
            if(!guilddata.DisabledPlugins.includes(key.name)){
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
    dataManager = new DataInterface(guild);
    guilddata = dataManager.GuildDataManager;
    var prefix = guilddata.getProperty('prefix');
    guilddata.getProperty('Aliases').forEach(alias => {
        if(message.content.startsWith(alias)){
            prefix = alias;
        }
    });
    if(message.content.startsWith(prefix)){
        var args = message.content.slice(prefix.length).split(/ +/);
        var command = args.shift().toLowerCase();
        if(guilddata.getProperty('DisabledPlugins').includes(command)){
            message.reply(config.Messages['disabled-plugin']);
        } else if(mainClient.plugins.has(command)){
            if(typeof mainClient.plugins.get(command).onMessage === 'function'){
                mainClient.plugins.get(command).onMessage(message, new DataInterface(guild, command), args);
            } else {
                message.reply(config.Messages['plugin-doesnt-handle-commands']);
            }
        } else {
            message.reply(config.Messages['unknown-command']);
        }
    } else {
        //estos plugins tienen comportamientos especiales y tienen su propio manejo de comandos cuando no inician con el prefix
        if(!guilddata.getProperty('DisabledPlugins').includes('custommsg')){
            if(mainClient.plugins.get('custommsg') != undefined){
                if(typeof mainClient.plugins.get('custommsg').onMessage === 'function'){
                    mainClient.plugins.get('custommsg').onMessage(message, new DataInterface(guild, 'custommsg'));
                }
            }
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

    mainClient.plugins.forEach(plugin => {
        if(!guilddata.DisabledPlugins.includes(plugin.name)){
            if(typeof plugin.voiceStateUpdate === 'function'){
                plugin.voiceStateUpdate(guilddata, oldstate, newstate);
            }
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

    mainClient.plugins.forEach(plugin => {
        if(!guilddata.DisabledPlugins.includes(plugin.name)){
            if(typeof plugin.OnMemberJoin === 'function'){
                plugin.OnMemberJoin(guilddata, member);
            }
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

    mainClient.plugins.forEach(plugin => {
        if(!guilddata.DisabledPlugins.includes(plugin.name)){
            if(interaction.isButton()){
                if (typeof plugin.onButtonClick === 'function'){
                    plugin.onButtonClick(guilddata, interaction);
                }
            } else if(interaction.isCommand()){
                if (typeof plugin.onSlashCommand === 'function'){
                    plugin.onSlashCommand(guilddata, interaction);
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

/* Comando de consola flushplugins */
const cmdflushplugins = function(){
    d = new Date();
    console.log('[' + timeParser(d) + '] ' + config.Messages['plugin-load-started']);
    mainClient.plugins = new Discord.Collection();
    const deletePlugins = function(dirPath, arrayOfPlugins){
        files = fs.readdirSync(dirPath);
        arrayOfPlugins = arrayOfPlugins || [];
    
        files.forEach(function(file) {
            if (fs.statSync(dirPath + '/' + file).isDirectory()){
                arrayOfPlugins = deletePlugins(dirPath + '/' + file, arrayOfPlugins);
            } else if(file == 'main.js'){
                arrayOfPlugins.push(path.join(__dirname, dirPath, '/', file));
                delete require.cache[require.resolve(dirPath + '/' + file)];
            }
        });
    
        return arrayOfPlugins;
    };
    deletePlugins('./plugins');
    getPlugins('./plugins');
    d = new Date();
    console.log('[' + timeParser(d) + '] ' + config.Messages['plugins-loaded']);
    mainClient.plugins.forEach(key =>{
        console.log('-' + key.name);
    });
    console.log(config.Messages['flushplugins-doesnt-refresh-slashcommands']);
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
        case 'flushplugins':
            cmdflushplugins();
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