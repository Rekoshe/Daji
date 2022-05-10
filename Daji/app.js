'use strict';
const viewerRoleName = 'viewer';
const streamerRoleName = 'strimmer';
const subsFilePath = 'subscribers.json';
const gamesFilePath = 'popularGames.json';
const fs = require('node:fs');
//const Sub = require('subscriber.js');

const dotenv = require('dotenv');
dotenv.config();

const { Client, Collection, Intents } = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES
    ]
    }
);

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

let subsList = [];
let usersString;

if (fs.existsSync(subsFilePath)) {
    usersString = fs.readFileSync(subsFilePath, { encoding: 'utf-8' });

    if (!(usersString === "")) {
        subsList = JSON.parse(usersString);

    }

} else {
    fs.writeFileSync(subsFilePath, "");
}

let listOfPopularGames = [];
let gamesString;

if (fs.existsSync(gamesFilePath)) {
    gamesString = fs.readFileSync(gamesFilePath, { encoding: 'utf-8' });

    if (!(gamesString === "")) {
        listOfPopularGames = JSON.parse(gamesString);

    }

} else {
    fs.writeFileSync(gamesFilePath, "");
}

function checkForRole(guild, roleName) {
    for (const role of guild.roles.cache.values()) {
        if (role.name === roleName) {

            //debug:
            //console.log(`role found: ${roleName}`);

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

    client.user.setActivity('for streamers', { type: 'WATCHING' });

    for (const guild of client.guilds.cache.values()) {
        if (guild.available) {

            //debug:
            //console.log(`guild available: ${guild}`);

            checkForRole(guild, viewerRoleName);
            checkForRole(guild, streamerRoleName);
        }
    }

    console.log("Ready");
    
}

async function partyFinder(oldState, newState) {
    if (newState.equals(oldState)) {

        //debug:
        console.log("the oldstate is the same as new state");

        return;
    }

    let channel = newState.member.voice.channel;

    if (!channel) {

        //debug:
        //console.log(`member ${newState.member.user.username} is not in a voiceChannel in ${newState.guild.name}`);

        return;
    }

    if (channel.members.size > 1) {

        //debug
        console.log(`channel ${channel.name} has more than 1 member`);

        let players = new Map();

        for (const member of channel.members.values()) {

            if (!member.presence) {

                //debug:
                console.log(`member ${member.user.username} does not have a presence`);
                continue;

            }

            for (const activity of member.presence.activities) {

                if (activity.type === 'PLAYING') {
                    players.set(member, activity.name);

                    //debug
                    console.log(`found ${member.user.username} playing ${activity.name}`);
                }
            }
        }

        if (players.size <= 1) {

            //debug:
            console.log("not enough players playing games to call it a party")

            return;
        }

        let numOfDuplicates = 0;
        let duplicate = "";

        players.forEach(function (game, player) {
            if (duplicate.length == 0) {
                duplicate = game;
            }
            if (duplicate === game) {
                numOfDuplicates++;
            }
        });

        if (numOfDuplicates < 1) {

            //debug
            console.log("no two players playing the same game were found");

            return;

        }

        let membersplaying = [];

        //game found with players
        console.log(`game being played by multiple people is ${duplicate}`);
        players.forEach(function (game, player) {
            if (game === duplicate) {
                membersplaying.push(player);
            }
        })

        if (membersplaying.length <= 1) {
            //debug:
            console.log("error in collecting members");
            return;
        }

        let data = "";

        for (const playername of membersplaying) {
            data += `${playername.user.username} `;

            if (!(playername == membersplaying[membersplaying.length - 1])) {
                data += "and ";
            }
        }

        for (const channel of newState.guild.channels.cache.values()) {
            if (channel.type === 'GUILD_TEXT') {

                //debug
                //console.log(`to be sent in ${channel}`);

                await channel.send(data + `are playing ${duplicate}! \n@everyone come chill`);
                return;

            }

        }

    } else {

        //debug
        console.log(`channel ${channel.name} doesn't have enough members`);
    }
}

function addToPopularGames(newState) {
    let detectedGame;

    if (newState == null) {
        return;
    }

    if (newState.activities.length == 0) {
        return;
    }

    // duplicate code, clean this later
    for (const activity of newState.activities) {
        if (activity.type == 'PLAYING') {
            detectedGame = activity.name;
            break;
        }
    }

    if (!detectedGame) {
        return;
    }

    let detectedGameS = detectedGame.replace(/\s/g, '').toLowerCase();

    for (const game of listOfPopularGames) {

        let gameS = game.replace(/\s/g, '').toLowerCase();

        if (gameS === detectedGameS) {
            return;
        }
    }

    detectedGame = detectedGame.trim();

    listOfPopularGames.push(detectedGame);

    fs.writeFile(gamesFilePath, JSON.stringify(listOfPopularGames), (err) => { });

    console.log(`${detectedGame} added to list of popular games`);
}

async function presenceStateUpdate(oldState, newState) {

    addToPopularGames(oldState);
    addToPopularGames(newState);

    let detectedGame;

    if (newState.activities.length == 0) {

        //debug
        //console.log("no activities are in the new state");

        return;
    }

    // duplicate code, clean this later
    for (const activity of newState.activities) {
        if (activity.type == 'PLAYING') {
            detectedGame = activity.name;

            //debug:
            //console.log(`${detectedGame} is being played`);

            break;
        }
    }

    if (!detectedGame) {

        //debug:
        //console.log(`no game is being played`);

        return;
    }

    let playerName;
    let subscriberList = [];

    for (const subscriber of subsList) {

        

        if (newState.guild.id === subscriber.guild.id) {

            if (subscriber.user.id === newState.user.id) {

                //debug:
                //console.log("prevented noti from being sent to the same user");

                return;
            }

            //debug:
            //console.log("new state is from one of the subs guild");

            let detectedGameS = detectedGame.replace(/\s/g, '').toLowerCase();

            //debug:
            //console.log(`${detectedGameS} has been detected`);

            for (const game of subscriber.games) {

                
                let gameS = game.replace(/\s/g, '').toLowerCase();

                if (detectedGameS === gameS) {
                    playerName = newState.user.username;
                    subscriberList.push(subscriber);

                    //debug:
                    //console.log(`found subscriber ${subscriber.user.username} is subbed to ${gameS}`);

                    break;
                }
            }
        }
    }

    if (!playerName || !subscriberList) {

        //console.log("nothing has been found");

        return;
    }

    for (const subscriberObj of subscriberList) {



        client.users.fetch(subscriberObj.user.id).then(function sendDM(user) {

            user.send(`${playerName} has just started playing **${detectedGame}**!`).then(function log() {
                console.log(`${subscriberObj.user.username} has been sent a DM about ${playerName} playing ${detectedGame}`);
            });

            console.log(`${subscriberObj.user.username} has been sent a DM about ${playerName} playing ${detectedGame}`);

        }, function logError(reason) {

            console.log(`fetching user rejected with reason ${reason}`);
        });
    }
}

async function onStateUpdate(oldState, newState) {

    //debug
    //console.log(`voice state changed for ${newState.member.nickname}`);



    if (oldState.streaming === newState.streaming) {

        //debug:
        //console.log("the oldstate is the same as new state");

        return;
    }

    let streamerRole;

    for (const role of newState.member.roles.cache.values()) {
        if (role.name === streamerRoleName) {

            //debug:
            //console.log(`found a streamer with role ${role.name}`);

            streamerRole = role;
            break;
        }
    }

    if (!streamerRole) {

        //debug:
        //console.log("streamerRole is undefined");

        return;
    }



    if (newState.streaming) {

        //debug:
        //console.log("detected newState.streaming");

        //debug:
        //console.log(`newState presence status for ${newState.member.nickname}`);

        let game = 'something';

        //get the game they're streaming
        for (const activity of newState.member.presence.activities) {
            if (activity.type === 'PLAYING') {
                game = activity.name;

                //debug:
                //console.log(`detected that streamer is playing ${game}`);

                break;
            }
        }


        for (const role of newState.guild.roles.cache.values()) {

            
            if (role.name === viewerRoleName) {

                if (!role.members) {

                    //debug:
                    //console.log("viewer role doesn't have memebers");

                    continue;
                }

                //if (!role.members.cache) {
                //    console.log(role.members.);
                //    continue;
                //}

                let data = "";
                

                for (const member of role.members.values()) {
                    data += member.user.toString();

                    //debug
                    //console.log(`to be mensioned ${member}`);
                    
                }
                for (const channel of newState.guild.channels.cache.values()) {
                    if (channel.type === 'GUILD_TEXT') {

                        //debug
                        //console.log(`to be sent in ${channel}`);

                        await channel.send(data + `\n${newState.member.user.username} started streaming **${game}**!`);


                        return;

                    }

                    
                }                             
            }
        }      
    }

    //debug:
    //console.log("something went wrong");

}

client.once('ready', OnReady);

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    let Subscriber;

    if (subsList)
    {
        for (const sub of subsList) {
            if (interaction.user.id === sub.user.id) {
                Subscriber = sub;

                //debug:
                //console.log("sub found");

                break;
            }
        }
    }

    try {
        await command.execute(interaction, Subscriber, subsList);
        fs.writeFile(subsFilePath, JSON.stringify(subsList), (err) => { });

        //debug:
        console.log(`${interaction.user.username} used ${interaction.commandName}`);

    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('voiceStateUpdate', onStateUpdate);

client.on('presenceUpdate', presenceStateUpdate);

client.login(process.env.TOKEN);



