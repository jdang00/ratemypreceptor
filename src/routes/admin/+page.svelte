<script lang="ts">
	import { onMount } from 'svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import ReviewsDataTable from './reviews-data-table.svelte';
	import SimpleDataTable from './simple-data-table.svelte';
	import EditModal from '$lib/components/EditModal.svelte';
	import DeleteConfirmationModal from '$lib/components/DeleteConfirmationModal.svelte';
	import AddPreceptorModal from '$lib/components/AddPreceptorModal.svelte';
	import AddSchoolModal from '$lib/components/AddSchoolModal.svelte';
	import AddPracticeSiteModal from '$lib/components/AddPracticeSiteModal.svelte';
	import AddRotationTypeModal from '$lib/components/AddRotationTypeModal.svelte';
	import AddReviewModal from '$lib/components/AddReviewModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Plus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	import { reviewsColumns } from './reviews-columns.js';
	import { schoolsColumns, type School } from './schools-columns.js';
	import { preceptorsColumns, type Preceptor } from './preceptors-columns.js';
	import { practiceSitesColumns, type PracticeSite } from './practice-sites-columns.js';
	import { rotationTypesColumns, type RotationType } from './rotation-types-columns.js';

	let tabs = $state([
		{ id: 'reviews', label: 'Reviews', count: 0 },
		{ id: 'preceptors', label: 'Preceptors', count: 0 },
		{ id: 'schools', label: 'Schools', count: 0 },
		{ id: 'sites', label: 'Practice Sites', count: 0 },
		{ id: 'rotations', label: 'Rotation Types', count: 0 }
	]);

	const reviewsQuery = useQuery(api.reviews.get, {});
	const preceptorsQuery = useQuery(api.preceptors.get, {});
	const schoolsQuery = useQuery(api.schools.get, {});
	const sitesQuery = useQuery(api.practiceSites.get, {});
	const rotationsQuery = useQuery(api.rotationTypes.get, {});

	let reviewsData = $derived(reviewsQuery.data ?? []);
	let preceptorsData = $derived((preceptorsQuery.data ?? []) as Preceptor[]);
	let schoolsData = $derived((schoolsQuery.data ?? []) as School[]);
	let sitesData = $derived((sitesQuery.data ?? []) as PracticeSite[]);
	let rotationsData = $derived((rotationsQuery.data ?? []) as RotationType[]);

	let reviewsLoading = $derived(reviewsQuery.isLoading);
	let preceptorsLoading = $derived(preceptorsQuery.isLoading);
	let schoolsLoading = $derived(schoolsQuery.isLoading);
	let sitesLoading = $derived(sitesQuery.isLoading);
	let rotationsLoading = $derived(rotationsQuery.isLoading);

	let reviewsError = $derived(reviewsQuery.error);
	let preceptorsError = $derived(preceptorsQuery.error);
	let schoolsError = $derived(schoolsQuery.error);
	let sitesError = $derived(sitesQuery.error);
	let rotationsError = $derived(rotationsQuery.error);

	let editModalOpen = $state(false);
	let editModalEntity = $state<any>(null);
	let editModalMutationName = $state('');
	let editModalFields = $state<any[]>([]);

	let deleteModalOpen = $state(false);
	let deleteModalEntityId = $state('');
	let deleteModalEntityName = $state('');
	let deleteModalEntityType = $state('');
	let deleteModalMutationName = $state('');

	let addPreceptorModalOpen = $state(false);
	let addSchoolModalOpen = $state(false);
	let addPracticeSiteModalOpen = $state(false);
	let addRotationTypeModalOpen = $state(false);
	let addReviewModalOpen = $state(false);

	$effect(() => {
		tabs[0].count = reviewsData.length;
		tabs[1].count = preceptorsData.length;
		tabs[2].count = schoolsData.length;
		tabs[3].count = sitesData.length;
		tabs[4].count = rotationsData.length;
	});

	const schoolFields = $derived([
		{ key: 'name', label: 'School Name', type: 'text' as const, required: true }
	]);

	const preceptorFields = $derived([
		{ key: 'fullName', label: 'Full Name', type: 'text' as const, required: true },
		{
			key: 'schoolId',
			label: 'School',
			type: 'select' as const,
			options: schoolsData.map((s) => ({ label: s.name, value: s._id })),
			required: true
		},
		{
			key: 'siteId',
			label: 'Practice Site',
			type: 'select' as const,
			options: sitesData.map((s) => ({ label: s.name, value: s._id })),
			required: true
		}
	]);

	const practiceSiteFields = $derived([
		{ key: 'name', label: 'Site Name', type: 'text' as const, required: true },
		{ key: 'city', label: 'City', type: 'text' as const, required: true },
		{ key: 'state', label: 'State', type: 'text' as const, required: true },
		{
			key: 'schoolId',
			label: 'School',
			type: 'select' as const,
			options: schoolsData.map((s) => ({ label: s.name, value: s._id })),
			required: true
		}
	]);

	const rotationTypeFields = $derived([
		{ key: 'name', label: 'Rotation Type', type: 'text' as const, required: true }
	]);

	const reviewFields = $derived([
		{
			key: 'preceptorId',
			label: 'Preceptor',
			type: 'select' as const,
			options: preceptorsData.map((p) => ({ label: p.fullName, value: p._id })),
			required: true
		},
		{
			key: 'rotationTypeId',
			label: 'Rotation Type',
			type: 'select' as const,
			options: rotationsData.map((r) => ({ label: r.name, value: r._id })),
			required: true
		},
		{
			key: 'ippeAppe',
			label: 'Type',
			type: 'select' as const,
			options: [
				{ label: 'IPPE', value: 'IPPE' },
				{ label: 'APPE', value: 'APPE' }
			],
			required: true
		},
		{
			key: 'schoolYear',
			label: 'School Year',
			type: 'select' as const,
			options: [
				{ label: 'P1', value: 'P1' },
				{ label: 'P2', value: 'P2' },
				{ label: 'P3', value: 'P3' },
				{ label: 'P4', value: 'P4' }
			],
			required: true
		},
		{
			key: 'priorExperience',
			label: 'Prior Experience',
			type: 'select' as const,
			options: [
				{ label: 'None', value: 'None' },
				{ label: 'Little', value: 'Little' },
				{ label: 'Moderate', value: 'Moderate' },
				{ label: 'Significant', value: 'Significant' }
			],
			required: true
		},
		{
			key: 'schedulingFlexibility',
			label: 'Scheduling Flexibility',
			type: 'number' as const,
			required: true
		},
		{ key: 'workload', label: 'Workload', type: 'number' as const, required: true },
		{ key: 'expectations', label: 'Expectations', type: 'number' as const, required: true },
		{ key: 'mentorship', label: 'Mentorship', type: 'number' as const, required: true },
		{ key: 'enjoyment', label: 'Enjoyment', type: 'number' as const, required: true },
		{ key: 'wouldRecommend', label: 'Would Recommend', type: 'boolean' as const, required: true },
		{ key: 'starRating', label: 'Star Rating', type: 'number' as const, required: true },
		{ key: 'comment', label: 'Comment', type: 'text' as const }
	]);

	function openEditModal(entity: any, mutationName: string, fields: any[]) {
		editModalEntity = entity;
		editModalMutationName = mutationName;
		editModalFields = fields;
		editModalOpen = true;
	}

	function openDeleteModal(
		entityId: string,
		entityName: string,
		entityType: string,
		mutationName: string
	) {
		deleteModalEntityId = entityId;
		deleteModalEntityName = entityName;
		deleteModalEntityType = entityType;
		deleteModalMutationName = mutationName;
		deleteModalOpen = true;
	}

	function closeEditModal() {
		editModalOpen = false;
		editModalEntity = null;
		editModalMutationName = '';
		editModalFields = [];
	}

	function closeDeleteModal() {
		deleteModalOpen = false;
		deleteModalEntityId = '';
		deleteModalEntityName = '';
		deleteModalEntityType = '';
		deleteModalMutationName = '';
	}

	function openAddPreceptorModal() {
		addPreceptorModalOpen = true;
	}

	function closeAddPreceptorModal() {
		addPreceptorModalOpen = false;
	}

	function handleAddPreceptorSuccess() {
		toast.success('Preceptor added successfully!', {
			description: 'The preceptor has been added to the database.'
		});
		// Data will refresh automatically due to Convex reactivity
		// No manual refresh needed
	}

	function openAddSchoolModal() {
		addSchoolModalOpen = true;
	}

	function closeAddSchoolModal() {
		addSchoolModalOpen = false;
	}

	function openAddPracticeSiteModal() {
		addPracticeSiteModalOpen = true;
	}

	function closeAddPracticeSiteModal() {
		addPracticeSiteModalOpen = false;
	}

	function openAddRotationTypeModal() {
		addRotationTypeModalOpen = true;
	}

	function closeAddRotationTypeModal() {
		addRotationTypeModalOpen = false;
	}

	function openAddReviewModal() {
		addReviewModalOpen = true;
	}

	function closeAddReviewModal() {
		addReviewModalOpen = false;
	}

	function handleAddSchoolSuccess() {
		toast.success('School added successfully!', {
			description: 'The school has been added to the database.'
		});
	}

	function handleAddPracticeSiteSuccess() {
		toast.success('Practice site added successfully!', {
			description: 'The practice site has been added to the database.'
		});
	}

	function handleAddRotationTypeSuccess() {
		toast.success('Rotation type added successfully!', {
			description: 'The rotation type has been added to the database.'
		});
	}

	function handleAddReviewSuccess() {
		toast.success('Review added successfully!', {
			description: 'The review has been added to the database.'
		});
	}

	function handleEditSuccess() {
		toast.success('Item updated successfully!', {
			description: 'The changes have been saved to the database.'
		});
	}

	function handleDeleteSuccess() {
		toast.success('Item deleted successfully!', {
			description: 'The item has been removed from the database.'
		});
	}

	onMount(() => {
		const container = document.querySelector('.admin-container');
		if (!container) return;

		container.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;

			function findDataAttribute(element: HTMLElement, prefix: string): string | null {
				let current = element;
				while (current && current !== container) {
					for (const key of Object.keys(current.dataset)) {
						if (key.startsWith(prefix)) {
							return current.dataset[key] || null;
						}
					}
					current = current.parentElement as HTMLElement;
				}
				return null;
			}

			const editSchool = findDataAttribute(target, 'editSchool');
			if (editSchool) {
				const school = JSON.parse(editSchool);
				openEditModal(school, 'schools.updateSchool', schoolFields);
				return;
			}

			const editPreceptor = findDataAttribute(target, 'editPreceptor');
			if (editPreceptor) {
				const preceptor = JSON.parse(editPreceptor);
				openEditModal(preceptor, 'preceptors.updatePreceptor', preceptorFields);
				return;
			}

			const editPracticeSite = findDataAttribute(target, 'editPracticeSite');
			if (editPracticeSite) {
				const site = JSON.parse(editPracticeSite);
				openEditModal(site, 'practiceSites.updatePracticeSite', practiceSiteFields);
				return;
			}

			const editRotationType = findDataAttribute(target, 'editRotationType');
			if (editRotationType) {
				const rotationType = JSON.parse(editRotationType);
				openEditModal(rotationType, 'rotationTypes.updateRotationType', rotationTypeFields);
				return;
			}

			const deleteSchool = findDataAttribute(target, 'deleteSchool');
			if (deleteSchool) {
				const school = schoolsData.find((s) => s._id === deleteSchool);
				openDeleteModal(
					deleteSchool,
					school?.name || 'Unknown School',
					'School',
					'schools.deleteSchool'
				);
				return;
			}

			const deletePreceptor = findDataAttribute(target, 'deletePreceptor');
			if (deletePreceptor) {
				const preceptor = preceptorsData.find((p) => p._id === deletePreceptor);
				openDeleteModal(
					deletePreceptor,
					preceptor?.fullName || 'Unknown Preceptor',
					'Preceptor',
					'preceptors.deletePreceptor'
				);
				return;
			}

			const deletePracticeSite = findDataAttribute(target, 'deletePracticeSite');
			if (deletePracticeSite) {
				const site = sitesData.find((s) => s._id === deletePracticeSite);
				openDeleteModal(
					deletePracticeSite,
					site?.name || 'Unknown Site',
					'Practice Site',
					'practiceSites.deletePracticeSite'
				);
				return;
			}

			const deleteRotationType = findDataAttribute(target, 'deleteRotationType');
			if (deleteRotationType) {
				const rotationType = rotationsData.find((r) => r._id === deleteRotationType);
				openDeleteModal(
					deleteRotationType,
					rotationType?.name || 'Unknown Rotation Type',
					'Rotation Type',
					'rotationTypes.deleteRotationType'
				);
				return;
			}
		});

		window.addEventListener('edit-review', (e) => {
			const review = (e as CustomEvent).detail;
			openEditModal(review, 'reviews.updateReview', reviewFields);
		});

		window.addEventListener('delete-review', (e) => {
			const reviewId = (e as CustomEvent).detail;
			const review = reviewsData.find((r) => r._id === reviewId);
			const reviewDesc = review
				? `Review (${review.ippeAppe} - ${review.schoolYear})`
				: 'Unknown Review';
			openDeleteModal(reviewId, reviewDesc, 'Review', 'reviews.deleteReview');
		});
	});
</script>

<div class="admin-container min-h-screen p-3 sm:p-6">
	<div>
		<div class="mx-auto max-w-7xl">
			<div class="mb-6 sm:mb-8">
				<h1 class="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
				<p class="mt-2 text-sm sm:text-base">Manage all your preceptor review data</p>
			</div>

			<div class="mb-4">
				<Tabs.Root value="Preceptors" class="w-full">
					<Tabs.List class="flex flex-wrap gap-1 sm:gap-0">
						{#each tabs as tab (tab.id)}
							<Tabs.Trigger 
								value={tab.label}
								class="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3 py-2"
							>
								<span class="hidden sm:inline">{tab.label}</span>
								<span class="sm:hidden">{tab.label.slice(0, 3)}</span>
								{#if tab.count > 0}
									<span class="ml-1 rounded-full text-xs opacity-70">
										{tab.count}
									</span>
								{/if}
							</Tabs.Trigger>
						{/each}
					</Tabs.List>

					<div class="rounded-lg shadow mt-4">
						<Tabs.Content value="Reviews">
							<div class="p-3 sm:p-6">
								<div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<div>
										<h2 class="text-lg sm:text-xl font-semibold">Reviews</h2>
										<p class="text-sm sm:text-base">All preceptor reviews and ratings</p>
									</div>

									<div class="flex flex-row gap-2">
										<Button onclick={openAddReviewModal} class="w-full sm:w-auto">
											<Plus class="h-4 w-4" /> 
											<span class="hidden sm:inline">Add Review</span>
											<span class="sm:hidden">Add</span>
										</Button>
									</div>
								</div>

								{#if reviewsError}
									<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 sm:p-4">
										<p class="text-red-800 text-sm">{reviewsError}</p>
									</div>
								{/if}

								{#if reviewsLoading}
									<div class="flex items-center justify-center py-8 sm:py-12">
										<div class="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
										<span class="ml-2 text-sm sm:text-base">Loading reviews...</span>
									</div>
								{:else}
									<ReviewsDataTable data={reviewsData} columns={reviewsColumns} />
								{/if}
							</div>
						</Tabs.Content>
						<Tabs.Content value="Preceptors">
							<div class="p-3 sm:p-6">
								<div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<div>
										<h2 class="text-lg sm:text-xl font-semibold">Preceptors</h2>
										<p class="text-sm sm:text-base">All registered preceptors</p>
									</div>

									<div class="flex flex-row gap-2">
										<Button onclick={openAddPreceptorModal} class="w-full sm:w-auto">
											<Plus class="h-4 w-4" /> 
											<span class="hidden sm:inline">Add Preceptor</span>
											<span class="sm:hidden">Add</span>
										</Button>
									</div>
								</div>

								{#if preceptorsError}
									<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 sm:p-4">
										<p class="text-red-800 text-sm">{preceptorsError}</p>
									</div>
								{/if}

								{#if preceptorsLoading}
									<div class="flex items-center justify-center py-8 sm:py-12">
										<div class="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
										<span class="ml-2 text-sm sm:text-base">Loading preceptors...</span>
									</div>
								{:else}
									<SimpleDataTable
										data={preceptorsData}
										columns={preceptorsColumns}
										searchPlaceholder="Search preceptors..."
										searchColumn="fullName"
									/>
								{/if}
							</div>
						</Tabs.Content>
						<Tabs.Content value="Schools">
							<div class="p-3 sm:p-6">
								<div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<div>
										<h2 class="text-lg sm:text-xl font-semibold">Schools</h2>
										<p class="text-sm sm:text-base">All pharmacy schools</p>
									</div>

									<div class="flex flex-row gap-2">
										<Button onclick={openAddSchoolModal} class="w-full sm:w-auto">
											<Plus class="h-4 w-4" /> 
											<span class="hidden sm:inline">Add School</span>
											<span class="sm:hidden">Add</span>
										</Button>
									</div>
								</div>

								{#if schoolsError}
									<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 sm:p-4">
										<p class="text-red-800 text-sm">{schoolsError}</p>
									</div>
								{/if}

								{#if schoolsLoading}
									<div class="flex items-center justify-center py-8 sm:py-12">
										<div class="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
										<span class="ml-2 text-sm sm:text-base">Loading schools...</span>
									</div>
								{:else}
									<SimpleDataTable
										data={schoolsData}
										columns={schoolsColumns}
										searchPlaceholder="Search schools..."
										searchColumn="name"
									/>
								{/if}
							</div>
						</Tabs.Content>
						<Tabs.Content value="Practice Sites">
							<div class="p-3 sm:p-6">
								<div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<div>
										<h2 class="text-lg sm:text-xl font-semibold">Practice Sites</h2>
										<p class="text-sm sm:text-base">All practice sites and locations</p>
									</div>

									<div class="flex flex-row gap-2">
										<Button onclick={openAddPracticeSiteModal} class="w-full sm:w-auto">
											<Plus class="h-4 w-4" /> 
											<span class="hidden sm:inline">Add Practice Site</span>
											<span class="sm:hidden">Add</span>
										</Button>
									</div>
								</div>

								{#if sitesError}
									<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 sm:p-4">
										<p class="text-red-800 text-sm">{sitesError}</p>
									</div>
								{/if}

								{#if sitesLoading}
									<div class="flex items-center justify-center py-8 sm:py-12">
										<div class="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
										<span class="ml-2 text-sm sm:text-base">Loading sites...</span>
									</div>
								{:else}
									<SimpleDataTable
										data={sitesData}
										columns={practiceSitesColumns}
										searchPlaceholder="Search sites..."
										searchColumn="name"
									/>
								{/if}
							</div>
						</Tabs.Content>
						<Tabs.Content value="Rotation Types">
							<div class="p-3 sm:p-6">
								<div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<div>
										<h2 class="text-lg sm:text-xl font-semibold">Rotation Types</h2>
										<p class="text-sm sm:text-base">All available rotation types</p>
									</div>

									<div class="flex flex-row gap-2">
										<Button onclick={openAddRotationTypeModal} class="w-full sm:w-auto">
											<Plus class="h-4 w-4" /> 
											<span class="hidden sm:inline">Add Rotation Type</span>
											<span class="sm:hidden">Add</span>
										</Button>
									</div>
								</div>

								{#if rotationsError}
									<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 sm:p-4">
										<p class="text-red-800 text-sm">{rotationsError}</p>
									</div>
								{/if}

								{#if rotationsLoading}
									<div class="flex items-center justify-center py-8 sm:py-12">
										<div class="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
										<span class="ml-2 text-sm sm:text-base">Loading rotation types...</span>
									</div>
								{:else}
									<SimpleDataTable
										data={rotationsData}
										columns={rotationTypesColumns}
										searchPlaceholder="Search rotation types..."
										searchColumn="name"
									/>
								{/if}
							</div>
						</Tabs.Content>
					</div>
				</Tabs.Root>
			</div>
		</div>
	</div>
</div>

{#if editModalOpen && editModalEntity}
	<EditModal
		isOpen={editModalOpen}
		entity={editModalEntity}
		mutationName={editModalMutationName}
		fields={editModalFields}
		onClose={closeEditModal}
		onSuccess={handleEditSuccess}
	/>
{/if}

{#if deleteModalOpen}
	<DeleteConfirmationModal
		isOpen={deleteModalOpen}
		entityId={deleteModalEntityId}
		entityName={deleteModalEntityName}
		entityType={deleteModalEntityType}
		mutationName={deleteModalMutationName}
		onClose={closeDeleteModal}
		onSuccess={handleDeleteSuccess}
	/>
{/if}

<AddPreceptorModal
	isOpen={addPreceptorModalOpen}
	onClose={closeAddPreceptorModal}
	onSuccess={handleAddPreceptorSuccess}
/>

<AddSchoolModal
	isOpen={addSchoolModalOpen}
	onClose={closeAddSchoolModal}
	onSuccess={handleAddSchoolSuccess}
/>

<AddPracticeSiteModal
	isOpen={addPracticeSiteModalOpen}
	onClose={closeAddPracticeSiteModal}
	onSuccess={handleAddPracticeSiteSuccess}
/>

<AddRotationTypeModal
	isOpen={addRotationTypeModalOpen}
	onClose={closeAddRotationTypeModal}
	onSuccess={handleAddRotationTypeSuccess}
/>

<AddReviewModal
	isOpen={addReviewModalOpen}
	onClose={closeAddReviewModal}
	onSuccess={handleAddReviewSuccess}
/>
