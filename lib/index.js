var request = require('superagent')

module.exports = function(){ 

  var getSession = function(port, username, password, cb){

    request
      .post('localhost:'+port+'/user')
      .set('dpd-ssh-key', '984u5oiu4o5iu')
      .set('Content-Type',  'application/json')
      .set('Accept',  'application/json')
      .send({ username: username, password: password })
      .end(function(err,  res){

        request
          .post('localhost:'+port+'/user/login')
          .set('Content-Type',  'application/json')
          .set('Accept',  'application/json')
          .send({ username: username, password: password })
          .end(function(err,  res){
            if( err ) console.log("authenticated!")
            cb( err, res.body && res.body.id ? res.body.id: false)
          })

      })

  }

  this.run = function(opts){
    opts = opts ? opts : {}
    opts.isRoot ? opts.isRoot : true
    process.env.DBNAME="test"
    process.env.MONGO_DB_FILE="/tmp/testmongo.js"
    require('dpd-filebased-mongodb')
    var done = function(err){
      var data = {}
      opts.done( err, require(process.env.MONGO_DB_FILE) )
    }

    if( opts.patchFile ){
      var _require = require('module').prototype.require
      require('module').prototype.require = function(modname){
        var p = opts.patchFile(modname)
        if( p ) console.dir(p)
        return p ? p : _require.apply(this, arguments )
      }
    }

    var deployd = require('deployd')
    var sopts = {port:opts.port}
    if( opts.isRoot ) sopts.env = "development"
    var dpd = deployd(sopts)
    if( opts.before ) opts.before(dpd)
    dpd.listen()
    setTimeout( function(){
      if( opts.user ){
        getSession( opts.port, opts.user.username, opts.user.password, function(err, sessionid){
          if( err ) console.error(err)
          opts.ready( dpd, done, sessionid )
        })
      }else opts.ready( dpd, done )
    }, 2000 )
  }  

  return this
}


module.exports = module.exports.apply({})
