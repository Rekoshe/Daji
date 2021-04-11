module.exports = {
	name: 'echo',
	args: true,
	numArgs: 1,
	usage: '<thing-to-echo>',
	description: 'gives you back the message that you typed',
	execute(message, args) {
		message.channel.send(`${args[0]}`);
	}
}