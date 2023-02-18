const Express = require("express");
var router = Express.Router();
const { type } = require("express/lib/response");
let discordclient;

//const indexEJS = fs.readFileSync('./views/index.ejs', "utf8");
let OAuthURI = process.env.OAUTH_URL;
if(OAuthURI == undefined)
    OAuthURI = '/';

router.get('/', async (req, res) => {
    let session = req.session;
    if(session.user){
        res.render("index", { session: req.session.id, host: req.headers.host, user: session.user, leftnav: false });
    } else {
        res.render("index", { session: req.session.id, host: req.headers.host, user: false, OAuthURL: OAuthURI });
    }
});

module.exports = function (client) {
    discordclient = client;
    return router;
};