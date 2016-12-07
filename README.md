Easy way to write deployd tests without mongodb 

<img src="https://media4.giphy.com/media/i9qfoiyZ4Ml0c/200_s.gif" width="150" style="width:150px"/>

![Build Status](https://travis-ci.org/--repourl=git@github.com:coderofsalvation/dpd-test..svg?branch=master)

## Usage

    $ npm install dpd-test --save

test/mytest.js:

    var dpdTest = require('dpd-test')

    dpdTest.run({
      port:3030, 
      before: function(dpd){}, 
      ready: function(dpd, done){
        console.log("ready to test")       // use your favorite testing framework here
        done()
      }, 
      done: function(err, database){
        console.log("done")                // inspect database content here 
        process.exit( err ? 1 : 0 )
      }  
    })

> Voila,  there you go

## Options 

| key       | type               | info                                                                                               |
|-----------|--------------------|----------------------------------------------------------------------------------------------------|
| ready     | fn(dpd, done)      | called when deployd server started.                                                                |
| done      | fn (err, database) | called when done() is called in ready(). You can inspect the contents of the database afterwards   |
| port      | integer            | port for the fake deployd server to listen on                                                      |
| isRoot    | boolean            | this sets `req.isRoot = true` on each request when `dpd-ssh-key`-header is sent (see auth example) |
| patchFile | fn(file)           | allows patching files during bootup                                                                |

## Endpoint testing 

    var dpdTest = require('dpd-test')
    var request = require('superagent')
    var port = 3030

    dpdTest.run({
      port: port, 
      ready: function(dpd, done){

        request
          .post('localhost:'+port+'/user/login')
          .set('Content-Type',  'application/json')
          .set('Accept',  'application/json')
          .send({ username: "foo", password:"foo" })
          .end(function(err,  res){
            done(res.body.status != 200) // return true when error
          })

      }, 
      done: function(err, database){
        process.exit( err ? 1 : 0 )
      }  
    })

## Authenticated test

Just specify a user, and the user is automatically created and authenticated:

		dpdTest.run({
			port: port, 
			patchFile: patchFiles, 
			user: {username:"foo", "password":"foo"}, 
			ready: function(dpd, done, sessionid ){

				request
					.get('localhost:'+port+'/user/me')
					.set('Cookie', 'sid='+sessionid)
					.set('Content-Type',  'application/json')
					.set('Accept',  'application/json')
					.end(function(err,  res){
						console.dir(res.body) // logged in
						done()
					})

			}, 
			done: function(err, database){
				console.log("done") 
				process.exit( err ? 1 : 0 )
			} 
		})

> for testing roles check [dpd-acl-roles-permissions](https://npmjs.org/package/dpd-acl-roles-permissions)

## Patch files

Occasionally it can be handy to patch required files to mimic certain situations:

		var patchFiles = function(file){
			if( file.match(/resources\/foo\/config.json/) != null ){
				var mod = JSON.parse(require('fs').readFileSync(file))
				delete mod.user.properties
				return mod
			}
		}

		dpdTest.run({
			...
			patchFile: patchFiles
			...
		})
