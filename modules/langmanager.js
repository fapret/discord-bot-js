/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/
const path = require('path');
const fs = require('fs');
const { constants } = require('buffer');

function registerLang(scope, lang, texts) {
    let langPath = path.join(__dirname, '../lang', lang + '.json');
    let data;
    try{
        data = JSON.parse(fs.readFileSync(langPath), 'utf-8');
    } catch (err){
        if(err.code == 'ENOENT'){
            data = JSON.parse(fs.readFileSync(path.join(__dirname, '../lang', 'es-ES' + '.json'), 'utf-8'));
            fs.writeFileSync(langPath, JSON.stringify(data, null, 4));
        }
    }
    let aux = JSON.parse(texts);
    if(!data[scope])
        data[scope] = {};
    Object.assign(data[scope], aux);
    fs.writeFileSync(langPath, JSON.stringify(data, null, 4));
}

function readLang(scope, lang) {
    let langPath = path.join(__dirname, '../lang/' + lang + '.json');
    let data;
    try{
        data = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
    } catch (err){
        if(err.code == 'ENOENT'){
            console.log('[WARNING]' + ' ' + langPath + ' NOT FOUND!');
            return undefined;
        }
    }
    return data[scope];
}

function langParser(scope, text) {
    let out = text;
    let matches = text.match(/\$\{.+?:.+?\}/g);
    let matchescopy = new Map();
    matches?.forEach(element => {
        let parts = element.split(':');
        let lang = parts[0].slice(2);
        let toTraduce = parts[1].slice(0, -1);
        let langRead = readLang(scope, lang);
        let traduced;
        if(langRead)
            traduced = langRead[toTraduce];
        if(traduced)
            matchescopy.set(element, traduced);
        else if(lang != 'constants')//&& scope != 'global'?
            console.log('[\x1b[33mWARNING\x1b[0m]' + ' ' + element + ' TRADUCTION NOT FOUND ON SCOPE: ' + scope);
    });
    matchescopy.forEach((value, key, map) => {
        if(typeof value !== 'string')
            out = out.replaceAll(`"${key}"`, `${value}`);
        else
            out = out.replaceAll(`${key}`, `${value}`);
    });
    return out;
}

/**
 * @param {string} plugin
 */
function PluginLangManager (plugin){
    this.pluginName = plugin;
    this.registerLang = (lang, value) => {
        registerLang(this.pluginName, lang, value);
    }
    this.readGlobal = (lang) => {
        return readLang('global', lang);
    }
    this.readGlobalValue = (lang, value) => {
        return readLang('global', lang)[value];
    }
    this.read = (lang) => {
        return readLang(this.pluginName, lang);
    }
    this.readValue = (lang, value) => {
        return readLang(this.pluginName, lang)[value];
    }
    this.langParse = (text) => {
        return langParser(this.pluginName, text);
    }
}

var GlobalLangManager = {
    registerLang: (lang, value, scope = 'global') => {
        registerLang(scope, lang, value);
    },
    read: (lang, scope = 'global') => {
        return readLang(scope, lang);
    },
    readValue: (lang, value, scope = 'global') => {
        return readLang(scope, lang)[value];
    },
    langParse: (text, scope = 'global') => {
        return langParser(scope, text);
    }
}

module.exports = {
    name: 'langmanager',
    description: 'Maneja las traducciones del bot',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    PluginLangManager,
    GlobalLangManager
}