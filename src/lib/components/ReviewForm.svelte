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
	const experienceTypesQuery = useQuery(api.experienceTypes.get, {});
	const programTypesQuery = useQuery(api.programTypes.get, {});

	let formData = $state({
		preceptorId: '',
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

	const preceptors = $derived(preceptorsQuery.data ?? []);
	const rotationTypes = $derived(rotationTypesQuery.data ?? []);
	const experienceTypes = $derived(experienceTypesQuery.data ?? []);
	const programTypes = $derived(programTypesQuery.data ?? []);

	const selectedPreceptor = $derived(preceptors.find((p) => p._id === formData.preceptorId));
	const selectedProgramType = $derived(
		selectedPreceptor ? programTypes.find((pt) => pt._id === selectedPreceptor.programTypeId) : null
	);
	const availableYears = $derived(selectedProgramType ? selectedProgramType.yearLabels : []);

	const filteredRotationTypes = $derived(
		selectedPreceptor && selectedPreceptor.programTypeId
			? rotationTypes.filter((rt) => rt.programTypeId === selectedPreceptor.programTypeId)
			: rotationTypes
	);

	const filteredExperienceTypes = $derived(
		selectedPreceptor && selectedPreceptor.programTypeId
			? experienceTypes.filter((et) => et.programTypeId === selectedPreceptor.programTypeId)
			: experienceTypes
	);

	const rotationTypeTriggerContent = $derived(
		filteredRotationTypes.find((r) => r._id === formData.rotationTypeId)?.name ?? 'Select rotation'
	);

	const experienceTypeTriggerContent = $derived(
		filteredExperienceTypes.find((e) => e._id === formData.experienceTypeId)?.name ??
			'Select experience'
	);

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

	const dispatch = createEventDispatcher();

	onMount(() => {
		if (prefillPreceptorName && preceptors.length > 0) {
			const match = preceptors.find((p) => p.fullName === prefillPreceptorName);
			if (match) {
				formData.preceptorId = match._id;
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
				...reviewDataToSend,
				extraHours: reviewDataToSend.extraHours,
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
					reviewDataToSend.isOutlier === 'true'
						? reviewDataToSend.outlierReason?.trim()
						: undefined
			});
			dispatch('submitted');
		} catch (error) {
			if (error.errors) {
				validationErrors = error.errors.map((err) => err.message);
			} else {
				submitError = error instanceof Error ? error.message : 'Failed to submit review';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function handlePreceptorChange(preceptorId: string) {
		formData.preceptorId = preceptorId;
		formData.rotationTypeId = '';
		formData.experienceTypeId = '';
		formData.schoolYear = '';
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
					<Label class="text-sm font-medium">Rotation Type *</Label>
					<Select.Root
						type="single"
						bind:value={formData.rotationTypeId}
						onValueChange={clearValidationErrors}
						disabled={!selectedPreceptor}
					>
						<Select.Trigger class="w-full">
							{rotationTypeTriggerContent}
						</Select.Trigger>
						<Select.Content>
							{#each filteredRotationTypes as rotation (rotation._id)}
								<Select.Item value={rotation._id} label={rotation.name}>
									{rotation.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if !selectedPreceptor}
						<p class="text-muted-foreground text-xs">Select a preceptor first</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Experience Type *</Label>
					<Select.Root
						type="single"
						bind:value={formData.experienceTypeId}
						onValueChange={clearValidationErrors}
						disabled={!selectedPreceptor}
					>
						<Select.Trigger class="w-full">
							{experienceTypeTriggerContent}
						</Select.Trigger>
						<Select.Content>
							{#each filteredExperienceTypes as experienceType (experienceType._id)}
								<Select.Item value={experienceType._id} label={experienceType.name}>
									{experienceType.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if !selectedPreceptor}
						<p class="text-muted-foreground text-xs">Select a preceptor first</p>
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
						<p class="text-muted-foreground text-xs">Select a preceptor first</p>
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
				<Label class="text-sm">
					I agree to the <a
						href="/terms"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary hover:underline">Terms of Service</a
					>
					and
					<a
						href="/privacy"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary hover:underline">Privacy Policy</a
					>
				</Label>
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
