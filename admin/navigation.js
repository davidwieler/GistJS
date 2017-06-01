module.exports = [
	{
		slug: 'Dashboard',
		url: '',
		icon: 'icon-home4'
	},
	{
		menuName: 'Content'
	},
	{
		slug: 'Posts',
		url: 'posts',
		icon: 'icon-stack',
		priviledge: 'read',
	},
	{
		slug: 'Pages',
		url: 'pages',
		icon: 'icon-stack'
	},
	{
		slug: 'Media',
		url: 'media',
		icon: 'icon-image2',
		priviledge: 'editFiles',
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
		icon: 'icon-footprint',
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
		icon: 'icon-spell-check',
		priviledge: 'editSettings',
		url: 'settings',
		navItemName: 'settings'
	}
]
