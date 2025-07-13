import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('schools').collect();
	}
});

export const getWithPrograms = query({
	args: {},
	handler: async (ctx) => {
		const schools = await ctx.db.query('schools').collect();
		const schoolPrograms = await ctx.db.query('schoolPrograms').collect();
		const programTypes = await ctx.db.query('programTypes').collect();

		const programTypeMap = new Map(programTypes.map((p) => [p._id, p.name]));
		const schoolProgramsMap = new Map();

		schoolPrograms.forEach((sp) => {
			if (!schoolProgramsMap.has(sp.schoolId)) {
				schoolProgramsMap.set(sp.schoolId, []);
			}
			schoolProgramsMap.get(sp.schoolId).push({
				programTypeId: sp.programTypeId,
				programTypeName: programTypeMap.get(sp.programTypeId) || 'Unknown Program'
			});
		});

		return schools.map((school) => ({
			...school,
			programs: schoolProgramsMap.get(school._id) || []
		}));
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
