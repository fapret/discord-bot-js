const Express = require("express");
var router = Express.Router();
const { type } = require("express/lib/response");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); //import fetch from 'node-fetch';

const client_id = process.env.CLIENTID;
const client_secret = process.env.SECRET;
const redirect_uri = process.env.REDIRECT_URI;

router.get('/discord', async (req, res) => {
    let session = req.session;
    if(req.query.code){
        let discordtokenask = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `client_id=${client_id}&client_secret=${client_secret}&grant_type=authorization_code&code=${req.query.code}&redirect_uri=${redirect_uri}`
        });
        let aux = await discordtokenask.text();
        session.dstoken = JSON.parse(aux);

        let discorduserask = await fetch('https://discord.com/api/users/@me', {
            method: 'GET',
            headers: {
                'Authorization': `${session.dstoken.token_type} ${session.dstoken.access_token}`
            }
        });
        aux = await discorduserask.text();
        let user = JSON.parse(aux);

        session.user = user;
    }
    res.redirect('/');
});

router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.post('/logout', async (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
});

module.exports = router;