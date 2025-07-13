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
		city: '',
		state: ''
	});

	let isSubmitting = $state(false);
	let submitError = $state('');

	async function handleSubmit() {
		if (isSubmitting) return;

		if (!formData.name.trim() || !formData.city.trim() || !formData.state.trim()) {
			submitError = 'Please fill in all required fields';
			return;
		}

		try {
			isSubmitting = true;
			submitError = '';

			await client.mutation(api.practiceSites.insertPracticeSite, {
				name: formData.name.trim(),
				city: formData.city.trim(),
				state: formData.state.trim()
			});

			formData = {
				name: '',
				city: '',
				state: ''
			};

			onSuccess?.();
			onClose();
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to add practice site';
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		formData = {
			name: '',
			city: '',
			state: ''
		};
		submitError = '';
		onClose();
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<Dialog.Content class="w-full max-w-[95vw] p-4 sm:max-w-md sm:p-6">
		<Dialog.Header>
			<Dialog.Title class="text-lg font-semibold sm:text-xl">Add New Practice Site</Dialog.Title>
			<Dialog.Description class="text-muted-foreground text-sm">
				Add a new practice site to the system.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="name" class="text-sm font-medium">Site Name *</Label>
				<Input
					id="name"
					placeholder="Enter site name"
					bind:value={formData.name}
					disabled={isSubmitting}
					class="h-9 text-sm"
				/>
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="city" class="text-sm font-medium">City *</Label>
					<Input
						id="city"
						placeholder="City"
						bind:value={formData.city}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<Label for="state" class="text-sm font-medium">State *</Label>
					<Input
						id="state"
						placeholder="State"
						bind:value={formData.state}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>
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
				{isSubmitting ? 'Adding...' : 'Add Practice Site'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
