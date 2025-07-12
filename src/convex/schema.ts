import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	programTypes: defineTable({
		name: v.string(),
		yearLabels: v.array(v.string()),
		abbreviation: v.string()
	}),
	
	experienceTypes: defineTable({
		programTypeId: v.id('programTypes'),
		name: v.string(),
		description: v.optional(v.string())
	}).index('by_program_type', ['programTypeId']),
	
	schools: defineTable({
		name: v.string()
	}).index('by_name', ['name']),
	
	schoolPrograms: defineTable({
		schoolId: v.id('schools'),
		programTypeId: v.id('programTypes')
	}).index('by_school', ['schoolId'])
	 .index('by_program_type', ['programTypeId'])
	 .index('by_school_program', ['schoolId', 'programTypeId']),
	
	practiceSites: defineTable({
		name: v.string(),
		city: v.string(),
		state: v.string()
	}).index('by_location', ['state', 'city'])
	 .index('by_name', ['name'])
	 .index('by_state', ['state']),
	
	rotationTypes: defineTable({
		programTypeId: v.id('programTypes'),
		name: v.string()
	}).index('by_program_type', ['programTypeId'])
	 .index('by_name', ['name']),
	
	preceptors: defineTable({
		schoolId: v.id('schools'),
		programTypeId: v.id('programTypes'),
		siteId: v.id('practiceSites'),
		fullName: v.string()
	}).index('by_full_name', ['fullName'])
	 .index('by_school_program', ['schoolId', 'programTypeId'])
	 .index('by_site', ['siteId'])
	 .index('by_program_type', ['programTypeId'])
	 .index('by_school', ['schoolId']),
	
	reviews: defineTable({
		preceptorId: v.id('preceptors'),
		rotationTypeId: v.id('rotationTypes'),
		experienceTypeId: v.id('experienceTypes'),
		schoolYear: v.string(),
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
		upvoteCount: v.number(),
		downvoteCount: v.number(),
		netScore: v.number(),
		isOutlier: v.boolean(),
		outlierReason: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_preceptor', ['preceptorId'])
	 .index('by_preceptor_created', ['preceptorId', 'createdAt'])
	 .index('by_rotation_type', ['rotationTypeId'])
	 .index('by_experience_type', ['experienceTypeId'])
	 .index('by_net_score', ['netScore'])
	 .index('by_recent_reviews', ['createdAt'])
	 .index('by_star_rating', ['starRating'])
	 .index('by_would_recommend', ['wouldRecommend'])
	 .index('by_preceptor_star_rating', ['preceptorId', 'starRating'])
	 .index('by_preceptor_recommend', ['preceptorId', 'wouldRecommend'])
	 .index('by_rotation_star_rating', ['rotationTypeId', 'starRating'])
	 .index('by_top_reviews', ['netScore', 'createdAt'])
});