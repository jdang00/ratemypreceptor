<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';
	import NavHeader from '$lib/components/NavHeader.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';

	const { children } = $props();
	setupConvex(PUBLIC_CONVEX_URL);

	const navLinks = [
		{ title: 'Home', href: '/' },
		{ title: 'Preceptors', href: '/preceptors' },
		{ title: 'Reviews', href: '/reviews' }
	];
</script>

<ModeWatcher />
<NavHeader title="RateMyPreceptor" links={navLinks} showThemeButton={true} />

<main class="mx-auto max-w-2xl items-center px-4 py-8">
	{@render children()}
</main>
