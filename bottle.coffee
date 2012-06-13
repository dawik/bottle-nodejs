require("coffee-script")
net = require("net")
modules = require("./modules/load")

# Configuration
admins = ["davve"]
nick = "bottle_sh"
username = "Bottle beta bot"
networks = [ { "name" : "freequest", "address": "bier.de.eu.freequest.net", "port": 6667, "channels": ["#testorfq"] },
	{ "name" : "efnet", "address": "irc.homelien.no", "port": 6667, "channels": ["#testorefnet"] } ]


bottle = do ->
	self = @

	_instruction = new RegExp "^" + nick + ": (.*)"
	_ping = new RegExp  /^PING\ :/

	@.modules = modules

	_net = new Array

	for network,i in networks
		_net.push i

		network.connection = new net.createConnection network.port, network.address

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
				response = self.parse text, @
			if response 
				@.write response + "\n\r"
		

	@.say = (channel, something) ->
		"PRIVMSG " + channel + " :" + something

	@.mode = (channel, user, flag) ->
		"MODE " + channel + " " + flag + " " + user + "\n\r"

	@.parse = (input, socket) ->
		console.log input
		if input.charAt 0 == ":"
			prefix = input.slice 1, (input.search /\ /) - 1

			if prefix.match /@/
				user = prefix.slice 0, prefix.search /!/
				host = prefix.slice (prefix.search /!/) + 1

			trailing = input.slice (input.search /\ :/) + 2, input.length - 2
			args = input.slice (input.search /\ /) + 1, input.search /\ :/
			irc_argv = args.split " "
			channel = irc_argv[1]

		if irc_argv
			switch irc_argv[0]
				when "PRIVMSG" 
					if _instruction.test trailing
						instructions = _instruction.exec trailing
						cmd_argv = instructions[1].split " "
						switch cmd_argv[0]
							when "hello"
							    return self.say channel, "sup"
							when "mode"
								return self.mode channel, cmd_argv[1], cmd_argv[2]
							when "say"
								return self.say channel, cmd_argv.slice(1).join(" ")
							else
								for hook,module of self.modules
									if cmd_argv[0] == hook and admins.indexOf(user) != -1
										module_response = module(cmd_argv, channel,socket) 
										if (module_response)
											is_formated = module_response.match /^PRIVMSG.*/i
										if module_response and is_formated
											return module_response
										else if module_response != undefined
											return self.say channel, module_response
										else return

				when "JOIN"
					if admins.indexOf(user) != -1
						return self.mode (trailing.slice 0, trailing.length), [ user ], "+o"
					else
						return self.mode (trailing.slice 0, trailing.length), [ user ], "+v"

		return

