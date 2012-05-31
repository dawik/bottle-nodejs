(function() {
  var admins, bot, bottle, channels, http, log, net, nick, port, server, username, util;

  http = require("http");

  net = require("net");

  util = require("util");

  admins = ["davve"];

  nick = "bottle";

  username = "Bottle beta bot";

  channels = ["#testor1", "#testor2"];

  server = "irc.freequest.net";

  port = 6667;

  log = [];

  bottle = function() {
    var irc, self, _connected, _ping;
    self = this;
    _ping = new RegExp(/^PING\ :/);
    _connected = new RegExp(/^.*MODE.*\+iw$/m);
    irc = this.connection = net.createConnection(port, server);
    this.connection.on("error", function(error) {
      console.log(error);
    });
    this.connection.on("connect", function() {
      this.write("NICK " + nick + "\r");
      this.write("USER bottle 8 * :" + username + "\r");
    });
    this.connection.on("data", function(data) {
      var channel, text, _fn, _i, _len;
      text = data.toString();
      if (_ping.test(text)) this.write(text.replace(/:/g, "") + "\r");
      if (_connected.test(text)) {
        _fn = function(channel) {
          self.connection.write("JOIN " + channel + "\r");
          self.say(channel, "Howdee ho\r");
        };
        for (_i = 0, _len = channels.length; _i < _len; _i++) {
          channel = channels[_i];
          _fn(channel);
        }
      } else {
        self.parse(text);
      }
    });
    this.parse = function(input) {
      var argv, commands, host, msg, prefix, user, users;
      if (input.charAt(0 === ":")) {
        prefix = input.slice(1, (input.search(/\ /)) - 1);
        if (prefix.match(/@/)) {
          user = prefix.slice(0, prefix.search(/!/));
          host = prefix.slice((prefix.search(/!/)) + 1);
        }
        msg = input.slice((input.search(/\ :/)) + 2, input.length - 2);
        commands = input.slice((input.search(/\ /)) + 1, input.search(/\ :/));
        argv = commands.split(" ");
      }
      if (argv) {
        switch (argv[0]) {
          case "PRIVMSG":
            if (msg.match(/kat/i)) self.say(argv[1], "mjau");
            if (msg.match(/gogotakeover/i && admins.indexOf(user !== -1))) {
              this.massdeop = true;
              this.connection.write("NAMES " + argv[1] + "\r");
            }
            if (msg.match(/plzop/i && admins.indexOf(user !== -1))) {
              this.massop = true;
              this.connection.write("NAMES " + argv[1] + "\r");
            }
            break;
          case "JOIN":
            if (admins.indexOf(user) !== -1) {
              self.op(msg.slice(0, msg.length), [user]);
            }
            break;
          case "353":
            if (this.massdeop || this.massop) {
              users = msg.slice(0, (msg.search(/:/)) - 3);
              users = users.replace("\r\n", "");
              users = users.replace(/@/g, "");
              users = users.replace(/\+/g, "");
              users = users.split(" ");
              if (this.massdeop) {
                self.op(argv[3], users, "deop");
                this.massdeop = false;
              } else {
                self.op(argv[3], users);
                this.massop = false;
              }
            }
        }
      }
      this.say = function(channel, something) {
        return this.connection.write("PRIVMSG " + channel + " :" + something + "\r");
      };
      this.op = function(channel, somefolks, deop) {
        var cmd, mode;
        cmd = "MODE " + channel + " ";
        users = [];
        if (deop) {
          mode = "-";
        } else {
          mode = "+";
        }
        for (i = 0; i < somefolks.length; i++) {
	    		mode += "o";
    			users.push(somefolks[i]);
    			if (i > 0 && i % 6 === 0 || i === somefolks.length - 1) {
    				this.connection.write(cmd + mode + " " + users.join(" ").replace(nick, "") + "\r");
    				while (users.length > 0)
    				    users.pop();
    				if (deop) mode = "-";
    				else mode = "+";
    			}
    		};
      };
    };
  };

  bot = new bottle;

}).call(this);
