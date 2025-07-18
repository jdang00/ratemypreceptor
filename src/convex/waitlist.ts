import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const addEmail = mutation({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		const normalized = email.trim().toLowerCase();

		const existing = await ctx.db
			.query('waitlist')
			.withIndex('by_email', (q) => q.eq('email', normalized))
			.first();
		if (existing) return;

		const fiveMinAgo = Date.now() - 5 * 60 * 1000;
		const recent = await ctx.db
			.query('waitlist')
			.withIndex('by_email', (q) => q.eq('email', normalized))
			.first();
		if (recent && recent._creationTime > fiveMinAgo) return;

		await ctx.db.insert('waitlist', { email: normalized });
	}
});
