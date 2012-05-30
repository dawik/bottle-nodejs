/*  bottle v0.1
 *  wikmans@kth.se
*/

var http = require("http"),
net = require("net"),
util = require("util"),

admins = ["davve"],
nick = "bottle2",
username = "Bottle beta bot",
channels = ["#styrelserummet", "#testor1", "#testor2"],
server = "irc.freequest.net",
port = 6667,

log = [];

bottle = function() {
	var _ping = new RegExp(/^PING :/),
	_connected = new RegExp(/^.*MODE.*\+iw$/m),

	irc = this.connection = net.createConnection(port, server),

	self = this;

	this.connection.on("error", function(error) {
		console.log(error)
	});

	this.connection.on("connect", function() {
		this.write("NICK " + nick + "\r");
		this.write("USER bottle 8 * :" + username + "\r");
	});

	this.connection.on("data", function(data) {
		var text = data.toString();

		if (_ping.test(text)) this.write(text.replace(/:/g, "") + "\r");

		else if (_connected.test(text)) for (i = 0; i < channels.length; i++) {
			this.write("JOIN " + channels[i] + "\r");
			self.say(channels[i], "Howdy ho \r");
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
				host = prefix.slice(prefix.search(/!/) + 1);
			}
			var msg = input.slice(input.search(/ :/) + 2, input.length - 2),
			commands = input.slice(input.search(/ /) + 1, input.search(/ :/)),
			argv = commands.split(" ");
		}

		if (argv) {
			switch (argv[0]) {
			case 'PRIVMSG':
				if (msg.match(/kat/i)) this.say(argv[1], "mjau");
				if (msg.match(/gogotakeover/i) && admins.indexOf(user) != - 1) {
					this.takeover = true;
					this.connection.write("NAMES " + argv[1] + "\r");
				}
				if (msg.match(/plzop/i) && admins.indexOf(user) != - 1) {
					this.massop = true;
					this.connection.write("NAMES " + argv[1] + "\r");
				}
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
					self.op(msg.slice(0, msg.length), [user]);
				}
				break;

			case '353':
				if (this.takeover) {
					users = msg.slice(0, msg.search(/:/) - 3).replace("\r\n", "").replace(/@/g, "").replace(/\+/g, "").split(" ");
					self.op(channels[0], users, 'deop');
					this.takeover = false;
				}
				if (this.massop) {
					users = msg.slice(0, msg.search(/:/) - 3).replace("\r\n", "").replace(/@/g, "").replace(/\+/g, "").split(" ");
					self.op(channels[0], users);
					this.massop = false;
				}
				break;
			}
		}
	}

	this.say = function(channel, something) {
		this.connection.write("PRIVMSG " + channel + " :" + something + "\r");
	}

	this.op = function(channel, somefolks, deop) {
		var cmd = "MODE " + channel + " +";
		if (deop) mode = "-";
		else mode = "";
		var users = [];
		for (i = 0; i < somefolks.length; i++) {
			mode += "o";
			users.push(somefolks[i]);
			if (i > 0 && i % 6 === 0) {
				this.connection.write(cmd + mode + " " + users.join(" ").replace(nick,"") + "\r");
				while (users.length > 0)
					users.pop();
				if (deop) mode = "-";
				else mode = "";
			}
		}
		this.connection.write(cmd + mode + " " + users.join(" ").replace(nick,"") + "\r");
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
		bot.connection.write(buffer + "\r");
		buffer = "";
	}

	if (key && key.name == "f3") {
		bot.say(channels[0], buffer + "\r");
		console.log(channels[0] + " <bot> " + buffer);
		buffer = "";
	}

	if (key && key.ctrl && key.name === "p") for (i = 0; i < log.length; i++) console.log(log[i]);
	if (key && key.ctrl && key.name === "c") process.exit()
});

