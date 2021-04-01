'use strict';
 let prefix = '$';

const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => { console.log("Ready !"); });
client.login(process.env.TOKEN);

client.on('message', commandHandler);

function commandHandler(message) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "help") {
        message.channel.send('This bot does not have any useful commands yet \n you can always request new features from the owner here:\n *will insert a link to my account when i figure out how* ');
    }
}