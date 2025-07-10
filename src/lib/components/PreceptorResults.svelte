<script lang="ts">
	import { Card, CardHeader } from '$lib/components/ui/card/index.js';

	interface Props {
		fullName: string;
		schoolId: string;
		siteId: string;
	}

	let { fullName, schoolId, siteId, class: className = '' }: Props = $props();
</script>

<div class="w-full py-2 {className}">
	<a href="/preceptors/{fullName}">
		<Card class="cursor-pointer transition-all duration-100 hover:shadow-lg">
			<CardHeader>
				<div class="flex items-start justify-between">
					<h3 class="text-lg font-semibold">{fullName}</h3>
				</div></CardHeader
			>
		</Card>
	</a>
</div>
