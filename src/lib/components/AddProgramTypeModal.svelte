<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	type Props = {
		isOpen: boolean;
		onClose: () => void;
		onSuccess?: () => void;
	};

	let { isOpen, onClose, onSuccess }: Props = $props();

	const client = useConvexClient();

	let formData = $state({
		name: '',
		abbreviation: '',
		yearLabels: ''
	});

	let isSubmitting = $state(false);
	let submitError = $state('');

	async function handleSubmit() {
		if (isSubmitting) return;

		if (!formData.name.trim() || !formData.abbreviation.trim() || !formData.yearLabels.trim()) {
			submitError = 'Please fill in all required fields';
			return;
		}

		try {
			isSubmitting = true;
			submitError = '';

			const yearLabelsArray = formData.yearLabels.split(',').map(label => label.trim()).filter(label => label.length > 0);

			await client.mutation(api.programTypes.insertProgramType, {
				name: formData.name.trim(),
				abbreviation: formData.abbreviation.trim(),
				yearLabels: yearLabelsArray
			});
			
			formData = {
				name: '',
				abbreviation: '',
				yearLabels: ''
			};
			
			onSuccess?.();
			onClose();
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to add program type';
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		formData = {
			name: '',
			abbreviation: '',
			yearLabels: ''
		};
		submitError = '';
		onClose();
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<Dialog.Content class="w-full max-w-[95vw] sm:max-w-md p-4 sm:p-6">
		<Dialog.Header>
			<Dialog.Title class="text-lg sm:text-xl font-semibold">Add New Program Type</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Add a new program type to the system.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="name" class="text-sm font-medium">
					Program Name *
				</Label>
				<Input
					id="name"
					placeholder="e.g., Pharmacy, Medicine, Optometry"
					bind:value={formData.name}
					disabled={isSubmitting}
					class="h-9 text-sm"
				/>
			</div>

			<div class="space-y-2">
				<Label for="abbreviation" class="text-sm font-medium">
					Abbreviation *
				</Label>
				<Input
					id="abbreviation"
					placeholder="e.g., PharmD, MD, OD"
					bind:value={formData.abbreviation}
					disabled={isSubmitting}
					class="h-9 text-sm"
				/>
			</div>

			<div class="space-y-2">
				<Label for="yearLabels" class="text-sm font-medium">
					Year Labels *
				</Label>
				<Input
					id="yearLabels"
					placeholder="e.g., P1,P2,P3,P4 or M1,M2,M3,M4"
					bind:value={formData.yearLabels}
					disabled={isSubmitting}
					class="h-9 text-sm"
				/>
				<p class="text-xs text-muted-foreground">Separate multiple years with commas</p>
			</div>

			{#if submitError}
				<div class="rounded-md border border-red-200 bg-red-50 p-3">
					<p class="text-sm text-red-800">{submitError}</p>
				</div>
			{/if}
		</div>

		<Dialog.Footer class="flex justify-end gap-3 pt-4 border-t">
			<Button variant="outline" onclick={handleClose} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? 'Adding...' : 'Add Program Type'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root> 