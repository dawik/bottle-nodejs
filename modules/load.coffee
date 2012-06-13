modules = new Array

# load module like this
modules.push require "./chuck"
modules.push require "./no"
modules.push require "./sh"

module.exports = do ->
	hash = {}
	for module in modules
		hash[module()] = module 
	hash["default"] = hash["no"]
	return hash
