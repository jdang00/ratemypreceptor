<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { goto } from '$app/navigation';

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
		outlierReason: ''
	});

	let isSubmitting = $state(false);
	let submitError = $state('');

	const preceptors = $derived(preceptorsQuery.data ?? []);
	const rotationTypes = $derived(rotationTypesQuery.data ?? []);

	const preceptorTriggerContent = $derived(
		preceptors.find((p) => p._id === formData.preceptorId)?.fullName ?? 'Select preceptor'
	);

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

	async function handleSubmit() {
		if (isSubmitting) return;

		try {
			isSubmitting = true;
			submitError = '';

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
			goto('/reviews');
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to submit review';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Submit Review</h1>
		<p class="mt-2">Share your experience with other students</p>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Review Details</Card.Title>
			<Card.Description>All fields marked with * are required</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div class="space-y-2">
					<Label class="text-sm font-medium">Preceptor *</Label>
					<Select.Root type="single" bind:value={formData.preceptorId}>
						<Select.Trigger class="w-full">
							{preceptorTriggerContent}
						</Select.Trigger>
						<Select.Content>
							{#each preceptors as preceptor (preceptor._id)}
								<Select.Item value={preceptor._id} label={preceptor.fullName}>
									{preceptor.fullName}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Rotation Type *</Label>
					<Select.Root type="single" bind:value={formData.rotationTypeId}>
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
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label class="text-sm font-medium">Scheduling Flexibility</Label>
						<Input
							type="number"
							placeholder="1-5"
							bind:value={formData.schedulingFlexibility}
							min="1"
							max="5"
							step="0.1"
						/>
					</div>

					<div class="space-y-2">
						<Label class="text-sm font-medium">Workload</Label>
						<Input
							type="number"
							placeholder="1-5"
							bind:value={formData.workload}
							min="1"
							max="5"
							step="0.1"
						/>
					</div>

					<div class="space-y-2">
						<Label class="text-sm font-medium">Expectations</Label>
						<Input
							type="number"
							placeholder="1-5"
							bind:value={formData.expectations}
							min="1"
							max="5"
							step="0.1"
						/>
					</div>

					<div class="space-y-2">
						<Label class="text-sm font-medium">Mentorship</Label>
						<Input
							type="number"
							placeholder="1-5"
							bind:value={formData.mentorship}
							min="1"
							max="5"
							step="0.1"
						/>
					</div>

					<div class="space-y-2">
						<Label class="text-sm font-medium">Enjoyment</Label>
						<Input
							type="number"
							placeholder="1-5"
							bind:value={formData.enjoyment}
							min="1"
							max="5"
							step="0.1"
						/>
					</div>

					<div class="space-y-2">
						<Label class="text-sm font-medium">Overall Rating</Label>
						<Input
							type="number"
							placeholder="1-5"
							bind:value={formData.starRating}
							min="1"
							max="5"
							step="0.1"
						/>
					</div>
				</div>
			</div>

			<div class="space-y-4">
				<div class="space-y-2">
					<Label class="text-sm font-medium">Would Recommend *</Label>
					<Select.Root type="single" bind:value={formData.wouldRecommend}>
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
					<Select.Root type="single" bind:value={formData.isOutlier}>
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
						placeholder="Share your experience in detail..."
						bind:value={formData.comment}
					></textarea>
				</div>
			</div>

			{#if submitError}
				<div class="rounded-md border border-red-200 bg-red-50 p-4">
					<p class="text-red-800">{submitError}</p>
				</div>
			{/if}
		</Card.Content>
		<Card.Footer class="flex justify-between">
			<Button variant="outline" onclick={() => goto('/reviews')}>Cancel</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? 'Submitting...' : 'Submit Review'}
			</Button>
		</Card.Footer>
	</Card.Root>
</div> 