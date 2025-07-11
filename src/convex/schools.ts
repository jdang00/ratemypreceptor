import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const preceptors = await ctx.db.query('schools').collect();
		return preceptors;
	}
});

export const insertSchool = mutation({
	args: {
		name: v.string()
	},
	handler: async (ctx, { name }) => {
		await ctx.db.insert('schools', { name });
	}
});

export const deleteSchool = mutation({
	args: { id: v.id('schools') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	}
});

export const updateSchool = mutation({
	args: { 
		id: v.id('schools'),
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
