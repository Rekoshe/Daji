const axios = require('axios');


const nsfw = true;
const limit = 1;
const browseType = 'newest';
const timeRange = 'now';

module.exports = {
    name: 'devientart',
    args: true,
    numArgs : 1,
    usage: '<tag>',
    description: 'sends an image from Deviant Art using a specified tag',
    async execute(message, args) {

        const images = await getSrc(browseType, args[0], timeRange, limit, nsfw);

        //console.log(images);
        let imageSrc = '';
        
        for (const image of images) {
            console.log(image.is_mature);
            if (image.is_mature && !message.channel.nsfw) {
                imageSrc += "This image is marked as nsfw and can't be sent in a non Nsfw channel";
                imageSrc += `\n Here's the Url instead ${image.url}`;
                continue;
            }

            imageSrc += image.content.src + '\n';

        }

        if (!images.length) {
            message.channel.send("Sorry no results were found.");
            return;
        }

        
        //console.log(images);
        message.channel.send(imageSrc);
    }
}




async function getSrc(browseType, querry, timeRange, limit, nsfw) {

    let baseURL = "https://www.deviantart.com/oauth2/token?";
    let accessTokenRequest = `${baseURL}grant_type=${process.env.grant_type}&client_id=${process.env.clientId}&client_secret=${process.env.clietnSecret}`;
    let access_token;

    await axios.get(accessTokenRequest).then(response => {
        access_token = response.data.access_token;
    }).catch(reason => {
        console.log(reason);
    })

    //console.log( "got token: "+  access_token);

    let imageRequest = "https://www.deviantart.com/api/v1/oauth2/browse/";
    imageRequest += `${browseType}?`;
    imageRequest += `q=${querry}&`;
    //imageRequest += `timerange=${timeRange}&`;
    imageRequest += `limit=${limit}&`;
    imageRequest += `with_session=false&mature_content=${nsfw}&`;
    imageRequest += `access_token=${access_token}`;

    let results;

    await axios.get(imageRequest).then(response => {
        //console.log(response);
        results = response.data.results; 
    }).then(reason => {
        console.log(reason);
    })

    //console.log(results);
    return results;
}
