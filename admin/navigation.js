module.exports = [
	{
		slug: 'Dashboard',
		url: '',
		icon: 'icon-home4',
		priviledge: 'read',
	},
	{
		menuName: 'Content'
	},
	{
		slug: 'Media',
		url: 'media',
		icon: 'icon-image2',
		priviledge: 'editFiles',
	},
	{
		slug: 'Categories',
		url: 'menus',
		icon: 'icon-list2',
		priviledge: 'editMenus',
	},
	{
		slug: 'Tags',
		url: 'menus',
		icon: 'icon-list2',
		priviledge: 'editMenus',
	},
	{
		slug: 'Menus',
		url: 'menus',
		icon: 'icon-list2',
		priviledge: 'editMenus',
	},
	{
		menuName: 'Settings'
	},
	{
		slug: 'Themes',
		icon: 'icon-pencil3',
		priviledge: 'updateThemes',
		subMenu: [
			{
				slug: 'Manage',
				url: 'themes',
				icon: 'icon-image2',
				priviledge: 'switchThemes',
			}
		]
	},
	{
		slug: 'Plugins',
		icon: 'icon-file-css',
		priviledge: 'updatePlugins',
		subMenu: [
			{
				slug: 'Manage',
				url: 'plugins',
				icon: 'icon-image2',
				priviledge: 'updatePlugins',
			}
		]
	},
	{
		slug: 'Users',
		icon: 'icon-people',
		priviledge: 'editUsers',
		subMenu: [
			{
				slug: 'View all',
				url: 'users',
				icon: 'icon-image2',
				priviledge: 'listUsers',
			},
			{
				slug: 'Add new',
				url: 'users/add',
				icon: 'icon-image2',
				priviledge: 'addUsers',
			}
		]
	},
	{
		slug: 'Settings',
		icon: 'icon-cog2',
		priviledge: 'editSettings',
		navItemName: 'settings',
		subMenu: [
			{
				slug: 'All Settings',
				url: 'settings',
				icon: 'icon-cog',
				priviledge: 'listUsers',
			},
			{
				slug: 'Controls',
				url: 'settings/controls',
				icon: 'icon-envelope',
				priviledge: 'adjustControls',
			},
			{
				slug: 'Mail',
				url: 'settings/mail',
				icon: 'icon-envelope',
				priviledge: 'addUsers',
			}
		]
	}
]
