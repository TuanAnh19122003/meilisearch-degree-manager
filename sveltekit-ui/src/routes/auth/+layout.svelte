<script>
	import Header from "$lib/components/auth/header.svelte";
	import Footer from "$lib/components/auth/footer.svelte";
</script>

<div class="min-h-screen flex flex-col">
	<Header />

	<main class="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 px-4">
		<div class="w-full max-w-md">
			<slot />
		</div>
	</main>

	<Footer />
</div>