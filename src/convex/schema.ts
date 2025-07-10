import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	/* ---------------------------- 1. Schools ---------------------------- */
	schools: defineTable({
		name: v.string()
	}),

	/* ----------------------- 2. Practice Sites -------------------------- */
	practiceSites: defineTable({
		schoolId: v.id('schools'),
		name: v.string(),
		city: v.string(),
		state: v.string()
	}).index('by_school_name', ['schoolId', 'name']),

	/* ---------------------- 3. Rotation Types --------------------------- */
	rotationTypes: defineTable({
		name: v.string()
	}),

	/* ------------------------ 4. Preceptors ----------------------------- */
	preceptors: defineTable({
		schoolId: v.id('schools'),
		siteId: v.id('practiceSites'),
		fullName: v.string()
	}).index('by_school_site_name', ['schoolId', 'siteId', 'fullName']),

	/* -------------------------- 5. Reviews ------------------------------ */
	reviews: defineTable({
		preceptorId: v.id('preceptors'),
		rotationTypeId: v.id('rotationTypes'),

		ippeAppe: v.union(v.literal('IPPE'), v.literal('APPE')),
		schoolYear: v.union(v.literal('P1'), v.literal('P2'), v.literal('P3'), v.literal('P4')),
		priorExperience: v.union(
			v.literal('None'),
			v.literal('Little'),
			v.literal('Moderate'),
			v.literal('Significant')
		),
		extraHours: v.optional(v.number()),

		schedulingFlexibility: v.number(),
		workload: v.number(),
		expectations: v.number(),
		mentorship: v.number(),
		enjoyment: v.number(),

		wouldRecommend: v.boolean(),
		starRating: v.number(),
		comment: v.optional(v.string()),

		isOutlier: v.boolean(),
		outlierReason: v.optional(v.string()),

		updatedAt: v.number()
	}).index('by_preceptor', ['preceptorId'])
});
