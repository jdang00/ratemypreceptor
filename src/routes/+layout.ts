import posthog from 'posthog-js';
import { browser } from '$app/environment';
import { PUBLIC_POSTHOG_KEY as POSTHOG_KEY } from '$env/static/public';

function initTelemetry() {
	if (!browser) return;
	posthog.init(POSTHOG_KEY, {
		api_host: '/relay-JxkO',
		ui_host: 'https://us.posthog.com',
		person_profiles: 'always',
		persistence: 'localStorage'
	});
}

initTelemetry();
