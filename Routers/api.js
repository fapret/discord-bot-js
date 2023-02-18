const Express = require("express");
var router = Express.Router();
const { type } = require("express/lib/response");
const fs = require('fs');
const { DataInterface } = require('../modules/datamanager.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); //import fetch from 'node-fetch';
let discordclient;
const inviteLink = process.env.INVITE_LINK;

router.post('/managed-guilds', async (req, res) => {
    let session = req.session;
    if(session.user){
        let returnguilds = [];
        let guildsfetch = await fetch('https://discord.com/api/users/@me/guilds', {
            method: 'GET',
            headers: {
                'Authorization': `${session.dstoken.token_type} ${session.dstoken.access_token}`
            }
        });
        aux = await guildsfetch.text();
        let guilds = JSON.parse(aux);
        for (let index = 0; index < guilds.length; index++) {
            const element = guilds[index];
            let hasOperatorRole = false;
            let botinguild = false;
            let cacheguild = await discordclient.guilds.cache.get(element.id);

            if(cacheguild){
                botinguild = true;
                let member = await cacheguild.members.fetch(session.user.id);
                dataManager = new DataInterface(element.id);
                guilddata = dataManager.GuildDataManager;
                var operatorRole = guilddata.getProperty('operatorRole');
                if(member.roles.cache.has(operatorRole)){
                    hasOperatorRole = true;
                }
            }

            //(element.permissions & 0x8) == 0x8 chequea si el usuario tiene el rol admin usando el operador bitwise &
            if(element.owner || (element.permissions & 0x8) == 0x8 || hasOperatorRole){
                returnguilds.push({id: element.id, bot: botinguild, name: element.name, icon: element.icon, owner: element.owner});
            }
        }

        if(returnguilds.length > 0)
        {
            session.returnguilds = returnguilds;
            res.send(returnguilds);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(401);
    }
});

router.post('/guild/:id/disabledplugins', async (req, res) => {
    let session = req.session;
    let guildid = req.params.id;
    if(!session.user){
        res.sendStatus(403);
        return;
    }
    let cacheguild = await discordclient.guilds.cache.get(guildid);
    if(!cacheguild){
        res.sendStatus(404);
        return;
    }
    let hasOperatorRole = false;
    let member = await cacheguild.members.fetch(session.user.id);
    let dataManager = new DataInterface(guildid);
    let guilddata = dataManager.GuildDataManager;
    let operatorRole = guilddata.getProperty('operatorRole');
    if(member.roles.cache.has(operatorRole)){
        hasOperatorRole = true;
    }
    if(!(session.user.id == cacheguild.ownerId || member.permissions.has(0x8) || hasOperatorRole)){
        res.sendStatus(404);
        return;
    }
    res.send(guilddata.getProperty('DisabledPlugins'));
    return;
});

router.post('/guild/:id/enableplugin', async (req, res) => {
    res.sendStatus(200); //TODO
});

router.get('/invite-link', async (req, res) => {
    if(inviteLink == undefined)
        inviteLink = '/';
    res.status(303).redirect(inviteLink);
});

module.exports = function (client) {
    discordclient = client;
    return router;
};