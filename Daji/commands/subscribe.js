const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Saves your profile to enable party notifications'),
    async execute(interaction, sub, subList) {

        //check if already subbed
        if (sub) {
            await interaction.reply(`You are already a subscriber ${sub.user.username} \nUse /view to view the games you subbed to`);
            return;
        }

        //if not then:
        let newSub = {
            user: interaction.user,
            games: [],
            guild: interaction.guild
        }
        subList.push(newSub);

        //append subscriber to subscribers.json

        await interaction.reply('Subscribed');
    },
};