<script>
	import Header from '$lib/components/admin/header.svelte';
	import Footer from '$lib/components/admin/footer.svelte';
	import Sidebar from '$lib/components/admin/sidebar.svelte';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	let collapsed = false;
    
	onMount(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			goto('/auth/login');
		}
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
