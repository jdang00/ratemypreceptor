<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api.js';
	import PreceptorResults from '$lib/components/PreceptorResults.svelte';
	import { Search } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';

	let searchTerm = $state('');

	const searchResults = useQuery(api.reviews.searchPreceptorsByReviews, () => ({
		searchTerm: searchTerm || ''
	}));

	const allPreceptors = useQuery(api.preceptors.getWithReviews, {});
</script>



<h1 class="mt-8 mb-4 text-center text-3xl font-bold">RateMyPreceptor</h1>
<p class="text-center text-lg">Enter a preceptor, school, or rotation to get started.</p>


<div class="mt-12 flex flex-col items-center gap-6">
	<div class="relative w-full max-w-2xl">
		<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
		<Input
			bind:value={searchTerm}
			placeholder="Search preceptors, schools, or rotations..."
			class="h-12 pl-10"
		/>
	</div>

	<p class="text-center">
		<a href="/reviews/new"><Button variant="link">Or, submit a review</Button></a>
	</p>

	<div class="w-full max-w-4xl">
		{#if searchTerm}
			{#if searchResults.isLoading}
				<div class="space-y-3">
					{#each Array(3) as _, i}
						<div class="flex items-center space-x-4 rounded-lg border p-4">
							<div class="flex-1 space-y-2">
								<Skeleton class="h-5 w-[200px]" />
								<Skeleton class="h-4 w-[150px]" />
								<Skeleton class="h-4 w-[100px]" />
							</div>
							<div class="space-y-1">
								<Skeleton class="h-4 w-[60px]" />
								<Skeleton class="h-4 w-[40px]" />
							</div>
						</div>
					{/each}
				</div>
			{:else if searchResults.error}
				<div class="text-center text-red-500">Error: {searchResults.error.toString()}</div>
			{:else if searchResults.data}
				{#if searchResults.data.length === 0}
					<div class="py-8 text-center">
						<p class="text-muted-foreground">No preceptors found matching "{searchTerm}"</p>
						<p class="text-muted-foreground mt-1 text-sm">
							Try a different search term or browse all preceptors below.
						</p>
					</div>
				{:else}
					<div class="mb-6">
						<h2 class="mb-4 text-xl font-semibold">
							Found {searchResults.data.length} preceptor{searchResults.data.length !== 1
								? 's'
								: ''} for "{searchTerm}"
						</h2>
						<div class="flex flex-col gap-3">
							{#each searchResults.data as preceptor (preceptor._id)}
								<PreceptorResults
									fullName={preceptor.fullName}
									schoolName={preceptor.schoolName}
									programTypeName={preceptor.programTypeName}
									siteName={preceptor.siteName}
									totalReviews={preceptor.totalReviews}
									averageStarRating={preceptor.averageStarRating}
									recommendationRate={preceptor.recommendationRate}
								/>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		{:else if allPreceptors.isLoading}
			<div class="space-y-3">
				{#each Array(5) as _, i}
					<div class="flex items-center space-x-4 rounded-lg border p-4">
						<div class="flex-1 space-y-2">
							<Skeleton class="h-5 w-[200px]" />
							<Skeleton class="h-4 w-[150px]" />
							<Skeleton class="h-4 w-[100px]" />
						</div>
						<div class="space-y-1">
							<Skeleton class="h-4 w-[60px]" />
							<Skeleton class="h-4 w-[40px]" />
						</div>
					</div>
				{/each}
			</div>
		{:else if allPreceptors.error}
			<div class="text-center text-red-500">Error: {allPreceptors.error.toString()}</div>
		{:else if allPreceptors.data}
			{#if allPreceptors.data.length === 0}
				<div class="py-8 text-center">
					<p class="text-muted-foreground">No preceptors available yet.</p>
				</div>
			{:else}
				<div class="mb-6">
					<h2 class="mb-4 text-xl font-semibold">
						All Preceptors ({allPreceptors.data.length})
					</h2>
					<div class="flex flex-col gap-3">
						{#each allPreceptors.data as preceptor (preceptor._id)}
							<PreceptorResults
								fullName={preceptor.fullName}
								schoolName={preceptor.schoolName}
								programTypeName={preceptor.programTypeName}
								siteName={preceptor.siteName}
								totalReviews={preceptor.totalReviews}
								averageStarRating={preceptor.averageStarRating}
								recommendationRate={preceptor.recommendationRate}
							/>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
