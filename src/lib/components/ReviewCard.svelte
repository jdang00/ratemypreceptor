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
			<div class="min-w-0 flex-1">
				{#if showPreceptorName && review.preceptorName}
					<Card.Title class="text-foreground text-base font-semibold break-words">
						{#if preceptorLink}
							<a href={preceptorLink} class="hover:underline">
								{review.preceptorName}
							</a>
						{:else}
							{review.preceptorName}
						{/if}
					</Card.Title>
				{:else}
					<Card.Title class="text-foreground text-base font-semibold break-words"
						>{review.rotationTypeName}</Card.Title
					>
				{/if}
				<Card.Description class="text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-1 text-sm">
					{#if showPreceptorName}
						<span class="font-medium">{review.rotationTypeName}</span>
						<span class="hidden sm:inline">•</span>
					{/if}
					<span
						class={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
							review.experienceTypeName.includes('IPPE')
								? 'bg-primary/10 text-primary'
								: 'bg-secondary/10 text-secondary-foreground'
						}`}>{review.experienceTypeName}</span
					>
					<span class="hidden sm:inline">•</span>
					<span>{review.schoolYear}</span>
					<span class="hidden sm:inline">•</span>
					<span>{review.priorExperience} experience</span>
				</Card.Description>
			</div>
			<div
				class="mt-2 flex flex-row flex-wrap items-center gap-2 sm:mt-0 sm:flex-col sm:items-end sm:gap-3"
			>
				<div class="flex items-center gap-1">
					<span class="text-primary text-base sm:text-lg">⭐</span>
					<span class="text-sm font-semibold sm:text-base">{review.starRating.toFixed(1)}</span>
				</div>
				<span
					class={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
						review.wouldRecommend
							? 'bg-primary/10 text-primary'
							: 'bg-destructive/10 text-destructive'
					}`}
				>
					{review.wouldRecommend ? '👍 Recommends' : "👎 Doesn't recommend"}
				</span>
				{#if review.upvoteCount && review.downvoteCount && (review.upvoteCount > 0 || review.downvoteCount > 0)}
					<div class="flex items-center gap-1">
						<span class="text-muted-foreground text-xs">
							{review.upvoteCount - review.downvoteCount > 0 ? '+' : ''}{review.upvoteCount -
								review.downvoteCount}
						</span>
					</div>
				{/if}
			</div>
		</div>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="overflow-x-auto">
			<div
				class="grid min-w-[400px] grid-cols-2 gap-3 text-center text-sm sm:min-w-0 sm:grid-cols-5"
			>
				<div>
					<div class="text-muted-foreground text-xs font-medium">Flexibility</div>
					<div class="text-base font-semibold">{review.schedulingFlexibility}/5</div>
				</div>
				<div>
					<div class="text-muted-foreground text-xs font-medium">Workload</div>
					<div class="text-base font-semibold">{review.workload}/5</div>
				</div>
				<div>
					<div class="text-muted-foreground text-xs font-medium">Expectations</div>
					<div class="text-base font-semibold">{review.expectations}/5</div>
				</div>
				<div>
					<div class="text-muted-foreground text-xs font-medium">Mentorship</div>
					<div class="text-base font-semibold">{review.mentorship}/5</div>
				</div>
				<div>
					<div class="text-muted-foreground text-xs font-medium">Enjoyment</div>
					<div class="text-base font-semibold">{review.enjoyment}/5</div>
				</div>
			</div>
		</div>

		{#if review.extraHours}
			<div class="text-muted-foreground text-sm">
				Extra hours per week: <span class="font-medium">{review.extraHours}</span>
			</div>
		{/if}

		{#if review.comment}
			<div class="bg-muted rounded-lg p-3 text-sm leading-relaxed">
				{@html review.comment.replace(
					/(https?:\/\/[^\s]+)/g,
					'<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
				)}
			</div>
		{/if}

		{#if review.isOutlier && review.outlierReason}
			<div
				class="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950"
			>
				<div class="mb-1 flex items-center gap-2">
					<span class="text-xs font-bold text-amber-800 dark:text-amber-200"
						>⚠️ OUTLIER EXPERIENCE</span
					>
				</div>
				<p class="text-sm text-amber-700 dark:text-amber-300">{review.outlierReason}</p>
			</div>
		{/if}
	</Card.Content>
	<Card.Footer class="text-muted-foreground border-t pt-3 text-xs">
		Submitted {formatDate(review.createdAt)}
	</Card.Footer>
</Card.Root>
