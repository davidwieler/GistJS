const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const mongojs = require('mongojs');
const ObjectId = mongojs.ObjectId;
module.exports = (CMS) => {

	var users = {};

	users.getUsers = (findUsers, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.accounts.collection;

		let returnedUsers = [];
		let count = 0;
		let returnedLimits = {};
		let limit = findUsers.limit || 20;
		let search = {};

		if (typeof findUsers.search !== 'undefined') {
			search = findUsers.search;
		}

		if (findUsers.multiId) {
			// Working here
			// loop through ids, adding ObjectID string to searches
			const multi = [];
				for (var i = postId.length - 1; i >= 0; i--) {
				multi.push(ObjectID(postId[i]))
			}

			search._id = {$in: multi};
		}

		if (search._id) {
			const userId = ObjectId(search._id);
			search._id = userId;
		}

		returnedLimits.limit = limit;
		returnedLimits.offset = Number(findUsers.offset) || 0;
		let calc = (limit - 1);
		//db[CMS.dbConn.collection].find(search).limit(Number(limit)).sort({timestamp: -1}, (err, users) => {
		db[collection].find(search, (err, users) => {

			if (err) {
				done(err);
			}

			for (var i = 0; i < users.length; i++) {
				if (returnedLimits.offset >= 1) {
					calc = (limit - 1 + returnedLimits.offset);
					if (i < (returnedLimits.offset)) {
						continue;
					}
				}

				if (i <= calc) {
					// Remove the password hash before adding the results
					delete users[i].pass;
					returnedUsers.push(users[i]);
				} else {
					break;
				}

			}
			done(null, {userCount: users.length, users: returnedUsers, limits: returnedLimits});
		});
	};

	users.createUser = (userData, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.accounts.collection;

		db[collection].findOne({'username':userData.username}, function(err, user){

			if (user) {
				done('user exists');
			}

			let newUser = {
				pass : CMS.hash(userData.password),
				email : userData.email,
				username: userData.username,
				displayname: userData.displayname,
				displaytype: userData.displaytype,
				accounttype: userData.role
			};
			db[collection].save(newUser, function(err) {
				if (err){
					done('Error creating new user');
				}

				done(null, newUser);
			});
		});
	};

	users.updateUser = (userData, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.accounts.collection;

		let data = userData;
		delete data._id;

		db[collection].update(
			{'_id':ObjectId(userData._id)},
			{ $set: data},
			(err, response) => {

				if (err) {
					done(err);
				}

				done(null, response);

			}
		)
	};

	return users;

}
