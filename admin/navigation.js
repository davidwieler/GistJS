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
		subMenu: [
			{
				slug: 'General',
				url: 'settings',
				icon: 'icon-image2'
			},
			{
				slug: 'Media',
				url: 'settings/media',
				icon: 'icon-image2'
			},
			{
				slug: 'Reading',
				url: 'settings/readin',
				icon: 'icon-image2'
			},
			{
				slug: 'Writing',
				url: 'settings/writing',
				icon: 'icon-image2'
			},
			{
				slug: 'Discussion',
				url: 'settings/discussion',
				icon: 'icon-image2'
			},
			{
				slug: 'API',
				url: 'settings/api',
				icon: 'icon-image2'
			},
			{
				slug: 'Webhooks',
				url: 'settings/webhooks',
				icon: 'icon-image2'
			}
		]
	}
]