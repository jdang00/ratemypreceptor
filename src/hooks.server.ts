import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { withClerkHandler } from 'svelte-clerk/server';

const relayProxy: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (pathname.startsWith('/relay-JxkO')) {
		// decide which PostHog host to hit
		const hostname = pathname.startsWith('/relay-JxkO/static/')
			? 'us-assets.i.posthog.com'
			: 'us.i.posthog.com';

		// rebuild the URL
		const url = new URL(event.request.url);
		url.protocol = 'https:';
		url.hostname = hostname;
		url.port = '443';
		url.pathname = pathname.replace('/relay-JxkO/', '');

		// clone & tweak headers
		const headers = new Headers(event.request.headers);

		headers.set('Accept-Encoding', '');
		headers.set('host', hostname);

		// proxy
		const response = await fetch(url.toString(), {
			method: event.request.method,
			headers,
			body: event.request.body,
			duplex: 'half'
		});

		return response;
	}

	// otherwise fall through to the next handle
	return resolve(event);
};

const clerkHandle = withClerkHandler();

export const handle = sequence(relayProxy, clerkHandle);
