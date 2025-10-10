<script>
	import Header from '$lib/components/admin/header.svelte';
	import Footer from '$lib/components/admin/footer.svelte';
	import Sidebar from '$lib/components/admin/sidebar.svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { derived } from 'svelte/store';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Toaster } from 'svelte-sonner';

	export let children;

	let collapsed = false;

	const fullTitle = derived(pageTitle, ($pageTitle) => ($pageTitle ? `${$pageTitle}` : 'Admin'));

	function isTokenExpired(token) {
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			const exp = payload.exp;
			const now = Math.floor(Date.now() / 1000);
			return now > exp;
		} catch (e) {
			return true;
		}
	}

	function logout() {
		localStorage.removeItem('token');
		goto('/auth/login');
	}

	onMount(() => {
		const token = localStorage.getItem('token');
		if (!token || isTokenExpired(token)) {
			logout();
			return;
		}

		const unsubscribe = fullTitle.subscribe((val) => {
			document.title = val;
		});

		const interval = setInterval(() => {
			const token = localStorage.getItem('token');
			if (!token || isTokenExpired(token)) {
				logout();
			}
		}, 60000);

		return () => {
			unsubscribe();
			clearInterval(interval);
		};
	});
</script>

<div class="flex min-h-screen flex-col">
	<Header title="Admin Portal" />

	<div class="flex flex-1">
		<Sidebar bind:collapsed />

		<main class="flex-1 overflow-auto bg-gray-100 p-6">
			{@render children?.()}
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
