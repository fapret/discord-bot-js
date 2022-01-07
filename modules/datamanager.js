const fs = require('fs');
const path = require('path');
const stream = require('stream');
const config = require('../config.json');
const { timeParser, Mutex } = require('./microlib.js');

/*
storageMode = config.Storage['mode'];
cacheMode = config.Storage['cache'];
if(storageMode == undefined){
    storageMode = 'file';
}
if(cacheMode == undefined){
    cacheMode = 'file';
}
*/

/* Path donde se guarda la data si esta en modo file */
const dataPath = './data/';

//const mutexData = new Mutex();

/* GuildDataManager */
function GuildDataManager (guildID){
    this.ID = guildID;
    this.getGuildID = () => {return this.ID}
    this.getProperty = (property) => {
        return dataManager.read(`guildData:${this.ID}/properties/${property}`);
    }
    this.setProperty = (property, value) => {
        dataManager.write(`guildData:${this.ID}/properties/${property}`, value);
    }
}

/* PluginDataManager */
function PluginDataManager (plugin){
    this.pluginName = plugin;
    this.readData = (dirPath) => {
        return dataManager.read(`plugin:${this.pluginName}/${dirPath}`);
    }
    this.writeData = (dirPath, value) => {
        dataManager.write(`plugin:${this.pluginName}/${dirPath}`, value);
    }
    this.eraseData = (dirPath) => {
        dataManager.erase(`plugin:${this.pluginName}/${dirPath}`);
    }
}

/* CacheDataManager */
function CacheDataManager (namespace){
    this.namespace = namespace;
    this.readData = (dirPath) => {
        return dataManager.read(`cache:${this.namespace}/${dirPath}`);
    }
    this.writeData = (dirPath, value) => {
        dataManager.write(`cache:${this.namespace}/${dirPath}`, value);
    }
    this.eraseData = (dirPath) => {
        dataManager.erase(`cache:${this.namespace}/${dirPath}`);
    }
    this.readStreamData = (dirPath) => {
        return dataManager.readStream(`cache:${this.namespace}/${dirPath}`, cacheMode);
    }
    this.writeStreamData = (dirPath) => {
        return dataManager.writeStream(`cache:${this.namespace}/${dirPath}`, cacheMode);
    }
}

/* Acceso directo al manager de data */
function DirectDataManager (namespace){
    switch (namespace.toLowerCase()){
        case 'cache':
            throw 'namespace-is-protected';
        case 'plugin':
            throw 'namespace-is-protected';
        case 'guilddata':
            throw 'namespace-is-protected';
        default:
            this.namespace = namespace;
            this.readData = (dirPath) => {
                return dataManager.read(`${this.namespace}:${dirPath}`);
            }
            this.writeData = (dirPath, value) => {
                dataManager.write(`${this.namespace}:${dirPath}`, value);
            }
            this.eraseData = (dirPath) => {
                dataManager.erase(`${this.namespace}:${dirPath}`);
            }
            break;
    }
}

/* Interfaz expuesta para acceder a la data */
function DataInterface (guildID, plugin){
    this.PluginDataManager = new PluginDataManager(plugin);
    this.GuildDataManager = new GuildDataManager(guildID);
    this.CacheDataManager = new CacheDataManager(plugin);
}

let dataManager = {
    read: (dirPath, storageMode) => {
        //const unlock = await mutexData.lock();
        if (storageMode == undefined)
            storageMode = 'file';
        switch (storageMode) {
            case 'file':
                var dirPathParts = dirPath.split(':');
                namespace = dirPathParts[0].toLowerCase();
                dirPathParts = dirPathParts.slice(1);
                dirPathParts = dirPathParts[0].split('/');
                if (!fs.existsSync(dataPath)) {
                    fs.mkdirSync(dataPath);
                    d = new Date();
                    console.log('[' + timeParser(d) + '] ' + config.Messages['created-data-directory']);
                }
                if (!fs.existsSync(dataPath + namespace)) {
                    fs.mkdirSync(dataPath + namespace);
                    d = new Date();
                    console.log('[' + timeParser(d) + '] ' + config.Messages['created-namespace-storage'] + namespace);
                }
                switch (namespace) {
                    case 'guilddata':
                        currentPath = dataPath + namespace + '/' + dirPathParts[0];
                        if (!fs.existsSync(currentPath)) {
                            fs.mkdirSync(currentPath);
                            d = new Date();
                            console.log('[' + timeParser(d) + '] ' + config.Messages['created-guild-storage'] + dirPathParts[0]);
                        }
                        switch (dirPathParts[1]) {
                            case 'properties':
                                try {
                                    getdata = fs.readFileSync(currentPath + '/' + 'properties.json');
                                } catch (error){
                                    if (error.code === 'ENOENT') {
                                        d = new Date();
                                        console.log('[' + timeParser(d) + '] ' + config.Messages['guilddata-not-registered']+ ' ' + dirPathParts[0]);
                                        let newguild = {
                                            ID: dirPathParts[0],
                                            prefix: config['default-prefix'],
                                            operatorRole: '00000000000000000',
                                            DisabledPlugins: ['welcome','newworld'],
                                            Aliases: ['!f']
                                        }
                                        try {
                                            fs.writeFileSync(currentPath + '/' + 'properties.json', JSON.stringify(newguild, null, 4));
                                            getdata = fs.readFileSync(currentPath + '/' + 'properties.json');
                                        } catch (err){
                                            console.log(err);
                                            return undefined;
                                        }
                                    } else {
                                        console.log(error);
                                        return undefined;
                                    }
                                }
                                getdata = JSON.parse(getdata);
                                if(dirPathParts[2]) {
                                    return getdata[dirPathParts[2]];
                                } else {
                                    return getdata;
                                }                                    
                            default:
                                break;
                        }
                        break;
                    case 'plugin':
                        currentPath = dataPath + namespace + '/' + dirPathParts[0];
                        for (let index = 0; index < dirPathParts.length - 1; index++) {
                            currentPath = currentPath + '/' + dirPathParts[index+1];
                        }
                        try {
                            getdata = fs.readFileSync(currentPath + '.json');
                            getdata = JSON.parse(getdata);
                        } catch (error){
                            if (error.code === 'ENOENT') {
                                getdata = undefined;
                            }
                        }
                        return getdata;
                    case 'cache':
                        break;
                    default:
                        break;
                }
                break;
            default:
                throw 'storage-type-invalid';
        }
        //unlock();
    },
    write: (dirPath, value, storageMode) => {
        //const unlock = await mutexData.lock();
        if (storageMode == undefined)
            storageMode = 'file';
        switch (storageMode) {
            case 'file':
                var dirPathParts = dirPath.split(':');
                namespace = dirPathParts[0].toLowerCase();
                dirPathParts = dirPathParts.slice(1);
                dirPathParts = dirPathParts[0].split('/');
                if (!fs.existsSync(dataPath)) {
                    fs.mkdirSync(dataPath);
                    d = new Date();
                    console.log('[' + timeParser(d) + '] ' + config.Messages['created-data-directory']);
                }
                if (!fs.existsSync(dataPath + namespace)) {
                    fs.mkdirSync(dataPath + namespace);
                    d = new Date();
                    console.log('[' + timeParser(d) + '] ' + config.Messages['created-namespace-storage'] + namespace);
                }
                switch (namespace) {
                    case 'guilddata':
                        currentPath = dataPath + namespace + '/' + dirPathParts[0];
                        if (!fs.existsSync(currentPath)) {
                            fs.mkdirSync(currentPath);
                            d = new Date();
                            console.log('[' + timeParser(d) + '] ' + config.Messages['created-guild-storage'] + dirPathParts[0]);
                        }
                        switch (dirPathParts[1]) {
                            case 'properties':
                                try {
                                    getdata = fs.readFileSync(currentPath + '/' + 'properties.json');
                                } catch (error){
                                    if (error.code === 'ENOENT') {
                                        d = new Date();
                                        console.log('[' + timeParser(d) + '] ' + config.Messages['guilddata-not-registered']+ ' ' + dirPathParts[0]);
                                        let newguild = {
                                            ID: dirPathParts[0],
                                            prefix: config['default-prefix'],
                                            operatorRole: '00000000000000000',
                                            DisabledPlugins: ['welcome','newworld'],
                                            Aliases: ['f!']
                                        }
                                        try {
                                            fs.writeFileSync(currentPath + '/' + 'properties.json', JSON.stringify(newguild, null, 4));
                                            getdata = fs.readFileSync(currentPath + '/' + 'properties.json');
                                        } catch (err){
                                            console.log(err);
                                            return undefined;
                                        }
                                    } else {
                                        console.log(error);
                                        return undefined;
                                    }
                                }
                                getdata.dirPathParts[2] = value;
                                try {
                                    fs.writeFileSync(currentPath + '/' + 'properties.json', JSON.stringify(getdata, null, 4));
                                    getdata = fs.readFileSync(currentPath + '/' + 'properties.json');
                                } catch (err){
                                    console.log(err);
                                }
                                break;
                            default:
                                break;
                        }
                        break;
                    case 'plugin':
                        currentPath = dataPath + namespace + '/' + dirPathParts[0];
                        for (let index = 0; index < dirPathParts.length - 1; index++) {
                            if (!fs.existsSync(currentPath)) {
                                fs.mkdirSync(currentPath);
                                d = new Date();
                                console.log('[' + timeParser(d) + '] ' + config.Messages['created-plugindatapath-directory'] + currentPath);
                            }
                            currentPath = currentPath + '/' + dirPathParts[index+1];
                        }
                        try {
                            fs.writeFileSync(currentPath + '.json', JSON.stringify(value, null, 4));
                            getdata = fs.readFileSync(currentPath + '.json');
                        } catch (err){
                            console.log(err);
                        }
                        break;
                    case 'cache':
                        break;
                    default:
                        break;
                }
                break;
            default:
                throw 'storage-type-invalid';
        }
        //unlock();
    },
    erase: (dirPath, storageMode) => {
        //const unlock = await mutexData.lock();
        if (storageMode == undefined)
            storageMode = 'file';
        switch (storageMode) {
            case 'file':
                
                break;
            default:
                throw 'storage-type-invalid';
        }
        //unlock();
    },
    readStream: (dirPath, mode) => {
        switch (mode) {
            case 'file':
                break;
            case 'memory':
                break;
            default:
                throw 'storage-type-invalid';
        }
    },
    writeStream: (dirPath, mode) => {

    }
}

module.exports = {
    name: 'datamanager',
    description: 'Maneja los datos del bot',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    DataInterface
}