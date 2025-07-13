<script lang="ts">
	import { onMount } from 'svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import SimpleDataTable from './simple-data-table.svelte';
	import EditModal from '$lib/components/EditModal.svelte';
	import DeleteConfirmationModal from '$lib/components/DeleteConfirmationModal.svelte';
	import AddPreceptorModal from '$lib/components/AddPreceptorModal.svelte';
	import AddSchoolModal from '$lib/components/AddSchoolModal.svelte';
	import AddPracticeSiteModal from '$lib/components/AddPracticeSiteModal.svelte';
	import AddRotationTypeModal from '$lib/components/AddRotationTypeModal.svelte';
	import AddReviewModal from '$lib/components/AddReviewModal.svelte';
	import AddProgramTypeModal from '$lib/components/AddProgramTypeModal.svelte';
	import AddExperienceTypeModal from '$lib/components/AddExperienceTypeModal.svelte';
	import AddSchoolProgramModal from '$lib/components/AddSchoolProgramModal.svelte';
	import SeedDatabaseModal from '$lib/components/SeedDatabaseModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Plus, Database } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { PUBLIC_ENVIRONMENT_TYPE } from '$env/static/public';

	import { reviewsColumns } from './reviews-columns.js';
	import { schoolsColumns, type School } from './schools-columns.js';
	import { preceptorsColumns, type Preceptor } from './preceptors-columns.js';
	import { practiceSitesColumns, type PracticeSite } from './practice-sites-columns.js';
	import { rotationTypesColumns, type RotationType } from './rotation-types-columns.js';
	import { programTypesColumns, type ProgramType } from './program-types-columns.js';
	import { experienceTypesColumns, type ExperienceType } from './experience-types-columns.js';
	import { schoolProgramsColumns, type SchoolProgram } from './school-programs-columns.js';

	const isDevelopment = PUBLIC_ENVIRONMENT_TYPE === 'development';

	let tabs = $state([
		{ id: 'reviews', label: 'Reviews', count: 0 },
		{ id: 'preceptors', label: 'Preceptors', count: 0 },
		{ id: 'schools', label: 'Schools', count: 0 },
		{ id: 'sites', label: 'Practice Sites', count: 0 },
		{ id: 'rotations', label: 'Rotation Types', count: 0 },
		{ id: 'programs', label: 'Program Types', count: 0 },
		{ id: 'experiences', label: 'Experience Types', count: 0 },
		{ id: 'schoolPrograms', label: 'School Programs', count: 0 },
		...(isDevelopment ? [{ id: 'seeding', label: 'Database Seeding', count: 0 }] : [])
	]);

	const reviewsQuery = useQuery(api.reviews.get, {});
	const preceptorsQuery = useQuery(api.preceptors.get, {});
	const schoolsQuery = useQuery(api.schools.get, {});
	const sitesQuery = useQuery(api.practiceSites.get, {});
	const rotationsQuery = useQuery(api.rotationTypes.get, {});
	const programTypesQuery = useQuery(api.programTypes.get, {});
	const experienceTypesQuery = useQuery(api.experienceTypes.get, {});
	const schoolProgramsQuery = useQuery(api.schoolPrograms.get, {});

	let reviewsData = $derived((reviewsQuery.data ?? []) as any[]);
	let preceptorsData = $derived((preceptorsQuery.data ?? []) as Preceptor[]);
	let schoolsData = $derived((schoolsQuery.data ?? []) as School[]);
	let sitesData = $derived((sitesQuery.data ?? []) as PracticeSite[]);
	let rotationsData = $derived((rotationsQuery.data ?? []) as RotationType[]);
	let programTypesData = $derived((programTypesQuery.data ?? []) as ProgramType[]);
	let experienceTypesData = $derived((experienceTypesQuery.data ?? []) as ExperienceType[]);
	let schoolProgramsData = $derived((schoolProgramsQuery.data ?? []) as SchoolProgram[]);

	let reviewsLoading = $derived(reviewsQuery.isLoading);
	let preceptorsLoading = $derived(preceptorsQuery.isLoading);
	let schoolsLoading = $derived(schoolsQuery.isLoading);
	let sitesLoading = $derived(sitesQuery.isLoading);
	let rotationsLoading = $derived(rotationsQuery.isLoading);
	let programTypesLoading = $derived(programTypesQuery.isLoading);
	let experienceTypesLoading = $derived(experienceTypesQuery.isLoading);
	let schoolProgramsLoading = $derived(schoolProgramsQuery.isLoading);

	let reviewsError = $derived(reviewsQuery.error);
	let preceptorsError = $derived(preceptorsQuery.error);
	let schoolsError = $derived(schoolsQuery.error);
	let sitesError = $derived(sitesQuery.error);
	let rotationsError = $derived(rotationsQuery.error);
	let programTypesError = $derived(programTypesQuery.error);
	let experienceTypesError = $derived(experienceTypesQuery.error);
	let schoolProgramsError = $derived(schoolProgramsQuery.error);

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
	let addProgramTypeModalOpen = $state(false);
	let addExperienceTypeModalOpen = $state(false);
	let addSchoolProgramModalOpen = $state(false);
	let seedDatabaseModalOpen = $state(false);

	$effect(() => {
		tabs[0].count = reviewsData.length;
		tabs[1].count = preceptorsData.length;
		tabs[2].count = schoolsData.length;
		tabs[3].count = sitesData.length;
		tabs[4].count = rotationsData.length;
		tabs[5].count = programTypesData.length;
		tabs[6].count = experienceTypesData.length;
		tabs[7].count = schoolProgramsData.length;
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
			key: 'programTypeId',
			label: 'Program Type',
			type: 'select' as const,
			options: programTypesData.map((p) => ({ label: p.name, value: p._id })),
			required: true
		},
		{
			key: 'siteId',
			label: 'Practice Site',
			type: 'select' as const,
			options: sitesData.map((s) => ({ label: `${s.name} - ${s.city}, ${s.state}`, value: s._id })),
			required: true
		}
	]);

	const practiceSiteFields = $derived([
		{ key: 'name', label: 'Site Name', type: 'text' as const, required: true },
		{ key: 'city', label: 'City', type: 'text' as const, required: true },
		{ key: 'state', label: 'State', type: 'text' as const, required: true }
	]);

	const rotationTypeFields = $derived([
		{
			key: 'programTypeId',
			label: 'Program Type',
			type: 'select' as const,
			options: programTypesData.map((p) => ({ label: p.name, value: p._id })),
			required: true
		},
		{ key: 'name', label: 'Rotation Type', type: 'text' as const, required: true }
	]);

	const programTypeFields = $derived([
		{ key: 'name', label: 'Program Name', type: 'text' as const, required: true },
		{ key: 'abbreviation', label: 'Abbreviation', type: 'text' as const, required: true },
		{
			key: 'yearLabels',
			label: 'Year Labels (comma-separated)',
			type: 'array' as const,
			required: true
		}
	]);

	const experienceTypeFields = $derived([
		{
			key: 'programTypeId',
			label: 'Program Type',
			type: 'select' as const,
			options: programTypesData.map((p) => ({ label: p.name, value: p._id })),
			required: true
		},
		{ key: 'name', label: 'Experience Type', type: 'text' as const, required: true },
		{ key: 'description', label: 'Description', type: 'textarea' as const, required: false }
	]);

	const schoolProgramFields = $derived([
		{
			key: 'schoolId',
			label: 'School',
			type: 'select' as const,
			options: schoolsData.map((s) => ({ label: s.name, value: s._id })),
			required: true
		},
		{
			key: 'programTypeId',
			label: 'Program Type',
			type: 'select' as const,
			options: programTypesData.map((p) => ({ label: p.name, value: p._id })),
			required: true
		}
	]);

	const reviewFields = $derived([
		{
			key: 'preceptorId',
			label: 'Preceptor',
			type: 'preceptor_combobox' as const,
			preceptors: preceptorsData.map((p) => ({ _id: p._id, fullName: p.fullName })),
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
			key: 'experienceTypeId',
			label: 'Experience Type',
			type: 'select' as const,
			options: experienceTypesData.map((e) => ({ label: e.name, value: e._id })),
			required: true
		},
		{
			key: 'schoolYear',
			label: 'School Year',
			type: 'text' as const,
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
		{ key: 'comment', label: 'Comment', type: 'comment' as const }
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
	}

	function openAddSchoolModal() {
		addSchoolModalOpen = true;
	}

	function closeAddSchoolModal() {
		addSchoolModalOpen = false;
	}

	function handleAddSchoolSuccess() {
		toast.success('School added successfully!', {
			description: 'The school has been added to the database.'
		});
	}

	function openAddPracticeSiteModal() {
		addPracticeSiteModalOpen = true;
	}

	function closeAddPracticeSiteModal() {
		addPracticeSiteModalOpen = false;
	}

	function handleAddPracticeSiteSuccess() {
		toast.success('Practice site added successfully!', {
			description: 'The practice site has been added to the database.'
		});
	}

	function openAddRotationTypeModal() {
		addRotationTypeModalOpen = true;
	}

	function closeAddRotationTypeModal() {
		addRotationTypeModalOpen = false;
	}

	function handleAddRotationTypeSuccess() {
		toast.success('Rotation type added successfully!', {
			description: 'The rotation type has been added to the database.'
		});
	}

	function openAddReviewModal() {
		addReviewModalOpen = true;
	}

	function closeAddReviewModal() {
		addReviewModalOpen = false;
	}

	function handleAddReviewSuccess() {
		toast.success('Review added successfully!', {
			description: 'The review has been added to the database.'
		});
	}

	function openAddProgramTypeModal() {
		addProgramTypeModalOpen = true;
	}

	function closeAddProgramTypeModal() {
		addProgramTypeModalOpen = false;
	}

	function handleAddProgramTypeSuccess() {
		toast.success('Program type added successfully!', {
			description: 'The program type has been added to the database.'
		});
	}

	function openAddExperienceTypeModal() {
		addExperienceTypeModalOpen = true;
	}

	function closeAddExperienceTypeModal() {
		addExperienceTypeModalOpen = false;
	}

	function handleAddExperienceTypeSuccess() {
		toast.success('Experience type added successfully!', {
			description: 'The experience type has been added to the database.'
		});
	}

	function openAddSchoolProgramModal() {
		addSchoolProgramModalOpen = true;
	}

	function closeAddSchoolProgramModal() {
		addSchoolProgramModalOpen = false;
	}

	function handleAddSchoolProgramSuccess() {
		toast.success('School program added successfully!', {
			description: 'The school program has been added to the database.'
		});
	}

	function openSeedDatabaseModal() {
		seedDatabaseModalOpen = true;
	}

	function closeSeedDatabaseModal() {
		seedDatabaseModalOpen = false;
	}

	function handleSeedDatabaseSuccess() {
		toast.success('Database seeded successfully!', {
			description: 'The database has been populated with sample data.'
		});
	}

	function handleEditSuccess() {
		toast.success('Entity updated successfully!', {
			description: 'The changes have been saved to the database.'
		});
	}

	function handleDeleteSuccess() {
		toast.success('Entity deleted successfully!', {
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

			const editSchoolProgram = findDataAttribute(target, 'editSchoolProgram');
			if (editSchoolProgram) {
				const schoolProgram = JSON.parse(editSchoolProgram);
				openEditModal(schoolProgram, 'schoolPrograms.updateSchoolProgram', schoolProgramFields);
				return;
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

			const editProgramType = findDataAttribute(target, 'editProgramType');
			if (editProgramType) {
				const programType = JSON.parse(editProgramType);
				openEditModal(programType, 'programTypes.updateProgramType', programTypeFields);
				return;
			}

			const editExperienceType = findDataAttribute(target, 'editExperienceType');
			if (editExperienceType) {
				const experienceType = JSON.parse(editExperienceType);
				openEditModal(experienceType, 'experienceTypes.updateExperienceType', experienceTypeFields);
				return;
			}

			const deleteSchoolProgram = findDataAttribute(target, 'deleteSchoolProgram');
			if (deleteSchoolProgram) {
				const schoolProgram = schoolProgramsData.find((sp) => sp._id === deleteSchoolProgram);
				openDeleteModal(
					deleteSchoolProgram,
					schoolProgram
						? `${schoolProgram.schoolName} - ${schoolProgram.programTypeName}`
						: 'Unknown School Program',
					'School Program',
					'schoolPrograms.deleteSchoolProgram'
				);
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

			const deleteProgramType = findDataAttribute(target, 'deleteProgramType');
			if (deleteProgramType) {
				const programType = programTypesData.find((p) => p._id === deleteProgramType);
				openDeleteModal(
					deleteProgramType,
					programType?.name || 'Unknown Program Type',
					'Program Type',
					'programTypes.deleteProgramType'
				);
				return;
			}

			const deleteExperienceType = findDataAttribute(target, 'deleteExperienceType');
			if (deleteExperienceType) {
				const experienceType = experienceTypesData.find((e) => e._id === deleteExperienceType);
				openDeleteModal(
					deleteExperienceType,
					experienceType?.name || 'Unknown Experience Type',
					'Experience Type',
					'experienceTypes.deleteExperienceType'
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
			const review = reviewsData.find((r: any) => r._id === reviewId);
			const reviewDesc = review
				? `Review (${review.experienceTypeName} - ${review.schoolYear})`
				: 'Unknown Review';
			openDeleteModal(reviewId, reviewDesc, 'Review', 'reviews.deleteReview');
		});
	});
</script>

<div class="admin-container min-h-screen p-3 sm:p-6">
	<div>
		<div class="mx-auto">
			<div class="mb-6 sm:mb-8">
				<h1 class="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
				<p class="mt-2 text-sm sm:text-base">Manage all your preceptor review data</p>
			</div>

			<div class="mb-4">
				<Tabs.Root value="Preceptors" class="w-full">
					<Tabs.List class="flex ">
						{#each tabs as tab (tab.id)}
							<Tabs.Trigger
								value={tab.label}
								class="flex-1 text-xs sm:text-sm"
							>
							
								<span class="hidden sm:inline">{tab.label}</span>
								<span class="sm:hidden">{tab.label.slice(0, 3)}</span>
								{#if tab.count > 0}
									<span class="rounded-full text-xs opacity-70">
										{tab.count}
									</span>
								{/if}
							</Tabs.Trigger>
						{/each}
					</Tabs.List>

					<div class="mt-4 rounded-lg shadow">
						<Tabs.Content value="Reviews">
							<div class="p-3 sm:p-6">
								<div
									class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<h2 class="text-lg font-semibold sm:text-xl">Reviews</h2>
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
										<p class="text-sm text-red-800">{reviewsError}</p>
									</div>
								{/if}

								{#if reviewsLoading}
									<div class="space-y-4">
										{#each Array(5) as _, i (i)}
											<div class="flex items-center space-x-4 rounded-lg border p-4">
												<div class="flex-1 space-y-2">
													<Skeleton class="h-4 w-[150px]" />
													<Skeleton class="h-4 w-[100px]" />
												</div>
												<div class="space-y-1">
													<Skeleton class="h-4 w-[80px]" />
													<Skeleton class="h-4 w-[60px]" />
												</div>
												<div class="flex space-x-2">
													<Skeleton class="h-8 w-16" />
													<Skeleton class="h-8 w-16" />
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<SimpleDataTable
										data={reviewsData}
										columns={reviewsColumns}
										searchPlaceholder="Search reviews..."
										searchColumn="preceptorName"
									/>
								{/if}
							</div>
						</Tabs.Content>
						<Tabs.Content value="Preceptors">
							<div class="p-3 sm:p-6">
								<div
									class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<h2 class="text-lg font-semibold sm:text-xl">Preceptors</h2>
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
										<p class="text-sm text-red-800">{preceptorsError}</p>
									</div>
								{/if}

								{#if preceptorsLoading}
									<div class="space-y-4">
										{#each Array(5) as _, i (i)}
											<div class="flex items-center space-x-4 rounded-lg border p-4">
												<div class="flex-1 space-y-2">
													<Skeleton class="h-4 w-[150px]" />
													<Skeleton class="h-4 w-[100px]" />
												</div>
												<div class="space-y-1">
													<Skeleton class="h-4 w-[80px]" />
													<Skeleton class="h-4 w-[60px]" />
												</div>
												<div class="flex space-x-2">
													<Skeleton class="h-8 w-16" />
													<Skeleton class="h-8 w-16" />
												</div>
											</div>
										{/each}
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
								<div
									class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<h2 class="text-lg font-semibold sm:text-xl">Schools</h2>
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
										<p class="text-sm text-red-800">{schoolsError}</p>
									</div>
								{/if}

								{#if schoolsLoading}
									<div class="space-y-4">
										{#each Array(5) as _, i (i)}
											<div class="flex items-center space-x-4 rounded-lg border p-4">
												<div class="flex-1 space-y-2">
													<Skeleton class="h-4 w-[150px]" />
													<Skeleton class="h-4 w-[100px]" />
												</div>
												<div class="flex space-x-2">
													<Skeleton class="h-8 w-16" />
													<Skeleton class="h-8 w-16" />
												</div>
											</div>
										{/each}
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
								<div
									class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<h2 class="text-lg font-semibold sm:text-xl">Practice Sites</h2>
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
										<p class="text-sm text-red-800">{sitesError}</p>
									</div>
								{/if}

								{#if sitesLoading}
									<div class="space-y-4">
										{#each Array(5) as _, i (i)}
											<div class="flex items-center space-x-4 rounded-lg border p-4">
												<div class="flex-1 space-y-2">
													<Skeleton class="h-4 w-[150px]" />
													<Skeleton class="h-4 w-[100px]" />
												</div>
												<div class="flex space-x-2">
													<Skeleton class="h-8 w-16" />
													<Skeleton class="h-8 w-16" />
												</div>
											</div>
										{/each}
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
								<div
									class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<h2 class="text-lg font-semibold sm:text-xl">Rotation Types</h2>
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
										<p class="text-sm text-red-800">{rotationsError}</p>
									</div>
								{/if}

								{#if rotationsLoading}
									<div class="space-y-4">
										{#each Array(5) as _, i (i)}
											<div class="flex items-center space-x-4 rounded-lg border p-4">
												<div class="flex-1 space-y-2">
													<Skeleton class="h-4 w-[150px]" />
													<Skeleton class="h-4 w-[100px]" />
												</div>
												<div class="flex space-x-2">
													<Skeleton class="h-8 w-16" />
													<Skeleton class="h-8 w-16" />
												</div>
											</div>
										{/each}
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
						<Tabs.Content value="Program Types">
							<div class="p-3 sm:p-6">
								<div
									class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<h2 class="text-lg font-semibold sm:text-xl">Program Types</h2>
										<p class="text-sm sm:text-base">All available program types</p>
									</div>

									<div class="flex flex-row gap-2">
										<Button onclick={openAddProgramTypeModal} class="w-full sm:w-auto">
											<Plus class="h-4 w-4" />
											<span class="hidden sm:inline">Add Program Type</span>
											<span class="sm:hidden">Add</span>
										</Button>
									</div>
								</div>

								{#if programTypesError}
									<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 sm:p-4">
										<p class="text-sm text-red-800">{programTypesError}</p>
									</div>
								{/if}

								{#if programTypesLoading}
									<div class="space-y-4">
										{#each Array(5) as _, i (i)}
											<div class="flex items-center space-x-4 rounded-lg border p-4">
												<div class="flex-1 space-y-2">
													<Skeleton class="h-4 w-[150px]" />
													<Skeleton class="h-4 w-[100px]" />
												</div>
												<div class="flex space-x-2">
													<Skeleton class="h-8 w-16" />
													<Skeleton class="h-8 w-16" />
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<SimpleDataTable
										data={programTypesData}
										columns={programTypesColumns}
										searchPlaceholder="Search program types..."
										searchColumn="name"
									/>
								{/if}
							</div>
						</Tabs.Content>
						<Tabs.Content value="Experience Types">
							<div class="p-3 sm:p-6">
								<div
									class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<h2 class="text-lg font-semibold sm:text-xl">Experience Types</h2>
										<p class="text-sm sm:text-base">All available experience types</p>
									</div>

									<div class="flex flex-row gap-2">
										<Button onclick={openAddExperienceTypeModal} class="w-full sm:w-auto">
											<Plus class="h-4 w-4" />
											<span class="hidden sm:inline">Add Experience Type</span>
											<span class="sm:hidden">Add</span>
										</Button>
									</div>
								</div>

								{#if experienceTypesError}
									<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 sm:p-4">
										<p class="text-sm text-red-800">{experienceTypesError}</p>
									</div>
								{/if}

								{#if experienceTypesLoading}
									<div class="space-y-4">
										{#each Array(5) as _, i (i)}
											<div class="flex items-center space-x-4 rounded-lg border p-4">
												<div class="flex-1 space-y-2">
													<Skeleton class="h-4 w-[150px]" />
													<Skeleton class="h-4 w-[100px]" />
												</div>
												<div class="flex space-x-2">
													<Skeleton class="h-8 w-16" />
													<Skeleton class="h-8 w-16" />
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<SimpleDataTable
										data={experienceTypesData}
										columns={experienceTypesColumns}
										searchPlaceholder="Search experience types..."
										searchColumn="name"
									/>
								{/if}
							</div>
						</Tabs.Content>
						<Tabs.Content value="School Programs">
							<div class="p-3 sm:p-6">
								<div
									class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<h2 class="text-lg font-semibold sm:text-xl">School Programs</h2>
										<p class="text-sm sm:text-base">All available school programs</p>
									</div>

									<div class="flex flex-row gap-2">
										<Button onclick={openAddSchoolProgramModal} class="w-full sm:w-auto">
											<Plus class="h-4 w-4" />
											<span class="hidden sm:inline">Add School Program</span>
											<span class="sm:hidden">Add</span>
										</Button>
									</div>
								</div>

								{#if schoolProgramsError}
									<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 sm:p-4">
										<p class="text-sm text-red-800">{schoolProgramsError}</p>
									</div>
								{/if}

								{#if schoolProgramsLoading}
									<div class="space-y-4">
										{#each Array(5) as _, i (i)}
											<div class="flex items-center space-x-4 rounded-lg border p-4">
												<div class="flex-1 space-y-2">
													<Skeleton class="h-4 w-[150px]" />
													<Skeleton class="h-4 w-[100px]" />
												</div>
												<div class="flex space-x-2">
													<Skeleton class="h-8 w-16" />
													<Skeleton class="h-8 w-16" />
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<SimpleDataTable
										data={schoolProgramsData}
										columns={schoolProgramsColumns}
										searchPlaceholder="Search school programs..."
										searchColumn="schoolName"
									/>
								{/if}
							</div>
						</Tabs.Content>
						{#if isDevelopment}
							<Tabs.Content value="Database Seeding">
								<div class="p-3 sm:p-6">
									<div
										class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
									>
										<div>
											<h2 class="text-lg font-semibold sm:text-xl">Database Seeding</h2>
											<p class="text-sm sm:text-base">
												Seed the database with sample data for development
											</p>
										</div>

										<div class="flex flex-row gap-2">
											<Button
												onclick={openSeedDatabaseModal}
												class="w-full bg-orange-600 hover:bg-orange-700 sm:w-auto"
											>
												<Database class="h-4 w-4" />
												<span class="hidden sm:inline">Seed Database</span>
												<span class="sm:hidden">Seed</span>
											</Button>
										</div>
									</div>

									<div class="bg-muted/50 rounded-lg border p-4">
										<div
											class="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium"
										>
											<Database class="h-4 w-4" />
											Development Tool
										</div>
										<p class="text-muted-foreground mb-3 text-sm">
											This tool allows you to populate the database with realistic sample data for
											testing and development purposes.
										</p>
										<div class="text-muted-foreground space-y-1 text-sm">
											<p><strong>Features:</strong></p>
											<ul class="ml-2 list-inside list-disc space-y-1">
												<li>Configurable record counts (preceptors, schools, practice sites)</li>
												<li>Customizable review generation settings</li>
												<li>Realistic rating distributions</li>
												<li>Clear tables functionality</li>
												<li>5 program types with experience and rotation types</li>
											</ul>
										</div>
									</div>
								</div>
							</Tabs.Content>
						{/if}
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

<AddProgramTypeModal
	isOpen={addProgramTypeModalOpen}
	onClose={closeAddProgramTypeModal}
	onSuccess={handleAddProgramTypeSuccess}
/>

<AddExperienceTypeModal
	isOpen={addExperienceTypeModalOpen}
	onClose={closeAddExperienceTypeModal}
	onSuccess={handleAddExperienceTypeSuccess}
/>

<AddSchoolProgramModal
	isOpen={addSchoolProgramModalOpen}
	onClose={closeAddSchoolProgramModal}
	onSuccess={handleAddSchoolProgramSuccess}
/>

<SeedDatabaseModal
	isOpen={seedDatabaseModalOpen}
	onClose={closeSeedDatabaseModal}
	onSuccess={handleSeedDatabaseSuccess}
/>
