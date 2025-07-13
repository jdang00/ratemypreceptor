import type { ColumnDef } from '@tanstack/table-core';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';
import { createRawSnippet } from 'svelte';

export type ProgramType = {
	_id: string;
	name: string;
	abbreviation: string;
	yearLabels: string[];
	_creationTime: number;
};

export const programTypesColumns: ColumnDef<ProgramType>[] = [
	{
		accessorKey: 'name',
		header: 'Program Name',
		cell: ({ row }) => {
			const nameSnippet = createRawSnippet<[string]>((getName) => {
				const name = getName();
				return {
					render: () => `<div class="font-medium">${name}</div>`
				};
			});
			return renderSnippet(nameSnippet, row.getValue('name'));
		}
	},
	{
		accessorKey: 'abbreviation',
		header: 'Abbreviation',
		cell: ({ row }) => {
			const abbrevSnippet = createRawSnippet<[string]>((getAbbrev) => {
				const abbrev = getAbbrev();
				return {
					render: () => `<div class="text-sm">${abbrev}</div>`
				};
			});
			return renderSnippet(abbrevSnippet, row.getValue('abbreviation'));
		}
	},
	{
		accessorKey: 'yearLabels',
		header: 'Year Labels',
		cell: ({ row }) => {
			const yearLabelsSnippet = createRawSnippet<[string[]]>((getYearLabels) => {
				const yearLabels = getYearLabels();
				const labelsText = yearLabels.join(', ');
				return {
					render: () => `<div class="text-sm">${labelsText}</div>`
				};
			});
			return renderSnippet(yearLabelsSnippet, row.getValue('yearLabels'));
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
					render: () => `<div class="text-xs">${formatted}</div>`
				};
			});
			return renderSnippet(dateSnippet, row.getValue('_creationTime'));
		}
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			const actionsSnippet = createRawSnippet<[ProgramType]>((getProgramType) => {
				const programType = getProgramType();
				return {
					render: () => `
						<div class="flex items-center gap-2">
							<button 
								class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
								data-edit-program-type='${JSON.stringify(programType)}'
								title="Edit"
								type="button"
							>
								<svg class="h-4 w-4" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
							</button>
							<button 
								class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-destructive/10 hover:text-destructive h-8 w-8"
								data-delete-program-type="${programType._id}"
								title="Delete"
								type="button"
							>
								<svg class="h-4 w-4 text-destructive" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
							</button>
						</div>
					`
				};
			});
			return renderSnippet(actionsSnippet, row.original);
		}
	}
];
