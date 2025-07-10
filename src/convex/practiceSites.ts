import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const practiceSites = await ctx.db.query('practiceSites').collect();
		
		// Get all schools for joining
		const schools = await ctx.db.query('schools').collect();
		
		// Create lookup map for efficient joining
		const schoolMap = new Map(schools.map(s => [s._id, s.name]));
		
		// Return practice sites with resolved school names
		return practiceSites.map(site => ({
			...site,
			schoolName: schoolMap.get(site.schoolId) || 'Unknown School'
		}));
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
		schoolId: v.optional(v.id('schools')),
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
