<script lang="ts">
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function handleSubmitted() {
		goto('/reviews');
	}
</script>

<div class="mx-auto max-w-4xl">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Submit Review</h1>
		<p class="mt-2">Share your experience with other students</p>
	</div>
	<ReviewForm prefillPreceptorName={data.fullName} on:submitted={handleSubmitted} />
</div> 