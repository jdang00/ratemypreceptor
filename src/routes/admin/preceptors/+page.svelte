<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import SimpleDataTable from '../simple-data-table.svelte';
	import AddPreceptorModal from '$lib/components/AddPreceptorModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Plus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { ColumnDef } from '@tanstack/table-core';
	import { renderSnippet } from '$lib/components/ui/data-table/index.js';
	import { createRawSnippet } from 'svelte';

	// Query for preceptors with stats (review count and average rating)
	const preceptorsQuery = useQuery(api.preceptors.getWithStats, {});

	let preceptorsData = $derived((preceptorsQuery.data ?? []) as any[]);
	let preceptorsLoading = $derived(preceptorsQuery.isLoading);
	let preceptorsError = $derived(preceptorsQuery.error);

	// Modal state
	let addPreceptorModalOpen = $state(false);

	// Define columns for preceptor list with review stats
	const preceptorColumns: ColumnDef<any>[] = [
		{
			accessorKey: 'fullName',
			header: 'Preceptor Name',
			cell: ({ row }) => {
				const nameSnippet = createRawSnippet<[string]>((getName) => {
					const name = getName();
					return {
						render: () => `<div class="font-medium">${name}</div>`
					};
				});
				return renderSnippet(nameSnippet, row.getValue('fullName'));
			}
		},
		{
			accessorKey: 'reviewCount',
			header: 'Reviews',
			cell: ({ row }) => {
				const reviewSnippet = createRawSnippet<[number]>((getCount) => {
					const count = getCount();
					return {
						render: () => `<div class="text-sm font-medium">${count}</div>`
					};
				});
				return renderSnippet(reviewSnippet, row.getValue('reviewCount'));
			}
		},
		{
			accessorKey: 'averageRating',
			header: 'Avg Rating',
			cell: ({ row }) => {
				const ratingSnippet = createRawSnippet<[number]>((getRating) => {
					const rating = getRating();
					const formatted = rating > 0 ? rating.toFixed(1) : 'N/A';
					return {
						render: () => `<div class="text-sm">${formatted}</div>`
					};
				});
				return renderSnippet(ratingSnippet, row.getValue('averageRating'));
			}
		},
		{
			accessorKey: 'email',
			header: 'Email',
			cell: ({ row }) => {
				const emailSnippet = createRawSnippet<[string | undefined]>((getEmail) => {
					const email = getEmail();
					return {
						render: () => `<div class="text-sm text-muted-foreground">${email || 'N/A'}</div>`
					};
				});
				return renderSnippet(emailSnippet, row.getValue('email'));
			}
		},
		{
			accessorKey: 'credentials',
			header: 'Credentials',
			cell: ({ row }) => {
				const credentialsSnippet = createRawSnippet<[string | undefined]>((getCredentials) => {
					const credentials = getCredentials();
					return {
						render: () => `<div class="text-sm text-muted-foreground">${credentials || 'N/A'}</div>`
					};
				});
				return renderSnippet(credentialsSnippet, row.getValue('credentials'));
			}
		},
		{
			accessorKey: '_creationTime',
			header: 'Created',
			cell: ({ row }) => {
				const dateSnippet = createRawSnippet<[number]>((getDate) => {
					const timestamp = getDate();
					const date = new Date(timestamp);
					const formatted = date.toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric'
					});
					return {
						render: () => `<div class="text-xs text-muted-foreground">${formatted}</div>`
					};
				});
				return renderSnippet(dateSnippet, row.getValue('_creationTime'));
			}
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				const actionsSnippet = createRawSnippet<[any]>((getPreceptor) => {
					const preceptor = getPreceptor();
					return {
						render: () => `
							<div class="flex items-center gap-2">
								<a
									href="/admin/preceptors/${preceptor._id}"
									class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3"
									title="View Details"
								>
									View
								</a>
							</div>
						`
					};
				});
				return renderSnippet(actionsSnippet, row.original);
			}
		}
	];

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
		closeAddPreceptorModal();
	}
</script>

<div class="min-h-screen p-3 sm:p-6">
	<div class="mx-auto">
		<div class="mb-6 sm:mb-8">
			<h1 class="text-2xl font-bold sm:text-3xl">Preceptor Management</h1>
			<p class="mt-2 text-sm sm:text-base">Manage all preceptors and their information</p>
		</div>

		<div class="rounded-lg border bg-card shadow">
			<div class="p-3 sm:p-6">
				<div
					class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between"
				>
					<div>
						<h2 class="text-lg font-semibold sm:text-xl">All Preceptors</h2>
						<p class="text-sm sm:text-base">View and manage preceptor profiles</p>
					</div>

					<div class="flex flex-row gap-2">
						<Button onclick={openAddPreceptorModal} class="w-full sm:w-auto">
							<Plus class="h-4 w-4" />
							<span class="hidden sm:inline">Add New Preceptor</span>
							<span class="sm:hidden">Add</span>
						</Button>
					</div>
				</div>

				{#if preceptorsError}
					<div class="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 sm:p-4">
						<p class="text-sm text-destructive-foreground">{preceptorsError}</p>
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
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<SimpleDataTable
						data={preceptorsData}
						columns={preceptorColumns}
						searchPlaceholder="Search preceptors by name..."
						searchColumn="fullName"
					/>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Add Preceptor Modal -->
<AddPreceptorModal
	isOpen={addPreceptorModalOpen}
	onClose={closeAddPreceptorModal}
	onSuccess={handleAddPreceptorSuccess}
	redirectToDetail={true}
/>
