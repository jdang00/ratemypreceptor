<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import PreceptorResults from '$lib/components/PreceptorResults.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';

	const query = useQuery(api.preceptors.getWithReviews, {});

	function getPreceptorDisplayData(preceptor: any) {
		return {
			fullName: preceptor.fullName || 'Unknown',
			schoolNames: preceptor.schoolNames || [],
			programTypeNames: preceptor.programTypeNames || [],
			siteNames: preceptor.siteNames || [],
			totalReviews: preceptor.totalReviews || preceptor.reviewCount || 0,
			averageStarRating: preceptor.averageStarRating || preceptor.averageRating || 0,
			recommendationRate: preceptor.recommendationRate || 0
		};
	}
</script>

<div class="mb-6 text-3xl font-bold">Preceptors</div>

{#if query.isLoading}
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
{:else if query.error}
	failed to load: {query.error.toString()}
{:else}
	<div class="flex flex-col gap-2">
		{#each query.data as preceptor (preceptor._id)}
			{@const displayData = getPreceptorDisplayData(preceptor)}
			<PreceptorResults
				fullName={displayData.fullName}
				schoolNames={displayData.schoolNames}
				programTypeNames={displayData.programTypeNames}
				siteNames={displayData.siteNames}
				totalReviews={displayData.totalReviews}
				averageStarRating={displayData.averageStarRating}
				recommendationRate={displayData.recommendationRate}
			/>
		{/each}
	</div>
{/if}
