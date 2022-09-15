/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const Discord = require('discord.js');
const {Intents} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const { DataInterface } = require('./modules/datamanager.js');
const { timeParser } = require('./modules/microlib.js');

/* Interfaz de lectura de consola */
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/* Clientes Discord */
//Pensado para futuras implementaciones que existan multiples bots
const DiscordClients = new Map;
DiscordClients.set("main", new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS], partials: ['MESSAGE', 'REACTION'] }));
const mainClient = DiscordClients.get("main");

/* Carga los plugins */
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
    let isversionformatted = undefined;
    if(key.version){
        isversionformatted = /^[a-z0-9_\p{.} ]+$/.test(key.version);
    }
    if(isversionformatted){
            console.log('- ' + key.name + ' (' + key.version + ')');
    } else
        console.log('- ' + key.name);
});

/* Obtiene la informacion de la guild que se le pasa como parametro, si no existe la crea */
const getguild = function(guild){
    dataManager = new DataInterface(guild);
    guilddata = dataManager.GuildDataManager;
    return guilddata.getProperty();
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
    dataManager = new DataInterface(guildId);
    guilddata = dataManager.GuildDataManager;
    let DisabledPlugins = guilddata.getProperty('DisabledPlugins');
    try{
        commandstodelete = await commands.fetch();
        commandstodelete.forEach(async cmd => {
            try{
                await commands.delete(cmd);
            }catch(err){
                console.log('error on command delete: ' + cmd.name);
                console.log(err);
            }
        });
        mainClient.plugins.forEach(key => {
            if(!DisabledPlugins.includes(key.name)){
                if(key.slashCommands != undefined && key.slashCommands != null){
                    key.slashCommands.forEach(async command => {
                        command.name = command.name.toLowerCase();
                        try{
                            await commands.create(command);
                        }catch(err){
                            console.log('error on command creation: ' + command.name);
                            console.log(err);
                        }
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
mainClient.on('messageCreate', async message =>{
    if (message.partial) {
		try {
			await message.fetch();
		} catch (error) {
			console.error('Error al obtener el mensaje:', error);
			return;
		}
    }
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
        mainClient.plugins.forEach(plugin => {
            if(!guilddata.getProperty('DisabledPlugins').includes(plugin.name)){
                if(typeof plugin.onAllMessage === 'function'){
                    plugin.onAllMessage(message, new DataInterface(guild, plugin.name));
                }
            }
        });
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
    dataManager = new DataInterface(guild);
    guilddata = dataManager.GuildDataManager;
    mainClient.plugins.forEach(plugin => {
        if(!guilddata.getProperty('DisabledPlugins').includes(plugin.name)){
            if(typeof plugin.onMemberJoin === 'function'){
                plugin.onMemberJoin(new DataInterface(guild, plugin.name), member);
            }
        }
    });
});

/* Se ejecuta cuando alguien genera una interaccion como presionar un boton */
mainClient.on('interactionCreate', async (interaction) => {
    if((interaction.guild == undefined) || (interaction.guild == null)){return};
    const guild = interaction.guild.id;
    dataManager = new DataInterface(guild);
    guilddata = dataManager.GuildDataManager;
    mainClient.plugins.forEach(plugin => {
        if(!guilddata.getProperty('DisabledPlugins').includes(plugin.name)){
            if(interaction.isButton()){
                if (typeof plugin.onButtonClick === 'function'){
                    plugin.onButtonClick(new DataInterface(guild, plugin.name), interaction);
                }
            } else if(interaction.isCommand()){
                if (typeof plugin.onSlashCommand === 'function'){
                    plugin.onSlashCommand(new DataInterface(guild, plugin.name), interaction);
                }
            } else if(interaction.isSelectMenu()){
                if (typeof plugin.onSelectMenu === 'function'){
                    plugin.onSelectMenu(new DataInterface(guild, plugin.name), interaction);
                }
            }
        }
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
    const guild = reaction.message.guildid;
    dataManager = new DataInterface(guild);
    guilddata = dataManager.GuildDataManager;
    mainClient.plugins.forEach(plugin => {
        if(!guilddata.getProperty('DisabledPlugins').includes(plugin.name)){
            if (typeof plugin.onReactionAdd === 'function'){
                plugin.onReactionAdd(new DataInterface(guild, plugin.name), reaction, user);
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
    const guild = reaction.message.guildid;
    dataManager = new DataInterface(guild);
    guilddata = dataManager.GuildDataManager;
    mainClient.plugins.forEach(plugin => {
        if(!guilddata.getProperty('DisabledPlugins').includes(plugin.name)){
            if (typeof plugin.onReactionRemove === 'function'){
                plugin.onReactionRemove(new DataInterface(guild, plugin.name), reaction, user);
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