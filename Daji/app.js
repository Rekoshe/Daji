'use strict';
let prefix = '$';
const usersFilePath = 'users.json'

const fs = require('fs');
const User = require('./user'); //new User(id, prefix, name);

let users = [];
let usersString;


if (fs.existsSync(usersFilePath)) {
    usersString = fs.readFileSync(usersFilePath, { encoding: 'utf-8' });

    if (!(usersString === "")) {
        users = JSON.parse(usersString);
        
    }

} else {
    fs.writeFileSync(usersFilePath, "");
}








//fs.appendFile('users.json', jsonString, (err) => {
//    if (err) throw err;
//});


const dotenv = require('dotenv');
dotenv.config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}




function checkForUsers(message) {
    

    for (let user of users) {
        
        //console.log(user.author.id);
        if (user.author.id === message.author.id) {
            prefix = user.prefix;
            return user;
        }

    }

    prefix = '$';
    const newUser = new User(message.author, prefix);

    users.push(newUser);
    fs.writeFile(usersFilePath, JSON.stringify(users), (err) => { });
    //console.log("New user!: " + message.author.username);
    message.channel.send("New User!: " + message.author.username);
    return newUser;
}

function OnReady() {
    client.user.setActivity('for $help', { type: 'WATCHING' });
}



client.once('ready', OnReady);



client.login(process.env.TOKEN);




client.on('message', commandHandler);


//console.log(aUser.id);

function commandHandler(message) {

    if (message.author.bot) {
        return;
    }

    let user = checkForUsers(message);

    


    if (!message.content.startsWith(user.prefix)) {
        if (message.channel.type === 'dm') {
            console.log(`${message.author.username}: ${message.content}`);
        }
        return;
    }

    const args = message.content.slice(user.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    

    //console.log(commandName);
    if (!client.commands.has(commandName)) return;
    

    const command = client.commands.get(commandName);
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${user.prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    

    try {
        command.execute(message, args, user);
        
        
        if (command.userCommand) {
            fs.writeFile(usersFilePath, JSON.stringify(users), (err) => { });
            console.log("users re written");
        }

    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    } finally {
        console.log(`${message.author.username} invoked ${command.name}`);
    }
}