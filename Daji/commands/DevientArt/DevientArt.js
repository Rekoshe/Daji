const axios = require('axios');


const nsfw = false;


module.exports = {
    name: 'devientart',
    args: true,
    usage: '<browseType> <tag> <howMany> <timeRange> \nex: `devientart popular anime 1 now`',
    description: 'send some images from Deviant Art using a specified tag',
    execute(message, args) {
        let images;

        async function formatMessage() {
            images = await getImageSrc(args[0], args[1], args[3], args[2], nsfw);
        }

        formatMessage().then(() => {
            console.log(images);
            let imageSrc = images[0].content.src;
            for (var i = 0; i < images.length; i++) {
                imageSrc += images[i].content.src + '\n';

            }
            message.channel.send(imageSrc);
        }).catch(reason => {
            console.log(reason);
        })

        formatMessage();
        
    }
}

async function getImageSrc(browseType, querry, timeRange, limit, nsfw) {
    let baseURL = "https://www.deviantart.com/oauth2/token?";
    let accessTokenRequest = `${baseURL}grant_type=${process.env.grant_type}&client_id=${process.env.clientId}&client_secret=${process.env.clietnSecret}`;
    let access_token;

    await axios.get(accessTokenRequest).then(response => {
        access_token = response.data.access_token;
        getSrc(access_token, browseType, querry, timeRange, limit, nsfw).then((value) => {
            return value;
        })
    }).catch(reason => {
        console.log(reason);
    })

    
}



async function getSrc(token, browseType, querry, timeRange, limit, nsfw) {
    let imageRequest = "https://www.deviantart.com/api/v1/oauth2/browse/";
    imageRequest += `${browseType}?`;
    imageRequest += `q=${querry}&`;
    imageRequest += `timerange=${timeRange}&`;
    imageRequest += `limit=${limit}&`;
    imageRequest += `with_session=false&mature_content=${nsfw}&`;
    imageRequest += `access_token=${token}`;

    await axios.get(imageRequest).then(response => {
        return response.data.results;     
    }).then(reason => {
        console.log(reason);
    })
}
