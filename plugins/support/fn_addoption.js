const Discord = require('discord.js');

module.exports = {
    name: 'support.fn_addoption',
    description: 'implementacion de fn_addoption',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_addoption
}

async function fn_addoption(dataManager, slashcommand) {
    let pluginManager = dataManager.PluginDataManager;
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
    let message = await slashcommand.channel.messages.fetch(options.getString('id'));
    let category = options.getChannel('category')?.id;
    let waittime = options.getString('waittime'); //TODO waittime betwen ticket creation
    let timeregex = /^[0-9]{1,} ((minute)|(hour)|(day)|(week)|(month))(s?)$/i;
    let validwaittime = timeregex.test(waittime); //si waittime es undefined, retorna false
    let timeType;
    let timeAmount;
    if(message){
        if(validwaittime){
            timeType = waittime.replace(/^[0-9]{1,} /,'');
            timeAmount = waittime.replace(/ ((minute)|(hour)|(day)|(week)|(month))(s?)$/i,'');
        } else {
            timeType = 'minute';
            timeAmount = 0;
        }
        let supportMessageData = pluginManager.readData(options.getString('id'));
        if (supportMessageData){
            if(supportMessageData.optionsAmount < 25){
                try{
                    supportMessageData.optionsAmount++;
                    supportMessageData.options.push({id: supportMessageData.optionsAmount, modrole: options.getRole('modrole').id, text: options.getString('text').toString(), category: category, timeType: timeType, timeAmount: timeAmount});
                    pluginManager.writeData(options.getString('id'), supportMessageData);
                    slashcommand.editReply({ content: 'Opcion agregada correctamente'});
                } catch(err) {
                    slashcommand.editReply(err.toString());
                    return;
                }
            } else {
                slashcommand.editReply({ content: 'Ya se alcanzo el maximo de opciones disponibles, no es posible agregar mas opciones'});
                return;
            }
        } else {
            try{
                supportMessageData = {
                    optionsAmount: 1,
                    ticketsAmount: 0,
                    ticketsOpen: 0,
                    options: [{id: 1, modrole: options.getRole('modrole').id, text: options.getString('text').toString(), category: category, timeType: timeType, timeAmount: timeAmount}]
                }
                pluginManager.writeData(options.getString('id'), supportMessageData);
                slashcommand.editReply({ content: 'Opcion agregada correctamente'});
            } catch(err) {
                slashcommand.editReply(err.toString());
                return;
            }
        }
    } else {
        slashcommand.editReply({ content: 'No se encontro el mensaje a agregar la opcion :c'});
        return;
    }
}