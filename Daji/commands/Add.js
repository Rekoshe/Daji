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
        .setName('add')
        .setDescription('add a game to the list of games you subbed to for notifications')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('The Game to sub to')
                .setRequired(true).addChoices(...collectChoices())),

    //add choices based on a list of popular games on the server

    async execute(interaction, subscriber) {

        //check if already subbed
        if (!subscriber) {
            await interaction.reply(`You are not a subscriber ${interaction.user.username} \nUse /Subscribe to subscribe the notifications`);
            return;
        }
        
        //if yes then:
        


        //retrive profile from subscribers.json
        //check if they already subbed to game
        for (game of subscriber.games) {
            if (game === interaction.options.getString('game')) {
                interaction.reply(`${interaction.options.getString('game')} is already in your list of subbed games`);
                return;
            }
        }
        //if no then:
        //add game to their profile
        subscriber.games.push(interaction.options.getString('game'));

        await interaction.reply(`${interaction.options.getString('game')} has been added to your list of subbed games`);
    },
};