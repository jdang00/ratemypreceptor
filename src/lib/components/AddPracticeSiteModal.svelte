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
	const schoolsQuery = useQuery(api.schools.get, {});

	let formData = $state({
		name: '',
		city: '',
		state: '',
		schoolId: ''
	});

	let isSubmitting = $state(false);
	let submitError = $state('');

	const schools = $derived(schoolsQuery.data ?? []);

	const schoolTriggerContent = $derived(
		schools.find((s) => s._id === formData.schoolId)?.name ?? 'Select school'
	);

	async function handleSubmit() {
		if (isSubmitting) return;

		if (!formData.name.trim() || !formData.city.trim() || !formData.state.trim() || !formData.schoolId) {
			submitError = 'Please fill in all required fields';
			return;
		}

		try {
			isSubmitting = true;
			submitError = '';

			await client.mutation(api.practiceSites.insertPracticeSite, {
				name: formData.name.trim(),
				city: formData.city.trim(),
				state: formData.state.trim(),
				schoolId: formData.schoolId as any
			});
			
			formData = {
				name: '',
				city: '',
				state: '',
				schoolId: ''
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
			state: '',
			schoolId: ''
		};
		submitError = '';
		onClose();
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<Dialog.Content class="w-full max-w-[95vw] sm:max-w-md p-4 sm:p-6">
		<Dialog.Header>
			<Dialog.Title class="text-lg sm:text-xl font-semibold">Add New Practice Site</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Add a new practice site to the system.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="name" class="text-sm font-medium">
					Site Name *
				</Label>
				<Input
					id="name"
					placeholder="Enter site name"
					bind:value={formData.name}
					disabled={isSubmitting}
					class="h-9 text-sm"
				/>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div class="space-y-2">
					<Label for="city" class="text-sm font-medium">
						City *
					</Label>
					<Input
						id="city"
						placeholder="City"
						bind:value={formData.city}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<Label for="state" class="text-sm font-medium">
						State *
					</Label>
					<Input
						id="state"
						placeholder="State"
						bind:value={formData.state}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>
			</div>

			<div class="space-y-2">
				<Label class="text-sm font-medium">School *</Label>
				<Select.Root type="single" bind:value={formData.schoolId}>
					<Select.Trigger class="w-full h-9 text-sm">
						{schoolTriggerContent}
					</Select.Trigger>
					<Select.Content>
						{#each schools as school (school._id)}
							<Select.Item value={school._id} label={school.name}>
								{school.name}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
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
				{isSubmitting ? 'Adding...' : 'Add Practice Site'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root> 