<script>
	import Header from '$lib/components/auth/header.svelte';
	import Footer from '$lib/components/auth/footer.svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';

	const fullTitle = derived(pageTitle, ($pageTitle) => ($pageTitle ? `${$pageTitle}` : 'Admin'));

	onMount(() => {
		const unsubscribe = fullTitle.subscribe((val) => {
			document.title = val;
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<div class="flex min-h-screen flex-col">
	<Header title="Auth" />

	<main
		class="flex flex-1 items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 px-4"
	>
		<div class="w-full max-w-md">
			<slot />
		</div>
	</main>

	<Footer />
</div>
