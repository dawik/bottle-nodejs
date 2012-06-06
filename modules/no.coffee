# Default response
module.exports = (argv) ->
	if not argv
		return "no"
		
	_no = do ->
		fs = require("fs")
		fs.readFileSync("./lol/101nos.txt", "utf8").split("\n")

	"I'd like to but " +  _no[Math.round(Math.random() * _no.length)]
