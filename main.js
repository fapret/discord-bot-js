/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán establecidoen todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const Discord = require('discord.js');
const {GatewayIntentBits, Partials} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const { DataInterface } = require('./modules/datamanager.js');
const { PluginLangManager, GlobalLangManager } = require('./modules/langmanager.js');
const { timeParser, Mutex, logError } = require('./modules/microlib.js');
require('dotenv').config();

//Lee los mensajes en el idioma establecido
const messages = GlobalLangManager.read(process.env.APPLANG);

/* Interfaz de lectura de consola */
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/* Cliente Discord */
const mainClient = new Discord.Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions], partials: [Partials.Message, Partials.Reaction] });

/* Carga los plugins */
d = new Date();
console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] \x1b[35m' + messages['plugin-load-started'] + '\x1b[0m');
mainClient.plugins = new Discord.Collection();
mainClient.pluginsData = new Discord.Collection();
const getPlugins = function(dirPath){
    files = fs.readdirSync(dirPath);

    files.forEach(function(file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()){
            getPlugins(dirPath + '/' + file);
        } else if(file == 'plugin.json'){
            let main = JSON.parse(fs.readFileSync(path.join(dirPath, file)));
            if(main.name) {
                const plugin = require(dirPath + '/' + main.main);
                mainClient.plugins.set(main.name, plugin);
                main.path = dirPath;
                mainClient.pluginsData.set(main.name, main);
                let isversionformatted = undefined;
                if(main.languages)
                    Object.keys(main.languages).forEach(element => {
                        let langPath = path.join(__dirname, dirPath, main.languages[element]);
                        let lang = element;
                        GlobalLangManager.registerLang(lang, fs.readFileSync(langPath), main.name);
                    });
                if(main.version){
                    isversionformatted = /^[a-z0-9_\p{.} ]+$/.test(main.version);
                }
                if(isversionformatted){
                    console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + messages['plugin-load-succesfull'] + main.name + ' (' + main.version + ')');
                } else
                    console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + messages['plugin-load-succesfull'] + main.name);
            }
        }
    });
};
const deletePlugins = function(dirPath){
    files = fs.readdirSync(dirPath);

    files.forEach(function(file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()){
            deletePlugins(dirPath + '/' + file);
        } else if(file == 'plugin.json'){
            let main = JSON.parse(fs.readFileSync(path.join(dirPath, file)));
            if(main.main)
                delete require.cache[require.resolve(dirPath + '/' + main.main)];
        }
    });
};
getPlugins('./plugins');

/* Obtiene la informacion de la guild que se le pasa como parametro, si no existe la crea */
const getguild = function(guild){
    dataManager = new DataInterface(guild);
    guilddata = dataManager.GuildDataManager;
    return guilddata.getProperty();
};

/* Funcion para registrar y/o actualizar comandos en una guild en especifico */
const flushSlashCommands = async function(guildId, reCreateIfExists = true){
    let commands;
    const guild = mainClient.guilds.cache.get(guildId);
    if(guild){
        commands = guild?.commands;
    } else {
        return;
    }
    dataManager = new DataInterface(guildId);
    guilddata = dataManager.GuildDataManager;
    let DisabledPlugins = guilddata.getProperty('DisabledPlugins');
    let commandstodelete;
    commandstodelete = await commands.fetch();
    try{
        if(reCreateIfExists){
            commandstodelete.forEach(async cmd => {
                try{
                    await commands.delete(cmd);
                }catch(err){
                    d = new Date();
                    console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + 'error on command delete: ' + cmd.name);
                    logError(err.toString());
                }
            });
        }
        mainClient.pluginsData.forEach(key => {
            if(!DisabledPlugins.includes(key.name)){
                if(key.slashCommands != undefined && key.slashCommands != null){
                    let slashCommands = fs.readFileSync(path.join(key.path, key.slashCommands), 'utf8');
                    let firstParse = GlobalLangManager.langParse(slashCommands, key.name);
                    slashCommands = JSON.parse(GlobalLangManager.langParse(firstParse));
                    slashCommands.forEach(async command => {
                        command.name = command.name.toLowerCase();
                        try{
                            if(reCreateIfExists || !commandstodelete.find(localcommand => localcommand.name === command.name))
                                await commands.create(command);
                        }catch(err){
                            d = new Date();
                            console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + 'error on command creation: ' + command.name);
                            logError(err.toString());
                            console.log(err);
                        }
                    })
                }
            }
        });
        d = new Date();
        console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + messages['slashCommands-loaded'] + guildId);
    } catch {
        d = new Date();
        console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + messages['guild-has-no-permission-for-slashCommands'] + guildId);
        logError(err.toString());
        console.log(err);
    }
}

/* Funcion para registrar y/o actualizar comandos globales */
const flushGlobalSlashCommands = async function(reCreateIfExists = true){
    let commands = mainClient.application.commands;
    try{
        let commandstodelete;
        commandstodelete = await commands.fetch();
        if(reCreateIfExists){
            commandstodelete.forEach(async cmd => {
                try{
                    await commands.delete(cmd);
                }catch(err){
                    d = new Date();
                    console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + 'error on command delete: ' + cmd.name);
                    logError(err.toString());
                    console.log(err);
                }
            });
        }
        mainClient.pluginsData.forEach(key => {
                if(key.globalSlashCommands != undefined && key.globalSlashCommands != null && key.globalSlashCommands != ""){
                    let slashCommands = fs.readFileSync(path.join(key.path, key.globalSlashCommands), 'utf8');
                    let firstParse = GlobalLangManager.langParse(slashCommands, key.name);
                    slashCommands = JSON.parse(GlobalLangManager.langParse(firstParse));
                    slashCommands.forEach(async command => {
                        command.name = command.name.toLowerCase();
                        try{
                            if(reCreateIfExists || !commandstodelete.find(localcommand => localcommand.name === command.name))
                                await commands.create(command);
                        }catch(err){
                            d = new Date();
                            console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + 'error on command creation: ' + command.name);
                            logError(err.toString());
                            console.log(err);
                        }
                    })
                }
        });
        d = new Date();
        console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + messages['globalslashCommands-loaded']);
    } catch(err) {
        d = new Date();
        console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + messages['error-on-globalslashcommand-flush']);
        logError(err.toString());
        console.log(err);
    }
}

/* Se ejecuta al reciir un mensaje */
mainClient.on('messageCreate', async message =>{
    if (message.partial) {
		try {
			await message.fetch();
		} catch (error) {
			console.error('Error al obtener el mensaje:', error);
            logError(error.toString());
            console.log(err);
			return;
		}
    }
    if(message.author.bot){return};//Evita recibir mensajes de bots
    if((message.guild == undefined) || (message.guild == null)){return};//Evita recibir mensajes por DM
    const guild = message.guild.id;
    let dataManager = new DataInterface(guild);
    let guilddata = dataManager.GuildDataManager;
    mainClient.plugins.forEach((pluginComplete, plugin, map) => {
        if(!guilddata.getProperty('DisabledPlugins').includes(plugin) && typeof pluginComplete.onAllMessage === 'function'){
                let API = new DataInterface(guild, plugin);
                API.microlib = { timeParser, Mutex, logError };
                API.langManager = new PluginLangManager(plugin);
                pluginComplete.onAllMessage(message, API);
        }
    });
});

/* Se ejecuta al eliminarse un mensaje */
mainClient.on('messageDelete', async message => {
    if(!message.partial){
        if(message.author.bot){return};
        if((message.guild == undefined) || (message.guild == null)){return};//Evita recibir mensajes por DM
        //TODO
    } else {
        //TODO
    };
});

/* Acciones cuando un usuario hace algo en un canal de voz */
mainClient.on('voiceStateUpdate', async (oldstate, newstate) => {
    if(oldstate.guild.id != newstate.guild.id){
        d = new Date();
        console.log('[\x1b[36m' + timeParser(d) + '] error >> ' + 'newstate tiene diferente guild que oldstate, REVISAR CODIGO');
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

    mainClient.plugins.forEach((pluginComplete, plugin, map) => {
        if(!guilddata.DisabledPlugins.includes(plugin)){
            if(typeof pluginComplete.voiceStateUpdate === 'function'){
                pluginComplete.voiceStateUpdate(guilddata, oldstate, newstate);
            }
        }
    });
});

/* Se ejecuta cuando alguien se une a la guild */
mainClient.on('guildMemberAdd', async member => {
    const guild = member.guild.id;
    dataManager = new DataInterface(guild);
    guilddata = dataManager.GuildDataManager;
    mainClient.plugins.forEach((pluginComplete, plugin, map) => {
        if(!guilddata.getProperty('DisabledPlugins').includes(plugin)){
            if(typeof pluginComplete.onMemberJoin === 'function'){
                let API = new DataInterface(guild, plugin);
                API.langManager = new PluginLangManager(plugin);
                pluginComplete.onMemberJoin(API, member);
            }
        }
    });
});

/* Se ejecuta cuando alguien genera una interaccion como presionar un boton */
mainClient.on('interactionCreate', async (interaction) => {
    if((interaction.guild == undefined) || (interaction.guild == null)){return};
    const guild = interaction.guild.id;
    let dataManager = new DataInterface(guild);
    let guilddata = dataManager.GuildDataManager;
    //TODO chequear los plugin.json y que se ejecuten las funciones solo del plugin correcto
    mainClient.plugins.forEach((pluginComplete, plugin, map) => {
        if(!guilddata.getProperty('DisabledPlugins').includes(plugin)){
            let API = new DataInterface(guild, plugin);
            API.langManager = new PluginLangManager(plugin);
            if(interaction.isButton()){
                if (typeof pluginComplete.onButtonClick === 'function'){
                    pluginComplete.onButtonClick(API, interaction);
                }
            } else if(interaction.isCommand()){
                if (typeof pluginComplete.onSlashCommand === 'function'){
                    pluginComplete.onSlashCommand(API, interaction);
                }
            } else if(interaction.isStringSelectMenu()){
                if (typeof pluginComplete.onSelectMenu === 'function'){
                    pluginComplete.onSelectMenu(API, interaction);
                }
            } else if(interaction.isModalSubmit()){
                if (typeof pluginComplete.onModal === 'function'){
                    pluginComplete.onModal(API, interaction);
                }
            }
        } /* else {
            if(interaction.isRepliable()){
                interaction.reply({content: "Este plugin esta desabilitado en este servidor.", ephemeral: true});
            }
        } */
    });
});

//cuando un usuario reacciona a un mensaje
mainClient.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Error al obtener la reaccion:', error);
			return;
		}
    }
    if((reaction == undefined) || (user == null) || user.bot){return};
    let guild = reaction.message.guild.id;
    let dataManager = new DataInterface(guild, undefined);
    let guilddata = dataManager.GuildDataManager;
    mainClient.plugins.forEach((pluginComplete, plugin, map) => {
        if(!guilddata.getProperty('DisabledPlugins').includes(plugin)){
            if (typeof pluginComplete.onReactionAdd === 'function'){
                let API = new DataInterface(guild, plugin);
                API.langManager = new PluginLangManager(plugin);
                pluginComplete.onReactionAdd(API, reaction, user);
            }
        }
    });
});

//cuando un usuario quita la reaccion de un mensaje
mainClient.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Error al obtener la reaccion:', error);
			return;
		}
    }
    if((reaction == undefined) || (user == null) || user.bot){return};
    const guild = reaction.message.guild.id;
    let dataManager = new DataInterface(guild, undefined);
    let guilddata = dataManager.GuildDataManager;
    mainClient.plugins.forEach((pluginComplete, plugin, map) => {
        if(!guilddata.getProperty('DisabledPlugins').includes(plugin)){
            if (typeof pluginComplete.onReactionRemove === 'function'){
                let API = new DataInterface(guild, plugin);
                API.langManager = new PluginLangManager(plugin);
                pluginComplete.onReactionRemove(API, reaction, user);
            }
        }
    });
});

/* Se ejecuta cuando el bot entra a una guild */
mainClient.on('guildCreate', async guild => {
    flushSlashCommands(guild.id);
});

/* Se ejecuta cuando el bot sale de una guild */
mainClient.on('guildDelete', async guild => {
    d = new Date();
    console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + messages['bot-left-guild'] + guild.id);
    //TODO: erase guild data
});

/* Se ejecuta cuando el bot ya esta activo */
mainClient.on('ready', () => {
    d = new Date();
    console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] \x1b[32m' + messages['bot-loaded'] + '\x1b[0m');
    mainClient.user.setActivity(config.activity.value, { type: config.activity.type });
    d = new Date();
    console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] \x1b[35m' + messages['activity-setted'] + '\x1b[0m' + config.activity.value + ', type: ' + config.activity.type);
    d = new Date();
    console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] \x1b[35m' + messages['loading-slashcommands'] + '\x1b[0m');
    flushGlobalSlashCommands(false);
    mainClient.guilds.cache.forEach(guild => {
        flushSlashCommands(guild.id, false);
    });
    if(process.env.USEHTTP == 'true' || process.env.USEHTTPS == 'true') {
        d = new Date();
        console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + messages['starting-webserver']);
        require('./webserver.js')(mainClient);
    }
});

/* Inicia sesion con los bots */
mainClient.login(process.env.TOKEN);

/* Comando de consola flushplugins (beta) */
const cmdflushplugins = function(){
    d = new Date();
    console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + messages['plugin-load-started']);
    mainClient.plugins = new Discord.Collection();
    mainClient.pluginsData = new Discord.Collection();
    deletePlugins('./plugins');
    getPlugins('./plugins');
    d = new Date();
    console.log(messages['flushplugins-doesnt-refresh-slashcommands']);
    console.log('--------------------');
}

/* Comandos de la consola */
rl.on('line', (input) => {
    switch (input.toLowerCase()){
        case 'help':
            d = new Date();
            console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + "Comandos de consola disponibles:");
            for(helpCommandText of messages['console-help']){
                console.log(helpCommandText);
            }
            console.log('--------------------');
            break;
        case 'updateactivity':
            let getdata = fs.readFileSync('./config.json');
            getdata = JSON.parse(getdata);
            mainClient.user.setActivity(getdata.activity.value, { type: getdata.activity.type });
            d = new Date();
            console.log('[\x1b[36m' + timeParser(d) + '\x1b[0m] ' + messages['activity-setted'] + config.activity.value + ', type: ' + config.activity.type);    
            break;
        case 'flushplugins':
            cmdflushplugins();
            break;
        case 'flushallslashcommands':
            flushGlobalSlashCommands();
            mainClient.guilds.cache.forEach(guild => {
                flushSlashCommands(guild.id);
            });
            break;
        case 'flushglobalslashcommands':
            flushGlobalSlashCommands();
            break;
        case 'flushslashcommands':
            mainClient.guilds.cache.forEach(guild => {
                flushSlashCommands(guild.id);
            });
            break;
        default:
            break;
    }
});