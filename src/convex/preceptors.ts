import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const preceptors = await ctx.db.query('preceptors').collect();
		
		const schools = await ctx.db.query('schools').collect();
		const practiceSites = await ctx.db.query('practiceSites').collect();
		
		const schoolMap = new Map(schools.map(s => [s._id, s.name]));
		const practiceSiteMap = new Map(practiceSites.map(s => [s._id, s.name]));
		
		return preceptors.map(preceptor => ({
			...preceptor,
			schoolName: schoolMap.get(preceptor.schoolId) || 'Unknown School',
			siteName: practiceSiteMap.get(preceptor.siteId) || 'Unknown Site'
		}));
	}
});

export const getWithReviews = query({
	args: {},
	handler: async (ctx) => {
		const preceptors = await ctx.db.query('preceptors').collect();
		
		const schools = await ctx.db.query('schools').collect();
		const practiceSites = await ctx.db.query('practiceSites').collect();
		
		const reviews = await ctx.db.query('reviews').collect();
		
		const schoolMap = new Map(schools.map(s => [s._id, s.name]));
		const practiceSiteMap = new Map(practiceSites.map(s => [s._id, s.name]));
		
		const reviewsByPreceptor = new Map();
		reviews.forEach(review => {
			if (!reviewsByPreceptor.has(review.preceptorId)) {
				reviewsByPreceptor.set(review.preceptorId, []);
			}
			reviewsByPreceptor.get(review.preceptorId).push(review);
		});
		
		return preceptors.map(preceptor => {
			const preceptorReviews = reviewsByPreceptor.get(preceptor._id) || [];
			const totalReviews = preceptorReviews.length;
			const averageStarRating = totalReviews > 0 
				? preceptorReviews.reduce((sum: number, r: { starRating: number }) => sum + r.starRating, 0) / totalReviews 
				: 0;
			const recommendationRate = totalReviews > 0 
				? (preceptorReviews.filter((r: { wouldRecommend: boolean }) => r.wouldRecommend).length / totalReviews) * 100 
				: 0;
			
			return {
				...preceptor,
				schoolName: schoolMap.get(preceptor.schoolId) || 'Unknown School',
				siteName: practiceSiteMap.get(preceptor.siteId) || 'Unknown Site',
				totalReviews,
				averageStarRating,
				recommendationRate
			};
		});
	}
});

export const deletePreceptor = mutation({
	args: { id: v.id('preceptors') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	}
});

export const updatePreceptor = mutation({
	args: { 
		id: v.id('preceptors'),
		schoolId: v.optional(v.id('schools')),
		siteId: v.optional(v.id('practiceSites')),
		fullName: v.optional(v.string())
	},
	handler: async (ctx, { id, ...updates }) => {
		const cleanUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, value]) => value !== undefined)
		);
		if (Object.keys(cleanUpdates).length > 0) {
			await ctx.db.patch(id, cleanUpdates);
		}
	}
});
