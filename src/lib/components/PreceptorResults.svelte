<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card/index.js';
	import { formatNameWithCredentials } from '$lib/utils.js';

	interface Props {
		fullName: string;
		schoolId: string;
		siteId: string;
		totalReviews?: number;
		averageStarRating?: number;
		recommendationRate?: number;
		class?: string;
	}

	let { fullName, schoolId, siteId, totalReviews, averageStarRating, recommendationRate, class: className = '' }: Props = $props();
	
	const { displayName, credentials } = formatNameWithCredentials(fullName);
</script>

<div class="w-full py-2 {className}">
	<a href="/preceptors/{fullName}">
		<Card class="cursor-pointer transition-all duration-100 hover:shadow-lg">
			<CardHeader>
				<div class="flex items-start justify-between">
					<div>
						<h3 class="text-lg font-semibold">{displayName}</h3>
						{#if credentials}
							<p class="text-sm text-muted-foreground">{credentials}</p>
						{/if}
					</div>
					{#if totalReviews && totalReviews > 0}
						<div class="flex items-center space-x-2">
							<div class="flex items-center">
								<span class="text-yellow-500">{'⭐️'.repeat(Math.floor(averageStarRating || 0))}</span>
								<span class="ml-1 text-sm">{averageStarRating?.toFixed(1)}</span>
							</div>
							<span class={`px-2 py-1 rounded-full text-xs font-medium ${
								(recommendationRate || 0) >= 80 ? 'bg-green-100 text-green-800' :
								(recommendationRate || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
								'bg-red-100 text-red-800'
							}`}>
								{recommendationRate?.toFixed(0)}% recommend
							</span>
						</div>
					{/if}
				</div>
			</CardHeader>
			{#if totalReviews && totalReviews > 0}
				<CardContent>
					<p class="text-sm text-muted-foreground">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
				</CardContent>
			{/if}
		</Card>
	</a>
</div>
