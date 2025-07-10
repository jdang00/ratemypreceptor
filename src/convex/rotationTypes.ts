import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const preceptors = await ctx.db.query('rotationTypes').collect();
		return preceptors;
	}
});

export const deleteRotationType = mutation({
	args: { id: v.id('rotationTypes') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	}
});

export const updateRotationType = mutation({
	args: { 
		id: v.id('rotationTypes'),
		name: v.optional(v.string())
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
