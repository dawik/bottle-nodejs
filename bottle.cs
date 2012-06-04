net = require("net")
fs = require("fs")

networks = new Array
log = []

# Configuration
admins = ["davve"]
nick = "bottle_x"
username = "Bottle beta bot"
networks.push { name: "freequest", ip: "bier.de.eu.freequest.net", port: 6667, channels: ["#testor"] }
networks.push { name: "efnet", ip: "irc.homelien.no", port: 6667, channels: ["#testor"] }



# Simple module that takes arguments in a vector and returns a formatted string
# Black box style
module_example = (argv, input) ->
	jokes = fs.readFileSync("chuckfacts.txt", "utf8").split("\n")

	if argv and argv[1] > 0 and argv[1] <= jokes.length 
		number = argv[1]
	else
		number = Math.round(Math.random() * jokes.length)
	"Chuck norris fact #" + number + ": " + jokes[number]


bottle = ->
	self = @

	_me = new RegExp "^" + nick + ": (.*)"
	_ping = new RegExp  /^PING\ :/

#	Format { hook : function, .. }
	@.modules = { "chuck" : module_example, "rand" : Math.random }

	@.modeset = false
	@.modeflag = "+o"

	for network in networks
		network.connection = new net.createConnection network.port, network.ip
		network.connection.on "error", (error) ->
			console.log error
		network.connection.on "connect", ->
			@.write "NICK " + nick + "\n\r"
			@.write "USER bottle 0 * :" + username + "\n\r"
		network.connection.on "data", (data) ->
			_socket = network.connection;
			text = data.toString()
			if _ping.test text
				@.write text.replace(/:/g, "") + "\n\r"

			_connected = new RegExp("^:.* 376", "m")
			if _connected.test text
				for channel in network.channels
					@.write "JOIN " + channel + "\n\r"
			else
				response = self.parse text
			if response
				@.write response + "\n\r"

	@.parse = (input) ->
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
							when "set"
								if admins.indexOf(user) != -1 and cmd_argv[1].length == 2
									self.modeset = true
									self.modeflag = cmd_argv[1]
									return "NAMES " + channel
							else
								for hook,fn of self.modules
									if cmd_argv[0] == hook
										return self.say channel, fn(cmd_argv, trailing)

				when "JOIN"
					if admins.indexOf(user) != -1
						return self.mode (trailing.slice 0, trailing.length), [ user ], "+o"

				when "353"
					if @.modeset
						users = trailing.replace /@/g, ""
						users = users.replace /\+/g, ""
						users = users.replace "\n\r", ""
						users = users.split " "
						self.modeset = false
						return self.mode irc_argv[3], users, self.modeflag

				when "376"
					console.log "eomtd\n"

		@.say = (channel, something) ->
			"PRIVMSG " + channel + " :" + something

		@.mode = (channel, folk, flags) ->
			str = ""
			cmd = "MODE " + channel + " " + flags;
			users = [ ]
			`for (i = 0, mode = flags; i < folk.length; i++) {
				mode += flags.slice(1);
				users.push(folk[i]);
				if (i > 0 && i % 6 === 0 || folk.length === i + 1) {
					str += cmd + mode + " " + users.join(" ").replace(nick, "") + "\r";
					while (users.length > 0)
						users.pop();
					mode = flags;
				}
			}`
			str
		return

bot = new bottle
