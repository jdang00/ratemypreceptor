import { query } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {
		fullName: v.string(),
		limit: v.optional(v.number())
	},
	handler: async (ctx, { fullName, limit = 500 }) => {
		const preceptor = await ctx.db
			.query('preceptors')
			.withIndex('by_full_name', (q) => q.eq('fullName', fullName))
			.first();

		if (!preceptor) {
			return [];
		}

		const reviews = await ctx.db
			.query('reviews')
			.withIndex('by_preceptor_created', (q) => q.eq('preceptorId', preceptor._id))
			.order('desc')
			.take(limit);

		const [rotationTypes, experienceTypes] = await Promise.all([
			ctx.db.query('rotationTypes').collect(),
			ctx.db.query('experienceTypes').collect()
		]);
		
		const rotationTypeMap = new Map(rotationTypes.map(r => [r._id, r.name]));
		const experienceTypeMap = new Map(experienceTypes.map(e => [e._id, e.name]));
		
		return reviews.map(review => ({
			...review,
			rotationTypeName: rotationTypeMap.get(review.rotationTypeId) || 'Unknown Rotation',
			experienceTypeName: experienceTypeMap.get(review.experienceTypeId) || 'Unknown Experience'
		}));
	}
});

export const getStats = query({
	args: {
		fullName: v.string()
	},
	handler: async (ctx, { fullName }) => {
		const preceptor = await ctx.db
			.query('preceptors')
			.withIndex('by_full_name', (q) => q.eq('fullName', fullName))
			.first();

		if (!preceptor) {
			return null;
		}

		const reviews = await ctx.db
			.query('reviews')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptor._id))
			.collect();

		if (reviews.length === 0) {
			return {
				totalReviews: 0,
				averageStarRating: 0,
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
			totalReviews,
			averageStarRating: reviews.reduce((sum, r) => sum + r.starRating, 0) / totalReviews,
			recommendationRate: (recommendedCount / totalReviews) * 100,
			averageSchedulingFlexibility: reviews.reduce((sum, r) => sum + r.schedulingFlexibility, 0) / totalReviews,
			averageWorkload: reviews.reduce((sum, r) => sum + r.workload, 0) / totalReviews,
			averageExpectations: reviews.reduce((sum, r) => sum + r.expectations, 0) / totalReviews,
			averageMentorship: reviews.reduce((sum, r) => sum + r.mentorship, 0) / totalReviews,
			averageEnjoyment: reviews.reduce((sum, r) => sum + r.enjoyment, 0) / totalReviews
		};
	}
});
