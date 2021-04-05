module.exports = {
	name: 'changeprefix',
	args: true,
	usage: '<prefix>',
	userCommand: true,
	description: 'change your prefix!!',
	execute(message, args, user) {
		user.prefix = `${args[0]}`;
		message.channel.send("Your prefix has changed to " + args[0] );
	}
}
