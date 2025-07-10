<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let fullName = data.fullName;

	const reviewsQuery = useQuery(api.preceptorReviews.get, { fullName: fullName });
</script>

<h1 class="mb-4 text-2xl font-bold">{fullName}</h1>

{#if reviewsQuery.isLoading}
	<p>Loading reviews…</p>
{:else if reviewsQuery.error}
	<p class="text-red-600">Error: {reviewsQuery.error.message}</p>
{:else if reviewsQuery.data.length === 0}
	<p>No reviews yet for {fullName}.</p>
{:else}
	<ul class="space-y-4">
		{#each reviewsQuery.data as r (r._id)}
			<li class="rounded border p-4">
				<div class="flex justify-between">
					<span>⭐ {r.starRating}/5</span>
					<span>
						{#if r.wouldRecommend}
							👍 Recommended
						{:else}
							👎 Not recommended
						{/if}
					</span>
				</div>
				{#if r.comment}
					<p class="mt-2 text-gray-700">{r.comment}</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
