<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card/index.js';
	import { formatNameWithCredentials } from '$lib/utils.js';
	import { MapPin, School, Star, Users, ThumbsUp, GraduationCap } from '@lucide/svelte';

	interface Props {
		fullName: string;
		schoolName: string;
		programTypeName: string;
		siteName: string;
		totalReviews?: number;
		averageStarRating?: number;
		recommendationRate?: number;
		class?: string;
	}

	let { 
		fullName, 
		schoolName, 
		programTypeName,
		siteName, 
		totalReviews, 
		averageStarRating, 
		recommendationRate, 
		class: className = '' 
	}: Props = $props();
	
	const { displayName, credentials } = formatNameWithCredentials(fullName);
	const hasReviews = totalReviews && totalReviews > 0;
</script>

<div class="w-full py-1 {className}">
	<a href="/preceptors/{fullName}">
		<Card class="cursor-pointer transition-all duration-200 hover:shadow-md">
			<CardContent class="p-4">
				<div class="flex items-start justify-between gap-4">
					<div class="flex-1 min-w-0">
						<div class="flex items-start gap-2 mb-2">
							<div class="flex-1">
								<h3 class="text-lg font-semibold text-foreground leading-tight">{displayName}</h3>
								{#if credentials}
									<p class="text-sm text-muted-foreground font-medium">{credentials}</p>
								{/if}
							</div>
						</div>
						
						<div class="space-y-1.5">
							<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
								<School class="h-3.5 w-3.5 flex-shrink-0" />
								<span class="truncate">{schoolName}</span>
							</div>
							<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
								<GraduationCap class="h-3.5 w-3.5 flex-shrink-0" />
								<span class="truncate">{programTypeName}</span>
							</div>
							<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
								<MapPin class="h-3.5 w-3.5 flex-shrink-0" />
								<span class="truncate">{siteName}</span>
							</div>
						</div>
					</div>

					{#if hasReviews}
						<div class="flex flex-col items-end gap-2 flex-shrink-0">
							<div class="flex items-center gap-1.5">
								⭐️
								<span class="text-sm font-semibold">{averageStarRating?.toFixed(1)}</span>
							</div>
							
							<div class="flex items-center gap-1.5">
								<ThumbsUp class="h-3.5 w-3.5 text-green-600" />
								<span class="text-sm font-medium text-green-700">{recommendationRate?.toFixed(0)}%</span>
							</div>
							
							<div class="flex items-center gap-1.5 text-muted-foreground">
								<Users class="h-3.5 w-3.5" />
								<span class="text-xs">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
							</div>
						</div>
					{:else}
						<div class="flex flex-col items-end gap-2 flex-shrink-0">
							<div class="text-xs text-muted-foreground italic">No reviews yet</div>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>
	</a>
</div>
