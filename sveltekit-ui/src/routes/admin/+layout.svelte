<script>
	import Header from '$lib/components/admin/header.svelte';
	import Footer from '$lib/components/admin/footer.svelte';
	import Sidebar from '$lib/components/admin/sidebar.svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { derived } from 'svelte/store';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Toaster } from 'svelte-sonner';

	let collapsed = false;

	const fullTitle = derived(pageTitle, ($pageTitle) =>
		$pageTitle ? `${$pageTitle}` : 'Admin'
	);

	onMount(() => {
		const token = localStorage.getItem('token');
		if (!token) goto('/auth/login');

		const unsubscribe = fullTitle.subscribe((val) => {
			document.title = val;
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<div class="flex min-h-screen flex-col">
	<Header title="Admin Portal" />

	<div class="flex flex-1">
		<Sidebar bind:collapsed />

		<main class="flex-1 overflow-auto bg-gray-100 p-6">
			<slot />
		</main>
	</div>

	<Footer />
</div>

<Toaster
	position="top-center"
	richColors
	toastOptions={{
		duration: 3000,
		style: { fontSize: '15px' }
	}}
/>
