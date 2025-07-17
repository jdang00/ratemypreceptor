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
				.withIndex('by_state', (q) => q.eq('state', state))
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
		return await ctx.db.insert('practiceSites', {
			name,
			city,
			state
		});
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
		return await ctx.db.patch(id, updates);
	}
});

export const deletePracticeSite = mutation({
	args: { id: v.id('practiceSites') },
	handler: async (ctx, { id }) => {
		return await ctx.db.delete(id);
	}
});
