import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const schoolPrograms = await ctx.db.query('schoolPrograms').collect();
		const schools = await ctx.db.query('schools').collect();
		const programTypes = await ctx.db.query('programTypes').collect();
		
		const schoolMap = new Map(schools.map(s => [s._id, s.name]));
		const programTypeMap = new Map(programTypes.map(p => [p._id, p.name]));
		
		return schoolPrograms.map(sp => ({
			...sp,
			schoolName: schoolMap.get(sp.schoolId) || 'Unknown School',
			programTypeName: programTypeMap.get(sp.programTypeId) || 'Unknown Program'
		}));
	}
});

export const getBySchool = query({
	args: { schoolId: v.id('schools') },
	handler: async (ctx, { schoolId }) => {
		const schoolPrograms = await ctx.db
			.query('schoolPrograms')
			.withIndex('by_school', (q) => q.eq('schoolId', schoolId))
			.collect();
			
		const programTypes = await ctx.db.query('programTypes').collect();
		const programTypeMap = new Map(programTypes.map(p => [p._id, p.name]));
		
		return schoolPrograms.map(sp => ({
			...sp,
			programTypeName: programTypeMap.get(sp.programTypeId) || 'Unknown Program'
		}));
	}
});

export const getByProgramType = query({
	args: { programTypeId: v.id('programTypes') },
	handler: async (ctx, { programTypeId }) => {
		const schoolPrograms = await ctx.db
			.query('schoolPrograms')
			.withIndex('by_program_type', (q) => q.eq('programTypeId', programTypeId))
			.collect();
			
		const schools = await ctx.db.query('schools').collect();
		const schoolMap = new Map(schools.map(s => [s._id, s.name]));
		
		return schoolPrograms.map(sp => ({
			...sp,
			schoolName: schoolMap.get(sp.schoolId) || 'Unknown School'
		}));
	}
});

export const insertSchoolProgram = mutation({
	args: {
		schoolId: v.id('schools'),
		programTypeId: v.id('programTypes')
	},
	handler: async (ctx, { schoolId, programTypeId }) => {
		await ctx.db.insert('schoolPrograms', {
			schoolId,
			programTypeId
		});
	}
});

export const updateSchoolProgram = mutation({
	args: {
		id: v.id('schoolPrograms'),
		schoolId: v.optional(v.id('schools')),
		programTypeId: v.optional(v.id('programTypes'))
	},
	handler: async (ctx, { id, schoolId, programTypeId }) => {
		const updates: Record<string, unknown> = {};
		
		if (schoolId !== undefined) {
			updates.schoolId = schoolId;
		}
		if (programTypeId !== undefined) {
			updates.programTypeId = programTypeId;
		}
		
		if (Object.keys(updates).length > 0) {
			await ctx.db.patch(id, updates);
		}
	}
});

export const deleteSchoolProgram = mutation({
	args: { id: v.id('schoolPrograms') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	}
}); 