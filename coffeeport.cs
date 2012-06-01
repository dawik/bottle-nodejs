http = require("http")
net = require("net")
util = require("util")

admins = ["davve"]
nick = "bottle"
username = "Bottle beta bot"
channels = ["#testor1", "#testor2"]
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

			msg = input.slice (input.search /\ :/) + 2, input.length - 2
			commands = input.slice (input.search /\ /) + 1, input.search /\ :/
			argv = commands.split " "

		if argv
			switch argv[0]
				when "PRIVMSG" 
					if msg.match /kat/i 
						self.say argv[1], "mjau"
					if msg.match(/gogotakeover/i) and admins.indexOf(user) != -1
						@.massdeop = true
						@.connection.write "NAMES " + argv[1] + "\r"
					if msg.match(/plzop/i) and admins.indexOf(user) != -1
						@.massop = true
						@.connection.write "NAMES " + argv[1] + "\r"

				when "JOIN"
					if admins.indexOf(user) != -1
						self.op (msg.slice 0, msg.length), [ user ]

				when "353"
					if this.massdeop or this.massop
						users = msg.slice 0, (msg.search /:/) - 3
						users = users.replace "\r\n", ""
						users = users.replace /@/g, ""
						users = users.replace /\+/g, ""
						users = users.split " "
						if @.massdeop
							self.op argv[3], users, "deop"
							@.massdeop = false

						else
							self.op argv[3], users
							@.massop = false

		@.say = (channel, something) ->
			@.connection.write "PRIVMSG " + channel + " :" + something + "\r"

		@.op = (channel, somefolks, deop) ->
			cmd = "MODE " + channel + " "
			users = [ ]

			if deop
				mode = "-"
			else
				mode = "+"

			`for (i = 0; i < somefolks.length; i++) {
				mode += "o";
				users.push(somefolks[i]);
				if (i > 0 && i % 6 === 0 || i === somefolks.length - 1) {
					this.connection.write(cmd + mode + " " + users.join(" ").replace(nick, "") + "\r");
					while (users.length > 0)
						users.pop();
					if (deop) mode = "-";
					else mode = "+";
				}
			}`
			return

bot = new bottle
