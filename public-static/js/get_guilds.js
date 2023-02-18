async function changeLoadingStatus() {
    const style = getComputedStyle(document.getElementById('loadbar'), "").display;
    if (style == "none"){
      document.getElementById('loadbar').style.display = "block";
    } else {
      document.getElementById('loadbar').style.display = "none";
    }
}

function parseGuildHTML(guild){
    let inviteOrAccess = "INVITAR";
    let hrefLink = '/api/invite-link';
    let inviteStyle = "guild-login-invite";
    if(guild.bot){
        inviteOrAccess = "ACCEDER";
        hrefLink = `/guild/${guild.id}`;
        inviteStyle = "";
    }
    let icon = "https://cdn.discordapp.com/icons/" + guild.id + "/" + guild.icon + ".jpg";
    let out = `<div class="guild-item">
        <a class="guild-item-a" href="${hrefLink}">
        <div class="guild-img-div" style="background:  url(${icon}) center center / cover no-repeat">
            <img class="guild-img" src="${icon}"/>
        </div>
        <div class="guild-data">
            <div class="guild-name">
                <p class="guild-name-text">${guild.name}</p>
            </div>
            <div class="guild-login ${inviteStyle}">
                    <button id="button" class="nav-profile-button">
                        <p class="guild-text">${inviteOrAccess}</p>
                    </button>
            </div>
        </div>
        </a>
    </div>`;
    return out;
}


changeLoadingStatus();
fetch('/api/managed-guilds', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}).then(response =>{
    response.json().then(tojson =>{
        if(Array.isArray(tojson)){
            tojson.sort(function(a, b) {
                if (a.bot == true && b.bot == false) {
                  return -1;
                }
                if (a.bot == false && b.bot == true) {
                  return 1;
                }
                return 0;
            });
            let list = document.getElementById('guilds-list');
            for (let index = 0; index < tojson.length; index++) {
                const element = tojson[index];
                list.insertAdjacentHTML('beforeend', parseGuildHTML(element));
            }
        }
        changeLoadingStatus();
    })
});