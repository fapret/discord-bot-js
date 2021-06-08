const Discord = require('discord.js');
require('discord-reply');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const DiscordClients = new Map;
DiscordClients.set("main", new Discord.Client());
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
const loadmodules = getModules('./bot_modules');
d = new Date();
console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['modules-loaded']);
mainClient.modules.forEach(key =>{
    console.log('-' + key.name);
});
console.log('--------------------');
/*
console.log(config['secondary-bot-tokens'].length);
console.log(config['secondary-bot-tokens'][0]);
*/

/* comandos */
mainClient.on('message', message => {
    if(message.author.bot){return};
    const guild = message.guild.id;
    try {
        var getguilddata = fs.readFileSync('./guilds/' + guild + '.json');
    } catch (error){
        if (error.code === 'ENOENT') {
            d = new Date();
            console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['guild-not-registered']+ ' ' + guild);
            let newguild = {
                ID: guild,
                prefix: config['default-prefix'],
                operatorRole: '00000000000000000',
                DisabledModules: [],
                Aliases: []
            }
            try {
                fs.writeFileSync('./guilds/' + guild + '.json', JSON.stringify(newguild, null, 4));
                getguilddata = fs.readFileSync('./guilds/' + guild + '.json');
            } catch (err){
                console.log(err);
                return;
            }
          } else {
            console.log(error);
            return;
          }
    }
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
            mainClient.modules.get('custommsg').execute(message, guilddata, args);
        }
    }
});

/* Se ejecuta cuando el bot ya esta activo */
mainClient.on("ready", () => {
    d = new Date();
    console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['bot-loaded']);
    mainClient.user.setActivity('a fapret programar', { type: 'WATCHING'});
    d = new Date();
    console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ' + config.Messages['activity-setted'] + config.activity);
});

/* Inicia sesion con los bots */
mainClient.login(config['bot-token']);