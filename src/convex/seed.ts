// convex/seed.ts
import { mutation, type MutationCtx } from "./_generated/server";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

// Default seed configuration
const DEFAULT_SEED_CONFIG = {
  preceptors: 150,
  reviews: 1000,
  schools: 15,
  practiceSites: 25,
  reviewsPerPreceptor: { min: 1, max: 8 },
  ratingDistributions: {
    positive: 0.6,
    neutral: 0.3,
    negative: 0.1
  }
};

// Seed data constants
const PROGRAM_TYPES = [
  {
    name: "Pharmacy",
    yearLabels: ["P1", "P2", "P3", "P4"],
    abbreviation: "PharmD"
  },
  {
    name: "Medicine", 
    yearLabels: ["M1", "M2", "M3", "M4"],
    abbreviation: "MD"
  },
  {
    name: "Optometry",
    yearLabels: ["OD1", "OD2", "OD3", "OD4"], 
    abbreviation: "OD"
  },
  {
    name: "Physical Therapy",
    yearLabels: ["DPT1", "DPT2", "DPT3"],
    abbreviation: "DPT"
  },
  {
    name: "Occupational Therapy",
    yearLabels: ["OTD1", "OTD2", "OTD3"],
    abbreviation: "OTD"
  }
];

const EXPERIENCE_TYPES_BY_PROGRAM: Record<string, Array<{ name: string; description: string }>> = {
  "Pharmacy": [
    { name: "IPPE", description: "Introductory Pharmacy Practice Experience" },
    { name: "APPE", description: "Advanced Pharmacy Practice Experience" }
  ],
  "Medicine": [
    { name: "Clinical Rotation", description: "Core clinical rotations" },
    { name: "Elective", description: "Elective rotations" },
    { name: "Sub-Internship", description: "Acting internship rotations" }
  ],
  "Optometry": [
    { name: "Clinical Rotation", description: "Clinical training rotations" },
    { name: "Externship", description: "External clinical experience" }
  ],
  "Physical Therapy": [
    { name: "Clinical Internship", description: "Clinical training experience" }
  ],
  "Occupational Therapy": [
    { name: "Fieldwork", description: "Level II Fieldwork experience" }
  ]
};

const ROTATION_TYPES_BY_PROGRAM: Record<string, string[]> = {
  "Pharmacy": [
    "Community Pharmacy", "Hospital Pharmacy", "Clinical Pharmacy",
    "Ambulatory Care", "Critical Care", "Oncology", "Pediatrics"
  ],
  "Medicine": [
    "Internal Medicine", "Surgery", "Pediatrics", "Obstetrics/Gynecology",
    "Psychiatry", "Family Medicine", "Emergency Medicine", "Radiology"
  ],
  "Optometry": [
    "Primary Care", "Pediatric Optometry", "Low Vision", "Contact Lenses",
    "Ocular Disease", "Refractive Surgery"
  ],
  "Physical Therapy": [
    "Orthopedics", "Neurological", "Pediatrics", "Geriatrics",
    "Cardiopulmonary", "Sports Medicine"
  ],
  "Occupational Therapy": [
    "Pediatrics", "Mental Health", "Physical Rehabilitation",
    "Hand Therapy", "Community Practice"
  ]
};

const SAMPLE_SCHOOLS = [
  "University of California San Francisco",
  "Johns Hopkins University", 
  "University of Michigan",
  "University of Washington",
  "Emory University",
  "University of North Carolina",
  "University of Pittsburgh",
  "Ohio State University",
  "Stanford University",
  "Harvard Medical School",
  "Yale School of Medicine",
  "University of Pennsylvania",
  "Duke University",
  "University of California Los Angeles",
  "University of Texas Southwestern"
];

const SAMPLE_PRACTICE_SITES = [
  { name: "UCSF Medical Center", city: "San Francisco", state: "CA" },
  { name: "Johns Hopkins Hospital", city: "Baltimore", state: "MD" },
  { name: "CVS Pharmacy #1234", city: "Ann Arbor", state: "MI" },
  { name: "Seattle Children's Hospital", city: "Seattle", state: "WA" },
  { name: "Emory University Hospital", city: "Atlanta", state: "GA" },
  { name: "Walgreens #5678", city: "Chapel Hill", state: "NC" },
  { name: "UPMC Presbyterian", city: "Pittsburgh", state: "PA" },
  { name: "Ohio State Wexner Medical Center", city: "Columbus", state: "OH" },
  { name: "Stanford Health Care", city: "Stanford", state: "CA" },
  { name: "Massachusetts General Hospital", city: "Boston", state: "MA" },
  { name: "Yale New Haven Hospital", city: "New Haven", state: "CT" },
  { name: "Hospital of the University of Pennsylvania", city: "Philadelphia", state: "PA" },
  { name: "Duke University Hospital", city: "Durham", state: "NC" },
  { name: "Ronald Reagan UCLA Medical Center", city: "Los Angeles", state: "CA" },
  { name: "UT Southwestern Medical Center", city: "Dallas", state: "TX" },
  { name: "Kaiser Permanente Medical Center", city: "Oakland", state: "CA" },
  { name: "Mayo Clinic", city: "Rochester", state: "MN" },
  { name: "Cleveland Clinic", city: "Cleveland", state: "OH" },
  { name: "Mount Sinai Hospital", city: "New York", state: "NY" },
  { name: "Northwestern Memorial Hospital", city: "Chicago", state: "IL" },
  { name: "Vanderbilt University Medical Center", city: "Nashville", state: "TN" },
  { name: "University of Chicago Medical Center", city: "Chicago", state: "IL" },
  { name: "NYU Langone Health", city: "New York", state: "NY" },
  { name: "Cedars-Sinai Medical Center", city: "Los Angeles", state: "CA" },
  { name: "Rush University Medical Center", city: "Chicago", state: "IL" }
];

const DIVERSE_FIRST_NAMES = [
  "Aisha", "Alicia", "Amanda", "Amber", "Amy", "Andrea", "Angela", "Anna", "Ashley", "Audrey",
  "Barbara", "Beth", "Brittany", "Brooke", "Caitlin", "Carla", "Carmen", "Carol", "Caroline", "Cassandra",
  "Catherine", "Chelsea", "Christina", "Christine", "Cindy", "Claire", "Crystal", "Dana", "Danielle", "Dawn",
  "Deborah", "Denise", "Diana", "Donna", "Dorothy", "Elizabeth", "Emily", "Emma", "Erica", "Erika",
  "Erin", "Eva", "Faith", "Felicia", "Florence", "Gabrielle", "Gina", "Grace", "Heather", "Helen",
  "Holly", "Hope", "Iris", "Jackie", "Jacqueline", "Jamie", "Jane", "Janet", "Janice", "Jasmine",
  "Jennifer", "Jessica", "Jill", "Joan", "Joanna", "Joyce", "Julia", "Julie", "Karen", "Katherine",
  "Kathy", "Katie", "Katrina", "Kelly", "Kim", "Kimberly", "Kristen", "Kristin", "Kristina", "Kristine",
  "Laura", "Lauren", "Laurie", "Leah", "Leslie", "Linda", "Lisa", "Lori", "Lynn", "Madison",
  "Mandy", "Margaret", "Maria", "Marianne", "Marie", "Marilyn", "Marisa", "Martha", "Mary", "Maureen",
  "Megan", "Melanie", "Melissa", "Michelle", "Molly", "Monica", "Nancy", "Natalie", "Nicole", "Nina",
  "Olivia", "Pamela", "Patricia", "Paula", "Pauline", "Rachel", "Rebecca", "Renee", "Rhonda", "Robin",
  "Rose", "Ruth", "Samantha", "Sandra", "Sarah", "Sharon", "Sheila", "Shelley", "Sherry", "Shirley",
  "Sonia", "Stephanie", "Susan", "Suzanne", "Sylvia", "Tanya", "Tara", "Teresa", "Tiffany", "Tina",
  "Tracy", "Valerie", "Vanessa", "Vicki", "Victoria", "Wendy", "Wendy", "Yolanda", "Zoe"
];

const DIVERSE_LAST_NAMES = [
  "Adams", "Alexander", "Allen", "Anderson", "Andrews", "Armstrong", "Baker", "Barnes", "Bell", "Bennett",
  "Black", "Blake", "Boyd", "Bradley", "Brooks", "Brown", "Burke", "Burns", "Butler", "Campbell",
  "Carter", "Chapman", "Clark", "Collins", "Cook", "Cooper", "Cox", "Crawford", "Cruz", "Cunningham",
  "Curtis", "Davidson", "Davis", "Dixon", "Douglas", "Duncan", "Edwards", "Ellis", "Evans", "Fisher",
  "Fleming", "Foster", "Fox", "Fraser", "Gardner", "Gibson", "Gordon", "Graham", "Grant", "Gray",
  "Green", "Hall", "Hamilton", "Harris", "Harrison", "Hart", "Hayes", "Henderson", "Hill", "Holmes",
  "Howard", "Hughes", "Hunter", "Jackson", "James", "Jenkins", "Johnson", "Jones", "Kelly", "Kennedy",
  "King", "Knight", "Lawrence", "Lee", "Lewis", "Lopez", "Lucas", "MacDonald", "Marshall", "Martin",
  "Mason", "McDonald", "Miller", "Mitchell", "Moore", "Morgan", "Morris", "Morrison", "Murphy", "Murray",
  "Nelson", "Newman", "O'Connor", "O'Brien", "Oliver", "Owen", "Parker", "Paterson", "Patterson", "Pearson",
  "Phillips", "Powell", "Price", "Quinn", "Reed", "Reid", "Reynolds", "Richardson", "Roberts", "Robertson",
  "Robinson", "Rogers", "Ross", "Russell", "Ryan", "Scott", "Shaw", "Simpson", "Smith", "Stewart",
  "Taylor", "Thomas", "Thompson", "Turner", "Walker", "Walsh", "Ward", "Watson", "White", "Williams",
  "Wilson", "Wood", "Wright", "Young"
];

const REVIEW_COMMENTS = [
  "Excellent learning experience with hands-on patient care.",
  "Great mentorship and teaching approach.",
  "Very supportive and encouraging environment.",
  "Learned a lot about clinical decision making.",
  "Challenging but rewarding rotation.",
  "Preceptor was very knowledgeable and approachable.",
  "Good balance of autonomy and supervision.",
  "Excellent exposure to diverse patient cases.",
  "Very organized and structured learning experience.",
  "Preceptor took time to explain complex concepts.",
  "Great opportunity to develop clinical skills.",
  "Supportive environment for learning and growth.",
  "Excellent teaching methods and feedback.",
  "Good mix of didactic and hands-on learning.",
  "Preceptor was very patient and encouraging.",
  "Learned valuable clinical pearls and tips.",
  "Great experience for building confidence.",
  "Excellent role model for patient care.",
  "Very thorough in teaching clinical reasoning.",
  "Good balance of independence and guidance.",
  "Excellent preparation for future practice.",
  "Great exposure to different practice settings.",
  "Very knowledgeable and willing to share expertise.",
  "Good structure for learning objectives.",
  "Excellent feedback and constructive criticism.",
  "Great opportunity to practice clinical skills.",
  "Very supportive of student learning goals.",
  "Excellent teaching of evidence-based practice.",
  "Good integration of theory and practice.",
  "Very professional and respectful environment.",
  "Great learning experience overall."
];

interface ProgramTypeWithId {
  id: Id<"programTypes">;
  name: string;
}

interface PreceptorWithProgram {
  id: Id<"preceptors">;
  programTypeId: Id<"programTypes">;
}

interface RotationTypeWithProgram {
  id: Id<"rotationTypes">;
  programTypeId: Id<"programTypes">;
}

export const clearTables = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 Starting table clearing...");
    
    try {
      await clearAllTables(ctx);
      console.log("✅ Tables cleared successfully!");
      
      return {
        success: true,
        message: "All tables cleared successfully"
      };
      
    } catch (error) {
      console.error("❌ Table clearing failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ConvexError(`Table clearing failed: ${errorMessage}`);
    }
  }
});

export const seedDatabase = mutation({
  args: {
    config: v.optional(v.object({
      preceptors: v.optional(v.number()),
      reviews: v.optional(v.number()),
      schools: v.optional(v.number()),
      practiceSites: v.optional(v.number()),
      reviewsPerPreceptor: v.optional(v.object({
        min: v.number(),
        max: v.number()
      })),
      ratingDistributions: v.optional(v.object({
        positive: v.number(),
        neutral: v.number(),
        negative: v.number()
      }))
    }))
  },
  handler: async (ctx, args) => {
    console.log("🌱 Starting database seeding...");
    
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
      const preceptorIds = await seedPreceptors(ctx, schoolIds, programTypeIds, practiceSiteIds, config.preceptors);
      
      await seedReviews(ctx, preceptorIds, rotationTypeIds, experienceTypeIds, programTypeIds, config);
      
      console.log("✅ Database seeding completed successfully!");
      
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
      console.error("❌ Seeding failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ConvexError(`Seeding failed: ${errorMessage}`);
    }
  }
});

async function clearAllTables(ctx: MutationCtx) {
  const tables = ['reviews', 'preceptors', 'rotationTypes', 'schoolPrograms', 
                 'experienceTypes', 'practiceSites', 'schools', 'programTypes'] as const;
  
  for (const table of tables) {
    const records = await ctx.db.query(table).collect();
    for (const record of records) {
      await ctx.db.delete(record._id);
    }
  }
  console.log("🧹 Cleared existing data");
}

async function seedProgramTypes(ctx: MutationCtx): Promise<ProgramTypeWithId[]> {
  const ids: ProgramTypeWithId[] = [];
  for (const programType of PROGRAM_TYPES) {
    const id = await ctx.db.insert("programTypes", programType);
    ids.push({ id, name: programType.name });
  }
  console.log(`📚 Seeded ${ids.length} program types`);
  return ids;
}

async function seedSchools(ctx: MutationCtx, count: number): Promise<Id<"schools">[]> {
  const ids: Id<"schools">[] = [];
  const schoolsToSeed = SAMPLE_SCHOOLS.slice(0, count);
  
  for (const schoolName of schoolsToSeed) {
    const id = await ctx.db.insert("schools", { name: schoolName });
    ids.push(id);
  }
  console.log(`🏫 Seeded ${ids.length} schools`);
  return ids;
}

async function seedPracticeSites(ctx: MutationCtx, count: number): Promise<Id<"practiceSites">[]> {
  const ids: Id<"practiceSites">[] = [];
  const sitesToSeed = SAMPLE_PRACTICE_SITES.slice(0, count);
  
  for (const site of sitesToSeed) {
    const id = await ctx.db.insert("practiceSites", site);
    ids.push(id);
  }
  console.log(`🏥 Seeded ${ids.length} practice sites`);
  return ids;
}

async function seedExperienceTypes(ctx: MutationCtx, programTypeIds: ProgramTypeWithId[]): Promise<Id<"experienceTypes">[]> {
  const ids: Id<"experienceTypes">[] = [];
  for (const programType of programTypeIds) {
    const experiences = EXPERIENCE_TYPES_BY_PROGRAM[programType.name] || [];
    for (const exp of experiences) {
      const id = await ctx.db.insert("experienceTypes", {
        programTypeId: programType.id,
        ...exp
      });
      ids.push(id);
    }
  }
  console.log(`📋 Seeded ${ids.length} experience types`);
  return ids;
}

async function seedRotationTypes(ctx: MutationCtx, programTypeIds: ProgramTypeWithId[]): Promise<RotationTypeWithProgram[]> {
  const ids: RotationTypeWithProgram[] = [];
  for (const programType of programTypeIds) {
    const rotations = ROTATION_TYPES_BY_PROGRAM[programType.name] || [];
    for (const rotation of rotations) {
      const id = await ctx.db.insert("rotationTypes", {
        programTypeId: programType.id,
        name: rotation
      });
      ids.push({ id, programTypeId: programType.id });
    }
  }
  console.log(`🔄 Seeded ${ids.length} rotation types`);
  return ids;
}

async function seedSchoolPrograms(ctx: MutationCtx, schoolIds: Id<"schools">[], programTypeIds: ProgramTypeWithId[]): Promise<void> {
  const ids: Id<"schoolPrograms">[] = [];
  for (let i = 0; i < schoolIds.length; i++) {
    const numPrograms = Math.floor(Math.random() * 3) + 1;
    const selectedPrograms = programTypeIds
      .sort(() => 0.5 - Math.random())
      .slice(0, numPrograms);
    
    for (const program of selectedPrograms) {
      const id = await ctx.db.insert("schoolPrograms", {
        schoolId: schoolIds[i],
        programTypeId: program.id
      });
      ids.push(id);
    }
  }
  console.log(`🎓 Seeded ${ids.length} school programs`);
}

async function seedPreceptors(ctx: MutationCtx, schoolIds: Id<"schools">[], programTypeIds: ProgramTypeWithId[], practiceSiteIds: Id<"practiceSites">[], count: number): Promise<PreceptorWithProgram[]> {
  const ids: PreceptorWithProgram[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = DIVERSE_FIRST_NAMES[Math.floor(Math.random() * DIVERSE_FIRST_NAMES.length)];
    const lastName = DIVERSE_LAST_NAMES[Math.floor(Math.random() * DIVERSE_LAST_NAMES.length)];
    const fullName = `Dr. ${firstName} ${lastName}`;
    
    const schoolId = schoolIds[Math.floor(Math.random() * schoolIds.length)];
    const programType = programTypeIds[Math.floor(Math.random() * programTypeIds.length)];
    const siteId = practiceSiteIds[Math.floor(Math.random() * practiceSiteIds.length)];
    
    const id = await ctx.db.insert("preceptors", {
      schoolId,
      programTypeId: programType.id,
      siteId,
      fullName
    });
    
    ids.push({ id, programTypeId: programType.id });
  }
  
  console.log(`👨‍⚕️ Seeded ${ids.length} preceptors`);
  return ids;
}

function generateRealisticRatings(config: typeof DEFAULT_SEED_CONFIG): { ratings: Record<string, number>; starRating: number } {
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
    schedulingFlexibility: generateRating(ratingDistribution.min, ratingDistribution.max, ratingDistribution.bias),
    workload: generateRating(1, 5, 0.5),
    expectations: generateRating(ratingDistribution.min, ratingDistribution.max, ratingDistribution.bias),
    mentorship: generateRating(ratingDistribution.min, ratingDistribution.max, ratingDistribution.bias),
    enjoyment: generateRating(ratingDistribution.min, ratingDistribution.max, ratingDistribution.bias),
  };
  
  const starRating = Math.round((ratings.schedulingFlexibility + ratings.expectations + ratings.mentorship + ratings.enjoyment) / 4);
  
  return { ratings, starRating };
}

async function seedReviews(ctx: MutationCtx, preceptorIds: PreceptorWithProgram[], rotationTypeIds: RotationTypeWithProgram[], experienceTypeIds: Id<"experienceTypes">[], programTypeIds: ProgramTypeWithId[], config: typeof DEFAULT_SEED_CONFIG): Promise<void> {
  const priorExperienceOptions = ['None', 'Little', 'Moderate', 'Significant'] as const;
  const now = Date.now();
  let totalReviews = 0;
  
  for (const preceptor of preceptorIds) {
    const numReviews = Math.floor(Math.random() * (config.reviewsPerPreceptor.max - config.reviewsPerPreceptor.min + 1)) + config.reviewsPerPreceptor.min;
    
    const matchingRotations = rotationTypeIds.filter(r => r.programTypeId === preceptor.programTypeId);
    const matchingExperiences = experienceTypeIds.filter(() => 
      programTypeIds.find(p => p.id === preceptor.programTypeId)
    );
    
    if (matchingRotations.length === 0 || matchingExperiences.length === 0) continue;
    
    for (let i = 0; i < numReviews; i++) {
      const rotationType = matchingRotations[Math.floor(Math.random() * matchingRotations.length)];
      const experienceType = matchingExperiences[Math.floor(Math.random() * matchingExperiences.length)];
      
      const program = programTypeIds.find(p => p.id === preceptor.programTypeId);
      const programType = program ? PROGRAM_TYPES.find(pt => pt.name === program.name) : null;
      const yearLabels = programType?.yearLabels || ["P1"];
      const schoolYear = yearLabels[Math.floor(Math.random() * yearLabels.length)] || "P1";
      
      const { ratings, starRating } = generateRealisticRatings(config);
      const upvotes = Math.floor(Math.random() * 15);
      const downvotes = Math.floor(Math.random() * 5);
      
      const hasComment = Math.random() > 0.3;
      const comment = hasComment ? REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)] : undefined;
      
      await ctx.db.insert("reviews", {
        preceptorId: preceptor.id,
        rotationTypeId: rotationType.id,
        experienceTypeId: experienceType,
        schoolYear,
        priorExperience: priorExperienceOptions[Math.floor(Math.random() * priorExperienceOptions.length)],
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