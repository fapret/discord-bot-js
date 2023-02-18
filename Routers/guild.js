const Express = require("express");
var router = Express.Router();
const { type } = require("express/lib/response");
let discordclient;
const { DataInterface } = require('../modules/datamanager.js');

router.get('/:id', async (req, res) => {
    let session = req.session;
    let guildid = req.params.id;
    if(session.user && session.returnguilds){
        let guild = session.returnguilds.find(guild => guild.id == guildid);
        if(guild){
            let plugins = discordclient.plugins.sort(function(a, b) {
                if(a.category == undefined) {
                    return 1;
                }
                if(b.category == undefined) {
                    return -1;
                }
                if (a.category > b.category) {
                  return -1;
                }
                if (a.category < b.category) {
                  return 1;
                }
                return 0;
            });
            res.render("guild", { session: req.session.id, host: req.headers.host, user: session.user, leftnav: true, guild: guild, plugins: plugins});
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(401);
    }
});

module.exports = function (client) {
    discordclient = client;
    discordclient.plugins.forEach(plugin => {
        if(typeof plugin.webRouter === 'function'){
            localrouter = plugin.webRouter(new DataInterface(undefined, plugin.name));
            router.use(`/:id/${plugin.name}`, localrouter);
        }
    });
    return router;
};