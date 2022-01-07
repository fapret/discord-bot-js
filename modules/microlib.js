/* Parser de fechas */
const timeParser = function(date){
    day = (date.getDate() < 10 ? '0' : '') + date.getDate();
    month = (date.getMonth() < 10 ? '0' : '') + date.getMonth();
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