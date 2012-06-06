modules = new Array

# load module like this
modules.push require("./chuck")

# hook:function hash
module.exports = do ->
	hash = {}
	for module in modules
		hash[module()] = module 
	return hash
