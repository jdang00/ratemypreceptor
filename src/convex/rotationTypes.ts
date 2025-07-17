import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const rotationTypes = await ctx.db.query('rotationTypes').collect();
		const programTypes = await ctx.db.query('programTypes').collect();
		const programTypeMap = new Map(programTypes.map((p) => [p._id, p.name]));

		return rotationTypes.map((rt) => ({
			...rt,
			programTypeName: programTypeMap.get(rt.programTypeId) || 'Unknown Program'
		}));
	}
});

export const getByProgramType = query({
	args: { programTypeId: v.id('programTypes') },
	handler: async (ctx, { programTypeId }) => {
		return await ctx.db
			.query('rotationTypes')
			.withIndex('by_program_type', (q) => q.eq('programTypeId', programTypeId))
			.collect();
	}
});

export const insertRotationType = mutation({
	args: {
		programTypeId: v.id('programTypes'),
		name: v.string()
	},
	handler: async (ctx, { programTypeId, name }) => {
		return await ctx.db.insert('rotationTypes', { programTypeId, name });
	}
});

export const updateRotationType = mutation({
	args: {
		id: v.id('rotationTypes'),
		programTypeId: v.optional(v.id('programTypes')),
		name: v.optional(v.string())
	},
	handler: async (ctx, { id, ...updates }) => {
		return await ctx.db.patch(id, updates);
	}
});

export const deleteRotationType = mutation({
	args: { id: v.id('rotationTypes') },
	handler: async (ctx, { id }) => {
		return await ctx.db.delete(id);
	}
});
