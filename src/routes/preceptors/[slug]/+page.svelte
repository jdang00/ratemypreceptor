<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { aggregateReviews, formatNameWithCredentials } from '$lib/utils.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Plus, School, MapPin } from '@lucide/svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	let { data }: PageProps = $props();

	let fullName = data.fullName;

	const reviewsQuery = useQuery(api.preceptorReviews.get, { fullName: fullName });
	const preceptorQuery = useQuery(api.preceptors.getByFullName, { fullName: fullName });

	const { displayName, credentials } = formatNameWithCredentials(fullName);
	const aggregation = $derived(aggregateReviews(reviewsQuery.data ?? []));

	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
		<div class="flex-1">
			<div class="space-y-2">
				<h1 class="text-3xl font-bold">{displayName}</h1>
				{#if credentials}
					<p class="text-muted-foreground text-lg">{credentials}</p>
				{/if}
				
				{#if preceptorQuery.data}
					<div class="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
						<div class="flex items-center gap-2 text-muted-foreground">
							<School class="h-4 w-4" />
							<span class="text-sm font-medium">{preceptorQuery.data.schoolName}</span>
						</div>
						<div class="flex items-center gap-2 text-muted-foreground">
							<MapPin class="h-4 w-4" />
							<span class="text-sm font-medium">{preceptorQuery.data.siteName}</span>
						</div>
					</div>
				{/if}
				
			</div>
		</div>
		<div class="flex-shrink-0">
			<a href="/reviews/new/{fullName}">
				<Button class="w-full sm:w-auto">
					<Plus class="h-4 w-4" />
					Add Review
				</Button>
			</a>
		</div>
	</div>

	{#if aggregation.totalReviews > 0}
		<Card.Root>
			<Card.Header>
				<Card.Title>Overall Ratings</Card.Title>
				<Card.Description
					>Based on {aggregation.totalReviews} review{aggregation.totalReviews !== 1
						? 's'
						: ''}</Card.Description
				>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex items-center space-x-4">
					<div class="flex items-center">
						<span class="text-yellow-500"
							>{'⭐️'.repeat(Math.floor(aggregation.averageStarRating))}</span
						>
						<span class="ml-2 text-lg font-semibold"
							>{aggregation.averageStarRating.toFixed(1)}</span
						>
					</div>
					<span
						class={`rounded-full px-3 py-1 text-sm font-medium ${
							aggregation.recommendationRate >= 80
								? 'bg-green-100 text-green-800'
								: aggregation.recommendationRate >= 60
									? 'bg-yellow-100 text-yellow-800'
									: 'bg-red-100 text-red-800'
						}`}
					>
						{aggregation.recommendationRate.toFixed(0)}% recommend
					</span>
				</div>

				<div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
					<div class="text-center">
						<div class="font-medium">Flexibility</div>
						<div>{aggregation.averageSchedulingFlexibility.toFixed(1)}</div>
					</div>
					<div class="text-center">
						<div class="font-medium">Workload</div>
						<div>{aggregation.averageWorkload.toFixed(1)}</div>
					</div>
					<div class="text-center">
						<div class="font-medium">Expectations</div>
						<div>{aggregation.averageExpectations.toFixed(1)}</div>
					</div>
					<div class="text-center">
						<div class="font-medium">Mentorship</div>
						<div>{aggregation.averageMentorship.toFixed(1)}</div>
					</div>
					<div class="text-center">
						<div class="font-medium">Enjoyment</div>
						<div>{aggregation.averageEnjoyment.toFixed(1)}</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if reviewsQuery.data && reviewsQuery.data.length > 0}
		<div class="flex items-center space-x-4">
			<div class="mt-8 flex-1 border-t border-gray-200"></div>
		</div>
	{/if}

	<p class=" text-muted-foreground">Reviews from students who worked with this preceptor</p>


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
	{:else if reviewsQuery.data.length === 0}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center py-12">
				<div class="text-center">
					<h3 class="text-lg font-medium">No reviews yet</h3>
					<p class="mt-2">Be the first to share your experience with {displayName}!</p>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="space-y-4">
			{#each reviewsQuery.data as review (review._id)}
				<Card.Root>
					<Card.Header class="pb-4">
						<div class="flex items-start justify-between">
							<div>
								<Card.Title class="text-base font-semibold">{review.rotationTypeName}</Card.Title>
								<Card.Description class="flex items-center gap-2">
									<span class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
										review.ippeAppe === 'IPPE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
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
									<span class="text-yellow-500">⭐</span>
									<span class="text-sm font-semibold">{review.starRating.toFixed(1)}</span>
								</div>
								<span
									class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
										review.wouldRecommend
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'
									}`}
								>
									{review.wouldRecommend ? '👍 Recommends' : '👎 Doesn\'t recommend'}
								</span>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="space-y-4">
						<!-- Condensed ratings grid -->
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
							<div class="bg-muted rounded-lg p-3">
								<p class="text-sm leading-relaxed">{review.comment}</p>
							</div>
						{/if}

						{#if review.isOutlier && review.outlierReason}
							<div class="rounded-lg border border-amber-200 bg-amber-50 p-3">
								<div class="flex items-center gap-2 mb-1">
									<span class="text-xs font-bold text-amber-800">⚠️ OUTLIER EXPERIENCE</span>
								</div>
								<p class="text-sm text-amber-700">{review.outlierReason}</p>
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
