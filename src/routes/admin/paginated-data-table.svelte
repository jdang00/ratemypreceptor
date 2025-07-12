<script lang="ts" generics="T">
	import type { ColumnDef } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import {
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		type SortingState,
		type ColumnFiltersState
	} from '@tanstack/table-core';

	type PaginatedDataTableProps<T> = {
		columns: ColumnDef<T, unknown>[];
		data: T[];
		searchPlaceholder?: string;
		searchColumn?: string;
		currentPage: number;
		totalPages: number;
		pageSize: number;
		totalCount: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		onPageChange: (direction: 'next' | 'prev') => void;
		onPageSizeChange: (pageSize: number) => void;
		onSearchChange: (search: string) => void;
		isLoading?: boolean;
	};

	let {
		data,
		columns,
		searchPlaceholder = 'Search...',
		searchColumn = 'name',
		currentPage,
		totalPages,
		pageSize,
		totalCount,
		hasNextPage,
		hasPreviousPage,
		onPageChange,
		onPageSizeChange,
		onSearchChange,
		isLoading = false
	}: PaginatedDataTableProps<T> = $props();

	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let searchValue = $state('');

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		state: {
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
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
		manualPagination: true,
		pageCount: totalPages
	});

	let selectedPageSize = $state(pageSize.toString());
	let pageSizeTriggerContent = $derived(`${pageSize} per page`);

	function handlePageSizeChange(value: string) {
		const newPageSize = Number(value);
		selectedPageSize = value;
		onPageSizeChange(newPageSize);
	}

	function handleSearchInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		searchValue = target.value;
		onSearchChange(searchValue);
	}

	function handlePreviousPage() {
		if (hasPreviousPage) {
			onPageChange('prev');
		}
	}

	function handleNextPage() {
		if (hasNextPage) {
			onPageChange('next');
		}
	}



	let startItem = $derived((currentPage - 1) * pageSize + 1);
	let endItem = $derived(Math.min(currentPage * pageSize, totalCount));
</script>

<div class="w-full space-y-4">
	<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
		<div class="flex w-full items-center space-x-2">
			<Input
				placeholder="Search disabled for pagination"
				value={searchValue}
				oninput={handleSearchInput}
				class="w-full text-sm sm:max-w-sm"
				disabled={true}
			/>
		</div>
		<div class="text-muted-foreground text-sm">
			{totalCount} record(s)
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
				{#if isLoading}
					{#each Array(pageSize) as _, i}
						<Table.Row>
							{#each columns as _, j}
								<Table.Cell class="py-2 text-xs sm:py-3 sm:text-sm">
									<div class="h-4 bg-gray-200 rounded animate-pulse"></div>
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				{:else}
					{#each table.getRowModel().rows as row (row.id)}
						<Table.Row>
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
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
		<div class="text-muted-foreground order-2 text-sm sm:order-1">
			{#if totalCount > 0}
				Showing {startItem} to {endItem} of {totalCount} row(s)
			{:else}
				No records found
			{/if}
		</div>
		<div class="order-1 flex items-center space-x-2 sm:order-2">
			<Select.Root type="single" value={selectedPageSize} onValueChange={handlePageSizeChange}>
				<Select.Trigger class="w-[100px] text-xs sm:w-[120px] sm:text-sm" disabled={isLoading}>
					{pageSizeTriggerContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="5" label="5 per page">5 per page</Select.Item>
					<Select.Item value="10" label="10 per page">10 per page</Select.Item>
					<Select.Item value="20" label="20 per page">20 per page</Select.Item>
					<Select.Item value="50" label="50 per page">50 per page</Select.Item>
				</Select.Content>
			</Select.Root>
			
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					size="sm"
					onclick={handlePreviousPage}
					disabled={!hasPreviousPage || isLoading}
				>
					<ChevronLeft class="h-4 w-4" />
					<span class="hidden sm:block">Previous</span>
				</Button>
				
				<span class="text-sm text-muted-foreground">
					Page {currentPage}
				</span>
				
				<Button
					variant="outline"
					size="sm"
					onclick={handleNextPage}
					disabled={!hasNextPage || isLoading}
				>
					<span class="hidden sm:block">Next</span>
					<ChevronRight class="h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
</div> 