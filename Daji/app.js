'use strict';
let prefix = '$';
const usersFilePath = 'users.json';
const viewerRoleName = 'viewer';
const streamerRoleName = 'strimmer';

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
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER' ] });

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

function checkForRole(guild, roleName) {
    for (const role of guild.roles.cache.array()) {
        if (role.name === roleName) {
            return role;     
        }
    }
    return guild.roles.create({
        data: {
            name: roleName,
            color: 'YELLOW'
        }
    }).catch(console.error)
}


function OnReady() {
    client.user.setActivity('for $help', { type: 'WATCHING' });

    for (const guild of client.guilds.cache.array()) {
        if (guild.available) {
            checkForRole(guild, viewerRoleName);
            checkForRole(guild, streamerRoleName);
        }
    }
    
}

function onPresenceUpdate(oldPres, newPres) {
    console.log(newPres.streaming);
    if (oldPres.streaming === newPres.streaming) {
        return;
    }

    let streamerRole;

    for (const role of newPres.member.roles.cache.array()) {
        if (role.name === streamerRoleName) {
            streamerRole = role;
            break;
        }
    }

    if (!streamerRole) { return; }



    if (newPres.streaming) {
        

        for (const role of newPres.guild.roles.cache.array()) {
            if (role.name === viewerRoleName) {

                if (!role.members) {
                    console.log("role doesn't have memebers");
                    continue;
                }

                //if (!role.members.cache) {
                //    console.log(role.members.);
                //    continue;
                //}

                let data = "";

                for (const member of role.members.array()) {
                    data += member.user.toString();
                    
                }
                for (const channel of newPres.guild.channels.cache.array()) {
                    if (channel.type === 'text') {
                        channel.send(data + `\n${newPres.member.user.username} started streaming!`);
                        return;
                    }
                }
                
                // 
            }
        }
        
    }
}

client.once('ready', OnReady);

client.login(process.env.TOKEN);

client.on('voiceStateUpdate', onPresenceUpdate);


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