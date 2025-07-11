<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import PreceptorComboBox from '$lib/components/PreceptorComboBox.svelte';

	type Props = {
		isOpen: boolean;
		onClose: () => void;
		onSuccess?: () => void;
	};

	let { isOpen, onClose, onSuccess }: Props = $props();

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
		wouldRecommend: false,
		starRating: '',
		comment: '',
		isOutlier: false,
		outlierReason: ''
	});

	let isSubmitting = $state(false);
	let submitError = $state('');

	const preceptors = $derived(preceptorsQuery.data ?? []);
	const rotationTypes = $derived(rotationTypesQuery.data ?? []);

	const rotationTypeTriggerContent = $derived(
		rotationTypes.find((r) => r._id === formData.rotationTypeId)?.name ?? 'Select rotation type'
	);

	async function handleSubmit() {
		if (isSubmitting) return;

		if (!formData.preceptorId || !formData.rotationTypeId || !formData.ippeAppe || 
			!formData.schoolYear || !formData.priorExperience || !formData.schedulingFlexibility ||
			!formData.workload || !formData.expectations || !formData.mentorship || 
			!formData.enjoyment || !formData.starRating) {
			submitError = 'Please fill in all required fields';
			return;
		}

		if (formData.isOutlier && !formData.outlierReason.trim()) {
			submitError = 'Please provide a reason for marking as outlier';
			return;
		}

		try {
			isSubmitting = true;
			submitError = '';

			const reviewData = {
				preceptorId: formData.preceptorId as any,
				rotationTypeId: formData.rotationTypeId as any,
				ippeAppe: formData.ippeAppe as any,
				schoolYear: formData.schoolYear as any,
				priorExperience: formData.priorExperience as any,
				schedulingFlexibility: Number(formData.schedulingFlexibility),
				workload: Number(formData.workload),
				expectations: Number(formData.expectations),
				mentorship: Number(formData.mentorship),
				enjoyment: Number(formData.enjoyment),
				wouldRecommend: formData.wouldRecommend,
				starRating: Number(formData.starRating),
				isOutlier: formData.isOutlier,
				...(formData.extraHours && { extraHours: Number(formData.extraHours) }),
				...(formData.comment.trim() && { comment: formData.comment.trim() }),
				...(formData.isOutlier && formData.outlierReason.trim() && { outlierReason: formData.outlierReason.trim() })
			};

			await client.mutation(api.reviews.insertReview, reviewData);
			
			formData = {
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
				wouldRecommend: false,
				starRating: '',
				comment: '',
				isOutlier: false,
				outlierReason: ''
			};
			
			onSuccess?.();
			onClose();
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to add review';
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		formData = {
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
			wouldRecommend: false,
			starRating: '',
			comment: '',
			isOutlier: false,
			outlierReason: ''
		};
		submitError = '';
		onClose();
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<Dialog.Content class="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-hidden p-4 sm:p-6">
		<Dialog.Header>
			<Dialog.Title class="text-lg sm:text-xl font-semibold">Add New Review</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Add a new preceptor review to the system.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div class="space-y-2">
					<Label class="text-sm font-medium">Preceptor *</Label>
					<PreceptorComboBox 
						{preceptors}
						value={formData.preceptorId}
						onValueChange={(value) => formData.preceptorId = value}
						placeholder="Select preceptor"
						searchPlaceholder="Search preceptors..."
						class="h-9 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<Label class="text-sm font-medium">Rotation Type *</Label>
					<Select.Root type="single" bind:value={formData.rotationTypeId}>
						<Select.Trigger class="w-full h-9 text-sm">
							{rotationTypeTriggerContent}
						</Select.Trigger>
						<Select.Content>
							{#each rotationTypes as rotationType (rotationType._id)}
								<Select.Item value={rotationType._id} label={rotationType.name}>
									{rotationType.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
				<div class="space-y-2">
					<Label class="text-sm font-medium">Type *</Label>
					<Select.Root type="single" bind:value={formData.ippeAppe}>
						<Select.Trigger class="w-full h-9 text-sm">
							{formData.ippeAppe || 'Select type'}
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
						<Select.Trigger class="w-full h-9 text-sm">
							{formData.schoolYear || 'Select year'}
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
						<Select.Trigger class="w-full h-9 text-sm">
							{formData.priorExperience || 'Select experience'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="None" label="None">None</Select.Item>
							<Select.Item value="Little" label="Little">Little</Select.Item>
							<Select.Item value="Moderate" label="Moderate">Moderate</Select.Item>
							<Select.Item value="Significant" label="Significant">Significant</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div class="space-y-2">
					<Label for="extraHours" class="text-sm font-medium">Extra Hours</Label>
					<Input
						id="extraHours"
						type="number"
						placeholder="0"
						bind:value={formData.extraHours}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<Label for="starRating" class="text-sm font-medium">Star Rating (1-5) *</Label>
					<Input
						id="starRating"
						type="number"
						min="1"
						max="5"
						placeholder="5"
						bind:value={formData.starRating}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
				<div class="space-y-2">
					<Label for="schedulingFlexibility" class="text-sm font-medium">Scheduling (1-5) *</Label>
					<Input
						id="schedulingFlexibility"
						type="number"
						min="1"
						max="5"
						placeholder="5"
						bind:value={formData.schedulingFlexibility}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<Label for="workload" class="text-sm font-medium">Workload (1-5) *</Label>
					<Input
						id="workload"
						type="number"
						min="1"
						max="5"
						placeholder="5"
						bind:value={formData.workload}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<Label for="expectations" class="text-sm font-medium">Expectations (1-5) *</Label>
					<Input
						id="expectations"
						type="number"
						min="1"
						max="5"
						placeholder="5"
						bind:value={formData.expectations}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<Label for="mentorship" class="text-sm font-medium">Mentorship (1-5) *</Label>
					<Input
						id="mentorship"
						type="number"
						min="1"
						max="5"
						placeholder="5"
						bind:value={formData.mentorship}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>

				<div class="space-y-2">
					<Label for="enjoyment" class="text-sm font-medium">Enjoyment (1-5) *</Label>
					<Input
						id="enjoyment"
						type="number"
						min="1"
						max="5"
						placeholder="5"
						bind:value={formData.enjoyment}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div class="flex items-center space-x-2">
					<Checkbox bind:checked={formData.wouldRecommend} disabled={isSubmitting} />
					<Label class="text-sm font-medium">Would Recommend</Label>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox bind:checked={formData.isOutlier} disabled={isSubmitting} />
					<Label class="text-sm font-medium">Mark as Outlier</Label>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="comment" class="text-sm font-medium">Comment</Label>
				<Input
					id="comment"
					placeholder="Optional comment"
					bind:value={formData.comment}
					disabled={isSubmitting}
					class="h-9 text-sm"
				/>
			</div>

			{#if formData.isOutlier}
				<div class="space-y-2">
					<Label for="outlierReason" class="text-sm font-medium">Outlier Reason *</Label>
					<Input
						id="outlierReason"
						placeholder="Reason for marking as outlier"
						bind:value={formData.outlierReason}
						disabled={isSubmitting}
						class="h-9 text-sm"
					/>
				</div>
			{/if}

			{#if submitError}
				<div class="rounded-md border border-red-200 bg-red-50 p-3">
					<p class="text-sm text-red-800">{submitError}</p>
				</div>
			{/if}
		</div>

		<Dialog.Footer class="flex justify-end gap-3 pt-4 border-t">
			<Button variant="outline" onclick={handleClose} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? 'Adding...' : 'Add Review'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root> 