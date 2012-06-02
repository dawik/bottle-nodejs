http = require("http")
net = require("net")
util = require("util")

admins = ["davve"]
nick = "bottle"
username = "Bottle beta bot"
channels = ["#styrelserummet"]
server = "irc.freequest.net"
port = 6667

log = []

bottle = ->
	self = @

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
					self.say channel, "Howdee ho\r"
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
			argv = commands.split " "

		if argv
			switch argv[0]
				when "PRIVMSG" 
					if trailing.match(/plzop/i) and admins.indexOf(user) != -1
						@.massop = true
						@.connection.write "NAMES " + argv[1] + "\r"

				when "JOIN"
					if admins.indexOf(user) != -1
						self.op (trailing.slice 0, trailing.length), [ user ]

				when "353"
					if this.massdeop or this.massop
						users = trailing.slice 0, (trailing.search /:/) - 3
						users = users.replace "\r\n", ""
						users = users.replace /@/g, ""
						users = users.replace /\+/g, ""
						users = users.split " "
						if @.massdeop
							self.op argv[3], users, "+o"
							@.massdeop = false

						else
							self.op argv[3], users
							@.massop = false

		@.say = (channel, something) ->
			@.connection.write "PRIVMSG " + channel + " :" + something + "\r"

		@.mode = (channel, folk, flags) ->
			cmd = "MODE " + channel + " " + flags;
			users = [ ]
			`for (i = 0, mode = flags; i < folk.length; i++) {
				mode += flags.slice 1;
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
