module.exports = {
	name: 'echo',
	args: true,
	usage: '<thing-to-echo>',
	discription: 'gives you back the message that you typed',
	execute(message, args) {
		message.channel.send(`${args[0]}`);
	}
}