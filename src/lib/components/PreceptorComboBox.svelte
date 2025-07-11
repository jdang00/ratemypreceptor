<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import { tick } from "svelte";
	import * as Command from "$lib/components/ui/command/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	type Preceptor = {
		_id: string;
		fullName: string;
	};

	type Props = {
		preceptors: Preceptor[];
		value: string;
		onValueChange: (value: string) => void;
		placeholder?: string;
		searchPlaceholder?: string;
		class?: string;
		disabled?: boolean;
	};

	let {
		preceptors,
		value,
		onValueChange,
		placeholder = "Select preceptor...",
		searchPlaceholder = "Search preceptors...",
		class: className = "",
		disabled = false
	}: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(
		preceptors.find((p) => p._id === value)?.fullName
	);

	
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	function handleSelect(preceptorId: string) {
		onValueChange(preceptorId);
		closeAndFocusTrigger();
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				variant="outline"
				class={cn("w-full justify-between", className)}
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
				<Command.Empty>No preceptor found.</Command.Empty>
				<Command.Group>
					{#each preceptors as preceptor (preceptor._id)}
						<Command.Item
							value={preceptor.fullName}
							onSelect={() => handleSelect(preceptor._id)}
						>
							<CheckIcon
								class={cn(
									"mr-2 size-4",
									value !== preceptor._id && "text-transparent"
								)}
							/>
							{preceptor.fullName}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root> 