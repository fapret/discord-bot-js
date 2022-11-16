/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const fs = require('fs');
const path = require('path');
const stream = require('stream');
const config = require('../config.json');
const { timeParser, Mutex } = require('./microlib.js');

/* Path donde se guarda la data si esta en modo file */
const dataPath = './data/';

//const mutexData = new Mutex();

/* GuildDataManager */
/**
 * @param {string|number} guildID
 */
function GuildDataManager (guildID = undefined){
    if(guildID){
        this.ID = guildID;
        /**
         * 
         * @param {string|number} property 
         * @returns {string|number|Object}
         */
        this.getProperty = (property) => {
            return dataManager.read(`guildData:${this.ID}/properties/${property}`);
        }
        /**
         * 
         * @param {string|number} property 
         * @param {*} value 
         */
        this.setProperty = (property, value) => {
            dataManager.write(`guildData:${this.ID}/properties/${property}`, value);
        }
    }
    /**
    * @returns {string|number}
    */
    this.getGuildID = () => {return this.ID}
    /**
    * @param {string} guildID
    */
    this.changeGuildContext = (guildID) => {
        this.ID = guildID;
        /**
         * 
         * @param {string|number} property 
         * @returns {string|number|Object}
         */
        this.getProperty = (property) => {
            return dataManager.read(`guildData:${this.ID}/properties/${property}`);
        }
        /**
         * 
         * @param {string|number} property 
         * @param {*} value 
         */
        this.setProperty = (property, value) => {
            dataManager.write(`guildData:${this.ID}/properties/${property}`, value);
        }
    }
}

/* PluginDataManager */
/**
 * @param {string} plugin
 */
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
/**
 * @param {string} namespace
 */
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
/**
 * @param {string} namespace
 */
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
/**
 * @param {string} guildID
 * @param {string} plugin
 */
function DataInterface (guildID = undefined, plugin = undefined){
    if(plugin != undefined){
        this.PluginDataManager = new PluginDataManager(plugin);
        this.CacheDataManager = new CacheDataManager(plugin);
    }
    if(guildID != undefined)
        this.GuildDataManager = new GuildDataManager(guildID);
}

let dataManager = {
    /**
    * @param {string} dirPath
    * @param {string} storageMode
    * @returns {string|number|Buffer}
    */
    read: (dirPath, storageMode = 'file') => {
        //const unlock = await mutexData.lock();
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
                                            DisabledPlugins: ['welcome','newworld','template','apps','music'],
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
    /**
    * @param {string} dirPath
    * @param {string} storageMode
    * @param {string|number|Buffer|TypedArray|DataView} value
    * @returns {void}
    */
    write: (dirPath, value, storageMode = 'file') => {
        //const unlock = await mutexData.lock();
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
                                            DisabledPlugins: ['welcome','template','apps'],
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
                                getdata = JSON.parse(getdata);
                                getdata[dirPathParts[2]] = value;
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
    /**
    * @param {string} dirPath
    * @param {string} storageMode
    * @returns {void}
    */
    erase: (dirPath, storageMode = 'file') => {
        //const unlock = await mutexData.lock();
        switch (storageMode) {
            case 'file':
                
                break;
            default:
                throw 'storage-type-invalid';
        }
        //unlock();
    },
    /**
    * @param {string} dirPath
    * @param {string} mode
    * @returns {fs.ReadStream}
    */
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
    /**
    * @param {string} dirPath
    * @param {string} mode
    * @returns {fs.WriteStream}
    */
    writeStream: (dirPath, mode) => {

    }
}

module.exports = {
    name: 'datamanager',
    description: 'Maneja los datos del bot',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    DataInterface
}