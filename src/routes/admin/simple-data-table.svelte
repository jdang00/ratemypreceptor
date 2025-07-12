<script lang="ts" generics="T">
	import type { ColumnDef } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
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

	let pageSizeTriggerContent = $derived(`${pagination.pageSize} per page`);

	function handlePageSizeChange(value: string) {
		const newPageSize = Number(value);
		table.setPageSize(newPageSize);
	}

	let selectedPageSize = $state(pagination.pageSize.toString());

	let count = $derived(table.getFilteredRowModel().rows.length);
	let perPage = $derived(pagination.pageSize);
	let currentPage = $derived(pagination.pageIndex + 1);
	let siblingCount = 1;
</script>

<div class="w-full space-y-4">
	<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
		<div class="flex w-full items-center space-x-2">
			<Input
				placeholder={searchPlaceholder}
				value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
				oninput={(e) => table.getColumn(searchColumn)?.setFilterValue(e.currentTarget.value)}
				class="w-full text-sm sm:max-w-sm"
			/>
		</div>
		<div class="text-muted-foreground text-sm">
			{table.getFilteredRowModel().rows.length} record(s)
		</div>
	</div>

	<div class="overflow-x-auto rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class="text-xs font-medium sm:text-sm">
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
							<Table.Cell class="py-2 text-xs sm:py-3 sm:text-sm">
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center text-sm">
							No records found.
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
		<div class="text-muted-foreground order-2 text-sm sm:order-1">
			Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min(
				(table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
				table.getFilteredRowModel().rows.length
			)} of {table.getFilteredRowModel().rows.length} row(s)
		</div>
		<div class="order-1 flex items-center space-x-2 sm:order-2">
			<Select.Root type="single" value={selectedPageSize} onValueChange={handlePageSizeChange}>
				<Select.Trigger class="w-[100px] text-xs sm:w-[120px] sm:text-sm">
					{pageSizeTriggerContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="5" label="5 per page">5 per page</Select.Item>
					<Select.Item value="10" label="10 per page">10 per page</Select.Item>
					<Select.Item value="20" label="20 per page">20 per page</Select.Item>
					<Select.Item value="50" label="50 per page">50 per page</Select.Item>
				</Select.Content>
			</Select.Root>
			<Pagination.Root {count} {perPage} {siblingCount}>
				{#snippet children({ pages, currentPage })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton onclick={() => table.previousPage()}>
								<ChevronLeft class="h-4 w-4" />
								<span class="hidden sm:block">Previous</span>
							</Pagination.PrevButton>
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === "ellipsis"}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link 
										{page} 
										isActive={currentPage === page.value}
										onclick={() => table.setPageIndex(page.value - 1)}
									>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton onclick={() => table.nextPage()}>
								<span class="hidden sm:block">Next</span>
								<ChevronRight class="h-4 w-4" />
							</Pagination.NextButton>
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
	</div>
</div>
