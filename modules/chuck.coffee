# No bot without a chuck norris module.
module.exports = (argv, requestHook) ->
	if requestHook
		# Your hook here. Remember to add it to load.coffee
		return "chuck"

	fs = require("fs")
	facts = fs.readFileSync("./lol/chuckfacts.txt", "utf8").split("\n")

	if argv and argv[1] > 0 and argv[1] <= facts.length 
		number = argv[1]
	else
		number = Math.round(Math.random() * facts.length)
	"Chuck norris fact #" + number + ": " + facts[number]

