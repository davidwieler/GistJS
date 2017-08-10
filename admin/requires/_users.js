const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const mongojs = require('mongojs');
const ObjectId = mongojs.ObjectId;
const _ = require('lodash');
module.exports = (CMS) => {

	var users = {};

	users.getUser = (search, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.accounts.collection;

		CMS.dbFindOne(db, collection, search)
		.then((user) => {
			if (user === null) {
				done('not found');
				return;
			}
			done(null, user)
		})
		.catch((e) => {
			return done(e);
		})
	}

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
		CMS.dbFind(db, collection, search)
		.then((users) => {
			for (var i = 0; i < users.length; i++) {

				// Apply user specific permissions
				if (!users[i].permissions) {
					users[i].permissions = CMS.roles[users[i].accounttype];
				} else {
					_.extend(users[i].permissions, CMS.roles[users[i].accounttype])
				}

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
		})
		.catch((e) => {
			done(e);
		});
	};

	users.createUser = (userData, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.accounts.collection;

		CMS.dbFindOne(db, collection, {'username':userData.username})
		.then((user) => {
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

			CMS.dbSave(db, collection, newUser, (err, result) => {
				if (err) {
					done('Error creating new user');
				}

				done(err, result);
			});
		})
		.catch((e) => {
			done(err);
		});
	};

	users.updateUser = (id, userData, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.accounts.collection;

		let data = userData;
		CMS.dbUpdate(db, collection, {'_id':ObjectId(id)}, data, (err, result) => {
			if (err) {
				done(err);
			}

			done(err, result);
		});


	};

	users.getCurrentUserInfo = () => {
		const user = CMS.currentUser;

		if (!user) {
			return '';
		}

		return {
			name: user[user.displaytype] || user.username,
			id: user._id,
			accounttype: user.accounttype,
			networkAdmin: user.networkAdmin || false,
			assignedEditor: user.assignedEditor,
			email: user.email,
			pushSubscription: user.pushSubscription,
			editortype: user.editortype,
			pushEnabled: user.adminPushNotifications,
			assignedEditor: user._id,
			caps: user.caps
		}
	}

	return users;

}
