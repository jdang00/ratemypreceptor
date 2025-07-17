import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get all schools affiliated with a preceptor
 */
export const getPreceptorSchools = query({
	args: {
		preceptorId: v.id('preceptors'),
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, { preceptorId, onlyActive = true }) => {
		let preceptorSchools = await ctx.db
			.query('preceptorSchools')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptorId))
			.collect();

		if (onlyActive) {
			preceptorSchools = preceptorSchools.filter((ps) => ps.isActive);
		}

		const schools = await Promise.all(
			preceptorSchools.map(async (ps) => {
				return await ctx.db.get(ps.schoolId);
			})
		);

		return schools.filter(Boolean);
	}
});

/**
 * Get all practice sites affiliated with a preceptor
 */
export const getPreceptorSites = query({
	args: {
		preceptorId: v.id('preceptors'),
		schoolId: v.optional(v.id('schools')),
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, { preceptorId, schoolId, onlyActive = true }) => {
		let preceptorSites = await ctx.db
			.query('preceptorSites')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptorId))
			.collect();

		if (onlyActive) {
			preceptorSites = preceptorSites.filter((ps) => ps.isActive);
		}

		if (schoolId) {
			preceptorSites = preceptorSites.filter((ps) => ps.schoolId === schoolId);
		}

		const sites = await Promise.all(
			preceptorSites.map(async (ps) => {
				return await ctx.db.get(ps.siteId);
			})
		);

		return sites.filter(Boolean);
	}
});

/**
 * Get all program types affiliated with a preceptor
 */
export const getPreceptorPrograms = query({
	args: {
		preceptorId: v.id('preceptors'),
		schoolId: v.optional(v.id('schools')),
		siteId: v.optional(v.id('practiceSites')),
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, { preceptorId, schoolId, siteId, onlyActive = true }) => {
		let preceptorPrograms = await ctx.db
			.query('preceptorPrograms')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptorId))
			.collect();

		if (onlyActive) {
			preceptorPrograms = preceptorPrograms.filter((pp) => pp.isActive);
		}

		if (schoolId) {
			preceptorPrograms = preceptorPrograms.filter((pp) => pp.schoolId === schoolId);
		}

		if (siteId) {
			preceptorPrograms = preceptorPrograms.filter((pp) => pp.siteId === siteId);
		}

		const programs = await Promise.all(
			preceptorPrograms.map(async (pp) => {
				return await ctx.db.get(pp.programTypeId);
			})
		);

		return programs.filter(Boolean);
	}
});

/**
 * Get all preceptors affiliated with a specific school
 */
export const getSchoolPreceptors = query({
	args: {
		schoolId: v.id('schools'),
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, { schoolId, onlyActive = true }) => {
		let preceptorSchools = await ctx.db
			.query('preceptorSchools')
			.withIndex('by_school', (q) => q.eq('schoolId', schoolId))
			.collect();

		if (onlyActive) {
			preceptorSchools = preceptorSchools.filter((ps) => ps.isActive);
		}

		const preceptors = await Promise.all(
			preceptorSchools.map(async (ps) => {
				return await ctx.db.get(ps.preceptorId);
			})
		);

		return preceptors.filter(Boolean);
	}
});

/**
 * Get all preceptors affiliated with a specific practice site
 */
export const getSitePreceptors = query({
	args: {
		siteId: v.id('practiceSites'),
		schoolId: v.optional(v.id('schools')),
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, { siteId, schoolId, onlyActive = true }) => {
		let preceptorSites = await ctx.db
			.query('preceptorSites')
			.withIndex('by_site', (q) => q.eq('siteId', siteId))
			.collect();

		if (onlyActive) {
			preceptorSites = preceptorSites.filter((ps) => ps.isActive);
		}

		if (schoolId) {
			preceptorSites = preceptorSites.filter((ps) => ps.schoolId === schoolId);
		}

		const preceptors = await Promise.all(
			preceptorSites.map(async (ps) => {
				return await ctx.db.get(ps.preceptorId);
			})
		);

		return preceptors.filter(Boolean);
	}
});

/**
 * Get all preceptors affiliated with a specific program type
 */
export const getProgramPreceptors = query({
	args: {
		programTypeId: v.id('programTypes'),
		schoolId: v.optional(v.id('schools')),
		siteId: v.optional(v.id('practiceSites')),
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, { programTypeId, schoolId, siteId, onlyActive = true }) => {
		let preceptorPrograms = await ctx.db
			.query('preceptorPrograms')
			.withIndex('by_program_type', (q) => q.eq('programTypeId', programTypeId))
			.collect();

		if (onlyActive) {
			preceptorPrograms = preceptorPrograms.filter((pp) => pp.isActive);
		}

		if (schoolId) {
			preceptorPrograms = preceptorPrograms.filter((pp) => pp.schoolId === schoolId);
		}

		if (siteId) {
			preceptorPrograms = preceptorPrograms.filter((pp) => pp.siteId === siteId);
		}

		const preceptors = await Promise.all(
			preceptorPrograms.map(async (pp) => {
				return await ctx.db.get(pp.preceptorId);
			})
		);

		return preceptors.filter(Boolean);
	}
});

/**
 * Get a preceptor with all their affiliations
 */
export const getPreceptorWithAffiliations = query({
	args: {
		preceptorId: v.id('preceptors'),
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, { preceptorId, onlyActive = true }) => {
		const preceptor = await ctx.db.get(preceptorId);
		if (!preceptor) return null;

		// Get school affiliations
		let preceptorSchools = await ctx.db
			.query('preceptorSchools')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptorId))
			.collect();

		if (onlyActive) {
			preceptorSchools = preceptorSchools.filter((ps) => ps.isActive);
		}

		const schools = await Promise.all(
			preceptorSchools.map(async (ps) => {
				return await ctx.db.get(ps.schoolId);
			})
		);

		// Get site affiliations
		let preceptorSites = await ctx.db
			.query('preceptorSites')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptorId))
			.collect();

		if (onlyActive) {
			preceptorSites = preceptorSites.filter((ps) => ps.isActive);
		}

		const sites = await Promise.all(
			preceptorSites.map(async (ps) => {
				return await ctx.db.get(ps.siteId);
			})
		);

		// Get program affiliations
		let preceptorPrograms = await ctx.db
			.query('preceptorPrograms')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptorId))
			.collect();

		if (onlyActive) {
			preceptorPrograms = preceptorPrograms.filter((pp) => pp.isActive);
		}

		const programs = await Promise.all(
			preceptorPrograms.map(async (pp) => {
				return await ctx.db.get(pp.programTypeId);
			})
		);

		return {
			...preceptor,
			schools: schools.filter(Boolean),
			sites: sites.filter(Boolean),
			programs: programs.filter(Boolean)
		};
	}
});

/**
 * Create a preceptor-school affiliation
 */
export const createPreceptorSchoolAffiliation = mutation({
	args: {
		preceptorId: v.id('preceptors'),
		schoolId: v.id('schools'),
		isActive: v.optional(v.boolean())
	},
	handler: async (ctx, { preceptorId, schoolId, isActive = true }) => {
		const now = Date.now();
		return await ctx.db.insert('preceptorSchools', {
			preceptorId,
			schoolId,
			isActive,
			createdAt: now,
			updatedAt: now
		});
	}
});

/**
 * Create a preceptor-site affiliation
 */
export const createPreceptorSiteAffiliation = mutation({
	args: {
		preceptorId: v.id('preceptors'),
		schoolId: v.id('schools'),
		siteId: v.id('practiceSites'),
		isActive: v.optional(v.boolean())
	},
	handler: async (ctx, { preceptorId, schoolId, siteId, isActive = true }) => {
		const now = Date.now();
		return await ctx.db.insert('preceptorSites', {
			preceptorId,
			schoolId,
			siteId,
			isActive,
			createdAt: now,
			updatedAt: now
		});
	}
});

/**
 * Create a preceptor-program affiliation
 */
export const createPreceptorProgramAffiliation = mutation({
	args: {
		preceptorId: v.id('preceptors'),
		schoolId: v.id('schools'),
		siteId: v.id('practiceSites'),
		programTypeId: v.id('programTypes'),
		isActive: v.optional(v.boolean())
	},
	handler: async (ctx, { preceptorId, schoolId, siteId, programTypeId, isActive = true }) => {
		const now = Date.now();
		return await ctx.db.insert('preceptorPrograms', {
			preceptorId,
			schoolId,
			siteId,
			programTypeId,
			isActive,
			createdAt: now,
			updatedAt: now
		});
	}
});

/**
 * Update a preceptor-school affiliation
 */
export const updatePreceptorSchoolAffiliation = mutation({
	args: {
		affiliationId: v.id('preceptorSchools'),
		isActive: v.boolean()
	},
	handler: async (ctx, { affiliationId, isActive }) => {
		return await ctx.db.patch(affiliationId, {
			isActive,
			updatedAt: Date.now()
		});
	}
});

/**
 * Update a preceptor-site affiliation
 */
export const updatePreceptorSiteAffiliation = mutation({
	args: {
		affiliationId: v.id('preceptorSites'),
		isActive: v.boolean()
	},
	handler: async (ctx, { affiliationId, isActive }) => {
		return await ctx.db.patch(affiliationId, {
			isActive,
			updatedAt: Date.now()
		});
	}
});

/**
 * Update a preceptor-program affiliation
 */
export const updatePreceptorProgramAffiliation = mutation({
	args: {
		affiliationId: v.id('preceptorPrograms'),
		isActive: v.boolean()
	},
	handler: async (ctx, { affiliationId, isActive }) => {
		return await ctx.db.patch(affiliationId, {
			isActive,
			updatedAt: Date.now()
		});
	}
});

/**
 * Delete a preceptor-school affiliation
 */
export const deletePreceptorSchoolAffiliation = mutation({
	args: {
		affiliationId: v.id('preceptorSchools')
	},
	handler: async (ctx, { affiliationId }) => {
		await ctx.db.delete(affiliationId);
		return true;
	}
});

/**
 * Delete a preceptor-site affiliation
 */
export const deletePreceptorSiteAffiliation = mutation({
	args: {
		affiliationId: v.id('preceptorSites')
	},
	handler: async (ctx, { affiliationId }) => {
		await ctx.db.delete(affiliationId);
		return true;
	}
});

/**
 * Delete a preceptor-program affiliation
 */
export const deletePreceptorProgramAffiliation = mutation({
	args: {
		affiliationId: v.id('preceptorPrograms')
	},
	handler: async (ctx, { affiliationId }) => {
		await ctx.db.delete(affiliationId);
		return true;
	}
});

/**
 * Validate preceptor context for review submission
 */
export const validatePreceptorContext = query({
	args: {
		preceptorId: v.id('preceptors'),
		schoolId: v.id('schools'),
		siteId: v.id('practiceSites'),
		programTypeId: v.id('programTypes')
	},
	handler: async (ctx, { preceptorId, schoolId, siteId, programTypeId }) => {
		const preceptorProgram = await ctx.db
			.query('preceptorPrograms')
			.withIndex('by_preceptor_school_site_program', (q) =>
				q
					.eq('preceptorId', preceptorId)
					.eq('schoolId', schoolId)
					.eq('siteId', siteId)
					.eq('programTypeId', programTypeId)
			)
			.filter((q) => q.eq(q.field('isActive'), true))
			.first();

		return {
			isValid: !!preceptorProgram,
			errors: preceptorProgram ? [] : ['Invalid preceptor context'],
			suggestions: {}
		};
	}
});

/**
 * Get available schools for a preceptor
 */
export const getAvailableSchoolsForPreceptor = query({
	args: {
		preceptorId: v.id('preceptors')
	},
	handler: async (ctx, { preceptorId }) => {
		const preceptorSchools = await ctx.db
			.query('preceptorSchools')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptorId))
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect();

		const schools = await Promise.all(
			preceptorSchools.map(async (ps) => {
				return await ctx.db.get(ps.schoolId);
			})
		);

		return schools.filter(Boolean);
	}
});

/**
 * Get available sites for a preceptor at a specific school
 */
export const getAvailableSitesForPreceptorAtSchool = query({
	args: {
		preceptorId: v.id('preceptors'),
		schoolId: v.id('schools')
	},
	handler: async (ctx, { preceptorId, schoolId }) => {
		const preceptorSites = await ctx.db
			.query('preceptorSites')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptorId))
			.filter((q) => q.eq(q.field('schoolId'), schoolId))
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect();

		const sites = await Promise.all(
			preceptorSites.map(async (ps) => {
				return await ctx.db.get(ps.siteId);
			})
		);

		return sites.filter(Boolean);
	}
});

/**
 * Get available program types for a preceptor at a specific school and site
 */
export const getAvailableProgramsForPreceptorAtSchoolSite = query({
	args: {
		preceptorId: v.id('preceptors'),
		schoolId: v.id('schools'),
		siteId: v.id('practiceSites')
	},
	handler: async (ctx, { preceptorId, schoolId, siteId }) => {
		const preceptorPrograms = await ctx.db
			.query('preceptorPrograms')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptorId))
			.filter((q) => q.eq(q.field('schoolId'), schoolId))
			.filter((q) => q.eq(q.field('siteId'), siteId))
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect();

		const programs = await Promise.all(
			preceptorPrograms.map(async (pp) => {
				return await ctx.db.get(pp.programTypeId);
			})
		);

		return programs.filter(Boolean);
	}
});

/**
 * Check if a preceptor has any active affiliations
 */
export const hasActiveAffiliations = query({
	args: {
		preceptorId: v.id('preceptors')
	},
	handler: async (ctx, { preceptorId }) => {
		const activeSchools = await ctx.db
			.query('preceptorSchools')
			.withIndex('by_active_preceptor', (q) =>
				q.eq('preceptorId', preceptorId).eq('isActive', true)
			)
			.first();

		return !!activeSchools;
	}
});
