<script lang="ts">
	import { useClerkContext } from 'svelte-clerk/client';

	const ctx = useClerkContext();
</script>

<footer
	class="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur"
>
	<div class="mx-auto max-w-2xl px-4 py-6">
		<div
			class="flex flex-col items-center space-y-4 text-center sm:flex-row sm:justify-between sm:space-y-0"
		>
			<div class="text-muted-foreground text-sm">
				© 2025 RateMyPreceptor. All rights reserved.
			</div>
			<div class="flex space-x-6 text-sm">
				{#if ctx.user?.publicMetadata.role === 'admin'}
					<a href="/admin" class="text-muted-foreground hover:text-foreground transition-colors">
						Admin
					</a>
				{/if}
				<a href="/terms" class="text-muted-foreground hover:text-foreground transition-colors">
					Terms
				</a>
				<a
					href="/privacy"
					class="text-muted-foreground hover:text-foreground transition-colors"
				>
					Privacy
				</a>

				<a
					href="/guidelines"
					class="text-muted-foreground hover:text-foreground transition-colors"
				>
					Guidelines
				</a>
			</div>
		</div>
	</div>
</footer> 