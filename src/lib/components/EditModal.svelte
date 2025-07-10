<script lang="ts" generics="T extends Record<string, any>">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import * as Dialog from './ui/dialog/index.js';
	import { Button, buttonVariants } from './ui/button/index.js';
	import { Input } from './ui/input/index.js';
	import * as Select from './ui/select/index.js';
	import { Checkbox } from './ui/checkbox/index.js';
	import { Label } from './ui/label/index.js';

	type FieldConfig = {
		key: string;
		label: string;
		type: 'text' | 'select' | 'number' | 'boolean';
		options?: { label: string; value: string }[];
		required?: boolean;
	};

	type Props = {
		isOpen: boolean;
		entity: T | null;
		mutationName: string;
		fields: FieldConfig[];
		onClose: () => void;
		onSave?: (updatedEntity: T) => void;
	};

	let { isOpen, entity, mutationName, fields, onClose, onSave }: Props = $props();

	// Get Convex client for mutations
	const client = useConvexClient();

		// Form state
	let formData: Record<string, any> = $state({});
	let isSubmitting = $state(false);

	// Initialize form data when entity changes
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
				
				// Handle type conversions for specific field types
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

	// Helper function to get trigger content for select fields
	function getSelectTriggerContent(field: FieldConfig, value: any): string {
		if (!value) return `Select ${field.label.toLowerCase()}`;
		
		if (field.options) {
			const option = field.options.find(opt => opt.value === value);
			if (option) return option.label;
		}
		
		return value.toString();
	}

	// Helper function to get options for a field
	function getFieldOptions(field: FieldConfig): { label: string; value: string }[] {
		return field.options || [];
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && onClose()}>
	<Dialog.Content class="w-full max-w-[95vw] sm:max-w-[700px] max-h-[85vh] overflow-hidden p-4 sm:p-8">
		<Dialog.Header class="pb-4">
			<Dialog.Title class="text-lg font-semibold">
				Edit {mutationName.split('.')[0]}
			</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Update the information below and click save to apply changes.
			</Dialog.Description>
		</Dialog.Header>

		{#if entity}
			<div class="max-h-[60vh] overflow-y-auto pr-2">
				<div class="grid gap-x-6 gap-y-4" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
					{#each fields as field (field.key)}
						<div class="flex flex-col space-y-2">
							<Label for={field.key} class="text-sm font-medium text-foreground">
								{field.label}
								{#if field.required}
									<span class="text-red-500 ml-1">*</span>
								{/if}
							</Label>

							{#if field.type === 'text'}
								<Input
									id={field.key}
									value={formData[field.key] || ''}
									oninput={(e) => handleFieldChange(field.key, e.currentTarget.value)}
									required={field.required}
									class="h-9"
									placeholder="Enter {field.label.toLowerCase()}"
								/>
							{:else if field.type === 'number'}
								<Input
									id={field.key}
									type="number"
									value={formData[field.key] || ''}
									oninput={(e) => handleFieldChange(field.key, Number(e.currentTarget.value))}
									required={field.required}
									class="h-9"
									placeholder="Enter {field.label.toLowerCase()}"
								/>
							{:else if field.type === 'select'}
								<Select.Root 
									type="single" 
									bind:value={formData[field.key]}
									onValueChange={(value) => handleFieldChange(field.key, value)}
								>
									<Select.Trigger class="w-full">
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
									<Label for={field.key} class="text-sm cursor-pointer">
										{field.label}
									</Label>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<Dialog.Footer class="pt-4 border-t">
			<div class="flex justify-end gap-3 w-full">
				<Button type="button" variant="outline" onclick={onClose}>
					Cancel
				</Button>
				<Button 
					type="submit" 
					onclick={handleSubmit} 
					disabled={isSubmitting || !entity}
				>
					{isSubmitting ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>