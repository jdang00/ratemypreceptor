import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {
		limit: v.optional(v.number())
	},
	handler: async (ctx, { limit = 500 }) => {
		const preceptors = await ctx.db.query('preceptors').take(limit);

		const [schools, practiceSites, programTypes] = await Promise.all([
			ctx.db.query('schools').collect(),
			ctx.db.query('practiceSites').collect(),
			ctx.db.query('programTypes').collect()
		]);

		const schoolMap = new Map(schools.map((s) => [s._id, s.name]));
		const practiceSiteMap = new Map(practiceSites.map((s) => [s._id, s.name]));
		const programTypeMap = new Map(programTypes.map((p) => [p._id, p.name]));

		return preceptors.map((preceptor) => ({
			...preceptor,
			schoolName: schoolMap.get(preceptor.schoolId) || 'Unknown School',
			siteName: practiceSiteMap.get(preceptor.siteId) || 'Unknown Site',
			programTypeName: programTypeMap.get(preceptor.programTypeId) || 'Unknown Program'
		}));
	}
});

export const getWithStats = query({
	args: {
		limit: v.optional(v.number())
	},
	handler: async (ctx, { limit = 500 }) => {
		const preceptors = await ctx.db.query('preceptors').take(limit);

		const [schools, practiceSites, programTypes] = await Promise.all([
			ctx.db.query('schools').collect(),
			ctx.db.query('practiceSites').collect(),
			ctx.db.query('programTypes').collect()
		]);

		const schoolMap = new Map(schools.map((s) => [s._id, s.name]));
		const practiceSiteMap = new Map(practiceSites.map((s) => [s._id, s.name]));
		const programTypeMap = new Map(programTypes.map((p) => [p._id, p.name]));

		const preceptorResults = await Promise.all(
			preceptors.map(async (preceptor) => {
				const reviews = await ctx.db
					.query('reviews')
					.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptor._id))
					.collect();

				const totalReviews = reviews.length;
				const averageStarRating =
					totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.starRating, 0) / totalReviews : 0;
				const recommendationRate =
					totalReviews > 0
						? (reviews.filter((r) => r.wouldRecommend).length / totalReviews) * 100
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

export const getWithReviews = query({
	args: {
		limit: v.optional(v.number())
	},
	handler: async (ctx, { limit = 200 }) => {
		const preceptors = await ctx.db.query('preceptors').take(limit);

		const [schools, practiceSites, programTypes] = await Promise.all([
			ctx.db.query('schools').collect(),
			ctx.db.query('practiceSites').collect(),
			ctx.db.query('programTypes').collect()
		]);

		const schoolMap = new Map(schools.map((s) => [s._id, s.name]));
		const practiceSiteMap = new Map(practiceSites.map((s) => [s._id, s.name]));
		const programTypeMap = new Map(programTypes.map((p) => [p._id, p.name]));

		const preceptorResults = await Promise.all(
			preceptors.map(async (preceptor) => {
				const reviews = await ctx.db
					.query('reviews')
					.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptor._id))
					.collect();

				const totalReviews = reviews.length;
				const averageStarRating =
					totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.starRating, 0) / totalReviews : 0;
				const recommendationRate =
					totalReviews > 0
						? (reviews.filter((r) => r.wouldRecommend).length / totalReviews) * 100
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

export const getBySchoolProgram = query({
	args: {
		schoolId: v.id('schools'),
		programTypeId: v.id('programTypes'),
		limit: v.optional(v.number())
	},
	handler: async (ctx, { schoolId, programTypeId, limit = 500 }) => {
		const preceptors = await ctx.db
			.query('preceptors')
			.withIndex('by_school_program', (q) =>
				q.eq('schoolId', schoolId).eq('programTypeId', programTypeId)
			)
			.take(limit);

		const practiceSites = await ctx.db.query('practiceSites').collect();
		const practiceSiteMap = new Map(practiceSites.map((s) => [s._id, s.name]));

		return preceptors.map((preceptor) => ({
			...preceptor,
			siteName: practiceSiteMap.get(preceptor.siteId) || 'Unknown Site'
		}));
	}
});

export const getByFullName = query({
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

		const [school, practiceSite, programType] = await Promise.all([
			ctx.db.get(preceptor.schoolId),
			ctx.db.get(preceptor.siteId),
			ctx.db.get(preceptor.programTypeId)
		]);

		return {
			...preceptor,
			schoolName: school?.name || 'Unknown School',
			siteName: practiceSite?.name || 'Unknown Site',
			programTypeName: programType?.name || 'Unknown Program'
		};
	}
});

export const getByProgramType = query({
	args: {
		programTypeId: v.id('programTypes'),
		limit: v.optional(v.number())
	},
	handler: async (ctx, { programTypeId, limit = 500 }) => {
		const preceptors = await ctx.db
			.query('preceptors')
			.withIndex('by_program_type', (q) => q.eq('programTypeId', programTypeId))
			.take(limit);

		const [schools, practiceSites] = await Promise.all([
			ctx.db.query('schools').collect(),
			ctx.db.query('practiceSites').collect()
		]);

		const schoolMap = new Map(schools.map((s) => [s._id, s.name]));
		const practiceSiteMap = new Map(practiceSites.map((s) => [s._id, s.name]));

		return preceptors.map((preceptor) => ({
			...preceptor,
			schoolName: schoolMap.get(preceptor.schoolId) || 'Unknown School',
			siteName: practiceSiteMap.get(preceptor.siteId) || 'Unknown Site'
		}));
	}
});

export const getBySchool = query({
	args: {
		schoolId: v.id('schools'),
		limit: v.optional(v.number())
	},
	handler: async (ctx, { schoolId, limit = 50 }) => {
		const preceptors = await ctx.db
			.query('preceptors')
			.withIndex('by_school', (q) => q.eq('schoolId', schoolId))
			.take(limit);

		const [practiceSites, programTypes] = await Promise.all([
			ctx.db.query('practiceSites').collect(),
			ctx.db.query('programTypes').collect()
		]);

		const practiceSiteMap = new Map(practiceSites.map((s) => [s._id, s.name]));
		const programTypeMap = new Map(programTypes.map((p) => [p._id, p.name]));

		return preceptors.map((preceptor) => ({
			...preceptor,
			siteName: practiceSiteMap.get(preceptor.siteId) || 'Unknown Site',
			programTypeName: programTypeMap.get(preceptor.programTypeId) || 'Unknown Program'
		}));
	}
});

export const search = query({
	args: {
		searchTerm: v.string(),
		limit: v.optional(v.number())
	},
	handler: async (ctx, { searchTerm, limit = 20 }) => {
		if (!searchTerm.trim()) {
			return [];
		}

		const searchLower = searchTerm.toLowerCase();

		const preceptors = await ctx.db.query('preceptors').take(1000);
		const [schools, practiceSites, programTypes] = await Promise.all([
			ctx.db.query('schools').collect(),
			ctx.db.query('practiceSites').collect(),
			ctx.db.query('programTypes').collect()
		]);

		const schoolMap = new Map(schools.map((s) => [s._id, s.name]));
		const practiceSiteMap = new Map(practiceSites.map((s) => [s._id, s.name]));
		const programTypeMap = new Map(programTypes.map((p) => [p._id, p.name]));

		const matchingPreceptors = preceptors
			.filter((preceptor) => {
				const preceptorName = preceptor.fullName.toLowerCase();
				const schoolName = schoolMap.get(preceptor.schoolId)?.toLowerCase() || '';
				const siteName = practiceSiteMap.get(preceptor.siteId)?.toLowerCase() || '';
				const programTypeName = programTypeMap.get(preceptor.programTypeId)?.toLowerCase() || '';

				return (
					preceptorName.includes(searchLower) ||
					schoolName.includes(searchLower) ||
					siteName.includes(searchLower) ||
					programTypeName.includes(searchLower)
				);
			})
			.slice(0, limit);

		return matchingPreceptors.map((preceptor) => ({
			...preceptor,
			schoolName: schoolMap.get(preceptor.schoolId) || 'Unknown School',
			siteName: practiceSiteMap.get(preceptor.siteId) || 'Unknown Site',
			programTypeName: programTypeMap.get(preceptor.programTypeId) || 'Unknown Program'
		}));
	}
});

export const insertPreceptor = mutation({
	args: {
		fullName: v.string(),
		schoolId: v.id('schools'),
		programTypeId: v.id('programTypes'),
		siteId: v.id('practiceSites')
	},
	handler: async (ctx, { fullName, schoolId, programTypeId, siteId }) => {
		await ctx.db.insert('preceptors', {
			fullName,
			schoolId,
			programTypeId,
			siteId
		});
	}
});

export const updatePreceptor = mutation({
	args: {
		id: v.id('preceptors'),
		schoolId: v.optional(v.id('schools')),
		programTypeId: v.optional(v.id('programTypes')),
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

export const deletePreceptor = mutation({
	args: { id: v.id('preceptors') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	}
});
