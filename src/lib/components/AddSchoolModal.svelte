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
		name: ''
	});

	let isSubmitting = $state(false);
	let submitError = $state('');

	async function handleSubmit() {
		if (isSubmitting) return;

		if (!formData.name.trim()) {
			submitError = 'School name is required';
			return;
		}

		try {
			isSubmitting = true;
			submitError = '';

			await client.mutation(api.schools.insertSchool, {
				name: formData.name.trim()
			});

			formData = { name: '' };
			onSuccess?.();
			onClose();
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to add school';
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		formData = { name: '' };
		submitError = '';
		onClose();
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<Dialog.Content class="w-full max-w-[95vw] p-4 sm:max-w-md sm:p-6">
		<Dialog.Header>
			<Dialog.Title class="text-lg font-semibold sm:text-xl">Add New School</Dialog.Title>
			<Dialog.Description class="text-muted-foreground text-sm">
				Add a new pharmacy school to the system.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="name" class="text-sm font-medium">School Name *</Label>
				<Input
					id="name"
					placeholder="Enter school name"
					bind:value={formData.name}
					disabled={isSubmitting}
					class="h-9 text-sm"
				/>
			</div>

			{#if submitError}
				<div class="rounded-md border border-red-200 bg-red-50 p-3">
					<p class="text-sm text-red-800">{submitError}</p>
				</div>
			{/if}
		</div>

		<Dialog.Footer class="flex justify-end gap-3 border-t pt-4">
			<Button variant="outline" onclick={handleClose} disabled={isSubmitting}>Cancel</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? 'Adding...' : 'Add School'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
