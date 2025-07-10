import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

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
	args: {
		searchTerm: v.string()
	},
	handler: async (ctx, { searchTerm }) => {
		// Return empty array if search term is empty
		if (!searchTerm.trim()) {
			return [];
		}
		
		const searchLower = searchTerm.toLowerCase();
		
		// Get all data needed for search
		const reviews = await ctx.db.query('reviews').collect();
		const preceptors = await ctx.db.query('preceptors').collect();
		const schools = await ctx.db.query('schools').collect();
		const practiceSites = await ctx.db.query('practiceSites').collect();
		const rotationTypes = await ctx.db.query('rotationTypes').collect();
		
		// Create lookup maps
		const schoolMap = new Map(schools.map(s => [s._id, s.name]));
		const practiceSiteMap = new Map(practiceSites.map(s => [s._id, s.name]));
		const rotationTypeMap = new Map(rotationTypes.map(r => [r._id, r.name]));
		
		// Find preceptors that match the search criteria
		const matchingPreceptorIds = new Set();
		
		// Search through reviews to find matching preceptors
		reviews.forEach(review => {
			const preceptor = preceptors.find(p => p._id === review.preceptorId);
			if (!preceptor) return;
			
			const school = schoolMap.get(preceptor.schoolId);
			const practiceSite = practiceSiteMap.get(preceptor.siteId);
			const rotationType = rotationTypeMap.get(review.rotationTypeId);
			
			// Check if any field matches the search term
			if (
				preceptor.fullName.toLowerCase().includes(searchLower) ||
				school?.toLowerCase().includes(searchLower) ||
				practiceSite?.toLowerCase().includes(searchLower) ||
				rotationType?.toLowerCase().includes(searchLower)
			) {
				matchingPreceptorIds.add(review.preceptorId);
			}
		});
		
		// Get unique preceptors that match
		const matchingPreceptors = preceptors.filter(p => matchingPreceptorIds.has(p._id));
		
		// Calculate review statistics for each matching preceptor
		return matchingPreceptors.map(preceptor => {
			const preceptorReviews = reviews.filter(r => r.preceptorId === preceptor._id);
			const totalReviews = preceptorReviews.length;
			const averageStarRating = totalReviews > 0 
				? preceptorReviews.reduce((sum, r) => sum + r.starRating, 0) / totalReviews 
				: 0;
			const recommendationRate = totalReviews > 0 
				? (preceptorReviews.filter(r => r.wouldRecommend).length / totalReviews) * 100 
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
