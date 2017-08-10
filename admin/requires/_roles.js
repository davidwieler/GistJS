const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const APP = require('../assets/js/core/app.js');
const _ = require('lodash');
module.exports = (CMS) => {

	var roles = {};

	roles.initRoles = () => {
		// WARNING!!!!!
		// This will install/reinstall default roles, and remove anything that was added.
		// Should only be used on install, or when needing to reset defaults.

		let roles = {};

		roles.subscriber = {
			read: true,
			editPosts: false,
			deletePosts: false,
			publishPosts: false,
			editPublishedPosts: false,
			deletePublishedPosts: false,
			readPrivatePosts: false,
			editPrivatePosts: false,
			deletePrivatePosts: false,
			editFiles: false,
			deleteFiles: false,
			editOwnPosts: false,
			deleteOwnPosts: false,
			publishOwnPosts: false,
			uploadFiles: false,
			updateCore: false,
			updatePlugins: false,
			updateThemes: false,
			installPlugins: false,
			installThemes: false,
			deletePlugins: false,
			deleteThemes: false,
			switchThemes: false,
			addUsers: false,
			updateUsers: false,
			editUsers: false,
			deleteUsers: false,
			listUsers: false,
			editMenus: false,
			editSettings: false,
			adjustControls: false,
			enableAdminPush: false,
			adjustMessaging: false,
			adminPushNotifications: false,
			editorPushNotifications: false,
			authorPushNotifications: false,
			contributorPushNotifications: false,
			subscriberPushNotifications: true,
			issueKeys: false,
			editUserPermissions: false
		};

		roles.contributor = {
			read: true,
			editPosts: false,
			deletePosts: false,
			publishPosts: false,
			editPublishedPosts: false,
			deletePublishedPosts: false,
			readPrivatePosts: false,
			editPrivatePosts: false,
			deletePrivatePosts: false,
			editFiles: false,
			deleteFiles: false,
			editOwnPosts: true,
			deleteOwnPosts: true,
			publishOwnPosts: false,
			uploadFiles: false,
			updateCore: false,
			updatePlugins: false,
			updateThemes: false,
			installPlugins: false,
			installThemes: false,
			deletePlugins: false,
			deleteThemes: false,
			switchThemes: false,
			addUsers: false,
			updateUsers: false,
			editUsers: false,
			deleteUsers: false,
			listUsers: false,
			editMenus: false,
			editSettings: false,
			adjustControls: false,
			enableAdminPush: true,
			adminPushNotifications: false,
			editorPushNotifications: false,
			authorPushNotifications: false,
			contributorPushNotifications: true,
			subscriberPushNotifications: true,
			issueKeys: false,
			editUserPermissions: false
		};

		roles.author = {
			read: true,
			editPosts: true,
			deletePosts: true,
			publishPosts: true,
			editPublishedPosts: false,
			deletePublishedPosts: false,
			readPrivatePosts: false,
			editPrivatePosts: false,
			deletePrivatePosts: false,
			editFiles: false,
			deleteFiles: false,
			editOwnPosts: true,
			deleteOwnPosts: true,
			publishOwnPosts: false,
			uploadFiles: false,
			updateCore: false,
			updatePlugins: false,
			updateThemes: false,
			installPlugins: false,
			installThemes: false,
			deletePlugins: false,
			deleteThemes: false,
			switchThemes: false,
			addUsers: false,
			updateUsers: false,
			editUsers: false,
			deleteUsers: false,
			listUsers: false,
			editMenus: false,
			editSettings: false,
			adjustControls: false,
			enableAdminPush: true,
			adjustMessaging: false,
			adminPushNotifications: false,
			editorPushNotifications: false,
			authorPushNotifications: true,
			contributorPushNotifications: true,
			subscriberPushNotifications: true,
			issueKeys: false,
			editUserPermissions: false
		};

		roles.editor = {
			read: true,
			editPosts: true,
			deletePosts: true,
			publishPosts: true,
			editPublishedPosts: true,
			deletePublishedPosts: true,
			readPrivatePosts: true,
			editPrivatePosts: true,
			deletePrivatePosts: true,
			editFiles: true,
			deleteFiles: true,
			editOwnPosts: true,
			deleteOwnPosts: true,
			publishOwnPosts: true,
			uploadFiles: true,
			updateCore: false,
			updatePlugins: false,
			updateThemes: false,
			installPlugins: false,
			installThemes: false,
			deletePlugins: false,
			deleteThemes: false,
			switchThemes: false,
			addUsers: false,
			updateUsers: false,
			editUsers: false,
			deleteUsers: false,
			listUsers: false,
			editMenus: true,
			editSettings: false,
			adjustControls: false,
			enableAdminPush: true,
			adjustMessaging: false,
			adminPushNotifications: false,
			editorPushNotifications: true,
			authorPushNotifications: true,
			contributorPushNotifications: true,
			subscriberPushNotifications: true,
			issueKeys: false,
			editUserPermissions: false
		};

		roles.administrator = {
			read: true,
			editPosts: true,
			deletePosts: true,
			publishPosts: true,
			editPublishedPosts: true,
			deletePublishedPosts: true,
			readPrivatePosts: true,
			editPrivatePosts: true,
			deletePrivatePosts: true,
			editFiles: true,
			deleteFiles: true,
			editOwnPosts: true,
			deleteOwnPosts: true,
			publishOwnPosts: true,
			uploadFiles: true,
			updateCore: true,
			updatePlugins: true,
			updateThemes: true,
			installPlugins: true,
			installThemes: true,
			deletePlugins: true,
			deleteThemes: true,
			switchThemes: true,
			addUsers: true,
			updateUsers: true,
			editUsers: true,
			deleteUsers: true,
			listUsers: true,
			editMenus: true,
			editSettings: true,
			adjustControls: true,
			enableAdminPush: true,
			adjustMessaging: true,
			adminPushNotifications: true,
			editorPushNotifications: true,
			authorPushNotifications: true,
			contributorPushNotifications: true,
			subscriberPushNotifications: true,
			issueKeys: true,
			editUserPermissions: true
		};

		CMS.roles = roles;

	};

	roles.addRole = (role, caps) => {

		CMS.roles[role] = caps;

	};

	roles.editRole = (role, caps) => {

		_.extend(CMS.roles[role], caps);

	};

	roles.removeRole = (role) => {

		const notRemovable = ['subscriber', 'contributor', 'author', 'editor', 'administrator'];

	};

	roles.getRole = (role, user, done) => {

	};

	roles.getRoleTypes = (role, user, done) => {

		const roleTypes = [];

		for (var i in CMS.roles) {
			if (CMS.roles.hasOwnProperty(i)) {
				roleTypes.push(i);
			}
		}

		return roleTypes;

	};

	roles.currentUserCaps = (role, done) => {
		if (typeof done === 'function') {
			done(CMS.roles[role]);
		} else {
			return CMS.roles[role];
		}
	};

	roles.currentUserCan = (cap, done) => {
		const currentUserType = CMS.currentUser.accounttype;

		if (typeof CMS.roles[currentUserType][cap] === 'undefined') {
			return false;
		}
		return CMS.roles[currentUserType][cap];
	};

	roles.userCan = (user, cap) => {

	};

	return roles;

}
