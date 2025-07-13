<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import { formatNameWithCredentials } from '$lib/utils.js';
	import { MapPin, School, Users, ThumbsUp, GraduationCap } from '@lucide/svelte';

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
					<div class="min-w-0 flex-1">
						<div class="mb-2 flex items-start gap-2">
							<div class="flex-1">
								<h3 class="text-foreground text-lg leading-tight font-semibold">{displayName}</h3>
								{#if credentials}
									<p class="text-muted-foreground text-sm font-medium">{credentials}</p>
								{/if}
							</div>
						</div>

						<div class="space-y-1.5">
							<div class="text-muted-foreground flex items-center gap-1.5 text-sm">
								<School class="h-3.5 w-3.5 flex-shrink-0" />
								<span class="truncate">{schoolName}</span>
							</div>
							<div class="text-muted-foreground flex items-center gap-1.5 text-sm">
								<GraduationCap class="h-3.5 w-3.5 flex-shrink-0" />
								<span class="truncate">{programTypeName}</span>
							</div>
							<div class="text-muted-foreground flex items-center gap-1.5 text-sm">
								<MapPin class="h-3.5 w-3.5 flex-shrink-0" />
								<span class="truncate">{siteName}</span>
							</div>
						</div>
					</div>

					{#if hasReviews}
						<div class="flex flex-shrink-0 flex-col items-end gap-2">
							<div class="flex items-center gap-1.5">
								⭐️
								<span class="text-sm font-semibold">{averageStarRating?.toFixed(1)}</span>
							</div>

							<div class="flex items-center gap-1.5">
								<ThumbsUp class="h-3.5 w-3.5 text-green-600" />
								<span class="text-sm font-medium text-green-700"
									>{recommendationRate?.toFixed(0)}%</span
								>
							</div>

							<div class="text-muted-foreground flex items-center gap-1.5">
								<Users class="h-3.5 w-3.5" />
								<span class="text-xs">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
							</div>
						</div>
					{:else}
						<div class="flex flex-shrink-0 flex-col items-end gap-2">
							<div class="text-muted-foreground text-xs italic">No reviews yet</div>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>
	</a>
</div>
