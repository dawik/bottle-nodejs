/*  bottle v0.1
 *  wikmans@kth.se
*/

var http = require("http");
var net = require("net");
var util = require("util");

var admins = ["davve"];
var nick = "bottle";
var username = "Bottle beta bot";
var channels = ["#testor", "#testor1"];
var server = "irc.freequest.net";
var port = 6667;

var log = [];

bottle = function() {
	var _ping = new RegExp(/^PING :/)
	var _connected = new RegExp(/^.*MODE.*\+iw$/m)

	self = this;

	irc = this.con = net.createConnection(port, server);

	irc.on("error", function(error) {
		console.log(error)
	});

	irc.on("connect", function() {
		this.write("NICK " + nick + "\n");
		this.write("USER bottle 8 * : " + username + "\n");
	});

	irc.on("data", function(data) {
		text = data.toString();
		if (_ping.test(text)) this.write(text.replace(/:/g, "") + "\n");
		else self.parse(text);
	});

	this.parse = function(input) {

		if (input.charAt(0) == ':') {
			prefix = input.slice(1, input.search(/ /) - 1);
			if (prefix.match(/@/)) {
				user = prefix.slice(0, prefix.search(/!/));
				host = prefix.slice(prefix.search(/!/) + 1);
				msg = input.slice(input.search(/ :/) + 2, input.length - 2);
				console.log(msg);
			}
			var commands = input.slice(input.search(/ /) + 1, input.search(/ :/));
			var argv = commands.split(" ");
			console.log(argv);
		}

		if (argv) {
			if (argv[0] == 'PRIVMSG') {
				if (msg.match(/kat/i)) this.say(argv[1], "mjau");
				log.push({
					'date': new Date().toJSON(),
					'user': user,
					'host': host,
					'chan': argv[1],
					'msg': msg
				});
			}

			else if (argv[0] == 'JOIN') {
				if (admins.indexOf(user) != - 1) {
					this.con.write("MODE #" + msg.slice(1, msg.length) + " +o " + user + "\n");
				}
			}

			else if (argv[0] == '352') { // Who list
				console.log('mjauu');
			}

		}

		if (_connected.test(input)) for (i = 0; i < channels.length; i++) {
			self.con.write("JOIN " + channels[i] + "\n");
			self.say(channels[i], "Howdy ho \n");
		}

		console.log(input);
	}

	this.say = function(channel, something) {
		this.con.write("PRIVMSG " + channel + " :" + something + "\n");
	}
};

var bot = new bottle();

/* For debug purposes */
var buffer = "";
var stdin = process.openStdin();
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

