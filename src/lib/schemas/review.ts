import { z } from 'zod';

export const reviewSchema = z
	.object({
		preceptorId: z.string().nonempty({ message: 'Please select a preceptor' }),
		rotationTypeId: z.string().nonempty({ message: 'Please select a rotation type' }),
		experienceTypeId: z.string().nonempty({ message: 'Please select an experience type' }),
		schoolYear: z.string().nonempty({ message: 'Please select a school year' }),
		priorExperience: z.string().nonempty({ message: 'Please select your prior experience level' }),
		extraHours: z.preprocess(
			(val) => (val === '' ? undefined : Number(val)),
			z.number().min(0).max(60).optional()
		),
		schedulingFlexibility: z.string().nonempty({ message: 'Please rate scheduling flexibility' }),
		workload: z.string().nonempty({ message: 'Please rate workload' }),
		expectations: z.string().nonempty({ message: 'Please rate expectations' }),
		mentorship: z.string().nonempty({ message: 'Please rate mentorship' }),
		enjoyment: z.string().nonempty({ message: 'Please rate enjoyment' }),
		wouldRecommend: z.string().nonempty({ message: 'Please select recommendation' }),
		starRating: z.string().nonempty({ message: 'Please provide a star rating' }),
		comment: z.string().max(2000).optional(),
		isOutlier: z.string(),
		outlierReason: z.string().max(500).optional(),
		agreedToPolicies: z.boolean().refine((val) => val === true, {
			message: 'Please agree to the review policies'
		})
	})
	.refine(
		(data) => {
			if (data.isOutlier === 'true') {
				return data.outlierReason && data.outlierReason.trim().length > 0;
			}
			return true;
		},
		{
			message: 'Please explain why this is an outlier experience',
			path: ['outlierReason']
		}
	);
