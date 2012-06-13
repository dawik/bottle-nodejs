module.exports = (argv, channel, socket) ->
	
	self = this
	self.sock = socket

	if not argv
		return "sh"

	argv = argv.slice 1
	
	send = (text) ->
		self.sock.write "PRIVMSG " + channel + " :" + text + "\n\r"
	
	parse = (data) ->
		lines = data.split /\n/
		for line,i in lines
			if i < 7
				if line != undefined and line.length > 0 
					setTimeout send, (i+1) * 1000, line
			else 
				send "linecap reached (" + i + ")"
				return

	do ->
		util = require('util')
		sh = require('child_process').spawn "bash"
		sh.stdin.write argv.join(" ")+ "\n"
		sh.stdin.end()
		sh.stdout.on 'data', (data) ->
			parse data.toString()
		sh.stdin.on 'error', (error) ->
			console.log error
	return
