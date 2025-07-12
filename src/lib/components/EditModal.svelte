<script lang="ts" generics="T extends Record<string, any>">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import * as Dialog from './ui/dialog/index.js';
	import { Button } from './ui/button/index.js';
	import { Input } from './ui/input/index.js';
	import * as Select from './ui/select/index.js';
	import { Checkbox } from './ui/checkbox/index.js';
	import { Label } from './ui/label/index.js';
	import PreceptorComboBox from './PreceptorComboBox.svelte';

	type FieldConfig = {
		key: string;
		label: string;
		type: 'text' | 'select' | 'number' | 'boolean' | 'preceptor_combobox' | 'comment';
		options?: { label: string; value: string }[];
		preceptors?: { _id: string; fullName: string }[];
		required?: boolean;
	};

	type Props = {
		isOpen: boolean;
		entity: T | null;
		mutationName: string;
		fields: FieldConfig[];
		onClose: () => void;
		onSave?: (updatedEntity: T) => void;
		onSuccess?: () => void;
	};

	let { isOpen, entity, mutationName, fields, onClose, onSave, onSuccess }: Props = $props();

	const client = useConvexClient();

	let formData: Record<string, any> = $state({});
	let isSubmitting = $state(false);

	$effect(() => {
		if (entity) {
			formData = { ...entity };
		} else {
			formData = {};
		}
	});

	async function handleSubmit() {
		if (!entity) return;

		try {
			isSubmitting = true;

			const updates: Record<string, any> = { id: entity._id };

			for (const field of fields) {
				const newValue = formData[field.key];
				const oldValue = entity[field.key];

				let processedValue = newValue;
				if (field.type === 'boolean' && typeof newValue === 'string') {
					processedValue = newValue === 'true';
				} else if (field.type === 'number' && typeof newValue === 'string') {
					processedValue = Number(newValue);
				}

				if (processedValue !== oldValue) {
					updates[field.key] = processedValue;
				}
			}

			if (Object.keys(updates).length > 1) {
				const [moduleName, functionName] = mutationName.split('.');
				const mutation = (api as any)[moduleName][functionName];
				await client.mutation(mutation, updates);

				onSave?.(formData as T);
				onSuccess?.();
			}

			onClose();
		} catch (error) {
			console.error('Failed to update entity:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleFieldChange(fieldKey: string, value: any) {
		formData[fieldKey] = value;
	}

	function getSelectTriggerContent(field: FieldConfig, value: any): string {
		if (!value) return `Select ${field.label.toLowerCase()}`;

		if (field.options) {
			const option = field.options.find((opt) => opt.value === value);
			if (option) return option.label;
		}

		return value.toString();
	}

	function getFieldOptions(field: FieldConfig): { label: string; value: string }[] {
		return field.options || [];
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && onClose()}>
	<Dialog.Content
		class="max-h-[90vh] w-full max-w-[95vw] overflow-hidden p-4 sm:max-h-[85vh] sm:max-w-[700px] sm:p-8"
	>
		<Dialog.Header class="pb-4">
			<Dialog.Title class="text-lg font-semibold sm:text-xl">
				Edit {mutationName.split('.')[0]}
			</Dialog.Title>
			<Dialog.Description class="text-muted-foreground text-sm">
				Update the information below and click save to apply changes.
			</Dialog.Description>
		</Dialog.Header>

		{#if entity}
			<div class="max-h-[60vh] overflow-y-auto pr-2 sm:max-h-[60vh]">
				<div
					class="grid gap-x-4 gap-y-4 sm:gap-x-6"
					style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));"
				>
					{#each fields as field (field.key)}
						{#if field.type !== 'comment'}
							<div class="flex flex-col space-y-2">
								<Label for={field.key} class="text-foreground text-sm font-medium">
									{field.label}
									{#if field.required}
										<span class="ml-1 text-red-500">*</span>
									{/if}
								</Label>

								{#if field.type === 'text'}
									<Input
										id={field.key}
										value={formData[field.key] || ''}
										oninput={(e) => handleFieldChange(field.key, e.currentTarget.value)}
										required={field.required}
										class="h-9 text-sm"
										placeholder="Enter {field.label.toLowerCase()}"
									/>
								{:else if field.type === 'number'}
									<Input
										id={field.key}
										type="number"
										value={formData[field.key] || ''}
										oninput={(e) => handleFieldChange(field.key, Number(e.currentTarget.value))}
										required={field.required}
										class="h-9 text-sm"
										placeholder="Enter {field.label.toLowerCase()}"
									/>
								{:else if field.type === 'select'}
									<Select.Root
										type="single"
										bind:value={formData[field.key]}
										onValueChange={(value) => handleFieldChange(field.key, value)}
									>
										<Select.Trigger class="h-9 w-full text-sm">
											{getSelectTriggerContent(field, formData[field.key])}
										</Select.Trigger>
										<Select.Content>
											{#each getFieldOptions(field) as option (option.value)}
												<Select.Item value={option.value} label={option.label}>
													{option.label}
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								{:else if field.type === 'boolean'}
									<div class="flex items-center space-x-2">
										<Checkbox
											id={field.key}
											checked={formData[field.key] ?? false}
											onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
										/>
										<Label for={field.key} class="cursor-pointer text-sm">
											{field.label}
										</Label>
									</div>
								{:else if field.type === 'preceptor_combobox'}
									<PreceptorComboBox
										preceptors={field.preceptors || []}
										value={formData[field.key] || ''}
										onValueChange={(value) => handleFieldChange(field.key, value)}
										placeholder="Select {field.label.toLowerCase()}"
										searchPlaceholder="Search {field.label.toLowerCase()}s..."
										class="h-9 text-sm"
									/>
								{/if}
							</div>
						{/if}
					{/each}
				</div>

				{#if fields.find(f => f.type === 'comment')}
					<div class="mt-8">
						<Label class="text-foreground text-sm font-medium mb-2 block">Comment</Label>
						<div class="bg-muted rounded-lg p-3">
							<p class="text-sm leading-relaxed">{formData['comment'] || 'No comment provided'}</p>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<Dialog.Footer class="border-t pt-4">
			<div class="flex w-full justify-end gap-3">
				<Button type="button" variant="outline" onclick={onClose}>Cancel</Button>
				<Button type="submit" onclick={handleSubmit} disabled={isSubmitting || !entity}>
					{isSubmitting ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
