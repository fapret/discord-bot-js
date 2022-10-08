module.exports = {
    name: 'config.fn_setpluginenable',
    description: 'implementacion de setpluginenable',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_setpluginenable
}

async function fn_setpluginenable(dataManager, slashcommand) {
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
    let plugin = options.getString('plugin');
    if(plugin == 'config'){
        slashcommand.editReply({ content: 'El estado del plugin config no puede ser modificado'});
        return;
    }
    let enabled = options.getBoolean('enable');
    let DisabledPlugins = dataManager.GuildDataManager.getProperty('DisabledPlugins');
    if(enabled){
        if(DisabledPlugins.includes(plugin)){
            let index = DisabledPlugins.indexOf(plugin);
            DisabledPlugins.splice(index, 1);
        }
    } else {
        if(!DisabledPlugins.includes(plugin)){
            DisabledPlugins.push(plugin);
        }
    }
    try{
        dataManager.GuildDataManager.setProperty('DisabledPlugins', DisabledPlugins);
    } catch (err) {
        slashcommand.editReply({ content: 'Un error inesperado ha ocurrido, contacta con el administrador'});
        console.log(err); //TODO: Add bot log system
    }
    slashcommand.editReply({ content: 'Estado de activacion del plugin actualizado'});
}