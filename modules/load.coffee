modules = new Array

# Your module loaded here ;-P
chuck = require("./chuck")
modules.push chuck


#Hook to function hashmap
module.exports.hash = ->
	hooks = {}
	for module in modules
		hooks[module ["foo"], "bar"] = module 
	return hooks
