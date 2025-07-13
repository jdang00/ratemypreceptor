<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Database, AlertTriangle, CheckCircle, Loader2, Trash2 } from '@lucide/svelte';
	import { env } from '$env/dynamic/public';

	type Props = {
		isOpen: boolean;
		onClose: () => void;
		onSuccess?: () => void;
	};

	let { isOpen, onClose, onSuccess }: Props = $props();

	const client = useConvexClient();

	let isSeeding = $state(false);
	let isClearing = $state(false);
	let seedResult = $state<any>(null);
	let seedError = $state<string>('');
	let clearData = $state(true);

	let config = $state({
		preceptors: 50,
		schools: 15,
		practiceSites: 25,
		reviewsPerPreceptor: { min: 1, max: 8 },
		ratingDistributions: {
			positive: 0.6,
			neutral: 0.3,
			negative: 0.1
		}
	});

	const isDevEnvironment = $derived(env.PUBLIC_ENVIRONMENT_TYPE === 'development');

	async function handleSeed() {
		if (isSeeding) return;

		try {
			isSeeding = true;
			seedError = '';
			seedResult = null;

			const result = await client.mutation((api as any).seed.seedDatabase, {
				config: clearData ? config : undefined
			});
			seedResult = result;

			onSuccess?.();
		} catch (error) {
			seedError = error instanceof Error ? error.message : 'Failed to seed database';
		} finally {
			isSeeding = false;
		}
	}

	async function handleClearTables() {
		if (isClearing) return;

		try {
			isClearing = true;
			seedError = '';
			seedResult = null;

			const result = await client.mutation((api as any).seed.clearTables, {});
			seedResult = result;

			onSuccess?.();
		} catch (error) {
			seedError = error instanceof Error ? error.message : 'Failed to clear tables';
		} finally {
			isClearing = false;
		}
	}

	function handleClose() {
		seedResult = null;
		seedError = '';
		onClose();
	}

	$effect(() => {
		if (!isDevEnvironment && isOpen) {
			handleClose();
		}
	});
</script>

{#if isDevEnvironment}
	<Dialog.Root bind:open={isOpen} onOpenChange={handleClose}>
		<Dialog.Content class="sm:max-w-[600px]">
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					<Database class="h-5 w-5" />
					Database Seeding
				</Dialog.Title>
				<Dialog.Description>
					Seed the database with sample data for development and testing.
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4">
				<div class="bg-muted/50 rounded-lg border p-4">
					<div class="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
						<AlertTriangle class="h-4 w-4" />
						Development Only
					</div>
					<p class="text-muted-foreground text-sm">Configure the amount of data to generate:</p>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="preceptors" class="text-sm font-medium">Preceptors</Label>
						<Input
							id="preceptors"
							type="number"
							min="1"
							max="500"
							bind:value={config.preceptors}
							class="h-9 text-sm"
						/>
					</div>

					<div class="space-y-2">
						<Label for="schools" class="text-sm font-medium">Schools</Label>
						<Input
							id="schools"
							type="number"
							min="1"
							max="50"
							bind:value={config.schools}
							class="h-9 text-sm"
						/>
					</div>

					<div class="space-y-2">
						<Label for="practiceSites" class="text-sm font-medium">Practice Sites</Label>
						<Input
							id="practiceSites"
							type="number"
							min="1"
							max="100"
							bind:value={config.practiceSites}
							class="h-9 text-sm"
						/>
					</div>

					<div class="space-y-2">
						<Label for="reviewsMin" class="text-sm font-medium">Reviews per Preceptor (Min)</Label>
						<Input
							id="reviewsMin"
							type="number"
							min="1"
							max="20"
							bind:value={config.reviewsPerPreceptor.min}
							class="h-9 text-sm"
						/>
					</div>

					<div class="space-y-2">
						<Label for="reviewsMax" class="text-sm font-medium">Reviews per Preceptor (Max)</Label>
						<Input
							id="reviewsMax"
							type="number"
							min="1"
							max="20"
							bind:value={config.reviewsPerPreceptor.max}
							class="h-9 text-sm"
						/>
					</div>

					<div class="space-y-2">
						<Label for="positiveRatings" class="text-sm font-medium">Positive Ratings %</Label>
						<Input
							id="positiveRatings"
							type="number"
							min="0"
							max="100"
							step="0.1"
							value={config.ratingDistributions.positive * 100}
							onchange={(e) =>
								(config.ratingDistributions.positive =
									Number((e.target as HTMLInputElement).value) / 100)}
							class="h-9 text-sm"
						/>
					</div>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox id="clear-data" bind:checked={clearData} />
					<Label for="clear-data">Clear existing data before seeding</Label>
				</div>

				{#if seedError}
					<div class="border-destructive bg-destructive/10 rounded-lg border p-3">
						<div class="text-destructive flex items-center gap-2 text-sm">
							<AlertTriangle class="h-4 w-4" />
							{seedError}
						</div>
					</div>
				{/if}

				{#if seedResult}
					<div class="rounded-lg border border-green-200 bg-green-50 p-3">
						<div class="flex items-center gap-2 text-sm text-green-800">
							<CheckCircle class="h-4 w-4" />
							{seedResult.message || 'Database seeded successfully!'}
						</div>
						{#if seedResult.counts}
							<div class="mt-2 text-xs text-green-700">
								<strong>Created:</strong><br />
								• {seedResult.counts.programTypes} program types<br />
								• {seedResult.counts.schools} schools<br />
								• {seedResult.counts.practiceSites} practice sites<br />
								• {seedResult.counts.experienceTypes} experience types<br />
								• {seedResult.counts.rotationTypes} rotation types<br />
								• {seedResult.counts.preceptors} preceptors
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<Dialog.Footer class="flex justify-between">
				<Button
					variant="destructive"
					onclick={handleClearTables}
					disabled={isClearing || isSeeding}
				>
					{#if isClearing}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Clearing...
					{:else}
						<Trash2 class="mr-2 h-4 w-4" />
						Clear Tables
					{/if}
				</Button>

				<div class="flex gap-2">
					<Button variant="outline" onclick={handleClose} disabled={isSeeding || isClearing}>
						Cancel
					</Button>
					<Button
						onclick={handleSeed}
						disabled={isSeeding || isClearing}
						class="bg-orange-600 hover:bg-orange-700"
					>
						{#if isSeeding}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Seeding...
						{:else}
							<Database class="mr-2 h-4 w-4" />
							Seed Database
						{/if}
					</Button>
				</div>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
