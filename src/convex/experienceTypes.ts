import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const experienceTypes = await ctx.db.query('experienceTypes').collect();
		const programTypes = await ctx.db.query('programTypes').collect();
		const programTypeMap = new Map(programTypes.map((p) => [p._id, p.name]));

		return experienceTypes.map((et) => ({
			...et,
			programTypeName: programTypeMap.get(et.programTypeId) || 'Unknown Program'
		}));
	}
});

export const getByProgramType = query({
	args: { programTypeId: v.id('programTypes') },
	handler: async (ctx, { programTypeId }) => {
		return await ctx.db
			.query('experienceTypes')
			.withIndex('by_program_type', (q) => q.eq('programTypeId', programTypeId))
			.collect();
	}
});

export const insertExperienceType = mutation({
	args: {
		programTypeId: v.id('programTypes'),
		name: v.string(),
		description: v.optional(v.string())
	},
	handler: async (ctx, { programTypeId, name, description }) => {
		return await ctx.db.insert('experienceTypes', {
			programTypeId,
			name,
			description
		});
	}
});

export const updateExperienceType = mutation({
	args: {
		id: v.id('experienceTypes'),
		programTypeId: v.optional(v.id('programTypes')),
		name: v.optional(v.string()),
		description: v.optional(v.string())
	},
	handler: async (ctx, { id, ...updates }) => {
		return await ctx.db.patch(id, updates);
	}
});

export const deleteExperienceType = mutation({
	args: { id: v.id('experienceTypes') },
	handler: async (ctx, { id }) => {
		return await ctx.db.delete(id);
	}
});
