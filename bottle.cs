http = require("http")
net = require("net")
util = require("util")

admins = ["davve"]
nick = "bottle_beta"
username = "Bottle beta bot"
channels = ["#testor"]
server = "irc.freequest.net"
port = 6667

log = []

bottle = ->
	self = @

	_me = new RegExp "^" + nick + ": (.*)"
	_ping = new RegExp  /^PING\ :/
	_connected = new RegExp /^.*MODE.*\+iw$/m

	irc = @.connection = net.createConnection port, server

	@.connection.on "error", (error) ->
		console.log error

	@.connection.on "connect", ->
		@.write "NICK " + nick + "\r"
		@.write "USER bottle 8 * :" + username + "\r"

	@.connection.on "data", (data) ->
		text = data.toString()
		if _ping.test text
			@.write text.replace(/:/g, "") + "\r"

		if _connected.test text
			for channel in channels
				do (channel) ->
					self.connection.write "JOIN " + channel + "\r"
		else
			self.parse text

	@.parse = (input) ->
		if input.charAt 0 == ":"
			prefix = input.slice 1, (input.search /\ /) - 1

			if prefix.match /@/
				user = prefix.slice 0, prefix.search /!/
				host = prefix.slice (prefix.search /!/) + 1

			trailing = input.slice (input.search /\ :/) + 2, input.length - 2
			commands = input.slice (input.search /\ /) + 1, input.search /\ :/
			irc_argv = commands.split " "

		if irc_argv
			switch irc_argv[0]
				when "PRIVMSG" 
					if _me.test trailing
						cmd = _me.exec trailing
						cmd_argv = cmd[1].split " "
						else switch cmd_argv[0]
							when "hey"
								self.say irc_argv[1], "sup"
							when "set"
								if admins.indexOf(user) != -1
									@.massmode = true
									@.massflag = cmd_argv[1]
									@.connection.write "NAMES " + irc_argv[1] + "\r"
							else
								self.say irc_argv[1], "you want something?\r"

				when "JOIN"
					if admins.indexOf(user) != -1
						self.op (trailing.slice 0, trailing.length), [ user ]

				when "353"
					if @.massmode
						users = trailing.slice 0, (trailing.search /:/) - 3
						users = users.replace "\r\n", ""
						users = users.replace /@/g, ""
						users = users.replace /\+/g, ""
						users = users.split " "
						self.mode irc_argv[3], users, @.massflag
						@.massmode = false

		@.say = (channel, something) ->
			@.connection.write "PRIVMSG " + channel + " :" + something + "\r"

		@.mode = (channel, folk, flags) ->
			cmd = "MODE " + channel + " " + flags;
			users = [ ]
			`for (i = 0, mode = flags; i < folk.length; i++) {
				mode += flags.slice(1);
				users.push(folk[i]);
				if (i > 0 && i % 6 === 0 || folk.length === i + 1) {
					this.connection.write(cmd + mode + " " + users.join(" ").replace(nick, "") + "\r");
					while (users.length > 0)
						users.pop();
					mode = flags;
				}
			}`
			return

bot = new bottle
