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
		icon: 'icon-stack'
	},
	{
		slug: 'Media',
		url: 'media',
		icon: 'icon-image2'
	},
	{
		menuName: 'Settings'
	},
	{
		slug: 'Themes',
		icon: 'icon-pencil3',
		subMenu: [
			{
				slug: 'Manage',
				url: 'themes',
				icon: 'icon-image2'
			}
		]
	},
	{
		slug: 'Plugins',
		icon: 'icon-file-css',
		subMenu: [
			{
				slug: 'Manage',
				url: 'themes',
				icon: 'icon-image2'
			}
		]
	},
	{
		slug: 'Users',
		icon: 'icon-footprint',
		subMenu: [
			{
				slug: 'View all',
				url: 'users',
				icon: 'icon-image2'
			},
			{
				slug: 'Add new',
				url: 'users/add',
				icon: 'icon-image2'
			}
		]
	},
	{
		slug: 'Settings',
		icon: 'icon-spell-check',
		url: 'settings',
		navItemName: 'settings'
	}
]