<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { AlertTriangle, Home } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Access Denied - RateMyPreceptor</title>
</svelte:head>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
		<Card.Root class="w-full max-w-md">
			<Card.Header class="text-center">
				<div
					class="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
				>
					<AlertTriangle class="text-destructive h-8 w-8" />
				</div>
				<Card.Title class="text-2xl font-bold">Access Denied</Card.Title>
				<Card.Description class="text-muted-foreground">
					You don't have permission to access this page.
				</Card.Description>
			</Card.Header>

			<Card.Content class="text-center">
				<p class="text-muted-foreground mb-6 text-sm">
					If you believe this is an error, please contact support or try logging in with a different
					account.
				</p>

				<Button href="/" class="w-full">
					<Home class="mr-2 h-4 w-4" />
					Go Back Home
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
</div>
