/*  bottle v0.1
 *  wikmans@kth.se
*/

var http = require("http"),
net = require("net"),
util = require("util"),

admins = ["davve"],
nick = "bottle2",
username = "Bottle beta bot",
channels = ["#testor1", "#testor2"],
server = "irc.freequest.net",
port = 6667,

log = [];

bottle = function() {
	var _ping = new RegExp(/^PING :/), 
	_connected = new RegExp(/^.*MODE.*\+iw$/m),
	irc = this.con = net.createConnection(port, server),
	self = this;

	irc.on("error", function(error) {
		console.log(error)
	});

	irc.on("connect", function() {
		this.write("NICK " + nick + "\n");
		this.write("USER bottle 8 * :" + username + "\n");
	});

	irc.on("data", function(data) {
		text = data.toString();

		if (_ping.test(text)) this.write(text.replace(/:/g, "") + "\n");

		else if (_connected.test(text)) for (i = 0; i < channels.length; i++) {
			this.write("JOIN " + channels[i] + "\n");
			self.say(channels[i], "Howdy ho \n");
		}

		else {
			self.parse(text);
		}
	});

	this.parse = function(input) {

		if (input.charAt(0) == ':') {
			prefix = input.slice(1, input.search(/ /) - 1);
			if (prefix.match(/@/)) {
				var user = prefix.slice(0, prefix.search(/!/)),
				host = prefix.slice(prefix.search(/!/) + 1),
				msg = input.slice(input.search(/ :/) + 2, input.length - 2);
			}
			var commands = input.slice(input.search(/ /) + 1, input.search(/ :/)),
			argv = commands.split(" ");
			console.log(argv);
		}

		if (argv) {
			switch (argv[0]) {
			case 'PRIVMSG':
				if (msg.match(/kat/i)) this.say(argv[1], "mjau");
				log.push({
					'date': new Date().toJSON(),
					'user': user,
					'host': host,
					'chan': argv[1],
					'msg': msg
				});
				break;

			case 'JOIN':
				if (admins.indexOf(user) != - 1) {
					this.con.write("MODE #" + msg.slice(1, msg.length) + " +o " + user + "\n");
				}
				break;

			case '352':
				break;
			}
			console.log(input);
		}
	}

	this.say = function(channel, something) {
		this.con.write("PRIVMSG " + channel + " :" + something + "\n");
	}
};

var bot = new bottle();

/* For debug purposes */
var buffer = "",
stdin = process.openStdin();
require("tty").setRawMode(true);
stdin.on("keypress", function(chunk, key) {
	if (chunk) {
		buffer += chunk;
	}

	if (key && key.name == "enter") {
		bot.con.write(buffer + "\n");
		buffer = "";
	}

	if (key && key.name == "f3") {
		bot.say(channels[0], buffer + "\n");
		console.log(channels[0] + " <bot> " + buffer);
		buffer = "";
	}

	if (key && key.ctrl && key.name === "p") for (i = 0; i < log.length; i++) console.log(log[i]);
	if (key && key.ctrl && key.name === "c") process.exit()
});

