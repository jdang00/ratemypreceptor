<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import type { Id } from '../../convex/_generated/dataModel.js';

	// Top-level queries (always called in same order)
	const allPreceptors = useQuery(api.preceptors.get, {});
	const allSchools = useQuery(api.schools.get, {});
	const allSites = useQuery(api.practiceSites.get, {});
	const allProgramTypes = useQuery(api.programTypes.get, {});
	const allRotationTypes = useQuery(api.rotationTypes.get, {});
	const allExperienceTypes = useQuery(api.experienceTypes.get, {});

	// Reactive state for selections
	let selectedPreceptorId = $state<Id<'preceptors'> | ''>('');
	let selectedSchoolId = $state<Id<'schools'> | ''>('');
	let selectedSiteId = $state<Id<'practiceSites'> | ''>('');

	// Cascading queries using reactive args and enabled flags
	const preceptorSchools = useQuery(
		api.preceptorAffiliations.getAvailableSchoolsForPreceptor,
		$derived(() => ({ preceptorId: selectedPreceptorId as Id<'preceptors'> })),
		{ enabled: $derived(() => !!selectedPreceptorId) }
	);

	const preceptorSites = useQuery(
		api.preceptorAffiliations.getAvailableSitesForPreceptorAtSchool,
		$derived(() => ({
			preceptorId: selectedPreceptorId as Id<'preceptors'>,
			schoolId: selectedSchoolId as Id<'schools'>
		})),
		{ enabled: $derived(() => !!selectedPreceptorId && !!selectedSchoolId) }
	);

	const preceptorPrograms = useQuery(
		api.preceptorAffiliations.getAvailableProgramsForPreceptorAtSchoolSite,
		$derived(() => ({
			preceptorId: selectedPreceptorId as Id<'preceptors'>,
			schoolId: selectedSchoolId as Id<'schools'>,
			siteId: selectedSiteId as Id<'practiceSites'>
		})),
		{ enabled: $derived(() => !!selectedPreceptorId && !!selectedSchoolId && !!selectedSiteId) }
	);

	const preceptorWithAffiliations = useQuery(
		api.preceptorAffiliations.getPreceptorWithAffiliations,
		$derived(() => ({ preceptorId: selectedPreceptorId as Id<'preceptors'> })),
		{ enabled: $derived(() => !!selectedPreceptorId) }
	);

	// Derived data using function-style $derived to track .data property changes
	const availableSchools = $derived(() => preceptorSchools.data ?? []);
	const availableSites = $derived(() => preceptorSites.data ?? []);
	const availablePrograms = $derived(() => preceptorPrograms.data ?? []);

	// Other derived data
	const selectedPreceptor = $derived(() =>
		allPreceptors.data?.find((p) => p._id === selectedPreceptorId)
	);

	$inspect(selectedPreceptor);

	const selectedSchool = $derived(() => allSchools.data?.find((s) => s._id === selectedSchoolId));

	const selectedSite = $derived(() => allSites.data?.find((s) => s._id === selectedSiteId));

	const selectedProgramType = $derived(() =>
		availablePrograms().length > 0 ? availablePrograms()[0] : null
	);

	const filteredRotationTypes = $derived(() => {
		const programType = selectedProgramType();
		return programType
			? (allRotationTypes.data?.filter((rt) => rt.programTypeId === programType._id) ?? [])
			: [];
	});

	const filteredExperienceTypes = $derived(() => {
		const programType = selectedProgramType();
		return programType
			? (allExperienceTypes.data?.filter((et) => et.programTypeId === programType._id) ?? [])
			: [];
	});

	const availableYears = $derived(() => {
		const programType = selectedProgramType();
		return programType ? programType.yearLabels : [];
	});

	// Reset cascading selections when parent changes
	let prevPreceptorId = '';
	$effect(() => {
		if (selectedPreceptorId !== prevPreceptorId) {
			selectedSchoolId = '';
			selectedSiteId = '';
			prevPreceptorId = selectedPreceptorId;
		}
	});

	$effect(() => {
		if (selectedSchoolId) {
			selectedSiteId = '';
		}
	});

	function handlePreceptorChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newPreceptorId = target.value as Id<'preceptors'> | '';
		selectedPreceptorId = newPreceptorId;
	}

	function handleSchoolChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedSchoolId = target.value as Id<'schools'> | '';
	}

	function handleSiteChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedSiteId = target.value as Id<'practiceSites'> | '';
	}
</script>

<main class="min-h-screen space-y-8 bg-gray-50 p-6">
	<h1 class="text-3xl font-bold text-gray-800">Preceptor Cascading Data Tester</h1>

	<!-- Selection Controls -->
	<section class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-xl font-bold">Make Selections</h2>
		<div class="grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
			<div>
				<label for="preceptor-select" class="mb-1 block text-sm font-medium">
					Select Preceptor:
				</label>
				<select
					id="preceptor-select"
					value={selectedPreceptorId}
					onchange={handlePreceptorChange}
					class="w-full rounded border px-3 py-2"
				>
					<option value="">Choose preceptor...</option>
					{#if allPreceptors.data}
						{#each allPreceptors.data as preceptor (preceptor._id)}
							<option value={preceptor._id}>{preceptor.fullName}</option>
						{/each}
					{/if}
				</select>
			</div>

			<div>
				<label for="school-select" class="mb-1 block text-sm font-medium"> Select School: </label>
				<select
					id="school-select"
					value={selectedSchoolId}
					onchange={handleSchoolChange}
					disabled={!selectedPreceptorId || availableSchools().length === 0}
					class="w-full rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="">Choose school...</option>
					{#each availableSchools().filter((s) => s !== null) as school (school._id)}
						<option value={school._id}>{school.name}</option>
					{/each}
				</select>
				{#if !selectedPreceptorId}
					<p class="mt-1 text-xs text-gray-500">Select a preceptor first</p>
				{/if}
			</div>

			<div>
				<label for="site-select" class="mb-1 block text-sm font-medium">
					Select Practice Site:
				</label>
				<select
					id="site-select"
					value={selectedSiteId}
					onchange={handleSiteChange}
					disabled={!selectedSchoolId || availableSites().length === 0}
					class="w-full rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="">Choose site...</option>
					{#each availableSites().filter((s) => s !== null) as site (site._id)}
						<option value={site._id}>{site.name} - {site.city}, {site.state}</option>
					{/each}
				</select>
				{#if !selectedSchoolId}
					<p class="mt-1 text-xs text-gray-500">Select a school first</p>
				{/if}
			</div>
		</div>
	</section>

	<!-- Current Selection Display -->
	{#if selectedPreceptorId}
		<section class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">Current Selection Chain</h2>
			<div class="space-y-2">
				<div class="flex items-center space-x-2">
					<span class="font-medium">Preceptor:</span>
					<span class="rounded bg-blue-100 px-2 py-1">{selectedPreceptor()?.fullName}</span>
				</div>
				{#if selectedSchoolId}
					<div class="flex items-center space-x-2">
						<span class="font-medium">School:</span>
						<span class="rounded bg-green-100 px-2 py-1">{selectedSchool()?.name}</span>
					</div>
				{/if}
				{#if selectedSiteId}
					<div class="flex items-center space-x-2">
						<span class="font-medium">Site:</span>
						<span class="rounded bg-purple-100 px-2 py-1"
							>{selectedSite()?.name} - {selectedSite()?.city}, {selectedSite()?.state}</span
						>
					</div>
				{/if}
				{#if selectedProgramType()}
					<div class="flex items-center space-x-2">
						<span class="font-medium">Program:</span>
						<span class="rounded bg-orange-100 px-2 py-1"
							>{selectedProgramType()?.name} ({selectedProgramType()?.abbreviation})</span
						>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Available Schools for Selected Preceptor -->
	{#if selectedPreceptorId}
		<section class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">Available Schools for {selectedPreceptor()?.fullName}</h2>
			{#if preceptorSchools.data}
				{#if availableSchools().length > 0}
					<div class="grid gap-2">
						{#each availableSchools().filter((s) => s !== null) as school (school._id)}
							<div class="flex items-center justify-between rounded border p-3">
								<div>
									<span class="font-medium">{school.name}</span>
								</div>
								<span class="text-xs text-gray-500">ID: {school._id}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-500">No schools found for this preceptor</p>
				{/if}
			{:else}
				<p class="text-gray-500">Loading schools...</p>
			{/if}
		</section>
	{/if}

	<!-- Available Sites for Selected Preceptor and School -->
	{#if selectedPreceptorId && selectedSchoolId}
		<section class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">
				Available Sites for {selectedPreceptor()?.fullName} at {selectedSchool()?.name}
			</h2>
			{#if preceptorSites.data}
				{#if availableSites().length > 0}
					<div class="grid gap-2">
						{#each availableSites().filter((s) => s !== null) as site (site._id)}
							<div class="flex items-center justify-between rounded border p-3">
								<div>
									<span class="font-medium">{site.name}</span>
									<span class="text-sm text-gray-600">• {site.city}, {site.state}</span>
								</div>
								<span class="text-xs text-gray-500">ID: {site._id}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-500">No sites found for this preceptor and school combination</p>
				{/if}
			{:else}
				<p class="text-gray-500">Loading sites...</p>
			{/if}
		</section>
	{/if}

	<!-- Available Programs for Selected Preceptor, School, and Site -->
	{#if selectedPreceptorId && selectedSchoolId && selectedSiteId}
		<section class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">
				Available Programs for {selectedPreceptor()?.fullName} at {selectedSchool()?.name} - {selectedSite()
					?.name}
			</h2>
			{#if preceptorPrograms.data}
				{#if availablePrograms().length > 0}
					<div class="grid gap-2">
						{#each availablePrograms().filter((p) => p !== null) as program (program._id)}
							<div class="flex items-center justify-between rounded border p-3">
								<div>
									<span class="font-medium">{program.name}</span>
									<span class="text-sm text-gray-600">({program.abbreviation})</span>
								</div>
								<span class="text-xs text-gray-500">ID: {program._id}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-500">No programs found for this combination</p>
				{/if}
			{:else}
				<p class="text-gray-500">Loading programs...</p>
			{/if}
		</section>
	{/if}

	<!-- Filtered Rotation Types -->
	{#if selectedProgramType()}
		<section class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">
				Available Rotation Types for {selectedProgramType()?.name}
			</h2>
			{#if filteredRotationTypes().length > 0}
				<div class="grid gap-2">
					{#each filteredRotationTypes() as rotationType (rotationType._id)}
						<div class="flex items-center justify-between rounded border p-3">
							<span class="font-medium">{rotationType.name}</span>
							<span class="text-xs text-gray-500">ID: {rotationType._id}</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No rotation types available for this program</p>
			{/if}
		</section>
	{/if}

	<!-- Filtered Experience Types -->
	{#if selectedProgramType()}
		<section class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">
				Available Experience Types for {selectedProgramType()?.name}
			</h2>
			{#if filteredExperienceTypes().length > 0}
				<div class="grid gap-2">
					{#each filteredExperienceTypes() as experienceType (experienceType._id)}
						<div class="flex items-center justify-between rounded border p-3">
							<span class="font-medium">{experienceType.name}</span>
							<span class="text-xs text-gray-500">ID: {experienceType._id}</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500">No experience types available for this program</p>
			{/if}
		</section>
	{/if}

	<!-- Available Years -->
	{#if selectedProgramType() && availableYears().length > 0}
		<section class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">
				Available Years for {selectedProgramType()?.name}
			</h2>
			<div class="flex flex-wrap gap-2">
				{#each availableYears() as year (year)}
					<span class="rounded bg-gray-100 px-3 py-1 text-sm">{year}</span>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Complete Preceptor Information -->
	{#if selectedPreceptorId && preceptorWithAffiliations.data}
		<section class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">Complete Preceptor Information</h2>
			<div class="space-y-4">
				<div class="rounded bg-gray-50 p-4">
					<h3 class="text-lg font-semibold">{preceptorWithAffiliations.data.fullName}</h3>
					{#if preceptorWithAffiliations.data.email}
						<p class="text-sm text-gray-600">Email: {preceptorWithAffiliations.data.email}</p>
					{/if}
					{#if preceptorWithAffiliations.data.credentials}
						<p class="text-sm text-gray-600">
							Credentials: {preceptorWithAffiliations.data.credentials}
						</p>
					{/if}
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div>
						<h4 class="font-medium text-blue-600">
							All Schools ({preceptorWithAffiliations.data.schools.filter((s) => s !== null)
								.length})
						</h4>
						<ul class="mt-2 space-y-1">
							{#each preceptorWithAffiliations.data.schools.filter((s) => s !== null) as school (school._id)}
								<li class="text-sm">• {school.name}</li>
							{/each}
						</ul>
					</div>

					<div>
						<h4 class="font-medium text-green-600">
							All Sites ({preceptorWithAffiliations.data.sites.filter((s) => s !== null).length})
						</h4>
						<ul class="mt-2 space-y-1">
							{#each preceptorWithAffiliations.data.sites.filter((s) => s !== null) as site (site._id)}
								<li class="text-sm">• {site.name} - {site.city}, {site.state}</li>
							{/each}
						</ul>
					</div>

					<div>
						<h4 class="font-medium text-purple-600">
							All Programs ({preceptorWithAffiliations.data.programs.filter((p) => p !== null)
								.length})
						</h4>
						<ul class="mt-2 space-y-1">
							{#each preceptorWithAffiliations.data.programs.filter((p) => p !== null) as program (program._id)}
								<li class="text-sm">• {program.name} ({program.abbreviation})</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- Database Overview -->
	<section class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-xl font-bold">Database Overview</h2>
		<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
			<div class="rounded bg-blue-50 p-4">
				<h3 class="font-semibold text-blue-800">Total Preceptors</h3>
				<p class="text-2xl font-bold text-blue-600">{allPreceptors.data?.length || 0}</p>
			</div>
			<div class="rounded bg-green-50 p-4">
				<h3 class="font-semibold text-green-800">Total Schools</h3>
				<p class="text-2xl font-bold text-green-600">{allSchools.data?.length || 0}</p>
			</div>
			<div class="rounded bg-purple-50 p-4">
				<h3 class="font-semibold text-purple-800">Total Sites</h3>
				<p class="text-2xl font-bold text-purple-600">{allSites.data?.length || 0}</p>
			</div>
			<div class="rounded bg-orange-50 p-4">
				<h3 class="font-semibold text-orange-800">Total Programs</h3>
				<p class="text-2xl font-bold text-orange-600">{allProgramTypes.data?.length || 0}</p>
			</div>
			<div class="rounded bg-indigo-50 p-4">
				<h3 class="font-semibold text-indigo-800">Total Rotations</h3>
				<p class="text-2xl font-bold text-indigo-600">{allRotationTypes.data?.length || 0}</p>
			</div>
			<div class="rounded bg-pink-50 p-4">
				<h3 class="font-semibold text-pink-800">Total Experiences</h3>
				<p class="text-2xl font-bold text-pink-600">{allExperienceTypes.data?.length || 0}</p>
			</div>
		</div>
	</section>
</main>
