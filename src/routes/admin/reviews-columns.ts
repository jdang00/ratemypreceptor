import type { ColumnDef } from '@tanstack/table-core';
import { renderSnippet } from '$lib/components/ui/data-table/index.js';
import { createRawSnippet } from 'svelte';

export type Review = {
	_id: string;
	preceptorId: string;
	rotationTypeId: string;
	preceptorName: string;
	rotationTypeName: string;
	ippeAppe: 'IPPE' | 'APPE';
	schoolYear: 'P1' | 'P2' | 'P3' | 'P4';
	priorExperience: 'None' | 'Little' | 'Moderate' | 'Significant';
	extraHours?: number;
	schedulingFlexibility: number;
	workload: number;
	expectations: number;
	mentorship: number;
	enjoyment: number;
	wouldRecommend: boolean;
	starRating: number;
	comment?: string;
	isOutlier: boolean;
	outlierReason?: string;
	updatedAt: number;
};

export const reviewsColumns: ColumnDef<Review>[] = [
	{
		accessorKey: 'preceptorName',
		header: 'Preceptor',
		cell: ({ row }) => {
			const nameSnippet = createRawSnippet<[string]>((getName) => {
				const name = getName();
				return {
					render: () => `<div class="font-medium text-sm">${name}</div>`
				};
			});
			return renderSnippet(nameSnippet, row.getValue('preceptorName'));
		}
	},
	{
		accessorKey: 'rotationTypeName',
		header: 'Rotation',
		cell: ({ row }) => {
			const rotationSnippet = createRawSnippet<[string]>((getRotation) => {
				const rotation = getRotation();
				return {
					render: () => `<div class="text-sm">${rotation}</div>`
				};
			});
			return renderSnippet(rotationSnippet, row.getValue('rotationTypeName'));
		}
	},
	{
		accessorKey: 'ippeAppe',
		header: 'Type',
		cell: ({ row }) => {
			const typeSnippet = createRawSnippet<[string]>((getType) => {
				const type = getType();
				const bgColor =
					type === 'IPPE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
				return {
					render: () =>
						`<span class="px-2 py-1 rounded-full text-xs font-medium ${bgColor}">${type}</span>`
				};
			});
			return renderSnippet(typeSnippet, row.getValue('ippeAppe'));
		}
	},
	{
		accessorKey: 'schoolYear',
		header: 'Year',
		cell: ({ row }) => {
			const yearSnippet = createRawSnippet<[string]>((getYear) => {
				const year = getYear();
				return {
					render: () => `<span class="px-2 py-1 rounded text-xs font-medium">${year}</span>`
				};
			});
			return renderSnippet(yearSnippet, row.getValue('schoolYear'));
		}
	},
	{
		accessorKey: 'starRating',
		header: 'Rating',
		cell: ({ row }) => {
			const ratingSnippet = createRawSnippet<[number]>((getRating) => {
				const rating = getRating();
				const stars = '⭐️'.repeat(Math.floor(rating));
				return {
					render: () => `<div class="flex items-center gap-1">
            <span class="text-yellow-500 text-sm">${stars}</span>
            <span class="text-xs">${rating.toFixed(1)}</span>
          </div>`
				};
			});
			return renderSnippet(ratingSnippet, row.getValue('starRating'));
		}
	},
	{
		accessorKey: 'wouldRecommend',
		header: 'Rec',
		cell: ({ row }) => {
			const recommendSnippet = createRawSnippet<[boolean]>((getRecommend) => {
				const recommend = getRecommend();
				const color = recommend ? 'text-green-600' : 'text-red-600';
				const text = recommend ? '✓' : '✗';
				return {
					render: () => `<span class="font-medium ${color} text-lg">${text}</span>`
				};
			});
			return renderSnippet(recommendSnippet, row.getValue('wouldRecommend'));
		}
	},
	{
		accessorKey: 'mentorship',
		header: 'Mentor',
		cell: ({ row }) => {
			const mentorshipSnippet = createRawSnippet<[number]>((getMentorship) => {
				const mentorship = getMentorship();
				return {
					render: () => `<div class="text-center text-sm">${mentorship.toFixed(1)}</div>`
				};
			});
			return renderSnippet(mentorshipSnippet, row.getValue('mentorship'));
		}
	},
	{
		accessorKey: 'enjoyment',
		header: 'Enjoy',
		cell: ({ row }) => {
			const enjoymentSnippet = createRawSnippet<[number]>((getEnjoyment) => {
				const enjoyment = getEnjoyment();
				return {
					render: () => `<div class="text-center text-sm">${enjoyment.toFixed(1)}</div>`
				};
			});
			return renderSnippet(enjoymentSnippet, row.getValue('enjoyment'));
		}
	},
	{
		accessorKey: 'workload',
		header: 'Load',
		cell: ({ row }) => {
			const workloadSnippet = createRawSnippet<[number]>((getWorkload) => {
				const workload = getWorkload();
				return {
					render: () => `<div class="text-center text-sm">${workload.toFixed(1)}</div>`
				};
			});
			return renderSnippet(workloadSnippet, row.getValue('workload'));
		}
	},
	{
		accessorKey: 'priorExperience',
		header: 'Exp',
		cell: ({ row }) => {
			const expSnippet = createRawSnippet<[string]>((getExp) => {
				const exp = getExp();
				const colorMap = {
					None: 'bg-red-100 text-red-800',
					Little: 'bg-orange-100 text-orange-800',
					Moderate: 'bg-yellow-100 text-yellow-800',
					Significant: 'bg-green-100 text-green-800'
				};
				const color = colorMap[exp as keyof typeof colorMap];
				const shortText = exp.charAt(0);
				return {
					render: () =>
						`<span class="px-2 py-1 rounded-full text-xs font-medium ${color}" title="${exp}">${shortText}</span>`
				};
			});
			return renderSnippet(expSnippet, row.getValue('priorExperience'));
		}
	},
	{
		accessorKey: 'isOutlier',
		header: 'Flag',
		cell: ({ row }) => {
			const outlierSnippet = createRawSnippet<[boolean]>((getOutlier) => {
				const isOutlier = getOutlier();
				if (isOutlier) {
					return {
						render: () =>
							`<span class="text-red-600 font-bold" title="Outlier Review">⚠</span>`
					};
				}
				return {
					render: () => `<span>-</span>`
				};
			});
			return renderSnippet(outlierSnippet, row.getValue('isOutlier'));
		}
	},
	{
		accessorKey: 'comment',
		header: 'Comment',
		cell: ({ row }) => {
			const commentSnippet = createRawSnippet<[string | undefined]>((getComment) => {
				const comment = getComment();
				if (!comment) return { render: () => `<div class="text-xs opacity-50">No comment</div>` };
				const truncated = comment.length > 50 ? comment.slice(0, 50) + '...' : comment;
				return {
					render: () => `<div class="text-xs max-w-xs" title="${comment.replace(/"/g, '&quot;')}">${truncated}</div>`
				};
			});
			return renderSnippet(commentSnippet, row.getValue('comment'));
		}
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			const actionsSnippet = createRawSnippet<[Review]>((getReview) => {
				const review = getReview();
				return {
					render: () => `
						<div class="flex items-center gap-2">
							<button 
								class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8 w-8 cursor-pointer"
								onclick="window.dispatchEvent(new CustomEvent('edit-review', { detail: ${JSON.stringify(review).replace(/"/g, '&quot;')} }))"
								title="Edit"
								type="button"
							>
								<svg class="h-4 w-4" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
							</button>
							<button 
								class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 w-8 cursor-pointer"
								onclick="window.dispatchEvent(new CustomEvent('delete-review', { detail: '${review._id}' }))"
								title="Delete"
								type="button"
							>
								<svg class="h-4 w-4" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
							</button>
						</div>
					`
				};
			});
			return renderSnippet(actionsSnippet, row.original);
		},
	},

	{
		accessorKey: 'updatedAt',
		header: 'Date',
		cell: ({ row }) => {
			const dateSnippet = createRawSnippet<[number]>((getDate) => {
				const timestamp = getDate();
				const date = new Date(timestamp);
				const formatted = date.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric'
				});
				return {
					render: () => `<div class="text-xs">${formatted}</div>`
				};
			});
			return renderSnippet(dateSnippet, row.getValue('updatedAt'));
		}
	}
];
