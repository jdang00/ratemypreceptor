<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import PreceptorResults from '$lib/components/PreceptorResults.svelte';

	const query = useQuery(api.preceptors.get, {});
</script>

<div class="mb-6 text-3xl font-bold">Professors</div>

{#if query.isLoading}
	Loading...
{:else if query.error}
	failed to load: {query.error.toString()}
{:else}
	<div class="flex flex-col gap-2">
		{#each query.data as preceptor (preceptor._id)}
			<PreceptorResults
				fullName={preceptor.fullName}
				schoolId={preceptor.schoolId}
				siteId={preceptor.siteId}
			/>
		{/each}
	</div>
{/if}
