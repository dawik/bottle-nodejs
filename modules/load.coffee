# Your module loaded here ;-P
modules.push require("./chuck")

#Hook to function hashmap
module.exports = do ->
	hash = {}
	for module in modules
		hash[module ["foo"], "bar"] = module 
	return hash
