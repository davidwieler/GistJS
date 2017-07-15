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
		console.log(findUsers);

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

		return {
			name: CMS.currentUser[CMS.currentUser.displaytype],
			id: CMS.currentUser._id,
			assignedEditor: CMS.currentUser.assignedEditor,
			email: CMS.currentUser.email,
			pushSubscription: CMS.currentUser.pushSubscription,
			editortype: CMS.currentUser.editortype,
			pushEnabled: CMS.currentUser.adminPushNotifications,
			assignedEditor: CMS.currentUser._id,
			caps: CMS.currentUser.caps
		}
	}

	return users;

}
