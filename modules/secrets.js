/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const crypto = require("crypto");
const fs = require("fs");
function saveSecrets(sessionsecrets) {
    try{
        fs.writeFileSync('secrets.json', JSON.stringify(sessionsecrets, null, 4));
        console.log('INFO >> succesfully generated new secrets file with random secret key');
    } catch (err2) {
        console.log('UNKNOWN ERROR >> looks like secrets.json couldnt be write, here is the error:');
        console.log(err2);
    }
}
function loadSecrets() {
    var sessionsecrets;
    try{
        sessionsecrets = JSON.parse(fs.readFileSync('secrets.json'));
    } catch (err) {
        switch (err.code) {
            case 'ENOENT':
                console.log('INFO >> looks like you doesnt have a secrets file, generating a new one...');
                sessionsecrets = {
                    secrets: [crypto.randomBytes(32).toString('base64')]
                }
                saveSecrets(sessionsecrets);
                break;
            default:
                console.log('UNKNOWN ERROR >> looks like secrets.json couldnt be read, here is the error:');
                console.log(err);
                break;
        }
    }
    if (sessionsecrets.secrets == undefined || !Array.isArray(sessionsecrets.secrets) || sessionsecrets.secrets.length == 0){
        sessionsecrets.secrets = [];
        generateNewSecret(sessionsecrets);
    }
    return sessionsecrets;
}
function generateNewSecret(sessionsecrets, maintainOldSecrets=true) {
    if (maintainOldSecrets) {
        sessionsecrets.secrets.unshift(crypto.randomBytes(32).toString('base64'));
        saveSecrets(sessionsecrets);
    } else {
        sessionsecrets.secrets = [];
        saveSecrets(sessionsecrets);
    }
}
module.exports = {
    generateNewSecret,
    loadSecrets,
    saveSecrets
}