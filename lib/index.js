var request = require('superagent')

module.exports = function(){ 

  var getSession = function(port, user, cb){

		var baseurl = 'http://localhost:'+port 
    request
      .post(baseurl+'/user')
      .set('dpd-ssh-key', '984u5oiu4o5iu')
      .set('Content-Type',  'application/json')
      .set('Accept',  'application/json')
      .send(user)
      .end(function(err,  res){

        request
          .post('http://localhost:'+port+'/user/login')
          .set('Content-Type',  'application/json')
          .set('Accept',  'application/json')
          .send(user)
          .end(function(err,  res){
						if( err ) console.error("error: POST "+baseurl+"/user/login: "+err.toString() )
            cb( err, res.body && res.body.id ? res.body.id: false)
          })

      })

  }

  this.run = function(opts){
    opts = opts ? opts : {}
    opts.isRoot ? opts.isRoot : true
    process.env.DBNAME="test"
    process.env.MONGO_DB_FILE=process.cwd()+"/mongodb.test.js"
    try{
      if( !opts.noreset ) require('fs').unlinkSync(process.env.MONGO_DB_FILE)
    }catch(e){}
    require('dpd-filebased-mongodb')
    var done = function(err){
      var ObjectID = require('bson-objectid');
      delete require.cache[ process.env.MONGO_DB_FILE ]
      var db = require( process.env.MONGO_DB_FILE ) 
      opts.done( err, db )
    }

    if( opts.patchFile ){
      var _require = require('module').prototype.require
      require('module').prototype.require = function(modname){
        var p = opts.patchFile(modname)
        return p ? p : _require.apply(this, arguments )
      }
    }

    var deployd = require('deployd')
    var sopts = {port:opts.port, env: "development"}
    var dpd = deployd(sopts)
    if( opts.before ) opts.before(dpd)
    var server = dpd.listen()
    server.on('listening', function(){
      if( opts.user ){
        getSession( opts.port, opts.user, function(err, sessionid){
          if( err ) console.error(err)
          opts.ready( dpd, done, sessionid )
        })
      }else opts.ready( dpd, done )
    })
  }  

  return this
}


module.exports = module.exports.apply({})
