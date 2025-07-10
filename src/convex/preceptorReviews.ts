import { query } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {
		fullName: v.string()
	},
	handler: async (ctx, { fullName }) => {
		const preceptor = await ctx.db
			.query('preceptors')
			.withIndex('by_full_name', (q) => q.eq('fullName', fullName))
			.first();

		if (!preceptor) {
			return [];
		}

		const reviews = await ctx.db
			.query('reviews')
			.withIndex('by_preceptor', (q) => q.eq('preceptorId', preceptor._id))
			.collect();

		const rotationTypes = await ctx.db.query('rotationTypes').collect();
		
		const rotationTypeMap = new Map(rotationTypes.map(r => [r._id, r.name]));
		
		return reviews.map(review => ({
			...review,
			rotationTypeName: rotationTypeMap.get(review.rotationTypeId) || 'Unknown Rotation'
		}));
	}
});
