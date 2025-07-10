<script lang="ts">
	import { onMount } from 'svelte';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import type { Id } from '../../convex/_generated/dataModel.js';
	import ReviewsDataTable from './reviews-data-table.svelte';
	import SimpleDataTable from './simple-data-table.svelte';
	import EditModal from '$lib/components/EditModal.svelte';
	import DeleteConfirmationModal from '$lib/components/DeleteConfirmationModal.svelte';

	import { reviewsColumns } from './reviews-columns.js';
	import { schoolsColumns, type School } from './schools-columns.js';
	import { preceptorsColumns, type Preceptor } from './preceptors-columns.js';
	import { practiceSitesColumns, type PracticeSite } from './practice-sites-columns.js';
	import { rotationTypesColumns, type RotationType } from './rotation-types-columns.js';

	let currentTab = $state('reviews');

	let tabs = $state([
		{ id: 'reviews', label: 'Reviews', count: 0 },
		{ id: 'preceptors', label: 'Preceptors', count: 0 },
		{ id: 'schools', label: 'Schools', count: 0 },
		{ id: 'sites', label: 'Practice Sites', count: 0 },
		{ id: 'rotations', label: 'Rotation Types', count: 0 }
	]);

	// Queries for all entities
	const reviewsQuery = useQuery(api.reviews.get, {});
	const preceptorsQuery = useQuery(api.preceptors.get, {});
	const schoolsQuery = useQuery(api.schools.get, {});
	const sitesQuery = useQuery(api.practiceSites.get, {});
	const rotationsQuery = useQuery(api.rotationTypes.get, {});

	// Get the Convex client for mutations
	const client = useConvexClient();

	// Data derivations
	let reviewsData = $derived(reviewsQuery.data ?? []);
	let preceptorsData = $derived((preceptorsQuery.data ?? []) as Preceptor[]);
	let schoolsData = $derived((schoolsQuery.data ?? []) as School[]);
	let sitesData = $derived((sitesQuery.data ?? []) as PracticeSite[]);
	let rotationsData = $derived((rotationsQuery.data ?? []) as RotationType[]);

	// Loading and error states
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

	// EditModal state
	let editModalOpen = $state(false);
	let editModalEntity = $state<any>(null);
	let editModalMutationName = $state('');
	let editModalFields = $state<any[]>([]);

	// DeleteConfirmationModal state
	let deleteModalOpen = $state(false);
	let deleteModalEntityId = $state('');
	let deleteModalEntityName = $state('');
	let deleteModalEntityType = $state('');
	let deleteModalMutationName = $state('');

	$effect(() => {
		tabs[0].count = reviewsData.length;
		tabs[1].count = preceptorsData.length;
		tabs[2].count = schoolsData.length;
		tabs[3].count = sitesData.length;
		tabs[4].count = rotationsData.length;
	});

	// Field configurations for each entity type - made reactive to update when data loads
	const schoolFields = $derived([
		{ key: 'name', label: 'School Name', type: 'text' as const, required: true }
	]);

	const preceptorFields = $derived([
		{ key: 'fullName', label: 'Full Name', type: 'text' as const, required: true },
		{ key: 'schoolId', label: 'School', type: 'select' as const, options: schoolsData.map(s => ({ label: s.name, value: s._id })), required: true },
		{ key: 'siteId', label: 'Practice Site', type: 'select' as const, options: sitesData.map(s => ({ label: s.name, value: s._id })), required: true }
	]);

	const practiceSiteFields = $derived([
		{ key: 'name', label: 'Site Name', type: 'text' as const, required: true },
		{ key: 'city', label: 'City', type: 'text' as const, required: true },
		{ key: 'state', label: 'State', type: 'text' as const, required: true },
		{ key: 'schoolId', label: 'School', type: 'select' as const, options: schoolsData.map(s => ({ label: s.name, value: s._id })), required: true }
	]);

	const rotationTypeFields = $derived([
		{ key: 'name', label: 'Rotation Type', type: 'text' as const, required: true }
	]);

	const reviewFields = $derived([
		{ key: 'preceptorId', label: 'Preceptor', type: 'select' as const, options: preceptorsData.map(p => ({ label: p.fullName, value: p._id })), required: true },
		{ key: 'rotationTypeId', label: 'Rotation Type', type: 'select' as const, options: rotationsData.map(r => ({ label: r.name, value: r._id })), required: true },
		{ key: 'ippeAppe', label: 'Type', type: 'select' as const, options: [
			{ label: 'IPPE', value: 'IPPE' },
			{ label: 'APPE', value: 'APPE' }
		], required: true },
		{ key: 'schoolYear', label: 'School Year', type: 'select' as const, options: [
			{ label: 'P1', value: 'P1' },
			{ label: 'P2', value: 'P2' },
			{ label: 'P3', value: 'P3' },
			{ label: 'P4', value: 'P4' }
		], required: true },
		{ key: 'priorExperience', label: 'Prior Experience', type: 'select' as const, options: [
			{ label: 'None', value: 'None' },
			{ label: 'Little', value: 'Little' },
			{ label: 'Moderate', value: 'Moderate' },
			{ label: 'Significant', value: 'Significant' }
		], required: true },
		{ key: 'schedulingFlexibility', label: 'Scheduling Flexibility', type: 'number' as const, required: true },
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

	function openDeleteModal(entityId: string, entityName: string, entityType: string, mutationName: string) {
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
				const school = schoolsData.find(s => s._id === deleteSchool);
				openDeleteModal(deleteSchool, school?.name || 'Unknown School', 'School', 'schools.deleteSchool');
				return;
			}
			
			const deletePreceptor = findDataAttribute(target, 'deletePreceptor');
			if (deletePreceptor) {
				const preceptor = preceptorsData.find(p => p._id === deletePreceptor);
				openDeleteModal(deletePreceptor, preceptor?.fullName || 'Unknown Preceptor', 'Preceptor', 'preceptors.deletePreceptor');
				return;
			}
			
			const deletePracticeSite = findDataAttribute(target, 'deletePracticeSite');
			if (deletePracticeSite) {
				const site = sitesData.find(s => s._id === deletePracticeSite);
				openDeleteModal(deletePracticeSite, site?.name || 'Unknown Site', 'Practice Site', 'practiceSites.deletePracticeSite');
				return;
			}
			
			const deleteRotationType = findDataAttribute(target, 'deleteRotationType');
			if (deleteRotationType) {
				const rotationType = rotationsData.find(r => r._id === deleteRotationType);
				openDeleteModal(deleteRotationType, rotationType?.name || 'Unknown Rotation Type', 'Rotation Type', 'rotationTypes.deleteRotationType');
				return;
			}
		});

		// Custom event listeners for reviews
		window.addEventListener('edit-review', (e) => {
			const review = (e as CustomEvent).detail;
			openEditModal(review, 'reviews.updateReview', reviewFields);
		});

		window.addEventListener('delete-review', (e) => {
			const reviewId = (e as CustomEvent).detail;
			const review = reviewsData.find(r => r._id === reviewId);
			const reviewDesc = review ? `Review (${review.ippeAppe} - ${review.schoolYear})` : 'Unknown Review';
			openDeleteModal(reviewId, reviewDesc, 'Review', 'reviews.deleteReview');
		});
	});
</script>

<div class="min-h-screen p-6 admin-container">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8">
			<h1 class="text-3xl font-bold">Admin Dashboard</h1>
			<p class="mt-2">Manage all your preceptor review data</p>
		</div>

		<div class="mb-6">
			<nav class="flex space-x-8" aria-label="Tabs">
				{#each tabs as tab (tab.id)}
					<button
						class="border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 {currentTab ===
						tab.id
							? 'border-blue-500 text-blue-600'
							: 'border-transparent '}"
						onclick={() => (currentTab = tab.id)}
					>
						{tab.label}
						{#if tab.count > 0}
							<span class="ml-2 rounded-full px-2 py-0.5 text-xs opacity-70">
								{tab.count}
							</span>
						{/if}
					</button>
				{/each}
			</nav>
		</div>

		<div class="rounded-lg shadow">
			{#if currentTab === 'reviews'}
				<div class="p-6">
					<div class="mb-6 flex items-center justify-between">
						<div>
							<h2 class="text-xl font-semibold">Reviews</h2>
							<p class="">All preceptor reviews and ratings</p>
						</div>
						<div class="text-sm opacity-60">
							{reviewsData.length} total reviews
						</div>
					</div>

					{#if reviewsError}
						<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
							<p class="text-red-800">{reviewsError}</p>
						</div>
					{/if}

					{#if reviewsLoading}
						<div class="flex items-center justify-center py-12">
							<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
							<span class="ml-2">Loading reviews...</span>
						</div>
					{:else}
						<ReviewsDataTable data={reviewsData} columns={reviewsColumns} />
					{/if}
				</div>
			{:else if currentTab === 'preceptors'}
				<div class="p-6">
					<div class="mb-6 flex items-center justify-between">
						<div>
							<h2 class="text-xl font-semibold">Preceptors</h2>
							<p class="">All registered preceptors</p>
						</div>
						<div class="text-sm opacity-60">
							{preceptorsData.length} total preceptors
						</div>
					</div>

					{#if preceptorsError}
						<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
							<p class="text-red-800">{preceptorsError}</p>
						</div>
					{/if}

					{#if preceptorsLoading}
						<div class="flex items-center justify-center py-12">
							<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
							<span class="ml-2">Loading preceptors...</span>
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
			{:else if currentTab === 'schools'}
				<div class="p-6">
					<div class="mb-6 flex items-center justify-between">
						<div>
							<h2 class="text-xl font-semibold">Schools</h2>
							<p class="">All pharmacy schools</p>
						</div>
						<div class="text-sm opacity-60">
							{schoolsData.length} total schools
						</div>
					</div>

					{#if schoolsError}
						<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
							<p class="text-red-800">{schoolsError}</p>
						</div>
					{/if}

					{#if schoolsLoading}
						<div class="flex items-center justify-center py-12">
							<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
							<span class="ml-2">Loading schools...</span>
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
			{:else if currentTab === 'sites'}
				<div class="p-6">
					<div class="mb-6 flex items-center justify-between">
						<div>
							<h2 class="text-xl font-semibold">Practice Sites</h2>
							<p class="">All practice sites and locations</p>
						</div>
						<div class="text-sm opacity-60">
							{sitesData.length} total sites
						</div>
					</div>

					{#if sitesError}
						<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
							<p class="text-red-800">{sitesError}</p>
						</div>
					{/if}

					{#if sitesLoading}
						<div class="flex items-center justify-center py-12">
							<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
							<span class="ml-2">Loading sites...</span>
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
			{:else if currentTab === 'rotations'}
				<div class="p-6">
					<div class="mb-6 flex items-center justify-between">
						<div>
							<h2 class="text-xl font-semibold">Rotation Types</h2>
							<p class="">All available rotation types</p>
						</div>
						<div class="text-sm opacity-60">
							{rotationsData.length} total rotation types
						</div>
					</div>

					{#if rotationsError}
						<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
							<p class="text-red-800">{rotationsError}</p>
						</div>
					{/if}

					{#if rotationsLoading}
						<div class="flex items-center justify-center py-12">
							<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
							<span class="ml-2">Loading rotation types...</span>
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
			{/if}
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
	/>
{/if}
