<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import {
		User,
		Shield,
		Home,
		Book,
		GraduationCap,
		ListCheck,
		FileText,
		Award,
		Clipboard,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';

	export let collapsed = false;

	const user = writable(null);

	onMount(() => {
		const userData = localStorage.getItem('user');
		if (userData) user.set(JSON.parse(userData));
		else window.location.href = '/auth/login';
	});

	const menuItems = [
		{ key: 'user-management', label: 'Quản lý người dùng', link: '/admin/users', icon: User },
		{ key: 'role-management', label: 'Quản lý vai trò', link: '/admin/roles', icon: Shield },
		{ key: 'departments', label: 'Khoa', link: '/admin/departments', icon: Home },
		{ key: 'majors', label: 'Chuyên ngành', link: '/admin/majors', icon: Book },
		{ key: 'students', label: 'Sinh viên', link: '/admin/students', icon: GraduationCap },
		{ key: 'courses', label: 'Khóa học', link: '/admin/courses', icon: ListCheck },
		{ key: 'grades', label: 'Bảng điểm', link: '/admin/grades', icon: FileText },
		{ key: 'certificates', label: 'Văn bằng', link: '/admin/certificates', icon: Award },
		{ key: 'logs', label: 'Logs', link: '/admin/logs', icon: Clipboard }
	];
</script>

<aside class={`flex flex-col bg-gray-800 text-white transition-all ${collapsed ? 'w-20' : 'w-64'}`}>
	<a href="/admin" class="flex items-center justify-center p-4">
		<img
			src="/img/logo.png"
			alt="Logo"
			class={`rounded-lg shadow-md transition-all ${collapsed ? 'h-10 w-10' : 'h-24 w-24'}`}
		/>
	</a>

	<nav class="mt-6 flex-1 overflow-auto">
		{#each menuItems as item}
			<a
				href={item.link}
				class="mx-2 my-1 flex items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-cyan-500"
			>
				<svelte:component this={item.icon} class="h-5 w-5" />
				{#if !collapsed}<span class="font-medium">{item.label}</span>{/if}
			</a>
		{/each}
	</nav>

	<button
		class="m-2 self-end rounded-full bg-gray-700 p-2 transition hover:bg-cyan-500"
		on:click={() => (collapsed = !collapsed)}
	>
		{#if collapsed}
			<ChevronRight class="h-5 w-5 text-white" />
		{:else}
			<ChevronLeft class="h-5 w-5 text-white" />
		{/if}
	</button>
</aside>

<style>
	aside::-webkit-scrollbar {
		width: 6px;
	}
	aside::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}
	aside::-webkit-scrollbar-track {
		background: transparent;
	}
</style>
