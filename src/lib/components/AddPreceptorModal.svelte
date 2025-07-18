<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { TITLES, DEGREES, formatFullName } from '$lib/utils.js';
	import UniversalComboBox from './UniversalComboBox.svelte';
	import { goto } from '$app/navigation';

	type Props = {
		isOpen: boolean;
		onClose: () => void;
		onSuccess?: () => void;
		redirectToDetail?: boolean;
	};

	let { isOpen, onClose, onSuccess, redirectToDetail = false }: Props = $props();

	const client = useConvexClient();
	const schoolsQuery = useQuery(api.schools.get, {});
	const practiceSitesQuery = useQuery(api.practiceSites.get, {});
	const programTypesQuery = useQuery(api.programTypes.get, {});

	let formData = $state({
		title: '',
		firstName: '',
		lastName: '',
		degree: '',
		schoolId: '',
		programTypeId: '',
		siteId: ''
	});

	let isSubmitting = $state(false);
	let submitError = $state('');

	const schools = $derived(schoolsQuery.data ?? []);
	const practiceSites = $derived(practiceSitesQuery.data ?? []);
	const programTypes = $derived(programTypesQuery.data ?? []);

	const schoolItems = $derived(
		schools.map((school) => ({
			id: school._id,
			name: school.name
		}))
	);

	const programTypeItems = $derived(
		programTypes.map((programType) => ({
			id: programType._id,
			name: programType.name
		}))
	);

	const practiceSiteItems = $derived(
		practiceSites.map((site) => ({
			id: site._id,
			name: `${site.name} - ${site.city}, ${site.state}`
		}))
	);

	async function handleSubmit() {
		if (isSubmitting) return;

		if (
			!formData.firstName.trim() ||
			!formData.lastName.trim() ||
			!formData.schoolId ||
			!formData.programTypeId ||
			!formData.siteId
		) {
			submitError = 'Please fill in all required fields';
			return;
		}

		try {
			isSubmitting = true;
			submitError = '';

			const fullName = formatFullName(
				formData.title,
				formData.firstName.trim(),
				formData.lastName.trim(),
				formData.degree
			);

			const preceptorData = {
				fullName: fullName,
				schoolId: formData.schoolId as any,
				programTypeId: formData.programTypeId as any,
				siteId: formData.siteId as any
			};

			const preceptorId = await client.mutation(api.preceptors.insertPreceptor, preceptorData);

			formData = {
				title: '',
				firstName: '',
				lastName: '',
				degree: '',
				schoolId: '',
				programTypeId: '',
				siteId: ''
			};

			onSuccess?.();
			onClose();

			// Redirect to detail page if requested
			if (redirectToDetail && preceptorId) {
				goto(`/admin/preceptors/${preceptorId}`);
			}
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to add preceptor';
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		formData = {
			title: '',
			firstName: '',
			lastName: '',
			degree: '',
			schoolId: '',
			programTypeId: '',
			siteId: ''
		};
		submitError = '';
		onClose();
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<Dialog.Content
		class="max-h-[90vh] w-full max-w-[95vw] overflow-hidden p-4 sm:max-h-[85vh] sm:max-w-md sm:p-6"
	>
		<Dialog.Header class="text-left">
			<Dialog.Title class="text-lg font-semibold sm:text-xl">Add New Preceptor</Dialog.Title>
			<Dialog.Description class="text-muted-foreground text-sm">
				Add a new preceptor to the system. First and last name are required.
			</Dialog.Description>
		</Dialog.Header>

		<div class="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div class="space-y-2">
					<Label class="text-sm font-medium">Title</Label>
					<Select.Root type="single" bind:value={formData.title}>
						<Select.Trigger class="h-9 w-full text-sm">
							{formData.title || 'Select title'}
						</Select.Trigger>
						<Select.Content>
							{#each TITLES as title (title.value)}
								<Select.Item value={title.value} label={title.label}>
									{title.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Degree</Label>
					<Select.Root type="single" bind:value={formData.degree}>
						<Select.Trigger class="h-9 w-full text-sm">
							{formData.degree || 'Select degree'}
						</Select.Trigger>
						<Select.Content>
							{#each DEGREES as degree (degree.value)}
								<Select.Item value={degree.value} label={degree.label}>
									{degree.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="firstName" class="text-sm font-medium">First Name *</Label>
					<Input
						id="firstName"
						placeholder="First name"
						bind:value={formData.firstName}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<Label for="lastName" class="text-sm font-medium">Last Name *</Label>
					<Input
						id="lastName"
						placeholder="Last name"
						bind:value={formData.lastName}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>
			</div>

			{#if formData.title || formData.firstName || formData.lastName || formData.degree}
				<div class="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800/20 dark:bg-blue-900/10">
					<p class="text-sm text-blue-800 dark:text-blue-200">
						<strong>Preview:</strong>
						{formatFullName(formData.title, formData.firstName, formData.lastName, formData.degree)}
					</p>
				</div>
			{/if}

			<div class="space-y-2">
				<Label class="text-sm font-medium">School *</Label>
				<UniversalComboBox
					items={schoolItems}
					value={formData.schoolId}
					onValueChange={(value) => (formData.schoolId = value)}
					placeholder="Select school"
					searchPlaceholder="Search schools..."
					disabled={isSubmitting}
				/>
			</div>

			<div class="space-y-2">
				<Label class="text-sm font-medium">Program Type *</Label>
				<UniversalComboBox
					items={programTypeItems}
					value={formData.programTypeId}
					onValueChange={(value) => (formData.programTypeId = value)}
					placeholder="Select program type"
					searchPlaceholder="Search program types..."
					disabled={isSubmitting}
				/>
			</div>

			<div class="space-y-2">
				<Label class="text-sm font-medium">Practice Site *</Label>
				<UniversalComboBox
					items={practiceSiteItems}
					value={formData.siteId}
					onValueChange={(value) => (formData.siteId = value)}
					placeholder="Select practice site"
					searchPlaceholder="Search practice sites..."
					disabled={isSubmitting || !formData.schoolId}
				/>
			</div>

			{#if submitError}
				<div class="rounded-md border border-destructive/20 bg-destructive/10 p-3">
					<p class="text-sm text-destructive-foreground">{submitError}</p>
				</div>
			{/if}
		</div>

		<Dialog.Footer class="flex justify-end gap-3 border-t pt-4">
			<Button variant="outline" onclick={handleClose} disabled={isSubmitting}>Cancel</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? 'Adding...' : 'Add Preceptor'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
