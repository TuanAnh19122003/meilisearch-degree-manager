<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	const user = writable(null);
	const dropdownOpen = writable(false);
	const showToast = writable(false);
	let toastMessage = '';

	onMount(() => {
		const userData = localStorage.getItem('user');
		if (userData) user.set(JSON.parse(userData));
	});

	function logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		toastMessage = 'Đăng xuất thành công!';
		showToast.set(true);
		setTimeout(() => {
			showToast.set(false);
			goto('/auth/login');
		}, 2000);
	}

	function toggleDropdown() {
		dropdownOpen.update((open) => !open);
	}
	function goToProfile() {
		goto('/profile');
		dropdownOpen.set(false);
	}
	function goToSettings() {
		goto('/settings');
		dropdownOpen.set(false);
	}
	function goToSearch() {
		goto('/');
		dropdownOpen.set(false);
	}
</script>

<header
	class="flex items-center justify-between bg-gradient-to-r from-cyan-600 to-teal-500 p-4 text-white shadow-md"
>
	<div class="text-xl font-semibold">Hệ thống quản lý văn bằng</div>

	<div class="relative">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition hover:bg-white/20"
			on:click={toggleDropdown}
		>
			{#if $user}
				<img
					src={`http://localhost:5000/${$user.image}`}
					alt="avatar"
					class="h-9 w-9 rounded-full border-2 border-white"
				/>
				<span>{$user.lastname} {$user.firstname}</span>
			{/if}
		</div>

		{#if $dropdownOpen}
			<div
				class="animate-fadeIn absolute right-0 z-50 mt-2 w-52 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-lg"
			>
				<button class="flex w-full px-4 py-3 text-left hover:bg-gray-100" on:click={goToProfile}
					>Thông tin cá nhân</button
				>
				<button class="flex w-full px-4 py-3 text-left hover:bg-gray-100" on:click={goToSettings}
					>Cài đặt</button
				>
				<button class="flex w-full px-4 py-3 text-left hover:bg-gray-100" on:click={goToSearch}
					>Tìm kiếm</button
				>
				<hr class="border-gray-200" />
				<button
					class="flex w-full px-4 py-3 text-left font-bold text-red-600 hover:bg-red-100"
					on:click={logout}>Đăng xuất</button
				>
			</div>
		{/if}
	</div>
</header>

{#if $showToast}
	<div
		class="animate-fadeInOut fixed top-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg"
	>
		{toastMessage}
	</div>
{/if}

<style>
	@keyframes fadeInOut {
		0% {
			opacity: 0;
			transform: translateY(-10px);
		}
		10% {
			opacity: 1;
			transform: translateY(0);
		}
		90% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateY(-10px);
		}
	}
	.animate-fadeInOut {
		animation: fadeInOut 2s ease-in-out forwards;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fadeIn {
		animation: fadeIn 0.2s ease-in-out forwards;
	}
</style>
