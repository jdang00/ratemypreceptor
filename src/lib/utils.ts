import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

// Review aggregation helper functions
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

// Name formatting helper functions
export function formatName(fullName: string, includeCredentials: boolean = true): string {
	if (!fullName) return '';
	// Remove common credentials if not including them
	let name = fullName;
	if (!includeCredentials) {
		name = name
			.replace(/\s*PharmD\s*/gi, ' ')
			.replace(/\s*Ph\.D\.\s*/gi, ' ')
			.replace(/\s*MD\s*/gi, ' ')
			.replace(/\s*DO\s*/gi, ' ')
			.replace(/\s*RN\s*/gi, ' ')
			.replace(/\s*NP\s*/gi, ' ')
			.replace(/\s*PA\s*/gi, ' ')
			.replace(/\s*BCPS\s*/gi, ' ')
			.replace(/\s*BCACP\s*/gi, ' ')
			.replace(/\s*BCGP\s*/gi, ' ')
			.replace(/\s*BCPP\s*/gi, ' ')
			.replace(/\s*FASHP\s*/gi, ' ')
			.replace(/\s*FCCP\s*/gi, ' ')
			.replace(/\s*FCCM\s*/gi, ' ');
	}
	// Remove any trailing commas and whitespace
	return name.replace(/,+\s*$/, '').trim();
}

export function extractCredentials(fullName: string): { name: string; credentials: string } {
	if (!fullName) return { name: '', credentials: '' };
	const credentials = fullName.match(/\b(PharmD|Ph\.D\.|MD|DO|RN|NP|PA|BCPS|BCACP|BCGP|BCPP|FASHP|FCCP|FCCM)\b/gi);
	let nameWithoutCredentials = formatName(fullName, false);
	// Remove any trailing commas and whitespace
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
