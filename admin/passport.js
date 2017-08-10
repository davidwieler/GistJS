// config/passport.js

// load all the things we need
const LocalStrategy   = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy  = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GithubStrategy = require('passport-github').Strategy;
const mongojs = require('mongojs');
const ObjectId = mongojs.ObjectId;
const bcrypt   = require('bcrypt-nodejs');
const fs = require('fs');
const db = require('./db.js');
const hat = require('hat');

// load the auth variables
var configAuth = require('./passport-auth');

// expose this function to our app using module.exports
module.exports = function(passport, CMS) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // initialize accounts dbs

    if (typeof CMS.dbConn === 'undefined') {
        return;
    }
    const dbConn = db(mongojs, CMS.dbConn).accountInit();
    const collection = CMS.dbConn.accounts.collection;

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
    	var session = {id:user._id}
        done(null, session);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {

    	var ident = id.id.toString();
		const search = {'_id':ObjectId(ident)};

		CMS.dbFindOne(dbConn, collection, search)
		.then((user) => {
			if (typeof user !== 'undefined') {
				delete user.pass;
			}
			user.networkAdmin = true;
			return done(null, user);
		})
		.catch((e) => {
			return done(e);
		});
    });

    // =========================================================================
    // LOCAL INSTALL ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-install', new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

            var email = req.body.email;
            if (req.body.name === '' || req.body.url === '') {
                return done(null, false, 'Site name and URL are both required.');
            }

            if (email === '') {
                return done(null, false);
            }

			const search = {'username':username};

			CMS.dbFindOne(dbConn, collection, search)
			.then((user) => {
                if(user){
                    return done(null, false, 'That username is already in use.');
                }
                else{

                    var newUser = {
                        pass : bcrypt.hashSync(password),
                        email : email,
                        username: username,
                        accounttype: 'administrator'
                    };

                    CMS.dbSave(dbConn, collection, newUser)
					.then(() => {
						return done(null, newUser);
					})
					.catch((e) => {
						return done(null, false, 'Error creating new user');
					});

                }
			})
			.catch((e) => {
				return done(e);
			});

        });

    }));

	// =========================================================================
	    // LOCAL LOGIN =============================================================
	    // =========================================================================
	    // we are using named strategies since we have one for login and one for signup
	    // by default, if there was no name, it would just be called 'local'

	passport.use('local-login', new LocalStrategy({
	        // by default, local strategy uses username and password, we will override with email
	        usernameField : 'username',
	        passwordField : 'password',
	        passReqToCallback : true // allows us to pass back the entire request to the callback
	    },
	    function(req, username, password, done) { // callback with email and password from our form

	        // find a user whose email is the same as the forms email
	        // we are checking to see if the user trying to login already exists

			const search = { $or: [ {'username': username}, {'email': username} ]};

			CMS.dbFindOne(dbConn, collection, search)
			.then((user) => {

				console.log(user);

	            // if no user is found, return the message
	            if (!user || user === null){
                    return done(null, false, 'Username or Password is incorrect'); // req.flash is the way to set flashdata using connect-flash
                }
                if(typeof user.pass === 'undefined'){
                    return done(null, false, 'Please reset your password.'); // req.flash is the way to set flashdata using connect-flash
                }
	            // if the user is found but the password is wrong
	            if (!validPassword(password, user.pass)){
                    return done(null, false, 'Username or Password is incorrect'); // create the loginMessage and save it to session as flashdata
                }
	            // all is well, return successful user
	            return done(null, user);
			})
			.catch((e) => {
				return done(e);
			});
	}));

};

var validPassword = function(password, hash){

	return bcrypt.compareSync(password, hash);

};

function generatePasswordHash(password){

    var hash = bcrypt.hashSync(password);

    return hash;

}
