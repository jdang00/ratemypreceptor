<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';
	import * as Dialog from './ui/dialog/index.js';
	import { Button } from './ui/button/index.js';
	import { AlertTriangle } from '@lucide/svelte';

	type Props = {
		isOpen: boolean;
		entityId: string;
		entityName: string;
		entityType: string;
		mutationName: string;
		onClose: () => void;
		onDelete?: () => void;
	};

	let { isOpen, entityId, entityName, entityType, mutationName, onClose, onDelete }: Props = $props();

	// Get Convex client for mutations
	const client = useConvexClient();

	// State
	let isDeleting = $state(false);

	async function handleDelete() {
		try {
			isDeleting = true;

			// Dynamically call the correct mutation based on mutationName
			const [moduleName, functionName] = mutationName.split('.');
			const mutation = (api as any)[moduleName][functionName];
			await client.mutation(mutation, { id: entityId });
			
			onDelete?.();
			onClose();
		} catch (error) {
			console.error('Failed to delete entity:', error);
		} finally {
			isDeleting = false;
		}
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && onClose()}>
	<Dialog.Content class="w-full max-w-[95vw] sm:max-w-[425px] p-4 sm:p-8">
		<Dialog.Header class="pb-4">
			<Dialog.Title class="text-lg font-semibold flex items-center gap-2">
				<AlertTriangle class="h-5 w-5 text-destructive" />
				Delete {entityType}
			</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Are you sure you want to delete this {entityType.toLowerCase()}? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			<div class="bg-muted/50 rounded-lg p-4">
				<p class="text-sm font-medium mb-1">{entityType}:</p>
				<p class="text-sm text-muted-foreground">{entityName}</p>
			</div>
		</div>

		<Dialog.Footer class="pt-4 border-t">
			<div class="flex justify-end gap-3 w-full">
				<Button type="button" variant="outline" onclick={onClose}>
					Cancel
				</Button>
				<Button 
					type="button" 
					variant="destructive"
					onclick={handleDelete} 
					disabled={isDeleting}
				>
					{isDeleting ? 'Deleting...' : 'Delete'}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root> 