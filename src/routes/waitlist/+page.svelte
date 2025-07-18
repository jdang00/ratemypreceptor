<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api.js';

	let email: string = '';
	let isSubmitting = false;
	let errorMsg: string | null = null;
	let successMsg: string | null = null;

	const client = useConvexClient();

	async function handleSubmit() {
		errorMsg = null;
		successMsg = null;

		if (!email) {
			errorMsg = 'Email is required.';
			return;
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(email)) {
			errorMsg = 'Please enter a valid email address.';
			return;
		}

		isSubmitting = true;
		try {
			await client.mutation(api.waitlist.addEmail, {
				email
			});
			successMsg = 'Thanks for joining! We’ll notify you when we launch.';
			email = '';
		} catch (err) {
			console.error('Failed to add email:', err);
			errorMsg =
				err instanceof Error
					? err.message
					: 'An unexpected error occurred. Please try again later.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<main class="relative min-h-screen overflow-hidden">
	<div class="gradient-bg fixed inset-0"></div>

	<div class="noise-overlay fixed inset-0"></div>

	<div class="pointer-events-none fixed inset-0">
		<div class="gradient-orb gradient-orb-1"></div>
		<div class="gradient-orb gradient-orb-2"></div>
		<div class="gradient-orb gradient-orb-3"></div>
		<div class="gradient-orb gradient-orb-4"></div>
	</div>

	<div class="bg-background/3 fixed inset-0 backdrop-blur-sm"></div>

	<!-- Content -->
	<div class="relative z-10 container mx-auto px-4">
		<div class="-mt-20 flex min-h-screen items-center justify-center">
			<div class="w-full space-y-8 text-center">
				<!-- Status Badge -->
				<div class="flex justify-center">
					<Badge variant="secondary" class="px-4 text-sm font-medium">Coming Soon</Badge>
				</div>

				<!-- Main Heading -->
				<div class="space-y-4">
					<div class="flex items-center justify-center gap-4">
						<img src="/RateMyPreceptorLogo.svg" alt="RateMyPreceptor Logo" class="h-16 w-16" />
						<h1
							class="text-foreground text-4xl font-bold tracking-tight
              sm:text-5xl lg:text-6xl"
						>
							RateMyPreceptor
						</h1>
					</div>
					<p
						class="text-muted-foreground mx-auto max-w-md text-xl
            leading-relaxed"
					>
						The platform that connects students with the best clinical preceptors
					</p>
				</div>

				<!-- Description -->
				<p class="text-muted-foreground mx-auto max-w-md">
					Be the first to know when we launch and get early access to revolutionary preceptor
					ratings and reviews.
				</p>

				<!-- Email Signup -->
				<div
					class="mx-auto flex max-w-lg flex-col justify-center gap-3
          sm:flex-row"
				>
					<Input
						bind:value={email}
						type="email"
						placeholder="Enter your email address"
						class="flex-1 rounded-md text-base lg:h-12"
						disabled={isSubmitting}
					/>
					<Button
						onclick={handleSubmit}
						class="rounded-md text-base lg:h-12"
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							Submitting…
						{:else}
							Join Waitlist
						{/if}
					</Button>
				</div>

				{#if errorMsg}
					<p class="text-sm text-red-500">{errorMsg}</p>
				{/if}
				{#if successMsg}
					<p class="text-sm text-green-500">{successMsg}</p>
				{/if}
			</div>
		</div>
	</div>
</main>

<style>
	@keyframes radial-pulse {
		0%,
		100% {
			transform: scale(1) rotate(0deg);
			opacity: 0.15;
		}
		50% {
			transform: scale(1.1) rotate(180deg);
			opacity: 0.25;
		}
	}

	@keyframes gentle-float {
		0%,
		100% {
			transform: translateY(0) translateX(0);
		}
		33% {
			transform: translateY(-15px) translateX(10px);
		}
		66% {
			transform: translateY(10px) translateX(-8px);
		}
	}

	@keyframes subtle-gradient {
		0% {
			background-position: 0% 50%;
			opacity: 0.2;
		}
		50% {
			background-position: 100% 50%;
			opacity: 0.3;
		}
		100% {
			background-position: 0% 50%;
			opacity: 0.2;
		}
	}

	.gradient-bg {
		background: radial-gradient(
			ellipse at center,
			#dc2626 0%,
			#b91c1c 20%,
			#991b1b 40%,
			#7f1d1d 60%,
			#450a0a 80%,
			#1c0000 100%
		);
		background-size: 200% 200%;
		animation: subtle-gradient 20s ease-in-out infinite;
		width: 100vw;
		height: 100vh;
	}

	.gradient-orb {
		position: absolute;
		border-radius: 50%;
		animation: radial-pulse 15s ease-in-out infinite;
		filter: blur(4px);
	}

	.gradient-orb-1 {
		top: 10%;
		left: 20%;
		width: 16rem;
		height: 16rem;
		background: radial-gradient(
			circle,
			rgba(239, 68, 68, 0.3) 0%,
			rgba(239, 68, 68, 0.1) 50%,
			transparent 100%
		);
		animation-delay: 0s;
	}

	.gradient-orb-2 {
		top: 60%;
		right: 15%;
		width: 12rem;
		height: 12rem;
		background: radial-gradient(
			circle,
			rgba(185, 28, 28, 0.25) 0%,
			rgba(185, 28, 28, 0.08) 50%,
			transparent 100%
		);
		animation-delay: 5s;
		animation-name: radial-pulse, gentle-float;
		animation-duration: 15s, 25s;
	}

	.gradient-orb-3 {
		top: 30%;
		left: 70%;
		width: 8rem;
		height: 8rem;
		background: radial-gradient(
			circle,
			rgba(127, 29, 29, 0.2) 0%,
			rgba(127, 29, 29, 0.06) 50%,
			transparent 100%
		);
		animation-delay: 10s;
	}

	.gradient-orb-4 {
		top: 80%;
		left: 40%;
		width: 10rem;
		height: 10rem;
		background: radial-gradient(
			circle,
			rgba(220, 38, 38, 0.15) 0%,
			rgba(220, 38, 38, 0.05) 50%,
			transparent 100%
		);
		animation-delay: 7s;
		animation-name: gentle-float;
		animation-duration: 30s;
	}

	.noise-overlay {
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' \
xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence \
type='fractalNoise' baseFrequency='0.4' numOctaves='2' stitchTiles='stitch'/%3E\
%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' \
opacity='0.02'/%3E%3C/svg%3E");
		mix-blend-mode: soft-light;
	}
</style>
