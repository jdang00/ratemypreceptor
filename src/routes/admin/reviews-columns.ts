import type { ColumnDef } from '@tanstack/table-core';

export type Review = {
	_id: string;
	preceptorId: string;
	rotationTypeId: string;
	experienceTypeId: string;
	preceptorName: string;
	rotationTypeName: string;
	experienceTypeName: string;
	schoolYear: string;
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
	upvoteCount: number;
	downvoteCount: number;
	netScore: number;
	isOutlier: boolean;
	outlierReason?: string;
	createdAt: number;
	updatedAt: number;
};

export const reviewsColumns: ColumnDef<Review>[] = [
	{
		accessorKey: 'preceptorName',
		header: 'Preceptor',
	},
	{
		accessorKey: 'rotationTypeName',
		header: 'Rotation',
	},
	{
		accessorKey: 'experienceTypeName',
		header: 'Experience',
	},
	{
		accessorKey: 'schoolYear',
		header: 'Year',
	},
	{
		accessorKey: 'starRating',
		header: 'Rating',
		cell: ({ row }) => `${row.getValue('starRating')}/5`,
	},
	{
		accessorKey: 'wouldRecommend',
		header: 'Recommend',
		cell: ({ row }) => row.getValue('wouldRecommend') ? 'Yes' : 'No',
	},
	{
		accessorKey: 'netScore',
		header: 'Score',
	},
	{
		accessorKey: 'comment',
		header: 'Comment',
		cell: ({ row }) => {
			const comment = row.getValue('comment') as string | undefined;
			if (!comment) return '';
			return comment.length > 50 ? comment.slice(0, 50) + '...' : comment;
		},
	},
	{
		accessorKey: 'createdAt',
		header: 'Created',
		cell: ({ row }) => {
			const timestamp = row.getValue('createdAt') as number;
			const date = new Date(timestamp);
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		},
	},
];
