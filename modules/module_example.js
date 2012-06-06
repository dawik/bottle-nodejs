(function() {
  var fs;

  fs = require("fs");

  module.exports.module_example = function(argv, requestHook) {
    var facts, number;
    if (requestHook) return "chuck";
    facts = fs.readFileSync("./lol/chuckfacts.txt", "utf8").split("\n");
    if (argv && argv[1] > 0 && argv[1] <= facts.length) {
      number = argv[1];
    } else {
      number = Math.round(Math.random() * facts.length);
    }
    return "Chuck norris fact #" + number + ": " + facts[number];
  };

}).call(this);
