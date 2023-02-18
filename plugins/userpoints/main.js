/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

//Es necesario importar discord para los tipos de datos de discord
const Discord = require('discord.js');

const {fn_processpoints} = require('./fn_processpoints.js');

const lockedGuilds = new Map();

class Mutex {
    constructor() {
        this._locking = Promise.resolve();
    }
    lock() {
        let unlockNext;
        let willLock = new Promise(resolve => unlockNext = () => {      
            resolve();
        });
        let willUnlock = this._locking.then(() => unlockNext);
        this._locking = this._locking.then(() => willLock);
        return willUnlock;
    }
}

const MutexCreator = new Mutex();

//Este plugin requiere el plugin "prizetables"

module.exports = {
    name: 'userpoints',
    description: 'Sistema de puntos de usuario con recompensas',
    author: 'fapret',
    version: '2.3.0.7e6a15565',
    category: 'entertainment',
    globalSlashCommands: [
        {name: 'rank', description: 'Obtiene tu rango o el de otro usuario', dm_permission: false, options: [
            {type: Discord.ApplicationCommandOptionType.User, name: 'user', description: 'Usuario para obtener el rango'}
        ]},
        {name: 'top', description: 'Obtiene la leaderboard de puntos', dm_permission: false, options: [
            {type: Discord.ApplicationCommandOptionType.Integer, name: 'leveltype', description: 'Tipo de nivel', choices: [
                {name: 'both', value: 0}, {name: 'text', value: 1}, {name: 'voice', value: 2}
            ]}
            //TODO
        ]},
        {name: 'pointsconfig', description: 'Configuracion del sistema de puntos', dm_permission: false, options: [
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'add', description: 'Agrega puntos a un usuario o rol', options: [
                {type: Discord.ApplicationCommandOptionType.Mentionable, name: 'mentionable', description: 'Usuario o Rol para agregar puntos', required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'leveltype', description: 'Tipo de nivel a agregar level, si no se coloca es ambos', choices: [
                    {name: 'both', value: 0}, {name: 'text', value: 1}, {name: 'voice', value: 2}
                ]}
            ]},
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'set', description: 'Setea puntos a un usuario o rol', options: [
                {type: Discord.ApplicationCommandOptionType.Mentionable, name: 'mentionable', description: 'Usuario o Rol para setear puntos', required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'leveltype', description: 'Tipo de nivel a asignar level, si no se coloca es ambos', choices: [
                    {name: 'both', value: 0}, {name: 'text', value: 1}, {name: 'voice', value: 2}
                ]}
            ]},
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'addlevel', description: 'Agrega niveles a un usuario o rol', options: [
                {type: Discord.ApplicationCommandOptionType.Mentionable, name: 'mentionable', description: 'Usuario o Rol para agregar niveles', required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'leveltype', description: 'Tipo de nivel a agregar niveles, si no se coloca es ambos', choices: [
                    {name: 'both', value: 0}, {name: 'text', value: 1}, {name: 'voice', value: 2}
                ]}
            ]},
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'setlevel', description: 'Setea el nivel a un usuario o rol', options: [
                {type: Discord.ApplicationCommandOptionType.Mentionable, name: 'mentionable', description: 'Usuario o Rol para setear nivel', required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'leveltype', description: 'Tipo de nivel a asignar level, si no se coloca es ambos', choices: [
                    {name: 'both', value: 0}, {name: 'text', value: 1}, {name: 'voice', value: 2}
                ]}
            ]},
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'setinterval', description: 'Setea el intervalo en segundos minimo que deben haber para que brinde puntos', options: [
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'time', description: 'Tiempo en segundos', required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'leveltype', description: 'Tipo de nivel a asignar intervalo, si no se coloca es ambos', choices: [
                    {name: 'both', value: 0}, {name: 'text', value: 1}, {name: 'voice', value: 2}
                ]}
            ]},
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'setformula', description: 'Setea la formula de experiencia por nivel', options: [
                {type: Discord.ApplicationCommandOptionType.String, name: 'formule', description: 'Formula', required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'leveltype', description: 'Tipo de nivel a asignar formula, si no se coloca es ambos', choices: [
                    {name: 'both', value: 0}, {name: 'text', value: 1}, {name: 'voice', value: 2}
                ]}
            ]},
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'setformulaoverride', description: 'Setea la experiencia necesaria para obtener un nivel en especifico', options: [
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'level', description: 'Nivel', required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'xp', description: 'Experiencia necesaria', min_value: 0, required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'leveltype', description: 'Tipo de nivel a asignar override, si no se coloca es ambos', choices: [
                    {name: 'both', value: 0}, {name: 'text', value: 1}, {name: 'voice', value: 2}
                ]}
            ]},
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'setxppergive', description: 'Setea la experiencia por mensaje o intervalo de voz', options: [
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'xpmin', description: 'xp minimo por mensaje', min_value: 0, required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'xpmax', description: 'xp maximo por mensaje', min_value: 0},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'leveltype', description: 'Tipo de nivel a asignar, si no se coloca es ambos', choices: [
                    {name: 'both', value: 0}, {name: 'text', value: 1}, {name: 'voice', value: 2}
                ]}
            ]},
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'addprize', description: 'Agrega un premio a un nivel', options: [
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'level', description: 'Nivel a llegar para recibir el premio', required: true},
                {type: Discord.ApplicationCommandOptionType.Role, name: 'role', description: 'Rol a ser brindado al ganador'},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'leveltype', description: 'Tipo de nivel a llegar, si no se coloca es ambos', choices: [
                    {name: 'both', value: 0}, {name: 'text', value: 1}, {name: 'voice', value: 2}
                ]},
                {type: Discord.ApplicationCommandOptionType.Boolean, name: 'createticket', description: 'Crear un ticket de reclamacion de premio'},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'prizeid', description: 'ID de tabla de premio'},//TODO Agregar a lista para brindar otros premios
                {type: Discord.ApplicationCommandOptionType.Boolean, name: 'notify', description: 'Notificar premio'},
                {type: Discord.ApplicationCommandOptionType.String, name: 'notifytext', description: 'Texto de notificacion'}
            ]},
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'setlogchannel', description: 'Setea un canal para loggear cuando alguien obtiene un premio', options: [
                {type: Discord.ApplicationCommandOptionType.Channel, name: 'channel', description: 'Canal', channel_types: ['0'], required: true}
            ]}
        ]}
    ],
    async onSlashCommand(API, slashcommand){},
    async onAllMessage(message, API){
        let pluginManager = API.PluginDataManager;
        let guildid = API.GuildDataManager.getGuildID();
        //let mutex = singleton.getSingleton(new API.microlib.Mutex());
        let guildMutex = await lockedGuilds.get(guildid);
        let unlock = MutexCreator.lock();
        if(!guildMutex){
            guildMutex = new Mutex();
            await lockedGuilds.set(guildid, guildMutex);
        }
        unlock();
        let unlockguild = guildMutex.lock();
        let properties = pluginManager.readData('properties/' + guildid);
        if(properties == undefined || properties == null){
            properties = {
                textFormula: '165*x',
                voiceFormula: '100*x',
                logchannel: undefined,
                xpData:{
                    textMin: 0,
                    textMax: 0,
                    voiceMin: 0,
                    voiceMax: 0,
                    textInterval: 0,
                    voiceInterval: 0
                },
                overwrittes: [],
                prizes: [],
                pages: 1
            };
            pluginManager.writeData('properties/' + guildid, properties);
        }
        let userData = pluginManager.readData('data/' + guildid + '/' + message.author.id);
        let leaderboard;
        if(userData == undefined || userData == null){
            userData = {
                textPoints: 0,
                totalTextPoints: 0,
                voicePoints: 0,
                totalVoicePoints: 0,
                textLevel: 0,
                voiceLevel: 0,
                lastTimestampText: 0,
                page: undefined
            };
            leaderboard = pluginManager.readData('leaderboards/' + guildid + `/` + properties.pages);
            if(leaderboard == undefined || leaderboard == null){
                leaderboard = [message.author.id];
                pluginManager.writeData('leaderboards/' + guildid + `/` + properties.pages, leaderboard);
            } else if (leaderboard.length == 10){
                leaderboard = [message.author.id];
                properties.pages++;
                pluginManager.writeData('properties/' + guildid, properties);
                pluginManager.writeData('leaderboards/' + guildid + `/` + properties.pages, leaderboard);
            }
            userData.page = properties.pages;
            pluginManager.writeData('data/' + guildid + '/' + message.author.id, userData);
        } else {
            leaderboard = pluginManager.readData('leaderboards/' + guildid + `/` + userData.page);
        }
        userData = await fn_processpoints(API, message, properties, userData, leaderboard);
        pluginManager.writeData('data/' + guildid + '/' + message.author.id, userData);
        unlockguild();
    }
}