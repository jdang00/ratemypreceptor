<script lang="ts">
	import { Input } from './ui/input/index.js';
	import { Search } from '@lucide/svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import type { School } from '../../routes/admin/schools-columns.js';
	import type { PracticeSite } from '../../routes/admin/practice-sites-columns.js';
	import type { ProgramType } from '../../routes/admin/program-types-columns.js';
	import type { RotationType } from '../../routes/admin/rotation-types-columns.js';
	import PreceptorResults from './PreceptorResults.svelte';

	const { placeholder = 'Search preceptors, schools, sites, or programs...' } = $props();

	let searchTerm = $state('');

	const preceptorsQuery = useQuery(api.preceptors.getWithReviews, {});
	const schoolsQuery = useQuery(api.schools.get, {});
	const sitesQuery = useQuery(api.practiceSites.get, {});
	const programsQuery = useQuery(api.programTypes.get, {});
	const rotationsQuery = useQuery(api.rotationTypes.get, {});

	const loading = $derived(
		preceptorsQuery.isLoading ||
			schoolsQuery.isLoading ||
			sitesQuery.isLoading ||
			programsQuery.isLoading ||
			rotationsQuery.isLoading
	);

	type PreceptorWithReviews = {
		_id: string;
		fullName: string;
		reviews: any[];
		reviewCount: number;
		averageRating: number;
		schoolNames: string[];
		siteNames: string[];
		programTypeNames: string[];
		_creationTime: number;
	};

	type Result =
		| ({ type: 'preceptor' } & PreceptorWithReviews)
		| ({ type: 'school' } & School)
		| ({ type: 'site' } & PracticeSite)
		| ({ type: 'program' } & ProgramType)
		| ({ type: 'rotation' } & RotationType);

	const results = $derived.by(() => {
		if (!searchTerm.trim()) return [];
		const term = searchTerm.toLowerCase();

		const preceptors = (preceptorsQuery.data ?? [])
			.filter((p: PreceptorWithReviews) => p.fullName?.toLowerCase().includes(term))
			.map((p: PreceptorWithReviews) => ({ type: 'preceptor' as const, ...p }));

		const schools = (schoolsQuery.data ?? [])
			.filter((s: School) => s.name?.toLowerCase().includes(term))
			.map((s: School) => ({ type: 'school' as const, ...s }));

		const sites = (sitesQuery.data ?? [])
			.filter(
				(site: PracticeSite) =>
					site.name?.toLowerCase().includes(term) ||
					site.city?.toLowerCase().includes(term) ||
					site.state?.toLowerCase().includes(term)
			)
			.map((site: PracticeSite) => ({ type: 'site' as const, ...site }));

		const programs = (programsQuery.data ?? [])
			.filter(
				(p: ProgramType) =>
					p.name?.toLowerCase().includes(term) || p.abbreviation?.toLowerCase().includes(term)
			)
			.map((p: ProgramType) => ({ type: 'program' as const, ...p }));

		const rotations = (rotationsQuery.data ?? [])
			.filter((r: RotationType) => r.name?.toLowerCase().includes(term))
			.map((r: RotationType) => ({ type: 'rotation' as const, ...r }));

		return [...preceptors, ...schools, ...sites, ...programs, ...rotations];
	});
</script>

<div class="relative w-full max-w-md mx-auto sm:max-w-full">
	<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
	<Input bind:value={searchTerm} {placeholder} class="h-12 pl-10 mt-8 w-full" autocomplete="off" />
</div>

{#if searchTerm}
	{#if loading}
		<div class="text-muted-foreground mt-4">Loading...</div>
	{:else if results.length === 0}
		<div class="text-muted-foreground mt-4">No results found.</div>
	{:else}
		<div class="mt-4 space-y-6">
			{#if results.filter((r: Result) => r.type === 'preceptor').length}
				<div>
					<div class="mb-2 font-semibold">Preceptors</div>
					<div class="space-y-2">
						{#each results.filter((r: Result) => r.type === 'preceptor') as p}
							<PreceptorResults
								fullName={p.fullName}
								schoolNames={p.schoolNames || []}
								programTypeNames={p.programTypeNames || []}
								siteNames={p.siteNames || []}
								totalReviews={p.reviewCount}
								averageStarRating={p.averageRating}
							/>
						{/each}
					</div>
				</div>
			{/if}
			{#if results.filter((r: Result) => r.type === 'school').length}
				<div>
					<div class="mb-2 font-semibold">Schools</div>
					<ul class="space-y-1">
						{#each results.filter((r: Result) => r.type === 'school') as s}
							<li class="rounded border px-3 py-2">{s.name}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if results.filter((r: Result) => r.type === 'site').length}
				<div>
					<div class="mb-2 font-semibold">Practice Sites</div>
					<ul class="space-y-1">
						{#each results.filter((r: Result) => r.type === 'site') as site}
							<li class="rounded border px-3 py-2">
								{site.name}
								<span class="text-muted-foreground text-xs">{site.city}, {site.state}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if results.filter((r: Result) => r.type === 'program').length}
				<div>
					<div class="mb-2 font-semibold">Programs</div>
					<ul class="space-y-1">
						{#each results.filter((r: Result) => r.type === 'program') as prog}
							<li class="rounded border px-3 py-2">
								{prog.name} <span class="text-muted-foreground text-xs">{prog.abbreviation}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if results.filter((r: Result) => r.type === 'rotation').length}
				<div>
					<div class="mb-2 font-semibold">Rotations</div>
					<ul class="space-y-1">
						{#each results.filter((r: Result) => r.type === 'rotation') as rot}
							<li class="rounded border px-3 py-2">{rot.name}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
{/if}
