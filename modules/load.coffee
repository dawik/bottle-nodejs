modules = new Array

# load module like this
modules.push require("./chuck")

module.exports = do ->
	hash = {}
	for module in modules
		#map module hoo
		hash[module()] = module 
	return hash
