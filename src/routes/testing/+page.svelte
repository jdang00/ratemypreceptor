<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';

	const client = useConvexClient();

	// Test different query functions
	const allPreceptors = useQuery(api.preceptors.get, {});
	const preceptorsWithStats = useQuery(api.preceptors.getWithStats, {});

	// Get dropdown data
	const schools = useQuery(api.schools.get, {});
	const programTypes = useQuery(api.programTypes.get, {});
	const practiceSites = useQuery(api.practiceSites.get, {});

	let selectedPreceptorId = $state('');
	let selectedSchoolId = $state('');
	let selectedSiteId = $state('');
	let searchTerm = $state('');

	// Dynamic queries based on selections using $derived
	const preceptorSchools = $derived(
		selectedPreceptorId
			? useQuery(api.preceptorAffiliations.getPreceptorSchools, {
					preceptorId: selectedPreceptorId
				})
			: { data: null }
	);

	const preceptorSites = $derived(
		selectedPreceptorId && selectedSchoolId
			? useQuery(api.preceptorAffiliations.getAvailableSitesForPreceptorAtSchool, {
					preceptorId: selectedPreceptorId,
					schoolId: selectedSchoolId
				})
			: { data: null }
	);

	const searchResults = $derived(
		searchTerm ? useQuery(api.preceptors.search, { searchTerm }) : { data: null }
	);

	// Form for creating preceptor
	let fullName = $state('');
	let email = $state('');
	let credentials = $state('');
	let newSchoolId = $state('');
	let newProgramTypeId = $state('');
	let newSiteId = $state('');

	async function createPreceptor() {
		if (!fullName || !newSchoolId || !newProgramTypeId || !newSiteId) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			await client.mutation(api.preceptors.insertPreceptor, {
				fullName,
				email: email || undefined,
				credentials: credentials || undefined,
				schoolId: newSchoolId as any,
				programTypeId: newProgramTypeId as any,
				siteId: newSiteId as any
			});
			// Reset form
			fullName = email = credentials = newSchoolId = newProgramTypeId = newSiteId = '';
		} catch (err) {
			console.error('Error creating preceptor:', err);
		}
	}
</script>

<main class="min-h-screen space-y-8 bg-gray-50 p-6">
	<h1 class="text-3xl font-bold text-gray-800">Preceptor Function Tester</h1>

	<!-- Create Preceptor Form -->
	<section class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-xl font-bold">Create New Preceptor</h2>
		<div class="grid max-w-4xl grid-cols-2 gap-4">
			<input
				bind:value={fullName}
				placeholder="Full Name *"
				required
				class="rounded border px-3 py-2"
			/>
			<input bind:value={email} placeholder="Email" class="rounded border px-3 py-2" />
			<input bind:value={credentials} placeholder="Credentials" class="rounded border px-3 py-2" />

			<div>
				<label class="mb-1 block text-sm font-medium">School *</label>
				<select bind:value={newSchoolId} required class="w-full rounded border px-3 py-2">
					<option value="">Choose school...</option>
					{#if schools.data}
						{#each schools.data as school (school._id)}
							<option value={school._id}>{school.name}</option>
						{/each}
					{/if}
				</select>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium">Program Type *</label>
				<select bind:value={newProgramTypeId} required class="w-full rounded border px-3 py-2">
					<option value="">Choose program type...</option>
					{#if programTypes.data}
						{#each programTypes.data as program (program._id)}
							<option value={program._id}>{program.name} ({program.abbreviation})</option>
						{/each}
					{/if}
				</select>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium">Practice Site *</label>
				<select bind:value={newSiteId} required class="w-full rounded border px-3 py-2">
					<option value="">Choose practice site...</option>
					{#if practiceSites.data}
						{#each practiceSites.data as site (site._id)}
							<option value={site._id}>{site.name} - {site.city}, {site.state}</option>
						{/each}
					{/if}
				</select>
			</div>
		</div>
		<button
			onclick={createPreceptor}
			class="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
		>
			Create Preceptor
		</button>
	</section>

	<!-- Search Testing -->
	<section class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-xl font-bold">Search Preceptors</h2>
		<input
			bind:value={searchTerm}
			placeholder="Search by name..."
			class="w-full max-w-md rounded border px-3 py-2"
		/>

		{#if searchResults.data}
			<div class="mt-4">
				<h3 class="font-semibold">Search Results ({searchResults.data.length}):</h3>
				<ul class="mt-2 space-y-1">
					{#each searchResults.data as preceptor (preceptor._id)}
						<li class="rounded bg-gray-50 p-2">{preceptor.fullName}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</section>

	<!-- Affiliation Testing -->
	<section class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-xl font-bold">Test Affiliations</h2>

		<div class="mb-4 grid grid-cols-3 gap-4">
			<div>
				<label class="mb-1 block text-sm font-medium">Select Preceptor:</label>
				<select bind:value={selectedPreceptorId} class="w-full rounded border px-3 py-2">
					<option value="">Choose preceptor...</option>
					{#if allPreceptors.data}
						{#each allPreceptors.data as preceptor (preceptor._id)}
							<option value={preceptor._id}>{preceptor.fullName}</option>
						{/each}
					{/if}
				</select>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium">Select School:</label>
				<select bind:value={selectedSchoolId} class="w-full rounded border px-3 py-2">
					<option value="">Choose school...</option>
					{#if preceptorSchools.data}
						{#each preceptorSchools.data as school (school._id)}
							<option value={school._id}>{school.name}</option>
						{/each}
					{/if}
				</select>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium">Available Sites:</label>
				<select bind:value={selectedSiteId} class="w-full rounded border px-3 py-2">
					<option value="">Choose site...</option>
					{#if preceptorSites.data}
						{#each preceptorSites.data as site (site._id)}
							<option value={site._id}>{site.name} - {site.city}, {site.state}</option>
						{/each}
					{/if}
				</select>
			</div>
		</div>

		{#if selectedPreceptorId}
			<div class="mt-4 rounded bg-gray-50 p-4">
				<h3 class="font-semibold">Preceptor Schools:</h3>
				{#if preceptorSchools.data}
					<ul class="mt-2">
						{#each preceptorSchools.data as school (school._id)}
							<li class="text-sm">• {school.name}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</section>

	<!-- All Preceptors with Stats -->
	<section class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-xl font-bold">All Preceptors with Stats</h2>

		{#if preceptorsWithStats.isLoading}
			<p>Loading...</p>
		{:else if preceptorsWithStats.data}
			<div class="grid gap-4">
				{#each preceptorsWithStats.data as preceptor (preceptor._id)}
					<div class="rounded border p-4">
						<h3 class="font-semibold">{preceptor.fullName}</h3>
						{#if preceptor.email}<p class="text-sm text-gray-600">{preceptor.email}</p>{/if}
						{#if preceptor.credentials}<p class="text-sm text-gray-600">
								{preceptor.credentials}
							</p>{/if}
						<div class="mt-2 flex gap-4 text-sm">
							<span class="rounded bg-blue-100 px-2 py-1">Reviews: {preceptor.reviewCount}</span>
							<span class="rounded bg-green-100 px-2 py-1"
								>Avg Rating: {preceptor.averageRating.toFixed(1)}</span
							>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</main>
