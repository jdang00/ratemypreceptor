<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
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
				<Card.Root>
					<Card.Header class="pb-4">
						<div class="flex items-start justify-between">
							<div>
								<Card.Title class="text-base font-semibold">
									<a href="/preceptors/{review.preceptorName}" class="hover:underline ">
										{review.preceptorName}
									</a>
								</Card.Title>
								<Card.Description class="flex items-center gap-2 mt-1">
									<span class="font-medium">{review.rotationTypeName}</span>
									<span>•</span>
									<span class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
										review.ippeAppe === 'IPPE' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary-foreground'
									}`}>
										{review.ippeAppe}
									</span>
									<span>•</span>
									<span>{review.schoolYear}</span>
									<span>•</span>
									<span class="text-muted-foreground">{review.priorExperience} experience</span>
								</Card.Description>
							</div>
							<div class="flex items-center gap-3">
								<div class="flex items-center gap-1">
									<span class="text-primary">⭐</span>
									<span class="text-sm font-semibold">{review.starRating.toFixed(1)}</span>
								</div>
								<span
									class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
										review.wouldRecommend
											? 'bg-primary/10 text-primary'
											: 'bg-destructive/10 text-destructive'
									}`}
								>
									{review.wouldRecommend ? '👍 Recommends' : '👎 Doesn\'t recommend'}
								</span>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="grid grid-cols-5 gap-3 text-center text-sm">
							<div>
								<div class="font-medium text-muted-foreground text-xs">Flexibility</div>
								<div class="text-base font-semibold">{review.schedulingFlexibility}/5</div>
							</div>
							<div>
								<div class="font-medium text-muted-foreground text-xs">Workload</div>
								<div class="text-base font-semibold">{review.workload}/5</div>
							</div>
							<div>
								<div class="font-medium text-muted-foreground text-xs">Expectations</div>
								<div class="text-base font-semibold">{review.expectations}/5</div>
							</div>
							<div>
								<div class="font-medium text-muted-foreground text-xs">Mentorship</div>
								<div class="text-base font-semibold">{review.mentorship}/5</div>
							</div>
							<div>
								<div class="font-medium text-muted-foreground text-xs">Enjoyment</div>
								<div class="text-base font-semibold">{review.enjoyment}/5</div>
							</div>
						</div>

						{#if review.extraHours}
							<div class="text-sm text-muted-foreground">
								Extra hours per week: <span class="font-medium">{review.extraHours}</span>
							</div>
						{/if}

						{#if review.comment}
							<div class="bg-muted rounded-lg p-3 ">
								<p class="text-sm leading-relaxed">{review.comment}</p>
							</div>
						{/if}

						{#if review.isOutlier && review.outlierReason}
							<div class="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
								<div class="flex items-center gap-2 mb-1">
									<span class="text-xs font-bold text-amber-800 dark:text-amber-200">⚠️ OUTLIER EXPERIENCE</span>
								</div>
								<p class="text-sm text-amber-700 dark:text-amber-300">{review.outlierReason}</p>
							</div>
						{/if}
					</Card.Content>
					<Card.Footer class="text-xs text-muted-foreground pt-3 border-t">
						Submitted {formatDate(review.updatedAt)}
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
