<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';
	import NavHeader from '$lib/components/NavHeader.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { dark } from '@clerk/themes';
	import { Theme } from './theme.svelte';

	import type { Snippet } from 'svelte';
	import { ClerkProvider } from 'svelte-clerk/client';
	import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
	import { page } from '$app/stores';
	const { children }: { children: Snippet } = $props();

	setupConvex(PUBLIC_CONVEX_URL);

	const navLinks = [
		{ title: 'Home', href: '/' },
		{ title: 'Preceptors', href: '/preceptors' },
		{ title: 'Reviews', href: '/reviews' },
		{ title: 'Admin Dashboard', href: '/admin' }
	];

	let theme = $state(new Theme());
</script>

<ModeWatcher />
<ClerkProvider
	publishableKey={PUBLIC_CLERK_PUBLISHABLE_KEY}
	appearance={{ baseTheme: theme.currentMode === 'dark' ? dark : undefined }}
>
	<div class="flex min-h-screen flex-col">
		<Toaster />
		<NavHeader
			themeProvider={theme}
			title="RateMyPreceptor"
			links={navLinks}
			showThemeButton={true}
		/>

		<main
			class="mx-auto w-full flex-1 px-4 py-8"
			class:max-w-5xl={$page.url.pathname !== '/admin'}
			class:max-w-7xl={$page.url.pathname === '/admin'}
		>
			{@render children()}
		</main>

		<Footer />
	</div>
</ClerkProvider>
