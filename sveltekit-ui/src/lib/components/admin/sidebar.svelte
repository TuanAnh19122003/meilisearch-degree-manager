<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import {
		User,
		Shield,
		Home,
		Book,
		FileText,
		GraduationCap,
		Clipboard,
		Award,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';

	export let collapsed = false;

	const user = writable(null);

	onMount(() => {
		const userData = localStorage.getItem('user');
		if (userData) {
			user.set(JSON.parse(userData));
		} else {
			window.location.href = '/auth/login';
		}
	});

	const menuItems = [
		{ key: 'user-management', label: 'Quản lý người dùng', link: '/admin/user', icon: User },
		{ key: 'role-management', label: 'Quản lý vai trò', link: '/admin/role', icon: Shield },
		{ key: 'faculty', label: 'Khoa', link: '/admin/department', icon: Home },
		{ key: 'major', label: 'Chuyên ngành', link: '/admin/major', icon: Book },
		{ key: 'template', label: 'Template', link: '/admin/template', icon: FileText },
		{ key: 'student', label: 'Sinh viên', link: '/admin/student', icon: GraduationCap },
		{ key: 'certs', label: 'Quản lý văn bằng', link: '/admin/cert', icon: Award },
		{ key: 'logs', label: 'Kiểm tra logs & văn bằng', link: '/admin/log', icon: Clipboard }
	];

	// Lấy path hiện tại để highlight
	let currentPath = '';
	onMount(() => {
		currentPath = window.location.pathname;
	});
</script>

<!-- Layout container -->
<div class="flex min-h-screen">
	<!-- Sidebar -->
	<aside
		class={`flex flex-col bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
	>
		<!-- Logo -->
		<a href="/admin" class="flex items-center justify-center p-4">
			<img
				src="/img/logo.png"
				alt="Logo"
				class={`rounded-lg shadow-md transition-all ${collapsed ? 'h-10 w-10' : 'h-20 w-20'}`}
			/>
		</a>

		<!-- Menu -->
		<nav class="mt-4 flex-1 overflow-auto">
			{#each menuItems as item}
				<a
					href={item.link}
					class={`mx-2 my-1 flex items-center gap-3 rounded-lg px-4 py-2 transition-colors 
						${currentPath.startsWith(item.link) ? 'bg-gray-700 font-semibold text-purple-300' : 'text-white hover:bg-gray-700'}`}
				>
					<svelte:component this={item.icon} class="h-5 w-5" />
					{#if !collapsed}
						<span>{item.label}</span>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- Collapse button -->
		<button
			type="button"
			aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
			class="m-2 self-end rounded-full bg-gray-800 p-2 transition hover:bg-gray-700"
			on:click={() => (collapsed = !collapsed)}
		>
			{#if collapsed}
				<ChevronRight class="h-5 w-5 text-white" />
			{:else}
				<ChevronLeft class="h-5 w-5 text-white" />
			{/if}
		</button>
	</aside>

	<!-- Main content -->
	<main class="flex-1 overflow-auto bg-gray-100 p-6">
		<slot />
	</main>
</div>

<style>
	/* Scrollbar cho sidebar */
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
