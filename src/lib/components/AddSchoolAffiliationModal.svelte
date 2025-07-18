<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import UniversalComboBox from '$lib/components/UniversalComboBox.svelte';

	type Props = {
		isOpen: boolean;
		preceptorId: string;
		onClose: () => void;
		onSuccess?: () => void;
	};

	let { isOpen, preceptorId, onClose, onSuccess }: Props = $props();

	const client = useConvexClient();

	// Query for all schools
	const schoolsQuery = useQuery(api.schools.get, {});
	let allSchools = $derived(schoolsQuery.data ?? []);

	// Query for current preceptor school affiliations to filter out active ones
	const preceptorSchoolAffiliationsQuery = useQuery(api.preceptorAffiliations.getPreceptorSchoolAffiliations, {
		preceptorId: preceptorId as any,
		onlyActive: false // Get all affiliations to filter properly
	});
	let preceptorSchoolAffiliations = $derived(preceptorSchoolAffiliationsQuery.data ?? []);

	// Available schools (not already actively affiliated)
	let availableSchools = $derived(() => {
		if (!allSchools || !preceptorSchoolAffiliations) return [];
		
		const activeAffiliatedSchoolIds = new Set(
			preceptorSchoolAffiliations
				.filter(affiliation => affiliation.isActive && affiliation.school)
				.map(affiliation => affiliation.school!._id)
		);
		
		return allSchools.filter(school => !activeAffiliatedSchoolIds.has(school._id));
	});
	
	// Schools with inactive affiliations that can be reactivated
	let inactiveAffiliatedSchools = $derived(() => {
		if (!preceptorSchoolAffiliations) return [];
		
		return preceptorSchoolAffiliations
			.filter(affiliation => !affiliation.isActive && affiliation.school)
			.map(affiliation => ({
				...affiliation.school!,
				affiliationId: affiliation.affiliationId,
				isInactive: true
			}));
	});

	// Combine available and inactive schools for the combo box
	let comboBoxItems = $derived(() => {
		const available = availableSchools().map(school => ({
			id: school._id,
			name: school.name
		}));
		
		const inactive = inactiveAffiliatedSchools().map(school => ({
			id: school._id,
			name: `${school.name} (Inactive)`
		}));
		
		return [...available, ...inactive];
	});

	let selectedSchoolId = $state('');
	let isSubmitting = $state(false);
	let submitError = $state('');

	async function handleSubmit() {
		if (isSubmitting) return;

		if (!selectedSchoolId) {
			submitError = 'Please select a school';
			return;
		}

		try {
			isSubmitting = true;
			submitError = '';

			// Check if there's an existing inactive affiliation for this school
			const existingAffiliation = preceptorSchoolAffiliations.find(
				affiliation => affiliation.school && affiliation.school._id === selectedSchoolId && !affiliation.isActive
			);

			if (existingAffiliation) {
				// Reactivate existing affiliation
				await client.mutation(api.preceptorAffiliations.updatePreceptorSchoolAffiliation, {
					affiliationId: existingAffiliation.affiliationId,
					isActive: true
				});
			} else {
				// Create new affiliation
				await client.mutation(api.preceptorAffiliations.createPreceptorSchoolAffiliation, {
					preceptorId: preceptorId as any,
					schoolId: selectedSchoolId as any,
					isActive: true
				});
			}

			selectedSchoolId = '';
			onSuccess?.();
			onClose();
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to add school affiliation';
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		selectedSchoolId = '';
		submitError = '';
		onClose();
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<Dialog.Content class="w-full max-w-[95vw] p-4 sm:max-w-md sm:p-6">
		<Dialog.Header class="text-left">
			<Dialog.Title class="text-lg font-semibold sm:text-xl">Add School Affiliation</Dialog.Title>
			<Dialog.Description class="text-muted-foreground text-sm">
				Add a new school affiliation or reactivate an inactive one for this preceptor.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="school" class="text-sm font-medium">School *</Label>
				{#if comboBoxItems().length > 0}
					<UniversalComboBox
						items={comboBoxItems()}
						value={selectedSchoolId}
						onValueChange={(value) => selectedSchoolId = value}
						placeholder="Select a school"
						searchPlaceholder="Search schools..."
					/>
				{:else}
					<div class="rounded-md border border-muted bg-muted/50 p-3">
						<p class="text-sm text-muted-foreground">All available schools are already affiliated with this preceptor.</p>
						<p class="text-xs text-muted-foreground mt-2">
							Debug info: {allSchools.length} total schools, {preceptorSchoolAffiliations.length} affiliations
						</p>
					</div>
				{/if}
			</div>

			{#if submitError}
				<div class="rounded-md border border-destructive/20 bg-destructive/10 p-3">
					<p class="text-sm text-destructive-foreground">{submitError}</p>
				</div>
			{/if}
		</div>

		<Dialog.Footer class="flex justify-end gap-3 border-t pt-4">
			<Button variant="outline" onclick={handleClose} disabled={isSubmitting}>Cancel</Button>
			<Button 
				onclick={handleSubmit} 
				disabled={isSubmitting || comboBoxItems().length === 0}
			>
				{isSubmitting ? 'Adding...' : 'Add Affiliation'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>