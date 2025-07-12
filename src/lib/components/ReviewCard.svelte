<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';

	interface Props {
		review: {
			_id: string;
			preceptorName?: string;
			rotationTypeName: string;
			experienceTypeName: string;
			schoolYear: string;
			priorExperience: string;
			starRating: number;
			wouldRecommend: boolean;
			schedulingFlexibility: number;
			workload: number;
			expectations: number;
			mentorship: number;
			enjoyment: number;
			extraHours?: number;
			comment?: string;
			isOutlier?: boolean;
			outlierReason?: string;
			upvoteCount?: number;
			downvoteCount?: number;
			createdAt: number;
		};
		showPreceptorName?: boolean;
		preceptorLink?: string;
	}

	let { review, showPreceptorName = false, preceptorLink }: Props = $props();

	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<Card.Root class="w-full">
	<Card.Header class="pb-4">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
			<div class="flex-1 min-w-0">
				{#if showPreceptorName && review.preceptorName}
					<Card.Title class="text-base font-semibold text-foreground break-words">
						{#if preceptorLink}
							<a href={preceptorLink} class="hover:underline">
								{review.preceptorName}
							</a>
						{:else}
							{review.preceptorName}
						{/if}
					</Card.Title>
				{:else}
					<Card.Title class="text-base font-semibold text-foreground break-words">{review.rotationTypeName}</Card.Title>
				{/if}
				<Card.Description class="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-sm text-muted-foreground">
					{#if showPreceptorName}
						<span class="font-medium">{review.rotationTypeName}</span>
						<span class="hidden sm:inline">•</span>
					{/if}
					<span class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
						review.experienceTypeName.includes('IPPE') ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary-foreground'
					}`}>{review.experienceTypeName}</span>
					<span class="hidden sm:inline">•</span>
					<span>{review.schoolYear}</span>
					<span class="hidden sm:inline">•</span>
					<span>{review.priorExperience} experience</span>
				</Card.Description>
			</div>
			<div class="flex flex-row flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-3 mt-2 sm:mt-0">
				<div class="flex items-center gap-1">
					<span class="text-primary text-base sm:text-lg">⭐</span>
					<span class="text-sm sm:text-base font-semibold">{review.starRating.toFixed(1)}</span>
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
				{#if review.upvoteCount && review.downvoteCount && (review.upvoteCount > 0 || review.downvoteCount > 0)}
					<div class="flex items-center gap-1">
						<span class="text-xs text-muted-foreground">
							{review.upvoteCount - review.downvoteCount > 0 ? '+' : ''}{review.upvoteCount - review.downvoteCount}
						</span>
					</div>
				{/if}
			</div>
		</div>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="overflow-x-auto">
			<div class="grid min-w-[400px] grid-cols-2 gap-3 text-center text-sm sm:min-w-0 sm:grid-cols-5">
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
		</div>

		{#if review.extraHours}
			<div class="text-sm text-muted-foreground">
				Extra hours per week: <span class="font-medium">{review.extraHours}</span>
			</div>
		{/if}

		{#if review.comment}
			<div class="bg-muted rounded-lg p-3 text-sm leading-relaxed">
				{review.comment}
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
		Submitted {formatDate(review.createdAt)}
	</Card.Footer>
</Card.Root> 