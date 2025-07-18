import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	preceptorSchools: defineTable({
		preceptorId: v.id('preceptors'),
		schoolId: v.id('schools'),
		isActive: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_preceptor', ['preceptorId'])
		.index('by_school', ['schoolId'])
		.index('by_preceptor_school', ['preceptorId', 'schoolId'])
		.index('by_active_preceptor', ['preceptorId', 'isActive']),

	preceptorSites: defineTable({
		preceptorId: v.id('preceptors'),
		siteId: v.id('practiceSites'),
		schoolId: v.id('schools'), // Site affiliation is school-specific
		isActive: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_preceptor', ['preceptorId'])
		.index('by_site', ['siteId'])
		.index('by_school', ['schoolId'])
		.index('by_preceptor_site', ['preceptorId', 'siteId'])
		.index('by_preceptor_school_site', ['preceptorId', 'schoolId', 'siteId'])
		.index('by_active_preceptor', ['preceptorId', 'isActive']),

	preceptorPrograms: defineTable({
		preceptorId: v.id('preceptors'),
		programTypeId: v.id('programTypes'),
		schoolId: v.id('schools'), // Program supervision is school-specific
		siteId: v.id('practiceSites'), // And site-specific
		isActive: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_preceptor', ['preceptorId'])
		.index('by_program_type', ['programTypeId'])
		.index('by_school', ['schoolId'])
		.index('by_site', ['siteId'])
		.index('by_preceptor_program', ['preceptorId', 'programTypeId'])
		.index('by_preceptor_school_site_program', [
			'preceptorId',
			'schoolId',
			'siteId',
			'programTypeId'
		])
		.index('by_active_preceptor', ['preceptorId', 'isActive']),
	programTypes: defineTable({
		name: v.string(),
		yearLabels: v.array(v.string()),
		abbreviation: v.string()
	}).searchIndex('search_name', {
		searchField: 'name'
	}),

	experienceTypes: defineTable({
		programTypeId: v.id('programTypes'),
		name: v.string(),
		description: v.optional(v.string())
	}).index('by_program_type', ['programTypeId']),

	schools: defineTable({
		name: v.string()
	})
		.index('by_name', ['name'])
		.searchIndex('search_name', {
			searchField: 'name'
		}),

	schoolPrograms: defineTable({
		schoolId: v.id('schools'),
		programTypeId: v.id('programTypes')
	})
		.index('by_school', ['schoolId'])
		.index('by_program_type', ['programTypeId'])
		.index('by_school_program', ['schoolId', 'programTypeId']),

	practiceSites: defineTable({
		name: v.string(),
		city: v.string(),
		state: v.string()
	})
		.index('by_location', ['state', 'city'])
		.index('by_name', ['name'])
		.index('by_state', ['state'])
		.searchIndex('search_name', {
			searchField: 'name'
		}),

	rotationTypes: defineTable({
		programTypeId: v.id('programTypes'),
		name: v.string()
	})
		.index('by_program_type', ['programTypeId'])
		.index('by_name', ['name']),

	preceptors: defineTable({
		fullName: v.string(),
		email: v.optional(v.string()),
		credentials: v.optional(v.string())
	})
		.index('by_full_name', ['fullName'])
		.searchIndex('search_name', {
			searchField: 'fullName'
		}),

	reviews: defineTable({
		preceptorId: v.id('preceptors'),
		schoolId: v.id('schools'),
		siteId: v.id('practiceSites'),
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
	})
		.index('by_preceptor', ['preceptorId'])
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
		.index('by_school', ['schoolId'])
		.index('by_site', ['siteId'])
		.index('by_school_site', ['schoolId', 'siteId'])
		.index('by_preceptor_school_site', ['preceptorId', 'schoolId', 'siteId']),

	waitlist: defineTable({
		email: v.string()
	}).index('by_email', ['email'])
});
