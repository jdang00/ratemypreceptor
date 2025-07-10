<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { goto } from '$app/navigation';

	const reviewsQuery = useQuery(api.reviews.get, {});

	const reviews = $derived(reviewsQuery.data ?? []);

	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Reviews</h1>
			<p class="mt-2">Browse preceptor reviews from other students</p>
		</div>
		<Button onclick={() => goto('/reviews/new')}>Submit Review</Button>
	</div>

	{#if reviewsQuery.isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
			<span class="ml-2">Loading reviews...</span>
		</div>
	{:else if reviewsQuery.error}
		<div class="rounded-md border border-red-200 bg-red-50 p-4">
			<p class="text-red-800">Error loading reviews: {reviewsQuery.error.message}</p>
		</div>
	{:else if reviews.length === 0}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center py-12">
				<div class="text-center">
					<h3 class="text-lg font-medium">No reviews yet</h3>
					<p class="mt-2">Be the first to share your experience with a preceptor!</p>
					<Button class="mt-4" onclick={() => goto('/reviews/new')}>Submit First Review</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="space-y-4">
			{#each reviews as review (review._id)}
				<Card.Root>
					<Card.Header>
						<div class="flex items-start justify-between">
							<div>
								<Card.Title class="text-lg">{review.preceptorName}</Card.Title>
								<Card.Description>
									{review.rotationTypeName} • {review.ippeAppe} • {review.schoolYear}
								</Card.Description>
							</div>
							<div class="flex items-center space-x-2">
								<div class="flex items-center">
									<span class="text-yellow-500">{'⭐️'.repeat(Math.floor(review.starRating))}</span>
									<span class="ml-1 text-sm">{review.starRating.toFixed(1)}</span>
								</div>
								<span class={`px-2 py-1 rounded-full text-xs font-medium ${
									review.wouldRecommend 
										? 'bg-green-100 text-green-800' 
										: 'bg-red-100 text-red-800'
								}`}>
									{review.wouldRecommend ? 'Recommended' : 'Not Recommended'}
								</span>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
							<div class="text-center">
								<div class="font-medium">Flexibility</div>
								<div>{review.schedulingFlexibility.toFixed(1)}</div>
							</div>
							<div class="text-center">
								<div class="font-medium">Workload</div>
								<div>{review.workload.toFixed(1)}</div>
							</div>
							<div class="text-center">
								<div class="font-medium">Expectations</div>
								<div>{review.expectations.toFixed(1)}</div>
							</div>
							<div class="text-center">
								<div class="font-medium">Mentorship</div>
								<div>{review.mentorship.toFixed(1)}</div>
							</div>
							<div class="text-center">
								<div class="font-medium">Enjoyment</div>
								<div>{review.enjoyment.toFixed(1)}</div>
							</div>
						</div>

						<div class="flex items-center space-x-4 text-sm">
							<span class="font-medium">Prior Experience:</span>
							<span class={`px-2 py-1 rounded-full text-xs font-medium ${
								review.priorExperience === 'None' ? 'bg-red-100 text-red-800' :
								review.priorExperience === 'Little' ? 'bg-orange-100 text-orange-800' :
								review.priorExperience === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
								'bg-green-100 text-green-800'
							}`}>
								{review.priorExperience}
							</span>
							{#if review.extraHours}
								<span>Extra Hours: {review.extraHours}/week</span>
							{/if}
						</div>

						{#if review.comment}
							<div class="rounded-md bg-muted p-3">
								<p class="text-sm leading-relaxed">{review.comment}</p>
							</div>
						{/if}

						{#if review.isOutlier && review.outlierReason}
							<div class="rounded-md border border-amber-200 bg-amber-50 p-3">
								<div class="flex items-center space-x-2">
									<span class="text-xs font-medium text-amber-800">OUTLIER EXPERIENCE</span>
								</div>
								<p class="mt-1 text-sm text-amber-700">{review.outlierReason}</p>
							</div>
						{/if}
					</Card.Content>
					<Card.Footer class="text-xs">
						Submitted {formatDate(review.updatedAt)}
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
