// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GithubStrategy = require('passport-github').Strategy;
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;
var bcrypt   = require('bcrypt-nodejs');
var fs = require('fs');
//var hat = require('hat');

// load the auth variables
var configAuth = require('./passport-auth');

// expose this function to our app using module.exports
module.exports = function(passport, CMS) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // initialize accounts db
    const db = CMS.dbUserAccounts();
    const collection = CMS.dbAccountConn.collection

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
    	var session = {id:user._id}
        done(null, session);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {

    	var ident = id.id.toString();
        db[collection].findOne({'_id':ObjectId(ident)}, function(err, user) {
            delete user.pass;
            return done(err, user);
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

            db[collection].findOne({'username':username}, function(err, user){

                if(err){
                    return done(err);
                }

                if(user){
                    return done(null, false, 'That username is already in use.');
                }
                else{

                    var writeConfig = {
                        name: req.body.name,
                        url: req.body.url
                    }

                    CMS.writeConfig(writeConfig, (err, result) => {
                        if (err) {
                            return done(null, false, 'Could not write to "config.json". Please ensure it exists, and is writable.');
                        }

                        if (result === 'complete') {
                            var newUser = {
                                pass : bcrypt.hashSync(password),
                                email : email,
                                username: username,
                                accounttype: 'administrator',
                                accountid: generateAccountId()
                            };

                            fs.unlink(__dirname + '/.install', (err) => {

                                if (err) {
                                    return done(null, false, 'Could not delete ".install" file. This is either because you\'ve already done the install, or the ".install" file is missing.');
                                }

                                db[collection].save(newUser, function(err) {
                                    if (err){
                                        return done(null, false, 'Error creating new user');
                                    }

                                    return done(null, newUser);
                                });

                            });
                        }

                    });

                }

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
	        db[collection].findOne({'username':username}, function(err, user){

	            // if there are any errors, return the error before anything else
	            if (err){
	                return done(err);
                }

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
	        });

	}));


	// =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true,
        profileFields: ['id', 'email', 'name'],

    },

    // facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            if(!req.user){

                // find the user in the database based on their facebook id
                db.accounts.findOne({'facebook.id' : profile.id}, function(err, user){

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {

                        if(!user.facebook){

                            db.accounts.update({'accountid':user.accountid},{
                                $set : {
                                    facebook : {

                                        id : profile.id,
                                        token : token,
                                        name : profile.name.givenName + ' ' + profile.name.familyName,
                                        email : profile.emails[0].value

                                    }
                                }

                            })
                        }

                        return done(null, user); // user found, return that user
                    } else {

                        var pubapi = hat();
                        var privapi = hat();

                        // if there is no user found with that facebook id, create them
                        var newUser = {

                            facebook : {

                                id : profile.id,
                                token : token,
                                name : profile.name.givenName + ' ' + profile.name.familyName,
                                email : profile.emails[0].value

                            },
                            public_api_key: 'pub_api_'+pubapi,
                            private_api_key: 'priv_api_'+privapi,
                            accounttype: 'pro'

                        };

                        newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.email = profile.emails[0].value;
                        newUser.accountid      = generateAccountId();

                        db.accounts.save(newUser, function(err) {
                            if (err)
                                throw err;

                            generateStripeKeys(newUser.accountid, email)
                            return done(null, newUser);
                        });
                    }

                });
            }
            else{

                var user = req.user

                user.facebook = {}

                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails[0].value; 

                db.accounts.update({accountid: req.user.accountid}, user, function(err) {
                    if (err)
                        throw err;

                    return done(null, user);
                });
            }

        });

    }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({
        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true,
        includeEmail: true,

    },
    function(req, token, tokenSecret, profile, done) {

        // make the code asynchronous
        process.nextTick(function() {

            console.log(profile)

            if(!req.user){

                // find the user in the database based on their twitter id
                db.accounts.findOne({$or: [{'twitter.id' : profile.id}, {'email':profile.emails[0].value}]}, function(err, user){

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {

                        console.log(profile)

                        if(!user.twitter){

                            db.accounts.update({'accountid':user.accountid},{
                                $set : {
                                    twitter : {

                                        id : profile.id,
                                        token : token,
                                        name : profile.displayName,
                                        displayName : profile.displayName,
                                        email : profile.emails[0].value

                                    }
                                }

                            })
                        }
                        return done(null, user); // user found, return that user
                    } else {

                        var pubapi = hat();
                        var privapi = hat();

                        // if there is no user found with that twitter id, create them
                        var newUser = {

                            twitter : {

                                id : profile.id,
                                token : token,
                                name : profile.username,
                                displayName : profile.displayName


                            },
                            public_api_key: 'pub_api_'+pubapi,
                            private_api_key: 'priv_api_'+privapi,
                            accounttype: 'pro'

                        };

                        newUser.name = profile.displayName;
                        newUser.email = profile.emails[0].value;
                        newUser.accountid      = generateAccountId();

                        db.accounts.save(newUser, function(err) {
                            if (err)
                                throw err;

                            generateStripeKeys(newUser.accountid, email)

                            return done(null, newUser);
                        });
                    }

                });
            }
            else{

                var user = req.user

                user.twitter = {}

                user.twitter.id    = profile.id;
                user.twitter.token = token;
                user.twitter.name  = profile.username;
                user.twitter.displayName = profile.displayName
                ///user.twitter.email = profile.emails[0].value; 

                db.accounts.update({accountid: req.user.accountid}, user, function(err) {
                    if (err)
                        throw err;

                    return done(null, user);
                });  

            }
        });

    }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true,

    },
    function(req, token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            if(!req.user){

                // find the user in the database based on their google id
                db.accounts.findOne({$or: [{'google.id' : profile.id}, {'email':profile.emails[0].value}]}, function(err, user){

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {

                        if(!user.google){

                            db.accounts.update({'accountid':user.accountid},{
                                $set : {
                                    google : {

                                        id : profile.id,
                                        token : token,
                                        name : profile.displayName,
                                        email : profile.emails[0].value

                                    }
                                }

                            })
                        }

                        return done(null, user); // user found, return that user
                    } else {

                        var pubapi = hat();
                        var privapi = hat();
                        // if there is no user found with that google id, create them
                        var newUser = {

                            google : {

                                id : profile.id,
                                token : token,
                                name : profile.displayName,
                                email : profile.emails[0].value

                            },
                            public_api_key: 'pub_api_'+pubapi,
                            private_api_key: 'priv_api_'+privapi,
                            accounttype: 'pro'

                        };

                        newUser.name = profile.displayName;
                        newUser.email = profile.emails[0].value;
                        newUser.accountid      = generateAccountId();

                        db.accounts.save(newUser, function(err) {
                            if (err)
                                throw err;

                            generateStripeKeys(newUser.accountid, email)

                            return done(null, newUser);
                        });
                    }

                });

            }
            else{

                var user = req.user

                user.google = {}

                user.google.id    = profile.id;
                user.google.token = token;
                user.google.displayName = profile.displayName
                user.google.email = profile.emails[0].value; 

                db.accounts.update({accountid: req.user.accountid}, user, function(err) {
                    if (err)
                        throw err;

                    return done(null, user);
                });

            }

        });

    }));

    // =========================================================================
    // GITHUB ==================================================================
    // =========================================================================
    passport.use(new GithubStrategy({

        clientID        : configAuth.githubAuth.clientID,
        clientSecret    : configAuth.githubAuth.clientSecret,
        callbackURL     : configAuth.githubAuth.callbackURL,
        passReqToCallback: true,

    },
    function(req, token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            if(!req.user){
                // find the user in the database based on their google id

                db.accounts.findOne({$or: [{'github.id' : profile.id}, {'email':profile.emails[0].value}]}, function(err, user){

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {

                        if(!user.github){

                            db.accounts.update({'accountid':user.accountid},{
                                $set : {
                                    github : {

                                        id : profile.id,
                                        token : token,
                                        name : profile.displayName,
                                        email : profile.emails[0].value

                                    }
                                }

                            })
                        }

                        return done(null, user); // user found, return that user
                    } else {

                        var pubapi = hat();
                        var privapi = hat();
                        // if there is no user found with that google id, create them
                        var newUser = {

                            github : {

                                id : profile.id,
                                token : token,
                                name : profile.displayName,
                                email : profile.emails[0].value

                            },
                            public_api_key: 'pub_api_'+pubapi,
                            private_api_key: 'priv_api_'+privapi,
                            accounttype: 'pro'

                        };

                        newUser.name = profile.displayName;
                        newUser.email = profile.emails[0].value;
                        newUser.accountid      = generateAccountId();

                        db.accounts.save(newUser, function(err) {
                            if (err)
                                throw err;

                            generateStripeKeys(newUser.accountid, email)

                            return done(null, newUser);
                        });
                    }

                });

            }
            else{

                var user = req.user

                user.github = {}

                user.github.id    = profile.id;
                user.github.token = token;
                user.github.displayName = profile.displayName
                user.github.email = profile.emails[0].value; 

                db.accounts.update({accountid: req.user.accountid}, user, function(err) {
                    if (err)
                        throw err;

                    return done(null, user);
                });

            }

        });

    }));



};

var validPassword = function(password, hash){

	return bcrypt.compareSync(password, hash);

};

function generateAccountId() {
    var date = +new Date();

    var random = Math.random() * (111111111 - date) + date;

    var num = random * Math.random() * (1 - 4) + 1;

    return 'AC'+Math.abs(num.toFixed(0));
}

function generatePasswordHash(password){

    var hash = bcrypt.hashSync(password);

    return hash;


}