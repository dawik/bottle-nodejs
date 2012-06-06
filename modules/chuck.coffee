# Simple module ((function)) that takes arguments in a vector and returns a formatted string
# Define 
fs = require("fs")
module.exports.module_example = (argv, requestHook) ->
	if requestHook
		return "chuck"

	facts = fs.readFileSync("./lol/chuckfacts.txt", "utf8").split("\n")

	if argv and argv[1] > 0 and argv[1] <= facts.length 
		number = argv[1]
	else
		number = Math.round(Math.random() * facts.length)
	"Chuck norris fact #" + number + ": " + facts[number]

