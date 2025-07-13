<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	interface Props {
		label: string;
		value: string | number;
		onChange: (value: number) => void;
		required?: boolean;
	}

	let { label, value, onChange, required = false }: Props = $props();

	const currentValue = $derived(Number(value) || 0);

	function getRatingColor(ratingValue: number): string {
		if (ratingValue <= currentValue) {
			switch (ratingValue) {
				case 1:
					return 'bg-red-500 border-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:border-red-600 dark:text-white dark:hover:bg-red-700';
				case 2:
					return 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:border-orange-600 dark:text-white dark:hover:bg-orange-700';
				case 3:
					return 'bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:border-yellow-600 dark:text-white dark:hover:bg-yellow-700';
				case 4:
					return 'bg-lime-500 border-lime-500 text-white hover:bg-lime-600 dark:bg-lime-600 dark:border-lime-600 dark:text-white dark:hover:bg-lime-700';
				case 5:
					return 'bg-green-500 border-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:border-green-600 dark:text-white dark:hover:bg-green-700';
				default:
					return '';
			}
		}
		return '';
	}

	function getRatingText(rating: number): string {
		switch (rating) {
			case 1:
				return 'Poor';
			case 2:
				return 'Fair';
			case 3:
				return 'Good';
			case 4:
				return 'Very Good';
			case 5:
				return 'Excellent';
			default:
				return '';
		}
	}
</script>

<div class="space-y-2">
	<Label class="text-sm font-medium">
		{label}
		{#if required}<span class="text-red-500">*</span>{/if}
	</Label>
	<div class="flex items-center gap-3">
		<div class="flex gap-1">
			{#each Array.from({ length: 5 }, (_, i) => i + 1) as ratingValue}
				<Button
					variant="outline"
					size="sm"
					class="h-10 w-10 rounded-full border-2 font-medium transition-all duration-200 {getRatingColor(
						ratingValue
					)} focus:ring-ring focus:ring-2 focus:ring-offset-2"
					onclick={() => onChange(ratingValue)}
				>
					{ratingValue}
				</Button>
			{/each}
		</div>
		<div class="flex flex-col">
			<span class="text-muted-foreground text-sm">
				{currentValue > 0 ? `${currentValue}/5` : 'Click to rate'}
			</span>
			{#if currentValue > 0}
				<span class="text-muted-foreground text-xs font-medium">
					{getRatingText(currentValue)}
				</span>
			{/if}
		</div>
	</div>
</div>
