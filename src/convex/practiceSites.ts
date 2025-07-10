import { query } from './_generated/server';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const preceptors = await ctx.db.query('practiceSites').collect();
		return preceptors;
	}
});
