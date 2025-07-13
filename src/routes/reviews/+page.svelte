<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { goto } from '$app/navigation';
	import ReviewCard from '$lib/components/ReviewCard.svelte';

	const reviewsQuery = useQuery(api.reviews.get);

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
		<div class="space-y-4">
			{#each Array(3) as _, i}
				<Card.Root>
					<Card.Header>
						<div class="space-y-2">
							<Skeleton class="h-6 w-[200px]" />
							<Skeleton class="h-4 w-[150px]" />
						</div>
					</Card.Header>
					<Card.Content>
						<div class="space-y-3">
							<div class="flex space-x-4">
								<Skeleton class="h-4 w-[80px]" />
								<Skeleton class="h-4 w-[60px]" />
								<Skeleton class="h-4 w-[70px]" />
							</div>
							<Skeleton class="h-20 w-full" />
							<Skeleton class="h-4 w-[100px]" />
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
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
				<ReviewCard
					{review}
					showPreceptorName={true}
					preceptorLink="/preceptors/{review.preceptorName}"
				/>
			{/each}
		</div>
	{/if}
</div>
