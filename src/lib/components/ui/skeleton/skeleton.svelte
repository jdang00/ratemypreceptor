<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="skeleton"
<<<<<<< HEAD
	class={cn('bg-secondary animate-pulse rounded-md', className)}
=======
	class={cn('bg-accent animate-pulse rounded-md', className)}
>>>>>>> 2670efc6742408a465b02e854b59819bd18960f2
	{...restProps}
></div>
