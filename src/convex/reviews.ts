import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getReviewsCount = query({
	args: {
		filters: v.optional(v.object({
			experienceType: v.optional(v.string()),
			wouldRecommend: v.optional(v.boolean()),
			comment: v.optional(v.string())
		}))
	},
	handler: async (ctx, { filters }) => {
		const allReviews = await ctx.db.query('reviews').collect();
		
		if (!filters) {
			return allReviews.length;
		}

		const [experienceTypes] = await Promise.all([
			ctx.db.query('experienceTypes').collect()
		]);

		const experienceTypeMap = new Map(experienceTypes.map(e => [e.name, e._id]));

		const filteredReviews = allReviews.filter(review => {
			if (filters.experienceType && filters.experienceType !== '') {
				const experienceTypeId = experienceTypeMap.get(filters.experienceType);
				if (experienceTypeId && review.experienceTypeId !== experienceTypeId) {
					return false;
				}
			}

			if (filters.wouldRecommend !== undefined && review.wouldRecommend !== filters.wouldRecommend) {
				return false;
			}

			if (filters.comment && filters.comment !== '') {
				const comment = review.comment || '';
				if (!comment.toLowerCase().includes(filters.comment.toLowerCase())) {
					return false;
				}
			}

			return true;
		});

		return filteredReviews.length;
	}
});

export const getReviewsWithOffset = query({
	args: {
		offset: v.number(),
		limit: v.number(),
		filters: v.optional(v.object({
			experienceType: v.optional(v.string()),
			wouldRecommend: v.optional(v.boolean()),
			comment: v.optional(v.string())
		}))
	},
	handler: async (ctx, { offset, limit, filters }) => {
		const reviewsQuery = ctx.db
			.query('reviews')
			.withIndex('by_recent_reviews')
			.order('desc');

		const allReviews = await reviewsQuery.collect();
		let filteredReviews = allReviews;

		if (filters) {
			const [experienceTypes] = await Promise.all([
				ctx.db.query('experienceTypes').collect()
			]);

			const experienceTypeMap = new Map(experienceTypes.map(e => [e.name, e._id]));

			filteredReviews = allReviews.filter(review => {
				if (filters.experienceType && filters.experienceType !== '') {
					const experienceTypeId = experienceTypeMap.get(filters.experienceType);
					if (experienceTypeId && review.experienceTypeId !== experienceTypeId) {
						return false;
					}
				}

				if (filters.wouldRecommend !== undefined && review.wouldRecommend !== filters.wouldRecommend) {
					return false;
				}

				if (filters.comment && filters.comment !== '') {
					const comment = review.comment || '';
					if (!comment.toLowerCase().includes(filters.comment.toLowerCase())) {
						return false;
					}
				}

				return true;
			});
		}

		const paginatedReviews = filteredReviews.slice(offset, offset + limit);

		const reviewsWithDetails = await Promise.all(
			paginatedReviews.map(async (review) => {
				const [preceptor, rotationType, experienceType] = await Promise.all([
					ctx.db.get(review.preceptorId),
					ctx.db.get(review.rotationTypeId),
					ctx.db.get(review.experienceTypeId)
				]);

				return {
					...review,
					preceptorName: preceptor?.fullName || 'Unknown Preceptor',
					rotationTypeName: rotationType?.name || 'Unknown Rotation',
					experienceTypeName: experienceType?.name || 'Unknown Experience'
				};
			})
		);

		return reviewsWithDetails;
	}
});

export const get = query({
	args: {},
	handler: async (ctx) => {
		const results = await ctx.db
			.query('reviews')
			.withIndex('by_recent_reviews')
			.order('desc')
			.collect();

		const reviewsWithDetails = await Promise.all(
			results.map(async (review) => {
				const [preceptor, rotationType, experienceType] = await Promise.all([
					ctx.db.get(review.preceptorId),
					ctx.db.get(review.rotationTypeId),
					ctx.db.get(review.experienceTypeId)
				]);

				return {
					...review,
					preceptorName: preceptor?.fullName || 'Unknown Preceptor',
					rotationTypeName: rotationType?.name || 'Unknown Rotation',
					experienceTypeName: experienceType?.name || 'Unknown Experience'
				};
			})
		);

		return reviewsWithDetails;
	}
});

export const getByPreceptor = query({
	args: {
		preceptorId: v.id('preceptors'),
		limit: v.optional(v.number())
	},
	handler: async (ctx, { preceptorId, limit = 500 }) => {
		const reviews = await ctx.db
			.query('reviews')
			.withIndex('by_preceptor_created', (q) => q.eq('preceptorId', preceptorId))
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

export const getPreceptorStats = query({
	args: {
		preceptorId: v.id('preceptors')
	},
	handler: async (ctx, { preceptorId }) => {
		const reviews = await ctx.db
			.query('reviews')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptorId))
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

export const getTopReviews = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, { limit = 10 }) => {
		const reviews = await ctx.db
			.query('reviews')
			.withIndex('by_top_reviews')
			.order('desc')
			.take(limit);

		const reviewsWithDetails = await Promise.all(
			reviews.map(async (review) => {
				const [preceptor, rotationType, experienceType] = await Promise.all([
					ctx.db.get(review.preceptorId),
					ctx.db.get(review.rotationTypeId),
					ctx.db.get(review.experienceTypeId)
				]);

				return {
					...review,
					preceptorName: preceptor?.fullName || 'Unknown Preceptor',
					rotationTypeName: rotationType?.name || 'Unknown Rotation',
					experienceTypeName: experienceType?.name || 'Unknown Experience'
				};
			})
		);

		return reviewsWithDetails;
	}
});

export const searchPreceptorsByReviews = query({
	args: { 
		searchTerm: v.string(),
		limit: v.optional(v.number())
	},
	handler: async (ctx, { searchTerm, limit = 200 }) => {
		if (!searchTerm.trim()) {
			return [];
		}

		const searchLower = searchTerm.toLowerCase();
		
		const [preceptors, schools, practiceSites, programTypes] = await Promise.all([
			ctx.db.query('preceptors').collect(),
			ctx.db.query('schools').collect(),
			ctx.db.query('practiceSites').collect(),
			ctx.db.query('programTypes').collect()
		]);

		const schoolMap = new Map(schools.map(s => [s._id, s.name]));
		const practiceSiteMap = new Map(practiceSites.map(s => [s._id, s.name]));
		const programTypeMap = new Map(programTypes.map(p => [p._id, p.name]));

		const matchingPreceptors = preceptors.filter(preceptor => {
			const preceptorName = preceptor.fullName.toLowerCase();
			const schoolName = schoolMap.get(preceptor.schoolId)?.toLowerCase() || '';
			const siteName = practiceSiteMap.get(preceptor.siteId)?.toLowerCase() || '';
			const programTypeName = programTypeMap.get(preceptor.programTypeId)?.toLowerCase() || '';
			
			return preceptorName.includes(searchLower) || 
				schoolName.includes(searchLower) || 
				siteName.includes(searchLower) ||
				programTypeName.includes(searchLower);
		}).slice(0, limit);

		const preceptorResults = await Promise.all(
			matchingPreceptors.map(async (preceptor) => {
				const stats = await ctx.db
					.query('reviews')
					.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptor._id))
					.collect();

				const totalReviews = stats.length;
				const averageStarRating = totalReviews > 0 
					? stats.reduce((sum, r) => sum + r.starRating, 0) / totalReviews 
					: 0;
				const recommendationRate = totalReviews > 0 
					? (stats.filter(r => r.wouldRecommend).length / totalReviews) * 100 
					: 0;

				return {
					...preceptor,
					schoolName: schoolMap.get(preceptor.schoolId) || 'Unknown School',
					siteName: practiceSiteMap.get(preceptor.siteId) || 'Unknown Site',
					programTypeName: programTypeMap.get(preceptor.programTypeId) || 'Unknown Program',
					totalReviews,
					averageStarRating,
					recommendationRate
				};
			})
		);

		return preceptorResults.sort((a, b) => b.totalReviews - a.totalReviews);
	}
});

export const getFilteredReviews = query({
	args: {
		filters: v.object({
			experienceType: v.optional(v.string()),
			rotationType: v.optional(v.string()),
			starRating: v.optional(v.number()),
			wouldRecommend: v.optional(v.boolean())
		}),
		limit: v.optional(v.number())
	},
	handler: async (ctx, { filters, limit = 500 }) => {
		let reviews;

		if (filters.starRating !== undefined) {
			reviews = await ctx.db
				.query('reviews')
				.withIndex('by_star_rating', (q) => q.eq('starRating', filters.starRating!))
				.take(limit * 2);
		} else if (filters.wouldRecommend !== undefined) {
			reviews = await ctx.db
				.query('reviews')
				.withIndex('by_would_recommend', (q) => q.eq('wouldRecommend', filters.wouldRecommend!))
				.take(limit * 2);
		} else {
			reviews = await ctx.db
				.query('reviews')
				.withIndex('by_recent_reviews')
				.order('desc')
				.take(limit * 2);
		}

		if (filters.experienceType || filters.rotationType) {
			const [experienceTypes, rotationTypes] = await Promise.all([
				ctx.db.query('experienceTypes').collect(),
				ctx.db.query('rotationTypes').collect()
			]);

			if (filters.experienceType) {
				const experienceTypeId = experienceTypes.find(e => e.name === filters.experienceType)?._id;
				if (experienceTypeId) {
					reviews = reviews.filter(r => r.experienceTypeId === experienceTypeId);
				}
			}

			if (filters.rotationType) {
				const rotationTypeId = rotationTypes.find(r => r.name === filters.rotationType)?._id;
				if (rotationTypeId) {
					reviews = reviews.filter(r => r.rotationTypeId === rotationTypeId);
				}
			}
		}

		reviews = reviews.slice(0, limit);

		const reviewsWithDetails = await Promise.all(
			reviews.map(async (review) => {
				const [preceptor, rotationType, experienceType] = await Promise.all([
					ctx.db.get(review.preceptorId),
					ctx.db.get(review.rotationTypeId),
					ctx.db.get(review.experienceTypeId)
				]);

				return {
					...review,
					preceptorName: preceptor?.fullName || 'Unknown Preceptor',
					rotationTypeName: rotationType?.name || 'Unknown Rotation',
					experienceTypeName: experienceType?.name || 'Unknown Experience'
				};
			})
		);

		return reviewsWithDetails;
	}
});

export const insertReview = mutation({
	args: {
		preceptorId: v.id('preceptors'),
		rotationTypeId: v.id('rotationTypes'),
		experienceTypeId: v.id('experienceTypes'),
		schoolYear: v.string(),
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
		const now = Date.now();
		const reviewData = {
			...args,
			upvoteCount: 0,
			downvoteCount: 0,
			netScore: 0,
			createdAt: now,
			updatedAt: now
		};
		await ctx.db.insert('reviews', reviewData);
	}
});

export const updateReview = mutation({
	args: { 
		id: v.id('reviews'),
		preceptorId: v.optional(v.id('preceptors')),
		rotationTypeId: v.optional(v.id('rotationTypes')),
		experienceTypeId: v.optional(v.id('experienceTypes')),
		schoolYear: v.optional(v.string()),
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

export const deleteReview = mutation({
	args: { id: v.id('reviews') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	}
});

export const upvoteReview = mutation({
	args: { id: v.id('reviews') },
	handler: async (ctx, { id }) => {
		const review = await ctx.db.get(id);
		if (!review) throw new Error('Review not found');
		
		const upvoteCount = review.upvoteCount + 1;
		const netScore = upvoteCount - review.downvoteCount;
		
		await ctx.db.patch(id, {
			upvoteCount,
			netScore,
			updatedAt: Date.now()
		});
	}
});

export const downvoteReview = mutation({
	args: { id: v.id('reviews') },
	handler: async (ctx, { id }) => {
		const review = await ctx.db.get(id);
		if (!review) throw new Error('Review not found');
		
		const downvoteCount = review.downvoteCount + 1;
		const netScore = review.upvoteCount - downvoteCount;
		
		await ctx.db.patch(id, {
			downvoteCount,
			netScore,
			updatedAt: Date.now()
		});
	}
});


