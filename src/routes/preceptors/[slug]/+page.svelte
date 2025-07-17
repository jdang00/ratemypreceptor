<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { aggregateReviews, formatNameWithCredentials } from '$lib/utils.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Plus, School, MapPin, GraduationCap } from '@lucide/svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import type { Id } from '../../../convex/_generated/dataModel.js';

	let { data }: PageProps = $props();
	let fullName: string = data.fullName;

	const reviewsQuery = useQuery(api.preceptorReviews.get, { fullName });
	const preceptorQuery = useQuery(api.preceptors.getByFullName, { fullName });

	type AffiliationSchool = { _id: Id<'schools'>; _creationTime: number; name: string };
	type AffiliationSite = { _id: Id<'practiceSites'>; _creationTime: number; name: string };
	type AffiliationProgram = {
		_id: Id<'programTypes'>;
		_creationTime: number;
		name: string;
		yearLabels: string[];
		abbreviation: string;
	};

	type AffiliationData = {
		schools: (AffiliationSchool | null)[];
		sites: (AffiliationSite | null)[];
		programs: (AffiliationProgram | null)[];
	};

	let preceptorId = $state<Id<'preceptors'> | undefined>(undefined);
	$effect(() => {
		preceptorId = preceptorQuery.data && preceptorQuery.data[0]?._id;
	});

	const affiliationsQuery = $derived(() =>
		preceptorId
			? useQuery(api.preceptorAffiliations.getPreceptorWithAffiliations, { preceptorId })
			: { data: undefined, error: undefined, isLoading: false, isStale: false }
	);

	const { displayName, credentials } = formatNameWithCredentials(fullName);
	const aggregation = $derived(aggregateReviews(reviewsQuery.data ?? []));

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div class="flex-1">
			<div class="space-y-2">
				<h1 class="text-3xl font-bold">{displayName}</h1>
				{#if credentials}
					<p class="text-muted-foreground text-lg">{credentials}</p>
				{/if}

				{#if affiliationsQuery()?.data?.schools}
					<div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
						{#if (affiliationsQuery().data?.schools ?? []).filter((s) => s !== null).length > 0}
							<div class="text-muted-foreground flex items-center gap-2">
								<School class="h-4 w-4" />
								<span class="text-sm font-medium">
									{(affiliationsQuery().data?.schools ?? []).filter((s) => s !== null).map((s) => s.name).join(', ')}
								</span>
							</div>
						{/if}
						{#if (affiliationsQuery().data?.programs ?? []).filter((p) => p !== null).length > 0}
							<div class="text-muted-foreground flex items-center gap-2">
								<GraduationCap class="h-4 w-4" />
								<span class="text-sm font-medium">
									{(affiliationsQuery().data?.programs ?? []).filter((p) => p !== null).map((p) => p.name).join(', ')}
								</span>
							</div>
						{/if}
						{#if (affiliationsQuery().data?.sites ?? []).filter((s) => s !== null).length > 0}
							<div class="text-muted-foreground flex items-center gap-2">
								<MapPin class="h-4 w-4" />
								<span class="text-sm font-medium">
									{(affiliationsQuery().data?.sites ?? []).filter((s) => s !== null).map((s) => s.name).join(', ')}
								</span>
							</div>
						{/if}
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

	<p class="text-muted-foreground">Reviews from students who worked with this preceptor</p>

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
				<ReviewCard {review} />
			{/each}
		</div>
	{/if}
</div>
