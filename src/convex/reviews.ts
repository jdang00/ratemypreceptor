import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const reviews = await ctx.db.query('reviews').collect();
		
		const preceptors = await ctx.db.query('preceptors').collect();
		const rotationTypes = await ctx.db.query('rotationTypes').collect();
		
		const preceptorMap = new Map(preceptors.map(p => [p._id, p.fullName]));
		const rotationTypeMap = new Map(rotationTypes.map(r => [r._id, r.name]));
		
		return reviews.map(review => ({
			...review,
			preceptorName: preceptorMap.get(review.preceptorId) || 'Unknown Preceptor',
			rotationTypeName: rotationTypeMap.get(review.rotationTypeId) || 'Unknown Rotation'
		}));
	}
});

export const insertReview = mutation({
	args: {
		preceptorId: v.id('preceptors'),
		rotationTypeId: v.id('rotationTypes'),
		ippeAppe: v.union(v.literal('IPPE'), v.literal('APPE')),
		schoolYear: v.union(v.literal('P1'), v.literal('P2'), v.literal('P3'), v.literal('P4')),
		priorExperience: v.union(
			v.literal('None'),
			v.literal('Little'),
			v.literal('Moderate'),
			v.literal('Significant')
		),
		extraHours: v.optional(v.number()),
		schedulingFlexibility: v.number(),
		workload: v.number(),
		expectations: v.number(),
		mentorship: v.number(),
		enjoyment: v.number(),
		wouldRecommend: v.boolean(),
		starRating: v.number(),
		comment: v.optional(v.string()),
		isOutlier: v.boolean(),
		outlierReason: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const reviewData = {
			...args,
			updatedAt: Date.now()
		};
		await ctx.db.insert('reviews', reviewData);
	}
});

export const deleteReview = mutation({
	args: { id: v.id('reviews') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	}
});

export const updateReview = mutation({
	args: { 
		id: v.id('reviews'),
		preceptorId: v.optional(v.id('preceptors')),
		rotationTypeId: v.optional(v.id('rotationTypes')),
		ippeAppe: v.optional(v.union(v.literal('IPPE'), v.literal('APPE'))),
		schoolYear: v.optional(v.union(v.literal('P1'), v.literal('P2'), v.literal('P3'), v.literal('P4'))),
		priorExperience: v.optional(v.union(
			v.literal('None'),
			v.literal('Little'),
			v.literal('Moderate'),
			v.literal('Significant')
		)),
		extraHours: v.optional(v.number()),
		schedulingFlexibility: v.optional(v.number()),
		workload: v.optional(v.number()),
		expectations: v.optional(v.number()),
		mentorship: v.optional(v.number()),
		enjoyment: v.optional(v.number()),
		wouldRecommend: v.optional(v.boolean()),
		starRating: v.optional(v.number()),
		comment: v.optional(v.string()),
		isOutlier: v.optional(v.boolean()),
		outlierReason: v.optional(v.string())
	},
	handler: async (ctx, { id, ...updates }) => {
		const cleanUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, value]) => value !== undefined)
		);
		if (Object.keys(cleanUpdates).length > 0) {
			cleanUpdates.updatedAt = Date.now();
			await ctx.db.patch(id, cleanUpdates);
		}
	}
});

export const searchPreceptorsByReviews = query({
	args: { searchTerm: v.string() },
	handler: async (ctx, { searchTerm }) => {
		if (!searchTerm.trim()) {
			return [];
		}

		const searchLower = searchTerm.toLowerCase();
		
		const preceptors = await ctx.db.query('preceptors').collect();
		const schools = await ctx.db.query('schools').collect();
		const practiceSites = await ctx.db.query('practiceSites').collect();
		const rotationTypes = await ctx.db.query('rotationTypes').collect();
		const reviews = await ctx.db.query('reviews').collect();
		
		const schoolMap = new Map(schools.map(s => [s._id, s.name]));
		const practiceSiteMap = new Map(practiceSites.map(s => [s._id, s.name]));
		const rotationTypeMap = new Map(rotationTypes.map(r => [r._id, r.name]));
		
		const reviewsByPreceptor = new Map();
		reviews.forEach(review => {
			if (!reviewsByPreceptor.has(review.preceptorId)) {
				reviewsByPreceptor.set(review.preceptorId, []);
			}
			reviewsByPreceptor.get(review.preceptorId).push(review);
		});
		
		const matchingPreceptors = preceptors.filter(preceptor => {
			const preceptorName = preceptor.fullName.toLowerCase();
			const schoolName = schoolMap.get(preceptor.schoolId)?.toLowerCase() || '';
			const siteName = practiceSiteMap.get(preceptor.siteId)?.toLowerCase() || '';
			
			if (preceptorName.includes(searchLower) || 
				schoolName.includes(searchLower) || 
				siteName.includes(searchLower)) {
				return true;
			}
			
			const preceptorReviews = reviewsByPreceptor.get(preceptor._id) || [];
			return preceptorReviews.some((review: { rotationTypeId: Id<'rotationTypes'> }) => {
				const rotationTypeName = rotationTypeMap.get(review.rotationTypeId)?.toLowerCase() || '';
				return rotationTypeName.includes(searchLower);
			});
		});
		
		return matchingPreceptors.map(preceptor => {
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


