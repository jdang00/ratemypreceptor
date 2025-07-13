<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	type Props = {
		isOpen: boolean;
		onClose: () => void;
		onSuccess?: () => void;
	};

	let { isOpen, onClose, onSuccess }: Props = $props();

	const client = useConvexClient();
	const programTypesQuery = useQuery(api.programTypes.get, {});

	let formData = $state({
		name: '',
		programTypeId: '',
		description: ''
	});

	let isSubmitting = $state(false);
	let submitError = $state('');

	const programTypes = $derived(programTypesQuery.data ?? []);

	const programTypeTriggerContent = $derived(
		programTypes.find((p) => p._id === formData.programTypeId)?.name ?? 'Select program type'
	);

	async function handleSubmit() {
		if (isSubmitting) return;

		if (!formData.name.trim() || !formData.programTypeId || !formData.description.trim()) {
			submitError = 'Please fill in all required fields';
			return;
		}

		try {
			isSubmitting = true;
			submitError = '';

			await client.mutation(api.experienceTypes.insertExperienceType, {
				name: formData.name.trim(),
				programTypeId: formData.programTypeId as any,
				description: formData.description.trim()
			});

			formData = {
				name: '',
				programTypeId: '',
				description: ''
			};

			onSuccess?.();
			onClose();
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to add experience type';
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		formData = {
			name: '',
			programTypeId: '',
			description: ''
		};
		submitError = '';
		onClose();
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<Dialog.Content class="w-full max-w-[95vw] p-4 sm:max-w-md sm:p-6">
		<Dialog.Header>
			<Dialog.Title class="text-lg font-semibold sm:text-xl">Add New Experience Type</Dialog.Title>
			<Dialog.Description class="text-muted-foreground text-sm">
				Add a new experience type to the system.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label class="text-sm font-medium">Program Type *</Label>
				<Select.Root type="single" bind:value={formData.programTypeId}>
					<Select.Trigger class="h-9 w-full text-sm">
						{programTypeTriggerContent}
					</Select.Trigger>
					<Select.Content>
						{#each programTypes as programType (programType._id)}
							<Select.Item value={programType._id} label={programType.name}>
								{programType.name}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<Label for="name" class="text-sm font-medium">Experience Type Name *</Label>
				<Input
					id="name"
					placeholder="e.g., IPPE, APPE, Clinical Rotation"
					bind:value={formData.name}
					disabled={isSubmitting}
					class="h-9 text-sm"
				/>
			</div>

			<div class="space-y-2">
				<Label for="description" class="text-sm font-medium">Description *</Label>
				<Input
					id="description"
					placeholder="A brief description of this experience type"
					bind:value={formData.description}
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
				{isSubmitting ? 'Adding...' : 'Add Experience Type'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
