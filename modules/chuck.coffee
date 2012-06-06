# No bot without Chuck Norris!
module.exports = (argv) ->
	if not argv
		return "chuck"
		
	fact = do ->
		fs = require("fs")
		fs.readFileSync("./lol/chuckfacts.txt", "utf8").split("\n")

	if argv[1] > 0 and argv[1] <= fact.length 
		number = argv[1] - 1
	else
		number = Math.round(Math.random() * fact.length)

	"Chuck norris fact #" + number + ": " + fact[number]
