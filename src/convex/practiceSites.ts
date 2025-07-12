import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('practiceSites').collect();
	}
});

export const getByLocation = query({
	args: { 
		state: v.optional(v.string()),
		city: v.optional(v.string())
	},
	handler: async (ctx, { state, city }) => {
		if (state && city) {
			return await ctx.db
				.query('practiceSites')
				.withIndex('by_location', (q) => q.eq('state', state).eq('city', city))
				.collect();
		} else if (state) {
			return await ctx.db
				.query('practiceSites')
				.withIndex('by_location', (q) => q.eq('state', state))
				.collect();
		} else {
			return await ctx.db.query('practiceSites').collect();
		}
	}
});

export const insertPracticeSite = mutation({
	args: {
		name: v.string(),
		city: v.string(),
		state: v.string()
	},
	handler: async (ctx, { name, city, state }) => {
		await ctx.db.insert('practiceSites', {
			name,
			city,
			state
		});
	}
});

export const deletePracticeSite = mutation({
	args: { id: v.id('practiceSites') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	}
});

export const updatePracticeSite = mutation({
	args: { 
		id: v.id('practiceSites'),
		name: v.optional(v.string()),
		city: v.optional(v.string()),
		state: v.optional(v.string())
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
