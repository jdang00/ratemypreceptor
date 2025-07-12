<script lang="ts">
	import { SignIn } from 'svelte-clerk';
</script>

<div class="flex justify-center">
	<SignIn path="/sign-in" routing="path" redirectUrl="/" />
</div>
