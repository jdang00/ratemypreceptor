import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithoutChild<T> = T extends { child?: unknown } ? Omit<T, "child"> : T;
export type WithoutChildren<T> = T extends { children?: unknown } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export interface ReviewAggregation {
	averageStarRating: number;
	totalReviews: number;
	recommendationRate: number;
	averageSchedulingFlexibility: number;
	averageWorkload: number;
	averageExpectations: number;
	averageMentorship: number;
	averageEnjoyment: number;
}

export function aggregateReviews(reviews: Array<{
	starRating: number;
	wouldRecommend: boolean;
	schedulingFlexibility: number;
	workload: number;
	expectations: number;
	mentorship: number;
	enjoyment: number;
}>): ReviewAggregation {
	if (reviews.length === 0) {
		return {
			averageStarRating: 0,
			totalReviews: 0,
			recommendationRate: 0,
			averageSchedulingFlexibility: 0,
			averageWorkload: 0,
			averageExpectations: 0,
			averageMentorship: 0,
			averageEnjoyment: 0
		};
	}

	const totalReviews = reviews.length;
	const recommendedCount = reviews.filter(r => r.wouldRecommend).length;

	return {
		averageStarRating: reviews.reduce((sum, r) => sum + r.starRating, 0) / totalReviews,
		totalReviews,
		recommendationRate: (recommendedCount / totalReviews) * 100,
		averageSchedulingFlexibility: reviews.reduce((sum, r) => sum + r.schedulingFlexibility, 0) / totalReviews,
		averageWorkload: reviews.reduce((sum, r) => sum + r.workload, 0) / totalReviews,
		averageExpectations: reviews.reduce((sum, r) => sum + r.expectations, 0) / totalReviews,
		averageMentorship: reviews.reduce((sum, r) => sum + r.mentorship, 0) / totalReviews,
		averageEnjoyment: reviews.reduce((sum, r) => sum + r.enjoyment, 0) / totalReviews
	};
}

export function formatName(fullName: string, includeCredentials: boolean = true): string {
	if (!fullName) return '';
	let name = fullName;
	if (!includeCredentials) {
		name = name
			.replace(/,\s*PharmD\b/gi, '')
			.replace(/\s+PharmD\b/gi, '')
			.replace(/,\s*Ph\.D\.\b/gi, '')
			.replace(/\s+Ph\.D\.\b/gi, '')
			.replace(/,\s*MD\b/gi, '')
			.replace(/\s+MD\b/gi, '')
			.replace(/,\s*DO\b/gi, '')
			.replace(/\s+DO\b/gi, '')
			.replace(/,\s*OD\b/gi, '')
			.replace(/\s+OD\b/gi, '')
			.replace(/,\s*RN\b/gi, '')
			.replace(/\s+RN\b/gi, '')
			.replace(/,\s*NP\b/gi, '')
			.replace(/\s+NP\b/gi, '')
			.replace(/,\s*PA\b/gi, '')
			.replace(/\s+PA\b/gi, '')
			.replace(/,\s*BCPS\b/gi, '')
			.replace(/\s+BCPS\b/gi, '')
			.replace(/,\s*BCACP\b/gi, '')
			.replace(/\s+BCACP\b/gi, '')
			.replace(/,\s*BCGP\b/gi, '')
			.replace(/\s+BCGP\b/gi, '')
			.replace(/,\s*BCPP\b/gi, '')
			.replace(/\s+BCPP\b/gi, '')
			.replace(/,\s*FASHP\b/gi, '')
			.replace(/\s+FASHP\b/gi, '')
			.replace(/,\s*FCCP\b/gi, '')
			.replace(/\s+FCCP\b/gi, '')
			.replace(/,\s*FCCM\b/gi, '')
			.replace(/\s+FCCM\b/gi, '');
	}
	return name.replace(/\s+/g, ' ').replace(/,\s*$/, '').trim();
}

export function extractCredentials(fullName: string): { name: string; credentials: string } {
	if (!fullName) return { name: '', credentials: '' };
	const credentials = fullName.match(/\b(PharmD|Ph\.D\.|MD|DO|OD|RN|NP|PA|BCPS|BCACP|BCGP|BCPP|FASHP|FCCP|FCCM)\b/gi);
	let nameWithoutCredentials = formatName(fullName, false);
	nameWithoutCredentials = nameWithoutCredentials.replace(/,+\s*$/, '').trim();
	return {
		name: nameWithoutCredentials,
		credentials: credentials ? credentials.join(' ') : ''
	};
}

export function formatNameWithCredentials(fullName: string): { displayName: string; credentials: string } {
	const { name, credentials } = extractCredentials(fullName);
	return {
		displayName: name,
		credentials: credentials
	};
}

export const TITLES = [
	{ value: '', label: 'No Title' },
	{ value: 'Dr.', label: 'Dr.' },
	{ value: 'Prof.', label: 'Prof.' },
	{ value: 'Mr.', label: 'Mr.' },
	{ value: 'Mrs.', label: 'Mrs.' },
	{ value: 'Ms.', label: 'Ms.' }
];

export const DEGREES = [
	{ value: 'PharmD', label: 'PharmD' },
	{ value: 'Ph.D.', label: 'Ph.D.' },
	{ value: 'MD', label: 'MD' },
	{ value: 'DO', label: 'DO' },
	{ value: 'OD', label: 'OD' },
	{ value: 'RN', label: 'RN' },
	{ value: 'NP', label: 'NP' },
	{ value: 'PA', label: 'PA' },
	{ value: 'BCPS', label: 'BCPS' },
	{ value: 'BCACP', label: 'BCACP' },
	{ value: 'BCGP', label: 'BCGP' },
	{ value: 'BCPP', label: 'BCPP' },
	{ value: 'FASHP', label: 'FASHP' },
	{ value: 'FCCP', label: 'FCCP' },
	{ value: 'FCCM', label: 'FCCM' }
];

export function formatFullName(title: string, firstName: string, lastName: string, degree: string): string {
	const parts = [];
	
	if (title) parts.push(title);
	if (firstName) parts.push(firstName);
	if (lastName) parts.push(lastName);
	if (degree) parts.push(degree);
	
	return parts.join(' ');
}

export function toTitleCase(str: string): string {
	if (!str) return '';

	const result = str.replace(/([A-Z])/g, ' $1');
	return result.charAt(0).toUpperCase() + result.slice(1);
}
