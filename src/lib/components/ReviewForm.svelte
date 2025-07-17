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
	import UniversalComboBox from './UniversalComboBox.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Id } from '../../convex/_generated/dataModel.js';

	let { prefillPreceptorName = null }: { prefillPreceptorName?: string | null } = $props();

	const client = useConvexClient();
	const dispatch = createEventDispatcher();

	// State for cascading queries
	let selectedPreceptorId = $state<Id<'preceptors'> | ''>('');
	let selectedSchoolId = $state<Id<'schools'> | ''>('');
	let selectedSiteId = $state<Id<'practiceSites'> | ''>('');

	// Base queries
	const preceptorsQuery = useQuery(api.preceptors.get, {});
	const rotationTypesQuery = useQuery(api.rotationTypes.get, {});
	const experienceTypesQuery = useQuery(api.experienceTypes.get, {});
	const programTypesQuery = useQuery(api.programTypes.get, {});

	// Dependent queries with proper reactivity and null handling
	const preceptorSchoolsQuery = $derived(
		selectedPreceptorId
			? useQuery(api.preceptorAffiliations.getAvailableSchoolsForPreceptor, {
					preceptorId: selectedPreceptorId as Id<'preceptors'>
				})
			: { data: null }
	);

	const preceptorSitesQuery = $derived(
		selectedPreceptorId && selectedSchoolId
			? useQuery(api.preceptorAffiliations.getAvailableSitesForPreceptorAtSchool, {
					preceptorId: selectedPreceptorId as Id<'preceptors'>,
					schoolId: selectedSchoolId as Id<'schools'>
				})
			: { data: null }
	);

	const preceptorProgramsQuery = $derived(
		selectedPreceptorId && selectedSchoolId && selectedSiteId
			? useQuery(api.preceptorAffiliations.getAvailableProgramsForPreceptorAtSchoolSite, {
					preceptorId: selectedPreceptorId as Id<'preceptors'>,
					schoolId: selectedSchoolId as Id<'schools'>,
					siteId: selectedSiteId as Id<'practiceSites'>
				})
			: { data: null }
	);

	let formData = $state({
		preceptorId: '',
		schoolId: '',
		siteId: '',
		rotationTypeId: '',
		experienceTypeId: '',
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

	// Derived data from queries
	const preceptors = $derived(preceptorsQuery.data ?? []);
	const rotationTypes = $derived(rotationTypesQuery.data ?? []);
	const experienceTypes = $derived(experienceTypesQuery.data ?? []);

	// Available options based on selection with null safety
	const availableSchools = $derived(preceptorSchoolsQuery.data ?? []);
	const availableSites = $derived(preceptorSitesQuery.data ?? []);
	const availableProgramTypes = $derived(preceptorProgramsQuery.data ?? []);

	// Derive program type from available programs
	const selectedProgramType = $derived(
		availableProgramTypes.length > 0 ? availableProgramTypes[0] : null
	);

	// Filter rotation and experience types based on program type
	const filteredRotationTypes = $derived(
		selectedProgramType
			? rotationTypes.filter((rt) => rt.programTypeId === selectedProgramType._id)
			: []
	);

	const filteredExperienceTypes = $derived(
		selectedProgramType
			? experienceTypes.filter((et) => et.programTypeId === selectedProgramType._id)
			: []
	);

	const availableYears = $derived(selectedProgramType ? selectedProgramType.yearLabels : []);

	const schoolYearTriggerContent = $derived(formData.schoolYear || 'Select year');
	const priorExperienceTriggerContent = $derived(formData.priorExperience || 'Select experience');
	const wouldRecommendTriggerContent = $derived(
		formData.wouldRecommend === 'true'
			? 'Yes, I would recommend'
			: formData.wouldRecommend === 'false'
				? 'No, I would not recommend'
				: 'Select recommendation'
	);
	const isOutlierTriggerContent = $derived(
		formData.isOutlier === 'true'
			? 'Yes, outlier experience'
			: formData.isOutlier === 'false'
				? 'No, typical experience'
				: 'Select outlier status'
	);

	// Word and character counts for text areas
	const commentWordCount = $derived(
		formData.comment
			? formData.comment
					.trim()
					.split(/\s+/)
					.filter((word) => word.length > 0).length
			: 0
	);
	const commentCharCount = $derived(formData.comment ? formData.comment.length : 0);

	const outlierReasonWordCount = $derived(
		formData.outlierReason
			? formData.outlierReason
					.trim()
					.split(/\s+/)
					.filter((word) => word.length > 0).length
			: 0
	);
	const outlierReasonCharCount = $derived(
		formData.outlierReason ? formData.outlierReason.length : 0
	);

	onMount(() => {
		if (prefillPreceptorName && preceptors.length > 0) {
			const match = preceptors.find((p) => p.fullName === prefillPreceptorName);
			if (match) {
				formData.preceptorId = match._id;
				selectedPreceptorId = match._id;
			}
		}
	});

	import { reviewSchema } from '../schemas/review';

	function clearValidationErrors() {
		validationErrors = [];
	}

	async function handleSubmit() {
		if (isSubmitting) return;

		clearValidationErrors();

		try {
			const validatedData = reviewSchema.parse(formData);
			isSubmitting = true;
			submitError = '';

			const { agreedToPolicies, ...reviewDataToSend } = validatedData;

			await client.mutation(api.reviews.insertReview, {
				preceptorId: reviewDataToSend.preceptorId as any,
				schoolId: formData.schoolId as any,
				siteId: formData.siteId as any,
				rotationTypeId: reviewDataToSend.rotationTypeId as any,
				experienceTypeId: reviewDataToSend.experienceTypeId as any,
				schoolYear: reviewDataToSend.schoolYear,
				priorExperience: reviewDataToSend.priorExperience as any,
				extraHours: reviewDataToSend.extraHours ? Number(reviewDataToSend.extraHours) : undefined,
				schedulingFlexibility: Number(reviewDataToSend.schedulingFlexibility),
				workload: Number(reviewDataToSend.workload),
				expectations: Number(reviewDataToSend.expectations),
				mentorship: Number(reviewDataToSend.mentorship),
				enjoyment: Number(reviewDataToSend.enjoyment),
				wouldRecommend: reviewDataToSend.wouldRecommend === 'true',
				starRating: Number(reviewDataToSend.starRating),
				comment: reviewDataToSend.comment?.trim() || undefined,
				isOutlier: reviewDataToSend.isOutlier === 'true',
				outlierReason:
					reviewDataToSend.isOutlier === 'true' ? reviewDataToSend.outlierReason?.trim() : undefined
			});
			dispatch('submitted');
		} catch (error: any) {
			if (error.issues) {
				validationErrors = error.issues.map((issue: any) => issue.message);
			} else {
				submitError = error instanceof Error ? error.message : 'Failed to submit review';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function handlePreceptorChange(preceptorId: string) {
		formData.preceptorId = preceptorId;
		selectedPreceptorId = preceptorId as Id<'preceptors'>;

		// Reset dependent fields
		formData.schoolId = '';
		selectedSchoolId = '';
		formData.siteId = '';
		selectedSiteId = '';
		formData.rotationTypeId = '';
		formData.experienceTypeId = '';
		formData.schoolYear = '';
		clearValidationErrors();
	}

	function handleSchoolChange(schoolId: string) {
		formData.schoolId = schoolId;
		selectedSchoolId = schoolId as Id<'schools'>;

		// Reset dependent fields
		formData.siteId = '';
		selectedSiteId = '';
		formData.rotationTypeId = '';
		formData.experienceTypeId = '';
		formData.schoolYear = '';
		clearValidationErrors();
	}

	function handleSiteChange(siteId: string) {
		formData.siteId = siteId;
		selectedSiteId = siteId as Id<'practiceSites'>;

		// Reset dependent fields
		formData.rotationTypeId = '';
		formData.experienceTypeId = '';
		formData.schoolYear = '';
		clearValidationErrors();
	}

	function handleRotationTypeChange(rotationTypeId: string) {
		formData.rotationTypeId = rotationTypeId;
		clearValidationErrors();
	}

	function handleExperienceTypeChange(experienceTypeId: string) {
		formData.experienceTypeId = experienceTypeId;
		clearValidationErrors();
	}
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>Share Your Experience</Card.Title>
		<Card.Description>
			Help other students by sharing your honest feedback about your preceptor experience.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<form class="space-y-6">
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div class="space-y-2">
					<Label class="text-sm font-medium">Preceptor *</Label>
					<PreceptorComboBox
						{preceptors}
						value={formData.preceptorId}
						onValueChange={handlePreceptorChange}
						placeholder="Select preceptor"
						searchPlaceholder="Search preceptors..."
					/>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">School *</Label>
					<UniversalComboBox
						items={availableSchools
							.filter((s) => s !== null)
							.map((s) => ({ id: s._id, name: s.name }))}
						value={formData.schoolId}
						onValueChange={handleSchoolChange}
						placeholder="Select school"
						searchPlaceholder="Search schools..."
						disabled={!selectedPreceptorId}
					/>
					{#if !selectedPreceptorId}
						<p class="text-muted-foreground text-xs">Select a preceptor first</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Practice Site *</Label>
					<UniversalComboBox
						items={availableSites
							.filter((s) => s !== null)
							.map((s) => ({ id: s._id, name: s.name }))}
						value={formData.siteId}
						onValueChange={handleSiteChange}
						placeholder="Select practice site"
						searchPlaceholder="Search practice sites..."
						disabled={!selectedSchoolId}
					/>
					{#if !selectedSchoolId}
						<p class="text-muted-foreground text-xs">Select a school first</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Rotation Type *</Label>
					<UniversalComboBox
						items={filteredRotationTypes.map((rt) => ({ id: rt._id, name: rt.name }))}
						value={formData.rotationTypeId}
						onValueChange={handleRotationTypeChange}
						placeholder="Select rotation type"
						searchPlaceholder="Search rotation types..."
						disabled={!selectedProgramType}
					/>
					{#if !selectedProgramType}
						<p class="text-muted-foreground text-xs">Complete selections above first</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Experience Type *</Label>
					<UniversalComboBox
						items={filteredExperienceTypes.map((et) => ({ id: et._id, name: et.name }))}
						value={formData.experienceTypeId}
						onValueChange={handleExperienceTypeChange}
						placeholder="Select experience type"
						searchPlaceholder="Search experience types..."
						disabled={!selectedProgramType}
					/>
					{#if !selectedProgramType}
						<p class="text-muted-foreground text-xs">Complete selections above first</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">School Year *</Label>
					<Select.Root
						type="single"
						bind:value={formData.schoolYear}
						onValueChange={clearValidationErrors}
						disabled={!selectedProgramType}
					>
						<Select.Trigger class="w-full">
							{schoolYearTriggerContent}
						</Select.Trigger>
						<Select.Content>
							{#each availableYears as year (year)}
								<Select.Item value={year} label={year}>
									{year}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if !selectedProgramType}
						<p class="text-muted-foreground text-xs">Complete selections above first</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Prior Experience *</Label>
					<Select.Root
						type="single"
						bind:value={formData.priorExperience}
						onValueChange={clearValidationErrors}
					>
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
					<Label class="text-sm font-medium">Extra Hours (per week)</Label>
					<Input
						type="number"
						bind:value={formData.extraHours}
						placeholder="0"
						min="0"
						max="60"
						oninput={clearValidationErrors}
					/>
					<p class="text-muted-foreground text-xs">Leave blank if no extra hours required</p>
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Rate Your Experience</h3>
				<p class="text-muted-foreground text-sm">
					Rate each aspect on a scale of 1-5 (1 = Poor, 5 = Excellent)
				</p>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<RatingInput
						label="Scheduling Flexibility"
						bind:value={formData.schedulingFlexibility}
						onChange={(value) => {
							formData.schedulingFlexibility = value.toString();
							clearValidationErrors();
						}}
						required={true}
					/>

					<RatingInput
						label="Workload"
						bind:value={formData.workload}
						onChange={(value) => {
							formData.workload = value.toString();
							clearValidationErrors();
						}}
						required={true}
					/>

					<RatingInput
						label="Expectations"
						bind:value={formData.expectations}
						onChange={(value) => {
							formData.expectations = value.toString();
							clearValidationErrors();
						}}
						required={true}
					/>

					<RatingInput
						label="Mentorship"
						bind:value={formData.mentorship}
						onChange={(value) => {
							formData.mentorship = value.toString();
							clearValidationErrors();
						}}
						required={true}
					/>

					<RatingInput
						label="Enjoyment"
						bind:value={formData.enjoyment}
						onChange={(value) => {
							formData.enjoyment = value.toString();
							clearValidationErrors();
						}}
						required={true}
					/>

					<RatingInput
						label="Overall Rating"
						bind:value={formData.starRating}
						onChange={(value) => {
							formData.starRating = value.toString();
							clearValidationErrors();
						}}
						required={true}
					/>
				</div>
			</div>

			<div class="space-y-4">
				<div class="space-y-2">
					<Label class="text-sm font-medium">Would you recommend this preceptor? *</Label>
					<Select.Root
						type="single"
						bind:value={formData.wouldRecommend}
						onValueChange={clearValidationErrors}
					>
						<Select.Trigger class="w-full">
							{wouldRecommendTriggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="true" label="Yes, I would recommend"
								>Yes, I would recommend</Select.Item
							>
							<Select.Item value="false" label="No, I would not recommend"
								>No, I would not recommend</Select.Item
							>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Comment</Label>
					<textarea
						bind:value={formData.comment}
						placeholder="Share specific details about your experience..."
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						oninput={(e) => {
							const target = e.target as HTMLTextAreaElement;
							if (target.value.length > 2000) {
								target.value = target.value.slice(0, 2000);
								formData.comment = target.value;
							}
							clearValidationErrors();
						}}
						maxlength="2000"
					></textarea>
					<p class="text-muted-foreground text-xs">
						{commentCharCount}/2000 characters • {commentWordCount} words
					</p>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Is this an outlier experience?</Label>
					<Select.Root
						type="single"
						bind:value={formData.isOutlier}
						onValueChange={clearValidationErrors}
					>
						<Select.Trigger class="w-full">
							{isOutlierTriggerContent}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="false" label="No, typical experience"
								>No, typical experience</Select.Item
							>
							<Select.Item value="true" label="Yes, outlier experience"
								>Yes, outlier experience</Select.Item
							>
						</Select.Content>
					</Select.Root>
				</div>

				{#if formData.isOutlier === 'true'}
					<div class="space-y-2">
						<Label class="text-sm font-medium">Explain why this is an outlier experience *</Label>
						<textarea
							bind:value={formData.outlierReason}
							placeholder="Explain what made this experience unusual..."
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							oninput={(e) => {
								const target = e.target as HTMLTextAreaElement;
								if (target.value.length > 500) {
									target.value = target.value.slice(0, 500);
									formData.outlierReason = target.value;
								}
								clearValidationErrors();
							}}
							maxlength="500"
						></textarea>
						<p class="text-muted-foreground text-xs">
							{outlierReasonCharCount}/500 characters • {outlierReasonWordCount} words
						</p>
					</div>
				{/if}
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox
					bind:checked={formData.agreedToPolicies}
					onCheckedChange={clearValidationErrors}
				/>
				<span class="text-sm">
					I agree to the
					<a
						href="/terms"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary ml-1 hover:underline">Terms of Service</a
					>
					and
					<a
						href="/privacy"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary ml-1 hover:underline">Privacy Policy</a
					>
				</span>
			</div>

			{#if validationErrors.length > 0}
				<div class="rounded-md border border-red-200 bg-red-50 p-4">
					<h4 class="text-sm font-medium text-red-800">Please fix the following errors:</h4>
					<ul class="mt-2 text-sm text-red-700">
						{#each validationErrors as error (error)}
							<li>• {error}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if submitError}
				<div class="rounded-md border border-red-200 bg-red-50 p-4">
					<p class="text-sm text-red-800">{submitError}</p>
				</div>
			{/if}

			<Button type="button" onclick={handleSubmit} disabled={isSubmitting} class="w-full">
				{isSubmitting ? 'Submitting...' : 'Submit Review'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
