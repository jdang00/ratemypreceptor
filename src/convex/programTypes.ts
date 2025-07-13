import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('programTypes').collect();
	}
});

export const insertProgramType = mutation({
	args: {
		name: v.string(),
		yearLabels: v.array(v.string()),
		abbreviation: v.string()
	},
	handler: async (ctx, { name, yearLabels, abbreviation }) => {
		await ctx.db.insert('programTypes', {
			name,
			yearLabels,
			abbreviation
		});
	}
});

export const updateProgramType = mutation({
	args: {
		id: v.id('programTypes'),
		name: v.optional(v.string()),
		yearLabels: v.optional(v.array(v.string())),
		abbreviation: v.optional(v.string())
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

export const deleteProgramType = mutation({
	args: { id: v.id('programTypes') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	}
});
