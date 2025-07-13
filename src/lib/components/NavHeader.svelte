<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { cn } from '$lib/utils.js';
	import { navigationMenuTriggerStyle } from '$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		SignedIn,
		SignedOut,
		SignInButton,
		UserButton,
		useClerkContext
	} from 'svelte-clerk/client';

	type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
		title: string;
		description?: string;
		href: string;
		class?: string;
	};

	let {
		themeProvider,
		title,
		links = [],
		showThemeButton = true,
		class: className = ''
	} = $props();

	let mobileOpen = $state(false);

	function handleMobileNavClick() {
		mobileOpen = false;
	}

	const ctx = useClerkContext();
</script>

{#snippet NavItem({ title, description, href, class: itemClass = '', ...restProps }: ListItemProps)}
	<li>
		<NavigationMenu.Link>
			{#snippet child()}
				<a
					{href}
					class={cn(
						'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md px-4 py-2 no-underline transition-colors outline-none select-none',
						itemClass
					)}
					{...restProps}
				>
					<div class="text-sm font-medium">{title}</div>
					{#if description}
						<p class="text-muted-foreground line-clamp-2 text-sm">
							{description}
						</p>
					{/if}
				</a>
			{/snippet}
		</NavigationMenu.Link>
	</li>
{/snippet}

<nav
	class={cn(
		'bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b px-6 backdrop-blur',
		className
	)}
>
	<div class="flex h-16 w-full items-center justify-between">
		<div class="flex items-center space-x-8">
			<a href="/" class="hover:text-primary text-xl font-bold transition-colors">
				{title}
			</a>
			<NavigationMenu.Root viewport={false} class="hidden md:flex">
				<NavigationMenu.List class="flex items-center space-x-1">
					{#each links.filter((link) => !(link.href === '/admin' && ctx.user?.publicMetadata.role !== 'admin')) as link (link.href)}
						<NavigationMenu.Item>
							<NavigationMenu.Link>
								{#snippet child()}
									<a href={link.href} class={navigationMenuTriggerStyle()}>
										{link.title}
									</a>
								{/snippet}
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{/each}
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</div>

		<div class="flex items-center space-x-4">
			<Button
				variant="ghost"
				size="sm"
				class="md:hidden"
				onclick={() => (mobileOpen = !mobileOpen)}
				aria-expanded={mobileOpen}
				aria-controls="mobile-menu"
				aria-label="Toggle mobile menu"
			>
				<svg
					class="h-5 w-5 transition-transform duration-200"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					class:rotate-45={mobileOpen}
				>
					{#if mobileOpen}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					{/if}
				</svg>
			</Button>

			{#if showThemeButton}
				<Button
					variant="ghost"
					size="sm"
					onclick={themeProvider.handleThemeToggle}
					class="h-9 w-9 p-0"
					aria-label="Toggle theme"
				>
					<Sun class="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon
						class="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
					/>
				</Button>
			{/if}

			<SignedOut>
				<SignInButton><Button variant="outline">Sign In</Button></SignInButton>
			</SignedOut>
			<SignedIn>
				<UserButton />
			</SignedIn>
		</div>
	</div>

	{#if mobileOpen}
		<div
			id="mobile-menu"
			class="bg-background animate-in slide-in-from-top-2 border-t duration-200 md:hidden"
		>
			<ul class="flex flex-col space-y-1 py-4">
				{#each links.filter((link) => !(link.href === '/admin' && ctx.user?.publicMetadata.role !== 'admin')) as link (link.href)}
					<li>
						<a
							href={link.href}
							class="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded px-4 py-2 transition-colors outline-none"
							onclick={handleMobileNavClick}
						>
							{link.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</nav>
