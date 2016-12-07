module.exports = function(){ 
	this.foo = function(){}

}

module.exports = module.exports.apply({})
