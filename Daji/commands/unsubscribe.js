const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsubscribe')
        .setDescription('Removes your profile from the list to stop using notifications'),
    async execute(interaction, sub, subList) {

        //check if already subbed
        if (!sub) {
            interaction.reply(`You are Not a subscriber ${interaction.user.username}`);
            return;
        }

        //if yes then:
        

        const index = subList.indexOf(sub);
        subList.splice(index, 1);

        //append subscriber to subscribers.json

        await interaction.reply('Unsubscribed :(');
    },
};