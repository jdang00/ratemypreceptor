// convex/seed.ts
import { mutation, type MutationCtx } from './_generated/server';
import { ConvexError } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { v } from 'convex/values';

// Default seed configuration
const DEFAULT_SEED_CONFIG = {
	preceptors: 100,
	reviews: 800,
	schools: 12,
	practiceSites: 20,
	reviewsPerPreceptor: { min: 2, max: 12 },
	ratingDistributions: {
		positive: 0.6,
		neutral: 0.3,
		negative: 0.1
	}
};

// Real student data from your CSV
const REAL_STUDENT_DATA = [
	{ firstName: 'Cori', lastName: 'Dorrell', email: 'dorrellc@nsuok.edu', state: 'KS' },
	{ firstName: 'Charlea', lastName: 'Leonard', email: 'bcsix10@gmail.com', state: 'OK' },
	{ firstName: 'Karis', lastName: 'Cheek', email: 'karischeek@gmail.com', state: 'AR' },
	{ firstName: 'Greyson', lastName: 'Palmer', email: 'greyson.w.palmer@gmail.com', state: 'OK' },
	{ firstName: 'Madison', lastName: 'Wrather', email: 'cwrath76@gmail.com', state: 'OK' },
	{ firstName: 'Morgandy', lastName: 'Haggard', email: 'morgan_haggard@yahoo.com', state: 'OK' },
	{ firstName: 'Kennedy', lastName: 'Ammeter', email: 'kammeter2201@gmail.com', state: 'OK' },
	{ firstName: 'Connor', lastName: 'Swift', email: 'connorswift44@gmail.com', state: 'OK' },
	{ firstName: 'Eric', lastName: 'Roach', email: 'ericroach25@gmail.com', state: 'OK' },
	{ firstName: 'Samantha', lastName: 'Black', email: 'samanthacrosley2@gmail.com', state: 'OK' },
	{ firstName: 'Lan', lastName: 'Nguyen', email: 'lannguyensh@gmail.com', state: 'OK' },
	{ firstName: 'Tate', lastName: 'Buster', email: 'tatebuster22@gmail.com', state: 'OK' },
	{ firstName: 'Reid', lastName: 'Fellers', email: 'reidfellers@gmail.com', state: 'AR' },
	{ firstName: 'Brianna', lastName: 'Germany', email: 'brianna.germany@gmail.com', state: 'OK' },
	{ firstName: 'Cooper', lastName: 'McCoy', email: 'cooper_mccoy@yahoo.com', state: 'OK' },
	{ firstName: 'Tait', lastName: 'Garroutte', email: 'nevermiss3@gmail.com', state: 'OK' },
	{ firstName: 'Conner', lastName: 'West', email: 'cdwest1999@gmail.com', state: 'OK' },
	{ firstName: 'Derek', lastName: 'Bryant', email: 'dirkbryant14@gmail.com', state: 'KS' },
	{ firstName: 'Deryn', lastName: 'Hobbs', email: 'dancerd007@gmail.com', state: 'OK' },
	{ firstName: 'Nate', lastName: 'Sudderth', email: 'nsudderth2@gmail.com', state: 'OK' },
	{ firstName: 'Elizabeth', lastName: 'Sharp', email: 'libbyclairesharp@hotmail.com', state: 'OK' },
	{ firstName: 'Taylor', lastName: 'Haddock', email: 'haddockt@nsuok.edu', state: 'KS' },
	{ firstName: 'Rebecca', lastName: 'McNeill', email: 'rajmcneill@gmail.com', state: 'OK' },
	{ firstName: 'Layne', lastName: 'Fowler', email: 'fowlerlayne99@gmail.com', state: 'AR' },
	{ firstName: 'Spencer', lastName: 'Havel', email: 'spencerhavel@gmail.com', state: 'AR' },
	{ firstName: 'Zachary', lastName: 'Hardee', email: 'zachary.hardee16@gmail.com', state: 'OK' },
	{ firstName: 'Madison', lastName: 'Gerk', email: 'madigerk@gmail.com', state: 'OK' },
	{ firstName: 'Crystal', lastName: 'Henderson', email: 'crhaith@gmail.com', state: 'OK' },
	{ firstName: 'Sergio', lastName: 'Fernandez', email: 'fernands@nsuok.edu', state: 'OK' },
	{ firstName: 'Emily', lastName: 'Do', email: 'emilyjoycedo@gmail.com', state: 'OK' },
	{ firstName: 'Callie', lastName: 'Glisson', email: 'glissonc@nsuok.edu', state: 'OK' },
	{ firstName: 'Nicholas', lastName: 'Rankin', email: 'nicholasrankin1@gmail.com', state: 'OK' },
	{ firstName: 'Morgan', lastName: 'Miller', email: 'pack11@nsuok.edu', state: 'OK' },
	{ firstName: 'Justin', lastName: 'Dang', email: 'justindang02@gmail.com', state: 'OK' },
	{ firstName: 'Rachel', lastName: 'Psomas', email: 'rachel.psomas@gmail.com', state: 'OK' },
	{ firstName: 'Clint', lastName: 'Kelley', email: 'clintk21@ymail.com', state: 'OK' },
	{ firstName: 'Alex', lastName: 'Foree', email: 'aforee32@gmail.com', state: 'OK' },
	{ firstName: 'Brayden', lastName: 'Dyer', email: 'braydensdyer@gmail.com', state: 'OK' },
	{ firstName: 'Chloe', lastName: 'Read', email: 'chloeread33@gmail.com', state: 'OK' },
	{ firstName: 'Austin', lastName: 'Fenton', email: 'austinfenton32@gmail.com', state: 'OK' },
	{ firstName: 'Jennifer', lastName: 'Perez', email: 'jenny.nicole671@gmail.com', state: 'OK' },
	{
		firstName: 'Sherika',
		lastName: 'Jackson',
		email: 'sherika.jackson1998@outlook.com',
		state: 'OK'
	},
	{ firstName: 'Katharine', lastName: 'Stanton', email: 'kes1220@yahoo.com', state: 'KS' },
	{ firstName: 'Bach', lastName: 'Nguyen', email: 'bachlnguyen93@gmail.com', state: 'KS' },
	{ firstName: 'Julia', lastName: 'Do', email: 'juliado830@gmail.com', state: 'OK' },
	{ firstName: 'Jayden', lastName: 'Lazzari', email: 'jtlazzari@gmail.com', state: 'OK' },
	{ firstName: 'Matthew', lastName: 'Wolgast', email: 'wolgastmatthew@gmail.com', state: 'KS' },
	{ firstName: 'Lindsey', lastName: 'Anstine', email: 'anstine@nsuok.edu', state: 'OK' },
	{ firstName: 'Lainee', lastName: 'Winton', email: 'laineewinton@gmail.com', state: 'OK' },
	{ firstName: 'Jayton', lastName: 'Salmans', email: 'j-salmans@hotmail.com', state: 'OK' },
	{ firstName: 'Corbin', lastName: 'Lill', email: 'corbinlill3@gmail.com', state: 'OK' },
	{ firstName: 'Ariel', lastName: 'Fowler', email: 'ariel.fowler10@gmail.com', state: 'AR' },
	{ firstName: 'Nikolay', lastName: 'Spasov', email: 'nickspasov1999@gmail.com', state: 'OK' },
	{ firstName: 'Haelyn', lastName: 'Depriest', email: 'haelyndepriest@gmail.com', state: 'KS' },
	{ firstName: 'Corinne', lastName: 'Collet', email: 'colletcori@gmail.com', state: 'OK' },
	{ firstName: 'James', lastName: 'Gamble', email: 'grantgamble49@yahoo.com', state: 'KS' },
	{ firstName: 'Haylee', lastName: 'Flores', email: 'vandeveh@nsuok.edu', state: 'OK' },
	{ firstName: 'Courtney', lastName: 'Swift', email: 'courtneyswift7@gmail.com', state: 'OK' },
	{ firstName: 'Nathanael', lastName: 'Patron', email: 'patron.nathanael@gmail.com', state: 'KS' },
	{ firstName: 'Chase', lastName: 'Bowerman', email: 'chasebowerman66@gmail.com', state: 'AR' },
	{
		firstName: 'Mckenzie',
		lastName: 'Crockett',
		email: 'mckenzie.crockett67@gmail.com',
		state: 'OK'
	},
	{ firstName: 'Ethan', lastName: 'Chandler', email: 'ethanx26@gmail.com', state: 'KS' },
	{ firstName: 'Jaden', lastName: 'VanCuren', email: 'jaden.vancuren@gmail.com', state: 'KS' },
	{ firstName: 'Kaitlyn', lastName: 'Shima', email: 'shimakaitlyn@gmail.com', state: 'KS' },
	{ firstName: 'Makenzie', lastName: 'Fleitman', email: 'makenziefleitman@gmail.com', state: 'OK' },
	{ firstName: 'Lybbee', lastName: 'Graham', email: 'lybbee11@gmail.com', state: 'OK' },
	{ firstName: 'Clay', lastName: 'Buchanan', email: 'claymbuchanan@gmail.com', state: 'OK' },
	{ firstName: 'Abigail', lastName: 'Lowe', email: 'abbyloulowe@gmail.com', state: 'OK' },
	{
		firstName: 'Aleksandar',
		lastName: 'Simovic',
		email: 'aleksandar.simovic1992@gmail.com',
		state: 'OK'
	},
	{ firstName: 'Elizabeth', lastName: 'Garcia', email: 'egarcia447799@gmail.com', state: 'AR' },
	{ firstName: 'Hayden', lastName: 'Harness', email: 'hakimberland@gmail.com', state: 'AR' },
	{ firstName: 'Ryan', lastName: 'Kerr', email: 'kerr.ryan99@gmail.com', state: 'OK' },
	{ firstName: 'Sophie', lastName: 'Fosmire', email: 'shfosmire@gmail.com', state: 'OK' },
	{ firstName: 'Catherine', lastName: 'Hoselton', email: 'catevordenbaum@gmail.com', state: 'OK' },
	{ firstName: 'Chau', lastName: 'Phan', email: 'nguyetchau.phan@gmail.com', state: 'OK' },
	{ firstName: 'Lorrin', lastName: 'Hooten', email: 'hootenl@nsuok.edu', state: 'AR' },
	{ firstName: 'Nereida', lastName: 'Torres', email: 'torresn@nsuok.edu', state: 'OK' },
	{ firstName: 'Maral', lastName: 'Moradi', email: 'maral.m.moradi@gmail.com', state: 'OK' },
	{ firstName: 'Emma', lastName: 'Strunks', email: 'Strunkse@gmail.com', state: 'OK' },
	{ firstName: 'Cameron', lastName: 'Williams', email: 'willi305@nsuok.edu', state: 'OK' },
	{ firstName: 'Laudan', lastName: 'Hatami', email: 'laudanhatami@gmail.com', state: 'OK' },
	{ firstName: 'Amanda', lastName: 'Arie', email: 'amanda.liske13@gmail.com', state: 'OK' },
	{ firstName: 'Chelsea', lastName: 'Leonard', email: 'Chelsea.ba.98@gmail.com', state: 'OK' },
	{ firstName: 'Kaitlyn', lastName: 'Chapman', email: 'chapmankaty73@gmail.com', state: 'OK' },
	{ firstName: 'Tuyen', lastName: 'Hoang', email: 'kt.hoang01@gmail.com', state: 'KS' },
	{ firstName: 'Jacob', lastName: 'Allred', email: 'jakeallred28@gmail.com', state: 'OK' },
	{ firstName: 'Callie', lastName: 'Hawkins', email: 'callie.hawkins99@yahoo.com', state: 'OK' },
	{ firstName: 'Carl', lastName: 'Robinette', email: 'erobinette12@gmail.com', state: 'KS' },
	{ firstName: 'Emma', lastName: 'Brockman', email: 'Emma.Brockman4@gmail.com', state: 'OK' },
	{ firstName: 'Christena', lastName: 'Chanay', email: 'chrcrouch@gmail.com', state: 'KS' },
	{ firstName: 'Casey', lastName: 'Nolan', email: 'phyllismae13@gmail.com', state: 'OK' },
	{ firstName: 'Piper', lastName: 'Bowman', email: 'piperfain@gmail.com', state: 'AR' },
	{ firstName: 'Carlye', lastName: 'Kennedy', email: 'celizabethk00@yahoo.com', state: 'OK' },
	{ firstName: 'Bayley', lastName: 'Miller', email: 'bayleynmiller@gmail.com', state: 'AR' },
	{
		firstName: 'Kaitlyn',
		lastName: 'Goldsmith',
		email: 'kaitlyngoldsmith2@gmail.com',
		state: 'OK'
	},
	{ firstName: 'Ashley', lastName: 'Oakley', email: 'ashoak97@gmail.com', state: 'OK' }
];

// Program types focused on health sciences
const PROGRAM_TYPES = [
	{
		name: 'Pharmacy',
		yearLabels: ['P1', 'P2', 'P3', 'P4'],
		abbreviation: 'PharmD'
	},
	{
		name: 'Medicine',
		yearLabels: ['M1', 'M2', 'M3', 'M4'],
		abbreviation: 'MD'
	},
	{
		name: 'Optometry',
		yearLabels: ['OD1', 'OD2', 'OD3', 'OD4'],
		abbreviation: 'OD'
	},
	{
		name: 'Physical Therapy',
		yearLabels: ['DPT1', 'DPT2', 'DPT3'],
		abbreviation: 'DPT'
	},
	{
		name: 'Occupational Therapy',
		yearLabels: ['OTD1', 'OTD2', 'OTD3'],
		abbreviation: 'OTD'
	}
];

const EXPERIENCE_TYPES_BY_PROGRAM: Record<string, Array<{ name: string; description?: string }>> = {
	Pharmacy: [
		{ name: 'IPPE', description: 'Introductory Pharmacy Practice Experience' },
		{ name: 'APPE', description: 'Advanced Pharmacy Practice Experience' }
	],
	Medicine: [
		{ name: 'Clinical Rotation', description: 'Core clinical rotations' },
		{ name: 'Elective', description: 'Elective rotations' },
		{ name: 'Sub-Internship', description: 'Acting internship rotations' }
	],
	Optometry: [
		{ name: 'Clinical Rotation', description: 'Clinical training rotations' },
		{ name: 'Externship', description: 'External clinical experience' }
	],
	'Physical Therapy': [
		{ name: 'Clinical Internship', description: 'Clinical training experience' }
	],
	'Occupational Therapy': [{ name: 'Fieldwork', description: 'Level II Fieldwork experience' }]
};

const ROTATION_TYPES_BY_PROGRAM: Record<string, string[]> = {
	Pharmacy: [
		'Community Pharmacy',
		'Hospital Pharmacy',
		'Clinical Pharmacy',
		'Ambulatory Care',
		'Critical Care',
		'Oncology',
		'Pediatrics'
	],
	Medicine: [
		'Internal Medicine',
		'Surgery',
		'Pediatrics',
		'Obstetrics/Gynecology',
		'Psychiatry',
		'Family Medicine',
		'Emergency Medicine',
		'Radiology'
	],
	Optometry: [
		'Primary Care',
		'Pediatric Optometry',
		'Low Vision',
		'Contact Lenses',
		'Ocular Disease',
		'Refractive Surgery'
	],
	'Physical Therapy': [
		'Orthopedics',
		'Neurological',
		'Pediatrics',
		'Geriatrics',
		'Cardiopulmonary',
		'Sports Medicine'
	],
	'Occupational Therapy': [
		'Pediatrics',
		'Mental Health',
		'Physical Rehabilitation',
		'Hand Therapy',
		'Community Practice'
	]
};

// Schools in Arkansas, Oklahoma, and Kansas
const REGIONAL_SCHOOLS = [
	'University of Arkansas for Medical Sciences',
	'Arkansas State University',
	'University of Central Arkansas',
	'Harding University College of Pharmacy',
	'University of Oklahoma Health Sciences Center',
	'Oklahoma State University',
	'Northeastern State University',
	'Southwestern Oklahoma State University',
	'University of Kansas Medical Center',
	'Kansas State University',
	'Wichita State University',
	'Pittsburg State University'
];

// Practice sites in Arkansas, Oklahoma, and Kansas
const REGIONAL_PRACTICE_SITES = [
	{ name: 'UAMS Medical Center', city: 'Little Rock', state: 'AR' },
	{ name: "Arkansas Children's Hospital", city: 'Little Rock', state: 'AR' },
	{ name: 'CHI St. Vincent', city: 'Little Rock', state: 'AR' },
	{ name: 'Washington Regional Medical Center', city: 'Fayetteville', state: 'AR' },
	{ name: 'Mercy Hospital Northwest Arkansas', city: 'Rogers', state: 'AR' },
	{ name: 'OU Medical Center', city: 'Oklahoma City', state: 'OK' },
	{ name: 'Saint Francis Hospital', city: 'Tulsa', state: 'OK' },
	{ name: 'Integris Baptist Medical Center', city: 'Oklahoma City', state: 'OK' },
	{ name: 'Hillcrest Medical Center', city: 'Tulsa', state: 'OK' },
	{ name: 'Mercy Hospital Oklahoma City', city: 'Oklahoma City', state: 'OK' },
	{ name: 'Tahlequah City Hospital', city: 'Tahlequah', state: 'OK' },
	{ name: 'Cherokee Nation Health Services', city: 'Tahlequah', state: 'OK' },
	{ name: 'University of Kansas Hospital', city: 'Kansas City', state: 'KS' },
	{ name: 'Wesley Medical Center', city: 'Wichita', state: 'KS' },
	{ name: 'Stormont Vail Health', city: 'Topeka', state: 'KS' },
	{ name: 'Hays Medical Center', city: 'Hays', state: 'KS' },
	{ name: 'CVS Pharmacy - Tahlequah', city: 'Tahlequah', state: 'OK' },
	{ name: 'Walgreens - Fayetteville', city: 'Fayetteville', state: 'AR' },
	{ name: 'Walmart Pharmacy - Wichita', city: 'Wichita', state: 'KS' },
	{ name: "Reasor's Pharmacy", city: 'Tulsa', state: 'OK' }
];

const REVIEW_COMMENTS = [
	'Excellent learning experience with hands-on patient care.',
	'Great mentorship and teaching approach.',
	'Very supportive and encouraging environment.',
	'Learned a lot about clinical decision making.',
	'Challenging but rewarding rotation.',
	'Preceptor was very knowledgeable and approachable.',
	'Good balance of autonomy and supervision.',
	'Excellent exposure to diverse patient cases.',
	'Very organized and structured learning experience.',
	'Preceptor took time to explain complex concepts.',
	'Great opportunity to develop clinical skills.',
	'Supportive environment for learning and growth.',
	'Excellent teaching methods and feedback.',
	'Good mix of didactic and hands-on learning.',
	'Preceptor was very patient and encouraging.',
	'Learned valuable clinical pearls and tips.',
	'Great experience for building confidence.',
	'Excellent role model for patient care.',
	'Very thorough in teaching clinical reasoning.',
	'Good balance of independence and guidance.',
	'Excellent preparation for future practice.',
	'Great exposure to different practice settings.',
	'Very knowledgeable and willing to share expertise.',
	'Good structure for learning objectives.',
	'Excellent feedback and constructive criticism.',
	'Great opportunity to practice clinical skills.',
	'Very supportive of student learning goals.',
	'Excellent teaching of evidence-based practice.',
	'Good integration of theory and practice.',
	'Very professional and respectful environment.',
	'Great learning experience overall.'
];

interface ProgramTypeWithId {
	id: Id<'programTypes'>;
	name: string;
}

interface RotationTypeWithProgram {
	id: Id<'rotationTypes'>;
	programTypeId: Id<'programTypes'>;
}

export const clearTables = mutation({
	args: {},
	handler: async (ctx) => {
		console.log('🧹 Starting table clearing...');

		try {
			await clearAllTables(ctx);
			console.log('✅ Tables cleared successfully!');

			return {
				success: true,
				message: 'All tables cleared successfully'
			};
		} catch (error) {
			console.error('❌ Table clearing failed:', error);
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new ConvexError(`Table clearing failed: ${errorMessage}`);
		}
	}
});

export const seedDatabase = mutation({
	args: {
		config: v.optional(
			v.object({
				preceptors: v.optional(v.number()),
				reviews: v.optional(v.number()),
				schools: v.optional(v.number()),
				practiceSites: v.optional(v.number()),
				reviewsPerPreceptor: v.optional(
					v.object({
						min: v.number(),
						max: v.number()
					})
				),
				ratingDistributions: v.optional(
					v.object({
						positive: v.number(),
						neutral: v.number(),
						negative: v.number()
					})
				)
			})
		)
	},
	handler: async (ctx, args) => {
		console.log('🌱 Starting database seeding...');

		const config = {
			...DEFAULT_SEED_CONFIG,
			...(args.config || {})
		};

		try {
			await clearAllTables(ctx);

			const programTypeIds = await seedProgramTypes(ctx);
			const schoolIds = await seedSchools(ctx, config.schools);
			const practiceSiteIds = await seedPracticeSites(ctx, config.practiceSites);

			const experienceTypeIds = await seedExperienceTypes(ctx, programTypeIds);
			const rotationTypeIds = await seedRotationTypes(ctx, programTypeIds);
			await seedSchoolPrograms(ctx, schoolIds, programTypeIds);
			const preceptorIds = await seedPreceptors(
				ctx,
				schoolIds,
				programTypeIds,
				practiceSiteIds,
				config.preceptors
			);

			await seedReviews(
				ctx,
				preceptorIds,
				rotationTypeIds,
				experienceTypeIds,
				schoolIds,
				practiceSiteIds,
				config
			);

			console.log('✅ Database seeding completed successfully!');

			return {
				success: true,
				counts: {
					programTypes: programTypeIds.length,
					schools: schoolIds.length,
					practiceSites: practiceSiteIds.length,
					experienceTypes: experienceTypeIds.length,
					rotationTypes: rotationTypeIds.length,
					preceptors: preceptorIds.length
				}
			};
		} catch (error) {
			console.error('❌ Seeding failed:', error);
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new ConvexError(`Seeding failed: ${errorMessage}`);
		}
	}
});

async function clearAllTables(ctx: MutationCtx) {
	const tables = [
		'reviews',
		'preceptorPrograms',
		'preceptorSites',
		'preceptorSchools',
		'preceptors',
		'rotationTypes',
		'schoolPrograms',
		'experienceTypes',
		'practiceSites',
		'schools',
		'programTypes'
	] as const;

	for (const table of tables) {
		const records = await ctx.db.query(table).collect();
		for (const record of records) {
			await ctx.db.delete(record._id);
		}
	}
	console.log('🧹 Cleared existing data');
}

async function seedProgramTypes(ctx: MutationCtx): Promise<ProgramTypeWithId[]> {
	const ids: ProgramTypeWithId[] = [];
	for (const programType of PROGRAM_TYPES) {
		const id = await ctx.db.insert('programTypes', programType);
		ids.push({ id, name: programType.name });
	}
	console.log(`📚 Seeded ${ids.length} program types`);
	return ids;
}

async function seedSchools(ctx: MutationCtx, count: number): Promise<Id<'schools'>[]> {
	const ids: Id<'schools'>[] = [];
	const schoolsToSeed = REGIONAL_SCHOOLS.slice(0, Math.min(count, REGIONAL_SCHOOLS.length));

	for (const schoolName of schoolsToSeed) {
		const id = await ctx.db.insert('schools', { name: schoolName });
		ids.push(id);
	}
	console.log(`🏫 Seeded ${ids.length} regional schools`);
	return ids;
}

async function seedPracticeSites(ctx: MutationCtx, count: number): Promise<Id<'practiceSites'>[]> {
	const ids: Id<'practiceSites'>[] = [];
	const sitesToSeed = REGIONAL_PRACTICE_SITES.slice(
		0,
		Math.min(count, REGIONAL_PRACTICE_SITES.length)
	);

	for (const site of sitesToSeed) {
		const id = await ctx.db.insert('practiceSites', site);
		ids.push(id);
	}
	console.log(`🏥 Seeded ${ids.length} regional practice sites`);
	return ids;
}

async function seedExperienceTypes(
	ctx: MutationCtx,
	programTypeIds: ProgramTypeWithId[]
): Promise<Id<'experienceTypes'>[]> {
	const ids: Id<'experienceTypes'>[] = [];
	for (const programType of programTypeIds) {
		const experiences = EXPERIENCE_TYPES_BY_PROGRAM[programType.name] || [];
		for (const exp of experiences) {
			const id = await ctx.db.insert('experienceTypes', {
				programTypeId: programType.id,
				...exp
			});
			ids.push(id);
		}
	}
	console.log(`📋 Seeded ${ids.length} experience types`);
	return ids;
}

async function seedRotationTypes(
	ctx: MutationCtx,
	programTypeIds: ProgramTypeWithId[]
): Promise<RotationTypeWithProgram[]> {
	const ids: RotationTypeWithProgram[] = [];
	for (const programType of programTypeIds) {
		const rotations = ROTATION_TYPES_BY_PROGRAM[programType.name] || [];
		for (const rotation of rotations) {
			const id = await ctx.db.insert('rotationTypes', {
				programTypeId: programType.id,
				name: rotation
			});
			ids.push({ id, programTypeId: programType.id });
		}
	}
	console.log(`🔄 Seeded ${ids.length} rotation types`);
	return ids;
}

async function seedSchoolPrograms(
	ctx: MutationCtx,
	schoolIds: Id<'schools'>[],
	programTypeIds: ProgramTypeWithId[]
): Promise<void> {
	const ids: Id<'schoolPrograms'>[] = [];
	for (const schoolId of schoolIds) {
		const numPrograms = Math.floor(Math.random() * 3) + 2;
		const selectedPrograms = [...programTypeIds]
			.sort(() => 0.5 - Math.random())
			.slice(0, numPrograms);

		for (const program of selectedPrograms) {
			const id = await ctx.db.insert('schoolPrograms', {
				schoolId,
				programTypeId: program.id
			});
			ids.push(id);
		}
	}
	console.log(`🎓 Seeded ${ids.length} school programs`);
}

async function seedPreceptors(
	ctx: MutationCtx,
	schoolIds: Id<'schools'>[],
	programTypeIds: ProgramTypeWithId[],
	practiceSiteIds: Id<'practiceSites'>[],
	count: number
): Promise<Id<'preceptors'>[]> {
	const ids: Id<'preceptors'>[] = [];
	const now = Date.now();

	for (let i = 0; i < count; i++) {
		const student = REAL_STUDENT_DATA[i % REAL_STUDENT_DATA.length];
		const fullName = `Dr. ${student.firstName} ${student.lastName}`;
		const email = student.email;
		const credentials = ['MD', 'PharmD', 'DO', 'NP', 'PA-C'][Math.floor(Math.random() * 5)];

		const preceptorId = await ctx.db.insert('preceptors', {
			fullName,
			email,
			credentials
		});

		const schoolId = schoolIds[Math.floor(Math.random() * schoolIds.length)];
		const programType = programTypeIds[Math.floor(Math.random() * programTypeIds.length)];
		const siteId = practiceSiteIds[Math.floor(Math.random() * practiceSiteIds.length)];

		await ctx.db.insert('preceptorSchools', {
			preceptorId,
			schoolId,
			isActive: true,
			createdAt: now,
			updatedAt: now
		});

		await ctx.db.insert('preceptorSites', {
			preceptorId,
			schoolId,
			siteId,
			isActive: true,
			createdAt: now,
			updatedAt: now
		});

		await ctx.db.insert('preceptorPrograms', {
			preceptorId,
			schoolId,
			siteId,
			programTypeId: programType.id,
			isActive: true,
			createdAt: now,
			updatedAt: now
		});

		ids.push(preceptorId);
	}

	console.log(`👨‍⚕️ Seeded ${ids.length} preceptors with affiliations`);
	return ids;
}

function generateRealisticRatings(config: typeof DEFAULT_SEED_CONFIG): {
	ratings: Record<string, number>;
	starRating: number;
} {
	const rand = Math.random();
	let ratingDistribution;

	if (rand < config.ratingDistributions.positive) {
		ratingDistribution = { min: 3, max: 5, bias: 0.7 };
	} else if (rand < config.ratingDistributions.positive + config.ratingDistributions.neutral) {
		ratingDistribution = { min: 2, max: 4, bias: 0.5 };
	} else {
		ratingDistribution = { min: 1, max: 3, bias: 0.3 };
	}

	const generateRating = (min: number, max: number, bias: number) => {
		const baseRating = Math.floor(Math.random() * (max - min + 1)) + min;
		return Math.random() < bias ? Math.min(max, baseRating + 1) : baseRating;
	};

	const ratings = {
		schedulingFlexibility: generateRating(
			ratingDistribution.min,
			ratingDistribution.max,
			ratingDistribution.bias
		),
		workload: generateRating(1, 5, 0.5),
		expectations: generateRating(
			ratingDistribution.min,
			ratingDistribution.max,
			ratingDistribution.bias
		),
		mentorship: generateRating(
			ratingDistribution.min,
			ratingDistribution.max,
			ratingDistribution.bias
		),
		enjoyment: generateRating(
			ratingDistribution.min,
			ratingDistribution.max,
			ratingDistribution.bias
		)
	};

	const starRating = Math.round(
		(ratings.schedulingFlexibility +
			ratings.expectations +
			ratings.mentorship +
			ratings.enjoyment) /
			4
	);

	return { ratings, starRating };
}

async function seedReviews(
	ctx: MutationCtx,
	preceptorIds: Id<'preceptors'>[],
	rotationTypeIds: RotationTypeWithProgram[],
	experienceTypeIds: Id<'experienceTypes'>[],
	schoolIds: Id<'schools'>[],
	practiceSiteIds: Id<'practiceSites'>[],
	config: typeof DEFAULT_SEED_CONFIG
): Promise<void> {
	const priorExperienceOptions = ['None', 'Little', 'Moderate', 'Significant'] as const;
	const now = Date.now();
	let totalReviews = 0;

	for (const preceptorId of preceptorIds) {
		const numReviews =
			Math.floor(
				Math.random() * (config.reviewsPerPreceptor.max - config.reviewsPerPreceptor.min + 1)
			) + config.reviewsPerPreceptor.min;

		for (let i = 0; i < numReviews; i++) {
			const rotationType = rotationTypeIds[Math.floor(Math.random() * rotationTypeIds.length)];
			const experienceType =
				experienceTypeIds[Math.floor(Math.random() * experienceTypeIds.length)];
			const schoolId = schoolIds[Math.floor(Math.random() * schoolIds.length)];
			const siteId = practiceSiteIds[Math.floor(Math.random() * practiceSiteIds.length)];

			const yearLabels = [
				'P1',
				'P2',
				'P3',
				'P4',
				'M1',
				'M2',
				'M3',
				'M4',
				'OD1',
				'OD2',
				'OD3',
				'OD4'
			];
			const schoolYear = yearLabels[Math.floor(Math.random() * yearLabels.length)];

			const { ratings, starRating } = generateRealisticRatings(config);
			const upvotes = Math.floor(Math.random() * 15);
			const downvotes = Math.floor(Math.random() * 5);

			const hasComment = Math.random() > 0.3;
			const comment = hasComment
				? REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)]
				: undefined;

			await ctx.db.insert('reviews', {
				preceptorId,
				schoolId,
				siteId,
				rotationTypeId: rotationType.id,
				experienceTypeId: experienceType,
				schoolYear,
				priorExperience:
					priorExperienceOptions[Math.floor(Math.random() * priorExperienceOptions.length)],
				extraHours: Math.random() > 0.7 ? Math.floor(Math.random() * 20) : undefined,
				schedulingFlexibility: ratings.schedulingFlexibility,
				workload: ratings.workload,
				expectations: ratings.expectations,
				mentorship: ratings.mentorship,
				enjoyment: ratings.enjoyment,
				wouldRecommend: starRating >= 3,
				starRating,
				comment,
				upvoteCount: upvotes,
				downvoteCount: downvotes,
				netScore: upvotes - downvotes,
				isOutlier: false,
				createdAt: now - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
				updatedAt: now
			});

			totalReviews++;
		}
	}

	console.log(`⭐ Seeded ${totalReviews} reviews`);
}
