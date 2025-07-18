<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import UniversalComboBox from '$lib/components/UniversalComboBox.svelte';
	import { toast } from 'svelte-sonner';

	type Props = {
		isOpen: boolean;
		preceptorId: string;
		schoolId: string;
		schoolName: string;
		onClose: () => void;
		onSuccess: () => void;
	};

	let { isOpen, preceptorId, schoolId, schoolName, onClose, onSuccess }: Props = $props();

	const client = useConvexClient();

	// Query for available sites for this school
	const availableSitesQuery = useQuery(api.preceptorAffiliations.getAvailableSitesForSchool, {
		schoolId: schoolId as any,
		preceptorId: preceptorId as any
	});

	let availableSites = $derived((availableSitesQuery.data ?? []).map(site => ({
		id: site._id,
		name: site.name
	})));
	let sitesLoading = $derived(availableSitesQuery.isLoading);

	// Form state
	let selectedSiteId = $state('');
	let isSubmitting = $state(false);

	// Reset form when modal opens/closes
	$effect(() => {
		if (!isOpen) {
			selectedSiteId = '';
			isSubmitting = false;
		}
	});

	async function handleSubmit() {
		if (!selectedSiteId) {
			toast.error('Please select a practice site');
			return;
		}

		isSubmitting = true;

		try {
			await client.mutation(api.preceptorAffiliations.createPreceptorSiteAffiliation, {
				preceptorId: preceptorId as any,
				schoolId: schoolId as any,
				siteId: selectedSiteId as any,
				isActive: true
			});

			onSuccess();
			onClose();
		} catch (error) {
			toast.error('Failed to add practice site affiliation', {
				description: error instanceof Error ? error.message : 'An unexpected error occurred'
			});
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		onClose();
	}
</script>

<Dialog.Root open={isOpen} onOpenChange={onClose}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header class="text-left">
			<Dialog.Title>Add Practice Site</Dialog.Title>
			<Dialog.Description>
				Add a practice site affiliation for {schoolName}
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="site">Practice Site</Label>
				{#if sitesLoading}
					<div class="h-10 animate-pulse rounded-md bg-muted"></div>
				{:else if availableSites.length === 0}
					<div class="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800/20 dark:bg-yellow-900/10">
						<p class="text-sm text-yellow-800 dark:text-yellow-200">
							No available practice sites found for this school, or all sites are already affiliated.
						</p>
					</div>
				{:else}
					<UniversalComboBox
						items={availableSites}
						value={selectedSiteId}
						onValueChange={(value) => (selectedSiteId = value)}
						placeholder="Select a practice site..."
						searchPlaceholder="Search practice sites..."
					/>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={handleCancel} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button 
				onclick={handleSubmit} 
				disabled={isSubmitting || !selectedSiteId || availableSites.length === 0}
			>
				{isSubmitting ? 'Adding...' : 'Add Site'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>