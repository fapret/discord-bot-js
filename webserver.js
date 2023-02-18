/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

async function init(client) {
    const Express = require("express");
    var session = require("express-session");
    const webserver = Express();
    var { generateNewSecret, loadSecrets, saveSecrets } = require("./modules/secrets.js");
    var sessionsecrets = loadSecrets();
    const webconfig = require('./webconfig.json');
    let sessionStore;

    const sessionStorage = process.env.SESSION_STORAGE_MODE;
    if(sessionStorage && sessionStorage.toLowerCase() == 'mysql'){
        const mysqlStore = require('express-mysql-session')(session);
        sessionStore = new mysqlStore({
            host: process.env.SESSION_MYSQL_HOST,
            user: process.env.SESSION_MYSQL_USER,
            password: process.env.SESSION_MYSQL_PASSWORD,
            database: process.env.SESSION_MYSQL_DATABASE,
            createDatabaseTable: true
        });
    } else {
        const FileStore = require('session-file-store')(session);
        let fileStoreOptions = {};
        sessionStore = new FileStore(fileStoreOptions);
    }

    var sessiondata = {
        name: webconfig.sessiondata.name,
        secret: sessionsecrets.secrets,
        cookie: webconfig.sessiondata.cookie,
        store: sessionStore,
        resave: webconfig.sessiondata.resave,
        saveUninitialized: webconfig.sessiondata.saveUninitialized
    };

    var indexRouter = require("./Routers/index.js")(client);
    var apiRouter = require("./Routers/api.js")(client);
    var guildRouter = require("./Routers/guild.js")(client);
    var authRouter = require("./Routers/auth.js");
    webserver.set('view engine','ejs');
    webserver.use(Express.json());
    webserver.use(Express.urlencoded({extended: true}));
    webserver.use(Express.static('public-static'));
    webserver.use(session(sessiondata));
    webserver.use("/", indexRouter);
    webserver.use("/auth", authRouter);
    webserver.use("/api", apiRouter);
    webserver.use("/guild", guildRouter);

    let port;

    //In case of use of http
    //NOT RECOMMENDED, USE ONLY FOR TESTING OR BEHIND PROXY
    if(process.env.USEHTTP == 'true'){
        var http = require('http');
        var httpServer = http.createServer(webserver);
        port = parseInt(process.env.HTTP_PORT);
        if(typeof port == NaN || port < 1 || port > 65535)
            port = 80;
        httpServer.listen(port, () => {console.log(`webserver listening on ${port} over http`)});
    }

    //In case of use of https
    if(process.env.USEHTTPS == 'true'){
        var https = require('https');
        const fs = require('fs');
        var privateKey  = fs.readFileSync(process.env.HTTPS_PRIVATEKEY, 'utf8');
        var certificate = fs.readFileSync(process.env.HTTPS_FULLCHAIN, 'utf8');
        var credentials = {key: privateKey, cert: certificate};
        var httpsServer = https.createServer(credentials, webserver);
        port = parseInt(process.env.HTTPS_PORT);
        if(typeof port == NaN || port < 1 || port > 65535)
            port = 443;
        httpsServer.listen(port, () => {console.log(`webserver listening on ${port} over https`)});
    }
}

module.exports = init;