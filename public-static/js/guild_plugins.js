//verificar
var yesbutton = document.getElementById('pluginbtnyes');
var nobutton = document.getElementById('pluginbtnno');
var inputplugins = document.querySelectorAll('input[data-plugin]');


//funciona
var pathArray = window.location.pathname.split('/');
let loadingcontent = document.getElementById('loadingcontent');
let dialog = document.getElementById('dialog');
loadingcontent.style.display = "flex";
fetch(`/api/guild/${pathArray[2]}/disabledplugins`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}).then(response =>{
    response.json().then(tojson =>{
        if(Array.isArray(tojson)){
            for (let i = 0; i < inputplugins.length; i++){
                inputplugins[i].checked = true;
            }
            for(let i = 0; i < tojson.length; i++){
                let aux = document.querySelector(`input[data-plugin="${tojson[i]}"]`);
                if(aux) aux.checked = false;
            }
        }
        loadingcontent.style.display = "none";
    })
});


//falta backend TODO
var enablecomplete = true;
function openPluginEnableDialog(plugin) {
    if(!enablecomplete){
        return;
    }
    let value = plugin.dataset['plugin'];
    yesbutton.dataset['plugin'] = value; //plugin is undefined?
    nobutton.dataset['plugin'] = value;
    dialog.style.display = "flex";
}

for (let index = 0; index < inputplugins.length; index++) {
    let element = inputplugins[index];
    element.addEventListener("click", (event) => {event.preventDefault(); openPluginEnableDialog(element)});
}

function enablePlugin(bool) {
    let plugin;
    //Probablemente se pueda condensar la siguiente linea en simplemente leer de uno de los botones
    //if(bool)
        plugin = yesbutton.dataset['plugin'];
    //else
       //plugin = nobutton.dataset['plugin'];
    enablecomplete = false;
    dialog.style.display = "none";
    fetch(`/api/guild/${pathArray[2]}/enableplugin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({active: bool, plugin: plugin})
    }).then(response =>{
        if(response.status != 200){
            alert('Unexpected error ocurred, error: ' + response.status);
            return;
        }
        let aux = document.querySelector(`input[data-plugin="${plugin}"]`);
        if(aux) aux.checked = bool;
        enablecomplete = true;
    });
}

yesbutton.addEventListener("click", enablePlugin.bind(undefined, true));
nobutton.addEventListener("click", enablePlugin.bind(undefined, false));