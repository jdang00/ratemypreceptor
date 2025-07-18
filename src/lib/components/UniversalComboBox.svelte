<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	type Item = {
		id: string;
		name: string;
	};

	type Props = {
		items: Item[];
		value: string;
		onValueChange: (value: string) => void;
		placeholder?: string;
		searchPlaceholder?: string;
		class?: string;
		disabled?: boolean;
	};

	let {
		items,
		value,
		onValueChange,
		placeholder = 'Select item...',
		searchPlaceholder = 'Search items...',
		class: className = '',
		disabled = false
	}: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(items.find((item) => item.id === value)?.name);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	function handleSelect(itemId: string) {
		onValueChange(itemId);
		closeAndFocusTrigger();
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				variant="outline"
				class={cn('w-full justify-between text-left', className)}
				{...props}
				role="combobox"
				aria-expanded={open}
				{disabled}
			>
				{selectedValue || placeholder}
				<ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[--bits-popover-trigger-width] p-0">
		<Command.Root>
			<Command.Input placeholder={searchPlaceholder} />
			<Command.List>
				<Command.Empty>No item found.</Command.Empty>
				<Command.Group>
					{#each items as item (item.id)}
						<Command.Item value={item.name} onSelect={() => handleSelect(item.id)}>
							<CheckIcon class={cn('mr-2 size-4', value !== item.id && 'text-transparent')} />
							{item.name}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root> 