<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import PreceptorResults from '$lib/components/PreceptorResults.svelte';

	const query = useQuery(api.preceptors.getWithReviews, {});
</script>

<div class="mb-6 text-3xl font-bold">Preceptors</div>

{#if query.isLoading}
	Loading...
{:else if query.error}
	failed to load: {query.error.toString()}
{:else}
	<div class="flex flex-col gap-2">
		{#each query.data as preceptor (preceptor._id)}
			<PreceptorResults
				fullName={preceptor.fullName}
				schoolName={preceptor.schoolName}
				siteName={preceptor.siteName}
				totalReviews={preceptor.totalReviews}
				averageStarRating={preceptor.averageStarRating}
				recommendationRate={preceptor.recommendationRate}
			/>
		{/each}
	</div>
{/if}
