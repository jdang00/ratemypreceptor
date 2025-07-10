<script lang="ts" generics="T">
	import type { ColumnDef } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import {
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		type SortingState,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState
	} from '@tanstack/table-core';

	type DataTableProps<T> = {
		columns: ColumnDef<T, unknown>[];
		data: T[];
		searchPlaceholder?: string;
		searchColumn?: string;
	};

	let { 
		data, 
		columns, 
		searchPlaceholder = 'Search...', 
		searchColumn = 'name' 
	}: DataTableProps<T> = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});

	let ippeAppeFilter = $state('');
	let wouldRecommendFilter = $state('');

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		}
	});

	const ippeAppeTriggerContent = $derived(
		ippeAppeFilter === '' ? 'All Types' :
		ippeAppeFilter === 'IPPE' ? 'IPPE' : 'APPE'
	);

	const wouldRecommendTriggerContent = $derived(
		wouldRecommendFilter === '' ? 'All Recommendations' :
		wouldRecommendFilter === 'true' ? 'Would Recommend' : 'Would Not Recommend'
	);

	function handleIppeAppeFilterChange(value: string) {
		ippeAppeFilter = value;
		table.getColumn('ippeAppe')?.setFilterValue(value === '' ? '' : value);
	}

	function handleWouldRecommendFilterChange(value: string) {
		wouldRecommendFilter = value;
		table.getColumn('wouldRecommend')?.setFilterValue(value === '' ? '' : value === 'true');
	}

	let pageSize = $state(table.getState().pagination.pageSize.toString());

	function handlePageSizeChange(value: string) {
		const newPageSize = Number(value);
		pageSize = value;
		table.setPageSize(newPageSize);
	}

	const pageSizeTriggerContent = $derived(`${pageSize} per page`);
</script>

<div class="w-full space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-2">
			<Input
				placeholder="Search comments..."
				value={(table.getColumn('comment')?.getFilterValue() as string) ?? ''}
				oninput={(e) => table.getColumn('comment')?.setFilterValue(e.currentTarget.value)}
				class="max-w-sm"
			/>

			<Select.Root type="single" bind:value={ippeAppeFilter} onValueChange={handleIppeAppeFilterChange}>
				<Select.Trigger class="w-[180px]">
					{ippeAppeTriggerContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="" label="All Types">All Types</Select.Item>
					<Select.Item value="IPPE" label="IPPE">IPPE</Select.Item>
					<Select.Item value="APPE" label="APPE">APPE</Select.Item>
				</Select.Content>
			</Select.Root>

			<Select.Root type="single" bind:value={wouldRecommendFilter} onValueChange={handleWouldRecommendFilterChange}>
				<Select.Trigger class="w-[200px]">
					{wouldRecommendTriggerContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="" label="All Recommendations">All Recommendations</Select.Item>
					<Select.Item value="true" label="Would Recommend">Would Recommend</Select.Item>
					<Select.Item value="false" label="Would Not Recommend">Would Not Recommend</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<div class="text-sm">
			{table.getFilteredRowModel().rows.length} review(s)
		</div>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class="font-medium">
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row class="">
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell class="py-3">
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">
							No records found.
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="flex items-center justify-between flex-wrap gap-2 py-4">
		<div class="text-sm">
			Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min(
				(table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
				table.getFilteredRowModel().rows.length
			)} of {table.getFilteredRowModel().rows.length} review(s)
		</div>
		<div class="flex items-center flex-wrap gap-2">
			<Select.Root type="single" bind:value={pageSize} onValueChange={handlePageSizeChange}>
				<Select.Trigger class="w-[120px]">
					{pageSizeTriggerContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="5" label="5 per page">5 per page</Select.Item>
					<Select.Item value="10" label="10 per page">10 per page</Select.Item>
					<Select.Item value="20" label="20 per page">20 per page</Select.Item>
					<Select.Item value="50" label="50 per page">50 per page</Select.Item>
				</Select.Content>
			</Select.Root>
			<Button variant="outline" size="sm" onclick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
				««
			</Button>
			<Button variant="outline" size="sm" onclick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
				Previous
			</Button>
			<span class="text-sm">
				Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
			</span>
			<Button variant="outline" size="sm" onclick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
				Next
			</Button>
			<Button variant="outline" size="sm" onclick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
				»»
			</Button>
		</div>
	</div>
</div>
