import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const getReviewsCount = query({
	args: {
		filters: v.optional(
			v.object({
				experienceType: v.optional(v.string()),
				wouldRecommend: v.optional(v.boolean()),
				comment: v.optional(v.string())
			})
		)
	},
	handler: async (ctx, { filters }) => {
		const allReviews = await ctx.db.query('reviews').collect();

		if (!filters) {
			return allReviews.length;
		}

		const experienceTypes = await ctx.db.query('experienceTypes').collect();
		const experienceTypeMap = new Map(experienceTypes.map((e) => [e.name, e._id]));

		const filteredReviews = allReviews.filter((review) => {
			if (filters.experienceType && filters.experienceType !== '') {
				const experienceTypeId = experienceTypeMap.get(filters.experienceType);
				if (experienceTypeId && review.experienceTypeId !== experienceTypeId) {
					return false;
				}
			}

			if (
				filters.wouldRecommend !== undefined &&
				review.wouldRecommend !== filters.wouldRecommend
			) {
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
		filters: v.optional(
			v.object({
				experienceType: v.optional(v.string()),
				wouldRecommend: v.optional(v.boolean()),
				comment: v.optional(v.string())
			})
		)
	},
	handler: async (ctx, { offset, limit, filters }) => {
		const allReviews = await ctx.db
			.query('reviews')
			.withIndex('by_recent_reviews')
			.order('desc')
			.collect();

		let filteredReviews = allReviews;

		if (filters) {
			const experienceTypes = await ctx.db.query('experienceTypes').collect();
			const experienceTypeMap = new Map(experienceTypes.map((e) => [e.name, e._id]));

			filteredReviews = allReviews.filter((review) => {
				if (filters.experienceType && filters.experienceType !== '') {
					const experienceTypeId = experienceTypeMap.get(filters.experienceType);
					if (experienceTypeId && review.experienceTypeId !== experienceTypeId) {
						return false;
					}
				}

				if (
					filters.wouldRecommend !== undefined &&
					review.wouldRecommend !== filters.wouldRecommend
				) {
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
				const [preceptor, rotationType, experienceType, school, site] = await Promise.all([
					ctx.db.get(review.preceptorId),
					ctx.db.get(review.rotationTypeId),
					ctx.db.get(review.experienceTypeId),
					ctx.db.get(review.schoolId),
					ctx.db.get(review.siteId)
				]);

				return {
					...review,
					preceptorName: preceptor?.fullName || 'Unknown Preceptor',
					rotationTypeName: rotationType?.name || 'Unknown Rotation',
					experienceTypeName: experienceType?.name || 'Unknown Experience',
					schoolName: school?.name || 'Unknown School',
					siteName: site?.name || 'Unknown Site'
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
				const [preceptor, rotationType, experienceType, school, site] = await Promise.all([
					ctx.db.get(review.preceptorId),
					ctx.db.get(review.rotationTypeId),
					ctx.db.get(review.experienceTypeId),
					ctx.db.get(review.schoolId),
					ctx.db.get(review.siteId)
				]);

				return {
					...review,
					preceptorName: preceptor?.fullName || 'Unknown Preceptor',
					rotationTypeName: rotationType?.name || 'Unknown Rotation',
					experienceTypeName: experienceType?.name || 'Unknown Experience',
					schoolName: school?.name || 'Unknown School',
					siteName: site?.name || 'Unknown Site'
				};
			})
		);

		return reviewsWithDetails;
	}
});

export const getByPreceptor = query({
	args: {
		preceptorId: v.id('preceptors')
	},
	handler: async (ctx, { preceptorId }) => {
		const reviews = await ctx.db
			.query('reviews')
			.withIndex('by_preceptor_created', (q) => q.eq('preceptorId', preceptorId))
			.order('desc')
			.collect();

		const reviewsWithDetails = await Promise.all(
			reviews.map(async (review) => {
				const [rotationType, experienceType, school, site] = await Promise.all([
					ctx.db.get(review.rotationTypeId),
					ctx.db.get(review.experienceTypeId),
					ctx.db.get(review.schoolId),
					ctx.db.get(review.siteId)
				]);

				return {
					...review,
					rotationTypeName: rotationType?.name || 'Unknown Rotation',
					experienceTypeName: experienceType?.name || 'Unknown Experience',
					schoolName: school?.name || 'Unknown School',
					siteName: site?.name || 'Unknown Site'
				};
			})
		);

		return reviewsWithDetails;
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
		const recommendedCount = reviews.filter((r) => r.wouldRecommend).length;

		return {
			totalReviews,
			averageStarRating: reviews.reduce((sum, r) => sum + r.starRating, 0) / totalReviews,
			recommendationRate: (recommendedCount / totalReviews) * 100,
			averageSchedulingFlexibility:
				reviews.reduce((sum, r) => sum + r.schedulingFlexibility, 0) / totalReviews,
			averageWorkload: reviews.reduce((sum, r) => sum + r.workload, 0) / totalReviews,
			averageExpectations: reviews.reduce((sum, r) => sum + r.expectations, 0) / totalReviews,
			averageMentorship: reviews.reduce((sum, r) => sum + r.mentorship, 0) / totalReviews,
			averageEnjoyment: reviews.reduce((sum, r) => sum + r.enjoyment, 0) / totalReviews
		};
	}
});

export const getTopReviews = query({
	args: {},
	handler: async (ctx) => {
		const reviews = await ctx.db
			.query('reviews')
			.withIndex('by_top_reviews')
			.order('desc')
			.take(10);

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
		searchTerm: v.string()
	},
	handler: async (ctx, { searchTerm }) => {
		if (!searchTerm.trim()) {
			return [];
		}

		const searchLower = searchTerm.toLowerCase();
		const preceptors = await ctx.db.query('preceptors').collect();

		const matchingPreceptors = preceptors.filter((preceptor) =>
			preceptor.fullName.toLowerCase().includes(searchLower)
		);

		const preceptorResults = await Promise.all(
			matchingPreceptors.map(async (preceptor) => {
				const stats = await ctx.db
					.query('reviews')
					.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptor._id))
					.collect();

				const totalReviews = stats.length;
				const averageStarRating =
					totalReviews > 0 ? stats.reduce((sum, r) => sum + r.starRating, 0) / totalReviews : 0;
				const recommendationRate =
					totalReviews > 0
						? (stats.filter((r) => r.wouldRecommend).length / totalReviews) * 100
						: 0;

				const [schoolAffiliations, siteAffiliations, programAffiliations] = await Promise.all([
					ctx.db
						.query('preceptorSchools')
						.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptor._id))
						.filter((q) => q.eq(q.field('isActive'), true))
						.collect(),
					ctx.db
						.query('preceptorSites')
						.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptor._id))
						.filter((q) => q.eq(q.field('isActive'), true))
						.collect(),
					ctx.db
						.query('preceptorPrograms')
						.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptor._id))
						.filter((q) => q.eq(q.field('isActive'), true))
						.collect()
				]);

				const [schools, sites, programs] = await Promise.all([
					Promise.all(schoolAffiliations.map(async (sa) => await ctx.db.get(sa.schoolId))),
					Promise.all(siteAffiliations.map(async (sa) => await ctx.db.get(sa.siteId))),
					Promise.all(programAffiliations.map(async (pa) => await ctx.db.get(pa.programTypeId)))
				]);

				const schoolNames = schools.filter(Boolean).map((s) => s!.name);
				const siteNames = sites.filter(Boolean).map((s) => s!.name);
				const programTypeNames = programs.filter(Boolean).map((p) => p!.name);

				return {
					...preceptor,
					totalReviews,
					averageStarRating,
					recommendationRate,
					schoolNames,
					siteNames,
					programTypeNames
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
		})
	},
	handler: async (ctx, { filters }) => {
		let reviews;

		if (filters.starRating !== undefined) {
			reviews = await ctx.db
				.query('reviews')
				.withIndex('by_star_rating', (q) => q.eq('starRating', filters.starRating!))
				.collect();
		} else if (filters.wouldRecommend !== undefined) {
			reviews = await ctx.db
				.query('reviews')
				.withIndex('by_would_recommend', (q) => q.eq('wouldRecommend', filters.wouldRecommend!))
				.collect();
		} else {
			reviews = await ctx.db
				.query('reviews')
				.withIndex('by_recent_reviews')
				.order('desc')
				.collect();
		}

		if (filters.experienceType || filters.rotationType) {
			const [experienceTypes, rotationTypes] = await Promise.all([
				ctx.db.query('experienceTypes').collect(),
				ctx.db.query('rotationTypes').collect()
			]);

			if (filters.experienceType) {
				const experienceTypeId = experienceTypes.find(
					(e) => e.name === filters.experienceType
				)?._id;
				if (experienceTypeId) {
					reviews = reviews.filter((r) => r.experienceTypeId === experienceTypeId);
				}
			}

			if (filters.rotationType) {
				const rotationTypeId = rotationTypes.find((r) => r.name === filters.rotationType)?._id;
				if (rotationTypeId) {
					reviews = reviews.filter((r) => r.rotationTypeId === rotationTypeId);
				}
			}
		}

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
		schoolId: v.id('schools'),
		siteId: v.id('practiceSites'),
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
		return await ctx.db.insert('reviews', reviewData);
	}
});

export const updateReview = mutation({
	args: {
		id: v.id('reviews'),
		preceptorId: v.optional(v.id('preceptors')),
		schoolId: v.optional(v.id('schools')),
		siteId: v.optional(v.id('practiceSites')),
		rotationTypeId: v.optional(v.id('rotationTypes')),
		experienceTypeId: v.optional(v.id('experienceTypes')),
		schoolYear: v.optional(v.string()),
		priorExperience: v.optional(
			v.union(
				v.literal('None'),
				v.literal('Little'),
				v.literal('Moderate'),
				v.literal('Significant')
			)
		),
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
		return await ctx.db.patch(id, updates);
	}
});

export const deleteReview = mutation({
	args: { id: v.id('reviews') },
	handler: async (ctx, { id }) => {
		return await ctx.db.delete(id);
	}
});

export const upvoteReview = mutation({
	args: { id: v.id('reviews') },
	handler: async (ctx, { id }) => {
		const review = await ctx.db.get(id);
		if (!review) throw new Error('Review not found');

		const upvoteCount = review.upvoteCount + 1;
		const netScore = upvoteCount - review.downvoteCount;

		return await ctx.db.patch(id, {
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

		return await ctx.db.patch(id, {
			downvoteCount,
			netScore,
			updatedAt: Date.now()
		});
	}
});
