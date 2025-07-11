<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from './ui/button/index.js';
	import { Input } from './ui/input/index.js';
	import * as Select from './ui/select/index.js';
	import * as Card from './ui/card/index.js';
	import { Label } from './ui/label/index.js';
	import { Checkbox } from './ui/checkbox/index.js';
	import RatingInput from './RatingInput.svelte';
	import PreceptorComboBox from './PreceptorComboBox.svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	let { prefillPreceptorName = null }: { prefillPreceptorName?: string | null } = $props();

	const client = useConvexClient();
	const preceptorsQuery = useQuery(api.preceptors.get, {});
	const rotationTypesQuery = useQuery(api.rotationTypes.get, {});

	let formData = $state({
		preceptorId: '',
		rotationTypeId: '',
		ippeAppe: '',
		schoolYear: '',
		priorExperience: '',
		extraHours: '',
		schedulingFlexibility: '',
		workload: '',
		expectations: '',
		mentorship: '',
		enjoyment: '',
		wouldRecommend: '',
		starRating: '',
		comment: '',
		isOutlier: 'false',
		outlierReason: '',
		agreedToPolicies: false
	});

	let isSubmitting = $state(false);
	let submitError = $state('');
	let validationErrors = $state<string[]>([]);

	const preceptors = $derived(preceptorsQuery.data ?? []);
	const rotationTypes = $derived(rotationTypesQuery.data ?? []);

	const rotationTypeTriggerContent = $derived(
		rotationTypes.find((r) => r._id === formData.rotationTypeId)?.name ?? 'Select rotation'
	);

	const ippeAppeTriggerContent = $derived(
		formData.ippeAppe || 'Select type'
	);

	const schoolYearTriggerContent = $derived(
		formData.schoolYear || 'Select year'
	);

	const priorExperienceTriggerContent = $derived(
		formData.priorExperience || 'Select experience'
	);

	const wouldRecommendTriggerContent = $derived(
		formData.wouldRecommend === 'true' ? 'Yes, I would recommend' : 
		formData.wouldRecommend === 'false' ? 'No, I would not recommend' : 
		'Select recommendation'
	);

	const isOutlierTriggerContent = $derived(
		formData.isOutlier === 'true' ? 'Yes, outlier experience' : 
		formData.isOutlier === 'false' ? 'No, typical experience' : 
		'Select outlier status'
	);

	const commentWordCount = $derived(formData.comment ? formData.comment.trim().split(/\s+/).filter(word => word.length > 0).length : 0);
	const commentCharCount = $derived(formData.comment ? formData.comment.length : 0);

	const dispatch = createEventDispatcher();

	onMount(() => {
		if (prefillPreceptorName && preceptors.length > 0) {
			const match = preceptors.find(p => p.fullName === prefillPreceptorName);
			if (match) {
				formData.preceptorId = match._id;
			}
		}
	});

	$effect(() => {
		if (prefillPreceptorName && preceptors.length > 0 && !formData.preceptorId) {
			const match = preceptors.find(p => p.fullName === prefillPreceptorName);
			if (match) {
				formData.preceptorId = match._id;
			}
		}
	});

	function validateForm(): string[] {
		const errors: string[] = [];
		if (!formData.preceptorId) errors.push('Please select a preceptor');
		if (!formData.rotationTypeId) errors.push('Please select a rotation type');
		if (!formData.ippeAppe) errors.push('Please select IPPE or APPE');
		if (!formData.schoolYear) errors.push('Please select your school year');
		if (!formData.priorExperience) errors.push('Please select your prior experience level');
		if (!formData.schedulingFlexibility || Number(formData.schedulingFlexibility) < 1) errors.push('Please rate Scheduling Flexibility (1-5)');
		if (!formData.workload || Number(formData.workload) < 1) errors.push('Please rate Workload (1-5)');
		if (!formData.expectations || Number(formData.expectations) < 1) errors.push('Please rate Expectations (1-5)');
		if (!formData.mentorship || Number(formData.mentorship) < 1) errors.push('Please rate Mentorship (1-5)');
		if (!formData.enjoyment || Number(formData.enjoyment) < 1) errors.push('Please rate Enjoyment (1-5)');
		if (!formData.starRating || Number(formData.starRating) < 1) errors.push('Please provide an Overall Rating (1-5)');
		if (!formData.wouldRecommend) errors.push('Please indicate if you would recommend this preceptor');
		if (!formData.isOutlier) errors.push('Please indicate if this was an outlier experience');
		if (formData.isOutlier === 'true' && !formData.outlierReason?.trim()) errors.push('Please explain why this was an outlier experience');
		if (!formData.agreedToPolicies) errors.push('You must agree to the Terms, Privacy Policy, and Guidelines to submit a review');
		return errors;
	}

	function clearValidationErrors() {
		if (validationErrors.length > 0) validationErrors = [];
	}

	async function handleSubmit() {
		if (isSubmitting) return;
		validationErrors = [];
		submitError = '';
		const errors = validateForm();
		if (errors.length > 0) {
			validationErrors = errors;
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}
		try {
			isSubmitting = true;
			const reviewData = {
				preceptorId: formData.preceptorId as any,
				rotationTypeId: formData.rotationTypeId as any,
				ippeAppe: formData.ippeAppe as 'IPPE' | 'APPE',
				schoolYear: formData.schoolYear as 'P1' | 'P2' | 'P3' | 'P4',
				priorExperience: formData.priorExperience as 'None' | 'Little' | 'Moderate' | 'Significant',
				extraHours: formData.extraHours ? Number(formData.extraHours) : undefined,
				schedulingFlexibility: Number(formData.schedulingFlexibility),
				workload: Number(formData.workload),
				expectations: Number(formData.expectations),
				mentorship: Number(formData.mentorship),
				enjoyment: Number(formData.enjoyment),
				wouldRecommend: formData.wouldRecommend === 'true',
				starRating: Number(formData.starRating),
				comment: formData.comment || undefined,
				isOutlier: formData.isOutlier === 'true',
				outlierReason: formData.outlierReason || undefined
			};
			await client.mutation(api.reviews.insertReview, reviewData);
			dispatch('submitted');
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to submit review';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="mx-auto max-w-4xl">
	<Card.Root>
		<Card.Header>
			<Card.Title>Review Details</Card.Title>
			<Card.Description>All fields marked with * are required</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			{#if validationErrors.length > 0}
				<div class="rounded-md border border-orange-200 bg-orange-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-orange-800">Please complete all required fields</h3>
							<div class="mt-2 text-sm text-orange-700">
								<ul class="list-disc list-inside space-y-1">
									{#each validationErrors as error}
										<li>{error}</li>
									{/each}
								</ul>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div class="space-y-2">
					<Label class="text-sm font-medium">Preceptor *</Label>
					<PreceptorComboBox 
						{preceptors}
						value={formData.preceptorId}
						onValueChange={(value) => {
							formData.preceptorId = value;
							clearValidationErrors();
						}}
						placeholder="Select preceptor"
						searchPlaceholder="Search preceptors..."
					/>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Rotation Type *</Label>
					<Select.Root type="single" bind:value={formData.rotationTypeId} onValueChange={clearValidationErrors}>
						<Select.Trigger class="w-full">
							{rotationTypeTriggerContent}
						</Select.Trigger>
						<Select.Content>
							{#each rotationTypes as rotation (rotation._id)}
								<Select.Item value={rotation._id} label={rotation.name}>
									{rotation.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Type *</Label>
					<Select.Root type="single" bind:value={formData.ippeAppe}>
						<Select.Trigger class="w-full">
							{ippeAppeTriggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="IPPE" label="IPPE">IPPE</Select.Item>
							<Select.Item value="APPE" label="APPE">APPE</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">School Year *</Label>
					<Select.Root type="single" bind:value={formData.schoolYear}>
						<Select.Trigger class="w-full">
							{schoolYearTriggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="P1" label="P1">P1</Select.Item>
							<Select.Item value="P2" label="P2">P2</Select.Item>
							<Select.Item value="P3" label="P3">P3</Select.Item>
							<Select.Item value="P4" label="P4">P4</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Prior Experience *</Label>
					<Select.Root type="single" bind:value={formData.priorExperience}>
						<Select.Trigger class="w-full">
							{priorExperienceTriggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="None" label="None">None</Select.Item>
							<Select.Item value="Little" label="Little">Little</Select.Item>
							<Select.Item value="Moderate" label="Moderate">Moderate</Select.Item>
							<Select.Item value="Significant" label="Significant">Significant</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Extra Hours per Week</Label>
					<Input
						type="number"
						placeholder="0"
						bind:value={formData.extraHours}
						min="0"
						max="168"
					/>
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-lg font-medium">Ratings (1-5 scale) *</h3>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<RatingInput
						label="Scheduling Flexibility"
						value={formData.schedulingFlexibility}
						onChange={(value) => {
							formData.schedulingFlexibility = value.toString();
							clearValidationErrors();
						}}
						required={true}
					/>
					<RatingInput
						label="Workload"
						value={formData.workload}
						onChange={(value) => formData.workload = value.toString()}
						required={true}
					/>
					<RatingInput
						label="Expectations"
						value={formData.expectations}
						onChange={(value) => formData.expectations = value.toString()}
						required={true}
					/>
					<RatingInput
						label="Mentorship"
						value={formData.mentorship}
						onChange={(value) => formData.mentorship = value.toString()}
						required={true}
					/>
					<RatingInput
						label="Enjoyment"
						value={formData.enjoyment}
						onChange={(value) => formData.enjoyment = value.toString()}
						required={true}
					/>
					<RatingInput
						label="Overall Rating"
						value={formData.starRating}
						onChange={(value) => formData.starRating = value.toString()}
						required={true}
					/>
				</div>
			</div>

			<div class="space-y-4">
				<div class="space-y-2">
					<Label class="text-sm font-medium">Would Recommend *</Label>
					<Select.Root type="single" bind:value={formData.wouldRecommend} onValueChange={clearValidationErrors}>
						<Select.Trigger class="w-full">
							{wouldRecommendTriggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="true" label="Yes, I would recommend">Yes, I would recommend</Select.Item>
							<Select.Item value="false" label="No, I would not recommend">No, I would not recommend</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Is this an outlier experience? *</Label>
					<Select.Root type="single" bind:value={formData.isOutlier} onValueChange={clearValidationErrors}>
						<Select.Trigger class="w-full">
							{isOutlierTriggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="false" label="No, typical experience">No, typical experience</Select.Item>
							<Select.Item value="true" label="Yes, outlier experience">Yes, outlier experience</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				{#if formData.isOutlier === 'true'}
					<div class="space-y-2">
						<Label class="text-sm font-medium">Outlier Reason</Label>
						<Input
							placeholder="Explain why this was an outlier experience"
							bind:value={formData.outlierReason}
						/>
					</div>
				{/if}

				<div class="space-y-2">
					<Label class="text-sm font-medium">Additional Comments</Label>
					<textarea
						class="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						placeholder="Share your experience in detail... (max 500 words)"
						bind:value={formData.comment}
						maxlength="2500"
					></textarea>
					<div class="flex justify-between text-xs text-muted-foreground">
						<span>{commentWordCount} words</span>
						<span>{commentCharCount}/2500 characters</span>
					</div>
				</div>
			</div>

			{#if submitError}
				<div class="rounded-md border border-red-200 bg-red-50 p-4">
					<p class="text-red-800">{submitError}</p>
				</div>
			{/if}

			<div class="space-y-2">
				<div class="flex items-center space-x-2">
					<Checkbox 
						id="policies" 
						bind:checked={formData.agreedToPolicies}
						onCheckedChange={clearValidationErrors}
					/>
					<Label for="policies" class="text-sm">
						I agree to the <a href="/terms" target="_blank" class="text-primary hover:underline">Terms and Conditions</a>, 
						<a href="/privacy" target="_blank" class="text-primary hover:underline">Privacy Policy</a>, and 
						<a href="/guidelines" target="_blank" class="text-primary hover:underline">Community Guidelines</a> *
					</Label>
				</div>
			</div>
		</Card.Content>
		<Card.Footer class="flex justify-between">
			<Button variant="outline" onclick={() => dispatch('submitted')}>Cancel</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? 'Submitting...' : 'Submit Review'}
			</Button>
		</Card.Footer>
	</Card.Root>
</div> 