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

<div class="flex min-h-screen flex-col">
	<ModeWatcher />
	<NavHeader title="RateMyPreceptor" links={navLinks} showThemeButton={true} />

	<main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
		{@render children()}
	</main>

	<footer
		class="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur"
	>
		<div class="mx-auto max-w-2xl px-4 py-6">
			<div
				class="flex flex-col items-center space-y-4 text-center sm:flex-row sm:justify-between sm:space-y-0"
			>
				<div class="text-muted-foreground text-sm">
					© 2025 RateMyPreceptor. All rights reserved.
				</div>
				<div class="flex space-x-6 text-sm">
					<a href="/admin" class="text-muted-foreground hover:text-foreground transition-colors">
						Admin
					</a>
					<a href="/terms" class="text-muted-foreground hover:text-foreground transition-colors">
						Terms
					</a>
					<a href="/contact" class="text-muted-foreground hover:text-foreground transition-colors">
						Contact
					</a>
				</div>
			</div>
		</div>
	</footer>
</div>
