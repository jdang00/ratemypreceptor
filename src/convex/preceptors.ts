import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		return ctx.db.query('preceptors').collect();
	}
});

export const getWithStats = query({
	args: {},
	handler: async (ctx) => {
		const preceptors = await ctx.db.query('preceptors').collect();

		const preceptorsWithStats = await Promise.all(
			preceptors.map(async (preceptor) => {
				const reviews = await ctx.db
					.query('reviews')
					.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptor._id))
					.collect();

				const reviewCount = reviews.length;
				const averageRating =
					reviewCount > 0
						? reviews.reduce((sum, review) => sum + review.starRating, 0) / reviewCount
						: 0;

				return {
					...preceptor,
					reviewCount,
					averageRating
				};
			})
		);

		return preceptorsWithStats;
	}
});

export const getBySchoolProgram = query({
	args: {
		schoolId: v.id('schools'),
		programTypeId: v.id('programTypes')
	},
	handler: async (ctx, { schoolId, programTypeId }) => {
		const preceptorPrograms = await ctx.db
			.query('preceptorPrograms')
			.withIndex('by_school', (q) => q.eq('schoolId', schoolId))
			.filter((q) => q.eq(q.field('programTypeId'), programTypeId))
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect();

		const preceptors = await Promise.all(
			preceptorPrograms.map(async (pp) => {
				return await ctx.db.get(pp.preceptorId);
			})
		);

		return preceptors.filter(Boolean);
	}
});

export const getByFullName = query({
	args: {
		fullName: v.string()
	},
	handler: async (ctx, { fullName }) => {
		return await ctx.db
			.query('preceptors')
			.withIndex('by_full_name', (q) => q.eq('fullName', fullName))
			.collect();
	}
});

export const getByProgramType = query({
	args: {
		programTypeId: v.id('programTypes')
	},
	handler: async (ctx, { programTypeId }) => {
		const preceptorPrograms = await ctx.db
			.query('preceptorPrograms')
			.withIndex('by_program_type', (q) => q.eq('programTypeId', programTypeId))
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect();

		const preceptors = await Promise.all(
			preceptorPrograms.map(async (pp) => {
				return await ctx.db.get(pp.preceptorId);
			})
		);

		return preceptors.filter(Boolean);
	}
});

export const getBySchool = query({
	args: {
		schoolId: v.id('schools')
	},
	handler: async (ctx, { schoolId }) => {
		const preceptorSchools = await ctx.db
			.query('preceptorSchools')
			.withIndex('by_school', (q) => q.eq('schoolId', schoolId))
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect();

		const preceptors = await Promise.all(
			preceptorSchools.map(async (ps) => {
				return await ctx.db.get(ps.preceptorId);
			})
		);

		return preceptors.filter(Boolean);
	}
});

export const search = query({
	args: {
		searchTerm: v.string()
	},
	handler: async (ctx, { searchTerm }) => {
		const allPreceptors = await ctx.db.query('preceptors').collect();

		return allPreceptors.filter((preceptor) =>
			preceptor.fullName.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}
});

export const insertPreceptor = mutation({
	args: {
		fullName: v.string(),
		email: v.optional(v.string()),
		credentials: v.optional(v.string()),
		schoolId: v.id('schools'),
		programTypeId: v.id('programTypes'),
		siteId: v.id('practiceSites')
	},
	handler: async (ctx, { fullName, email, credentials, schoolId, programTypeId, siteId }) => {
		// Create the preceptor
		const preceptorId = await ctx.db.insert('preceptors', {
			fullName,
			email,
			credentials
		});

		const now = Date.now();

		// Create school affiliation
		await ctx.db.insert('preceptorSchools', {
			preceptorId,
			schoolId,
			isActive: true,
			createdAt: now,
			updatedAt: now
		});

		// Create site affiliation
		await ctx.db.insert('preceptorSites', {
			preceptorId,
			schoolId,
			siteId,
			isActive: true,
			createdAt: now,
			updatedAt: now
		});

		// Create program affiliation
		await ctx.db.insert('preceptorPrograms', {
			preceptorId,
			schoolId,
			siteId,
			programTypeId,
			isActive: true,
			createdAt: now,
			updatedAt: now
		});

		return preceptorId;
	}
});

export const updatePreceptor = mutation({
	args: {
		id: v.id('preceptors'),
		fullName: v.optional(v.string()),
		email: v.optional(v.string()),
		credentials: v.optional(v.string())
	},
	handler: async (ctx, { id, ...updates }) => {
		return await ctx.db.patch(id, updates);
	}
});

export const deletePreceptor = mutation({
	args: { id: v.id('preceptors') },
	handler: async (ctx, { id }) => {
		return await ctx.db.delete(id);
	}
});

export const universalSearch = query({
	args: {
		searchTerm: v.string()
	},
	handler: async (ctx, { searchTerm }) => {
		if (!searchTerm.trim()) return [];

		const term = searchTerm.toLowerCase();
		const preceptors = await ctx.db.query('preceptors').collect();
		const reviews = await ctx.db.query('reviews').collect();

		const reviewsByPreceptor = new Map<string, typeof reviews>();
		for (const r of reviews) {
			const list = reviewsByPreceptor.get(r.preceptorId) ?? [];
			list.push(r);
			reviewsByPreceptor.set(r.preceptorId, list);
		}

		const matchingPreceptors = await Promise.all(
			preceptors.map(async (p) => {
				const list = reviewsByPreceptor.get(p._id) ?? [];
				const reviewCount = list.length;
				const averageRating =
					reviewCount > 0 ? list.reduce((sum, r) => sum + r.starRating, 0) / reviewCount : 0;
				const recommendationRate =
					reviewCount > 0 ? (list.filter(r => r.wouldRecommend).length / reviewCount) * 100 : 0;

				const [schoolAffiliations, siteAffiliations, programAffiliations] = await Promise.all([
					ctx.db
						.query('preceptorSchools')
						.withIndex('by_preceptor', (q) => q.eq('preceptorId', p._id))
						.filter((q) => q.eq(q.field('isActive'), true))
						.collect(),
					ctx.db
						.query('preceptorSites')
						.withIndex('by_preceptor', (q) => q.eq('preceptorId', p._id))
						.filter((q) => q.eq(q.field('isActive'), true))
						.collect(),
					ctx.db
						.query('preceptorPrograms')
						.withIndex('by_preceptor', (q) => q.eq('preceptorId', p._id))
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

				// Comprehensive search across ALL fields associated with preceptor
				const nameMatch = p.fullName?.toLowerCase().includes(term);
				const emailMatch = p.email?.toLowerCase().includes(term);
				const credentialsMatch = p.credentials?.toLowerCase().includes(term);
				const schoolMatch = schoolNames.some(name => name.toLowerCase().includes(term));
				const siteMatch = siteNames.some(name => name.toLowerCase().includes(term));
				const programMatch = programTypeNames.some(name => name.toLowerCase().includes(term));

				// Also search site locations (city, state)
				const siteLocationMatch = sites.some(site =>
					site && (
						site.city?.toLowerCase().includes(term) ||
						site.state?.toLowerCase().includes(term)
					)
				);

				// Search program abbreviations
				const programAbbrevMatch = programs.some(program =>
					program && program.abbreviation?.toLowerCase().includes(term)
				);

				if (nameMatch || emailMatch || credentialsMatch || schoolMatch || siteMatch || programMatch || siteLocationMatch || programAbbrevMatch) {
					return {
						...p,
						reviews: list,
						reviewCount,
						averageRating,
						recommendationRate,
						schoolNames,
						siteNames,
						programTypeNames
					};
				}
				return null;
			})
		);

		return matchingPreceptors.filter(Boolean);
	}
});

export const getWithReviews = query({
	args: {},
	handler: async (ctx) => {
		const preceptors = await ctx.db.query('preceptors').collect();
		const reviews = await ctx.db.query('reviews').collect();

		const reviewsByPreceptor = new Map<string, typeof reviews>();
		for (const r of reviews) {
			const list = reviewsByPreceptor.get(r.preceptorId) ?? [];
			list.push(r);
			reviewsByPreceptor.set(r.preceptorId, list);
		}

		const preceptorsWithStats = await Promise.all(
			preceptors.map(async (p) => {
				const list = reviewsByPreceptor.get(p._id) ?? [];
				const reviewCount = list.length;
				const averageRating =
					reviewCount > 0 ? list.reduce((sum, r) => sum + r.starRating, 0) / reviewCount : 0;

				const [schoolAffiliations, siteAffiliations, programAffiliations] = await Promise.all([
					ctx.db
						.query('preceptorSchools')
						.withIndex('by_preceptor', (q) => q.eq('preceptorId', p._id))
						.filter((q) => q.eq(q.field('isActive'), true))
						.collect(),
					ctx.db
						.query('preceptorSites')
						.withIndex('by_preceptor', (q) => q.eq('preceptorId', p._id))
						.filter((q) => q.eq(q.field('isActive'), true))
						.collect(),
					ctx.db
						.query('preceptorPrograms')
						.withIndex('by_preceptor', (q) => q.eq('preceptorId', p._id))
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
					...p,
					reviews: list,
					reviewCount,
					averageRating,
					schoolNames,
					siteNames,
					programTypeNames
				};
			})
		);

		return preceptorsWithStats;
	}
});
