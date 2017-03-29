$(document).ready(() => {
	$('.quick-db').on('click', () => {
		$('.custom-db-settings').hide();
	});

	$('.custom-db').on('click', () => {
		$('.custom-db-settings').removeClass('hidden').show();
	});

	$('.db-settings').on('click', (e) => {
		e.preventDefault();
		$('.user-site-details').hide();
		$('.connection-details').removeClass('hidden').show();
	});

	$('.confirm').on('click', (e) => {
		e.preventDefault();

		$('.connection-details').hide();
		$('.confirm-settings').removeClass('hidden').show();
		window.configData = {
			dbUsername: 	{key: 'DB Username', value: $('.connection-details input[name="dbusername"]').val()},
			dbPassword: 	{key: 'DB Password', value:$('.connection-details input[name="dbpassword"]').val()},
			dbPort: 		{key: 'DB Port', value:$('.connection-details input[name="dbport"]').val()},
			dbName: 		{key: 'DB Name', value:$('.connection-details input[name="dbname"]').val()},
			dbHost: 		{key: 'DB Host', value:$('.connection-details input[name="dbdomain"]').val()},
			dbCollectionData: 		{key: 'Data Collection', value:$('.connection-details input[name="dbcolldata"]').val()},
			dbCollectionAccounts: 	{key: 'Accounts Collection', value:$('.connection-details input[name="dbcollaccounts"]').val()},
			dbCollectionSessions: 	{key: 'Sessions Collection', value:$('.connection-details input[name="dbcollsessions"]').val()},
			siteName: 		{key: 'Site Name', value:$('.user-site-details input[name="name"]').val()},
			siteUrl: 		{key: 'Site URL', value:$('.user-site-details input[name="url"]').val()},
			username: 		{key: 'Username', value:$('.user-site-details input[name="username"]').val()},
			email: 			{key: 'Email', value:$('.user-site-details input[name="email"]').val()},
			password: 		{key: 'Password', value:$('.user-site-details input[name="password"]').val()},
			adminLocation: 	{key: 'Admin Location', value:$('.connection-details input[name="admin"]').val()},
			siteLocation: 	{key: 'Site Location', value:$('.connection-details input[name="site"]').val()},
		}

		$('.confirm-settings ul').empty();

		for (let i in window.configData) {

			const key = configData[i].key;
			let value = configData[i].value;
			let colClass;

			if (value === '') {
				value = '<span class="text-muted"><i>blank</i></span>';
			}

			$('.confirm-settings .settings').append(`<div class="col-md-4 text-right"><strong>${key}: </strong></div><div class="col-md-8">${value}</div>`);
		}
	});

	$('.configure, .retry').on('click', (e) => {
		e.preventDefault();
		$('.confirm-settings').hide();
		$('.start-configure').removeClass('hidden').show();

		const cogStringClasses = 'fa-cog fa-spin fa-3x fa-fw';
		const errorStringClasses = 'fa-times text-danger';
		const successStringClasses = 'fa-check text-success';
		const configData = window.configData;

		$('.connection-test, .write-configs, .create-user').find('.fa-times').removeClass('fa-times fa-check text-danger text-success').addClass(cogStringClasses);
		$('.alert-danger, .back-connection').hide();

		let dbConnectionUrl;
		let loginUrl;

		if (configData.dbUsername.value && configData.dbPassword.value) {
			dbConnectionUrl = `${configData.dbUsername.value}:${configData.dbPassword.value}@${configData.dbHost.value}:${configData.dbPort.value}/${configData.dbName.value}`;
		} else {
			dbConnectionUrl = `${configData.dbHost.value}:${configData.dbPort.value}/${configData.dbName.value}`;
		}

		loginUrl = `/${configData.adminLocation.value}/login`;

		testDb({url: dbConnectionUrl, collection: configData.dbCollectionData.value}, (res) => {
			if (res !== 'connected') {
				$('.connection-error').removeClass('hidden').show().html(res);
				$('.connection-test, .write-configs, .create-user').find('.fa-cog').removeClass(cogStringClasses).addClass(errorStringClasses);
				$('.back-connection').removeClass('hidden').show();
			} else {
				$('.connection-test').find('.fa-cog').removeClass(cogStringClasses).addClass(successStringClasses);
				// All is well, let's write the configs
				install({type: 'configs', data: configData}, (res) => {
					if (res !== 'success') {
						$('.config-error').removeClass('hidden').show().html(res);
						$('.write-configs, .create-user').find('.fa-cog').removeClass(cogStringClasses).addClass(errorStringClasses);
						$('.back-connection').removeClass('hidden').show();
					} else {
						$('.write-configs').find('.fa-cog').removeClass(cogStringClasses).addClass(successStringClasses);

						// All is well, let's create the first user
						install({type: 'user', data: configData}, (res) => {
							if (res !== 'success') {
								$('.user-error').removeClass('hidden').show().html(res);
								$('.create-user').find('.fa-cog').removeClass(cogStringClasses).addClass(errorStringClasses);
								$('.back-connection').removeClass('hidden').show();
							} else {
								$('.create-user').find('.fa-cog').removeClass(cogStringClasses).addClass(successStringClasses);
								$('.login-step a').attr({'href': loginUrl})
								$('.login-step').removeClass('hidden').show();
							}
						});
					}
				});
			}
		});

		$('.back-connection').removeClass('hidden').show();
	});

	$('.back').on('click', (e) => {
		e.preventDefault();
		const step = $(e.target).data('step');
		$('.step').hide();
		$(`.step-${step}`).show();
	});

	const testDb = (data, done) => {
		$.post('/segment-cms/api/install', {type: 'testdb', url: data.url, collection: data.collection}, (res) => {
			done(res)
		});
	};

	const install = (data, done) => {
		$.post('/segment-cms/api/install', data, (res) => {
			done(res)
		});
	};

});