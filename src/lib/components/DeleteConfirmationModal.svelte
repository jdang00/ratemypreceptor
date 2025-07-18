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
		parameterName?: string; // Optional parameter name, defaults to 'id'
		onClose: () => void;
		onDelete?: () => void;
		onSuccess?: () => void;
	};

	let {
		isOpen,
		entityId,
		entityName,
		entityType,
		mutationName,
		parameterName = 'id',
		onClose,
		onDelete,
		onSuccess
	}: Props = $props();

	const client = useConvexClient();

	let isDeleting = $state(false);

	async function handleDelete() {
		try {
			isDeleting = true;

			const [moduleName, functionName] = mutationName.split('.');
			const mutation = (api as any)[moduleName][functionName];
			await client.mutation(mutation, { [parameterName]: entityId });

			onDelete?.();
			onClose();
			onSuccess?.();
		} catch (error) {
			console.error('Failed to delete entity:', error);
		} finally {
			isDeleting = false;
		}
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={(open) => !open && onClose()}>
	<Dialog.Content class="w-full max-w-[95vw] p-4 sm:max-w-[425px] sm:p-8">
		<Dialog.Header class="pb-4">
			<Dialog.Title class="flex items-center gap-2 text-lg font-semibold sm:text-xl">
				<AlertTriangle class="text-destructive h-5 w-5" />
				Delete {entityType}
			</Dialog.Title>
			<Dialog.Description class="text-muted-foreground text-sm">
				Are you sure you want to delete this {entityType.toLowerCase()}? This action cannot be
				undone.
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			<div class="bg-muted/50 rounded-lg p-3 sm:p-4">
				<p class="mb-1 text-sm font-medium">{entityType}:</p>
				<p class="text-muted-foreground text-sm break-words">{entityName}</p>
			</div>
		</div>

		<Dialog.Footer class="border-t pt-4">
			<div class="flex w-full justify-end gap-3">
				<Button type="button" variant="outline" onclick={onClose}>Cancel</Button>
				<Button type="button" variant="destructive" onclick={handleDelete} disabled={isDeleting}>
					{isDeleting ? 'Deleting...' : 'Delete'}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
