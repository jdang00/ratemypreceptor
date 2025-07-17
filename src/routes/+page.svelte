<script lang="ts">
import UniversalSearch from '$lib/components/UniversalSearch.svelte';
</script>

<div class="mt-4 mb-6 flex flex-col items-center justify-center space-y-3">
  <img
    src="/RateMyPreceptorLogo.svg"
    alt="RateMyPreceptor Logo"
    class="mb-4 h-24 w-24 transition-transform duration-300 hover:scale-110 hover:rotate-12"
  />
  <h1 class="text-4xl font-bold">RateMyPreceptor</h1>
</div>
<p class="text-center text-lg">Enter a preceptor, school, or rotation to get started.</p>

<UniversalSearch />
