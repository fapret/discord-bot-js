/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

/* Parser de fechas */
/**
 * @param {Date} date
 * @returns {string}
 */
const timeParser = function(date){
    day = (date.getDate() < 10 ? '0' : '') + date.getDate();
    month = (date.getMonth() < 9 ? '0' : '') + date.getMonth() + 1;
    hour = (date.getHours() < 10 ? '0' : '') + date.getHours();
    minute = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    second = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    return day + "/" + month + ' ' + hour + ':' + minute + ':' + second;
}

/* tipo de objeto mutex */
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

module.exports = {
    name: 'microlib',
    description: 'Libreria interna del bot',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    timeParser,
    Mutex
}