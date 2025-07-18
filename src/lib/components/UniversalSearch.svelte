<script lang="ts">
	import { Input } from './ui/input/index.js';
	import { Search } from '@lucide/svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import PreceptorResults from './PreceptorResults.svelte';

	const { placeholder = 'Search preceptors by name, school, site, or program...' } = $props();

	let searchTerm = $state('');
	let debouncedSearchTerm = $state('');

	// Debounce search term
	$effect(() => {
		const currentSearchTerm = searchTerm;
		const timer = setTimeout(() => {
			debouncedSearchTerm = currentSearchTerm;
		}, 300);

		return () => clearTimeout(timer);
	});

	const searchQuery = $derived(
		useQuery(api.preceptors.universalSearch, {
			searchTerm: debouncedSearchTerm
		})
	);

	const results = $derived(searchQuery.data ?? []);
	const loading = $derived(searchQuery.isLoading);


</script>

<div class="relative mx-auto w-full max-w-md sm:max-w-full">
	<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
	<Input bind:value={searchTerm} {placeholder} class="mt-8 h-12 w-full pl-10" autocomplete="off" />
</div>

{#if searchTerm.trim()}
	{#if loading && debouncedSearchTerm.trim()}
		<div class="text-muted-foreground mt-4">Loading...</div>
	{:else if debouncedSearchTerm.trim() && results.length === 0}
		<div class="text-muted-foreground mt-4">No preceptors found.</div>
	{:else if results.length > 0}
		<div class="mt-4 space-y-2">
			{#each results as preceptor, i (i)}
				{#if preceptor}
					<PreceptorResults
						fullName={preceptor.fullName}
						schoolNames={preceptor.schoolNames || []}
						programTypeNames={preceptor.programTypeNames || []}
						siteNames={preceptor.siteNames || []}
						totalReviews={preceptor.reviewCount}
						averageStarRating={preceptor.averageRating}
						recommendationRate={preceptor.recommendationRate}
					/>
				{/if}
			{/each}
		</div>
	{/if}
{/if}
