const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');

function collectChoices() {


    //duplicate code clean later
    ChoicesList = [];
    twoDimList = [];

    if (fs.existsSync('popularGames.json')) {
        usersString = fs.readFileSync('popularGames.json', { encoding: 'utf-8' });

        if (!(usersString === "")) {
            ChoicesList = JSON.parse(usersString);

        }
    } else {
        console.log("file does not exit");
    }


    ChoicesList.reduce(function (prev, curr, currIndx) { twoDimList.push({ name: curr, value: curr }) }, {});

    //for (const pair of twoDimList) {
    //    console.log(pair);
    //}
    return twoDimList;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a game from the list of games you subbed to for notifications')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('The Game to remove')
                .setRequired(true).addChoices(...collectChoices())),

    //add choices based on a list of popular games on the server

    async execute(interaction, subscriber) {

        //check if already subbed
        if (!subscriber) {
            await interaction.reply(`You are not a subscriber ${sub.user.username} \nUse /Subscribe to subscribe the notifications`);
            return;
        }
        //if yes then:

        for (const game of subscriber.games) {
            if (game === interaction.options.getString('game')) {

                const index = subscriber.games.indexOf(game);
                subscriber.games.splice(index, 1);

                interaction.reply(`The game ${game} has been removed from the list`);
                return;
            }

        }

        interaction.reply(`The game ${interaction.options.getString('game')} is not in your list of games`);
        return
        //retrive profile from subscribers.json
        //check if they already subbed to game
        //if yes then:
        //remove game from their profile
    },
};