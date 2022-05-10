const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view')
        .setDescription('View the games you subbed to for notifications'),
    async execute(interaction, subscriber) {

        //check if already subbed

        if (!subscriber) {
            await interaction.reply(`You are not a subscriber ${subscriber.user.username} \nUse /Subscribe to subscribe the notifications`);
            return;
        }
        //if yes then:
        let list = "";

        if (subscriber.games.length == 0) {
            await interaction.reply('You are not subscribed to any games \nUse /add to add games to your list');
            return;
        }

        for (const game of subscriber.games) {
            list += game;
            list += '\n'
        }

        //retrive profile from subscribers.json

        await interaction.reply("Here's a list of the games you're subbed to:\n" + list + "Use /add or /remove to manipulate the list");
    },
};