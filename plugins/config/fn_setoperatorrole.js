module.exports = {
    name: 'config.fn_setoperatorrole',
    description: 'implementacion de setoperatorrole',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_setoperatorrole
}

async function fn_setoperatorrole(dataManager, slashcommand) {
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
    let role = options.getRole('rol').toString().slice(3, -1);
    try{
        dataManager.GuildDataManager.setProperty('operatorRole', role);
    } catch (err) {
        slashcommand.editReply({ content: 'Un error inesperado ha ocurrido, contacta con el administrador'});
        console.log(err); //TODO: Add bot log system
        dataManager.microlib.logError(err.toString());
    }
    slashcommand.editReply({ content: 'Rol de operador actualizado'});
}