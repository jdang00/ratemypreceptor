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
			submitError = 'Rotation type name is required';
			return;
		}

		try {
			isSubmitting = true;
			submitError = '';

			await client.mutation(api.rotationTypes.insertRotationType, {
				name: formData.name.trim()
			});
			
			formData = { name: '' };
			onSuccess?.();
			onClose();
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to add rotation type';
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
	<Dialog.Content class="w-full max-w-[95vw] sm:max-w-md p-4 sm:p-6">
		<Dialog.Header>
			<Dialog.Title class="text-lg sm:text-xl font-semibold">Add New Rotation Type</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Add a new rotation type to the system.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="name" class="text-sm font-medium">
					Rotation Type Name *
				</Label>
				<Input
					id="name"
					placeholder="Enter rotation type name"
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

		<Dialog.Footer class="flex justify-end gap-3 pt-4 border-t">
			<Button variant="outline" onclick={handleClose} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? 'Adding...' : 'Add Rotation Type'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root> 