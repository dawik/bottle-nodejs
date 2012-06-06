require("coffee-script")
net = require("net")
modules = require("./modules/load")

# Configuration
admins = ["davve"]
nick = "bottle_e"
username = "Bottle beta bot"
networks = [ { "address": "bier.de.eu.freequest.net", "port": 6667, "channels": ["#testorfq"] },
{ "address": "irc.homelien.no", "port": 6667, "channels": ["#testorefnet"] } ]


bottle = ->
	self = @

	_me = new RegExp "^" + nick + ": (.*)"
	_ping = new RegExp  /^PING\ :/

	@.modules = modules.hash()

	_net = new Array

	for network,i in networks
		_net.push i

		socket = network.connection = new net.createConnection network.port, network.address

		network.connection.on "error", (error) ->
			console.log error

		network.connection.on "connect", ->
			@.write "NICK " + nick + "\n\r"
			@.write "USER bottle 0 * :" + username + "\n\r"
			for chan in networks[_net.pop()].channels
				@.write "JOIN " + chan + "\n\r"

		network.connection.on "data", (data) ->
			text = data.toString()

			if _ping.test text
				@.write text.replace(/:/g, "") + "\n\r"
			else
				response = self.parse text, socket
			if response
				@.write response + "\n\r"

	@.say = (channel, something) ->
		"PRIVMSG " + channel + " :" + something

	@.mode = (channel, user, flag) ->
		"MODE #" + channel + " " + user + " " + flag + "\n\r"

	@.parse = (input, socket) ->
		if input.charAt 0 == ":"
			prefix = input.slice 1, (input.search /\ /) - 1

			if prefix.match /@/
				user = prefix.slice 0, prefix.search /!/
				host = prefix.slice (prefix.search /!/) + 1

			trailing = input.slice (input.search /\ :/) + 2, input.length - 2
			commands = input.slice (input.search /\ /) + 1, input.search /\ :/
			irc_argv = commands.split " "
			channel = irc_argv[1]

		if irc_argv
			switch irc_argv[0]
				when "PRIVMSG" 
					if _me.test trailing
						cmd = _me.exec trailing
						cmd_argv = cmd[1].split " "
						switch cmd_argv[0]
							when "hey"
							    return self.say channel, "sup"
							when "mode"
								return self.mode channel, cmd_argv[1], cmd_argv[2]
							when "say"
								return self.say channel, cmd
							else
								for hook,fn of self.modules
									if cmd_argv[0] == hook
										return self.say channel, fn(cmd_argv)

				when "JOIN"
					if admins.indexOf(user) != -1
						return self.mode (trailing.slice 0, trailing.length), [ user ], "+o"

		return

bot = new bottle
