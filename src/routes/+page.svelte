<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api.js';
	import PreceptorResults from '$lib/components/PreceptorResults.svelte';
	import { Search } from '@lucide/svelte';

	let searchTerm = '';

	// Query for search results
	const searchResults = useQuery(
		api.reviews.searchPreceptorsByReviews,
		{ searchTerm }
	);
</script>

<h1 class="mt-8 mb-4 text-center text-3xl font-bold">RateMyPreceptor</h1>
<p class="text-center text-lg">Enter a preceptor, school, or rotation to get started.</p>

<div class="mt-12 flex flex-col items-center gap-6">
	<div class="relative w-full max-w-2xl">
		<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<Input 
			bind:value={searchTerm}
			placeholder="Search preceptors, schools, or rotations..." 
			class="h-12 pl-10" 
		/>
	</div>

	{#if searchTerm}
		<div class="w-full max-w-4xl">
			{#if searchResults.isLoading}
				<div class="text-center text-muted-foreground">Searching...</div>
			{:else if searchResults.error}
				<div class="text-center text-red-500">Error: {searchResults.error.toString()}</div>
			{:else if searchResults.data}
				{#if searchResults.data.length === 0}
					<div class="text-center text-muted-foreground">
						No preceptors found matching "{searchTerm}"
					</div>
				{:else}
					<div class="text-lg font-semibold mb-4">
						Found {searchResults.data.length} preceptor{searchResults.data.length !== 1 ? 's' : ''} for "{searchTerm}"
					</div>
					<div class="flex flex-col gap-2">
						{#each searchResults.data as preceptor (preceptor._id)}
							<PreceptorResults
								fullName={preceptor.fullName}
								schoolId={preceptor.schoolId}
								siteId={preceptor.siteId}
								totalReviews={preceptor.totalReviews}
								averageStarRating={preceptor.averageStarRating}
								recommendationRate={preceptor.recommendationRate}
							/>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
