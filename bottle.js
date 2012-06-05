(function() {
  var admins, bot, bottle, fs, log, module_example, net, networks, nick, username;

  net = require("net");

  fs = require("fs");

  networks = new Array;

  log = [];

  admins = ["davve"];

  nick = "bottle_x";

  username = "Bottle beta bot";

  networks.push({
    "name": "freequest",
    "ip": "bier.de.eu.freequest.net",
    "port": 6667,
    "channels": ["#testorfq"]
  });

  networks.push({
    "name": "efnet",
    "ip": "irc.homelien.no",
    "port": 6667,
    "channels": ["#testorefnet"]
  });

  module_example = function(argv, input) {
    var jokes, number;
    jokes = fs.readFileSync("chuckfacts.txt", "utf8").split("\n");
    if (argv && argv[1] > 0 && argv[1] <= jokes.length) {
      number = argv[1];
    } else {
      number = Math.round(Math.random() * jokes.length);
    }
    return "Chuck norris fact #" + number + ": " + jokes[number];
  };

  bottle = function() {
    var channels, network, self, socket, _i, _len, _me, _ping;
    self = this;
    _me = new RegExp("^" + nick + ": (.*)");
    _ping = new RegExp(/^PING\ :/);
    this.modules = {
      "chuck": module_example,
      "rand": Math.random
    };
    this.modeset = false;
    this.modeflag = "+o";
    for (_i = 0, _len = networks.length; _i < _len; _i++) {
      network = networks[_i];
      console.log(network);
      socket = network.connection = new net.createConnection(network.port, network.ip);
      channels = network.channels;
      network.connection.on("error", function(error) {
        return console.log(error);
      });
      network.connection.on("connect", function(network) {
        this.write("NICK " + nick + "\n\r");
        this.write("USER bottle 0 * :" + username + "\n\r");
        this.write("JOIN " + networks.channels[0] + "\n\r");
        return console.log("joined " + network + "---------\n");
      });
      network.connection.on("data", function(data) {
        var response, text;
        text = data.toString();
        if (_ping.test(text)) {
          this.write(text.replace(/:/g, "") + "\n\r");
        } else {
          response = self.parse(text);
        }
        if (response) return this.write(response + "\n\r");
      });
    }
    return this.parse = function(input) {
      var channel, cmd, cmd_argv, commands, fn, hook, host, irc_argv, prefix, trailing, user, users, _ref;
      if (input.charAt(0 === ":")) {
        prefix = input.slice(1, (input.search(/\ /)) - 1);
        if (prefix.match(/@/)) {
          user = prefix.slice(0, prefix.search(/!/));
          host = prefix.slice((prefix.search(/!/)) + 1);
        }
        trailing = input.slice((input.search(/\ :/)) + 2, input.length - 2);
        commands = input.slice((input.search(/\ /)) + 1, input.search(/\ :/));
        irc_argv = commands.split(" ");
        channel = irc_argv[1];
      }
      if (irc_argv) {
        switch (irc_argv[0]) {
          case "PRIVMSG":
            if (_me.test(trailing)) {
              cmd = _me.exec(trailing);
              cmd_argv = cmd[1].split(" ");
              switch (cmd_argv[0]) {
                case "hey":
                  return self.say(channel, "sup");
                case "set":
                  if (admins.indexOf(user) !== -1 && cmd_argv[1].length === 2) {
                    self.modeset = true;
                    self.modeflag = cmd_argv[1];
                    return "NAMES " + channel;
                  }
                  break;
                default:
                  _ref = self.modules;
                  for (hook in _ref) {
                    fn = _ref[hook];
                    if (cmd_argv[0] === hook) {
                      return self.say(channel, fn(cmd_argv, trailing));
                    }
                  }
              }
            }
            break;
          case "JOIN":
            if (admins.indexOf(user) !== -1) {
              return self.mode(trailing.slice(0, trailing.length), [user], "+o");
            }
            break;
          case "353":
            if (this.modeset) {
              users = trailing.replace(/@/g, "");
              users = users.replace(/\+/g, "");
              users = users.replace("\n\r", "");
              users = users.split(" ");
              self.modeset = false;
              return self.mode(irc_argv[3], users, self.modeflag);
            }
        }
      }
      this.say = function(channel, something) {
        return "PRIVMSG " + channel + " :" + something;
      };
      this.mode = function(channel, folk, flags) {
        var str;
        str = "";
        cmd = "MODE " + channel + " " + flags;
        users = [];
        for (i = 0, mode = flags; i < folk.length; i++) {
				mode += flags.slice(1);
				users.push(folk[i]);
				if (i > 0 && i % 6 === 0 || folk.length === i + 1) {
					str += cmd + mode + " " + users.join(" ").replace(nick, "") + "\r";
					while (users.length > 0)
						users.pop();
					mode = flags;
				}
			};
        return str;
      };
    };
  };

  bot = new bottle;

}).call(this);
