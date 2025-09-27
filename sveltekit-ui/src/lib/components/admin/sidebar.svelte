<script>
	import { page } from '$app/stores';
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

	// Hàm kiểm tra active
	function isActive(pathname, item) {
		// Nếu đang ở "/admin" thì mặc định chọn user-management
		if (pathname === '/admin' && item.key === 'user-management') return true;
		return pathname.startsWith(item.link);
	}
</script>

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
				class={`mx-2 my-1 flex items-center gap-3 rounded-lg px-4 py-2 font-semibold transition-colors
					${
						isActive($page.url.pathname, item)
							? 'bg-gray-700 text-purple-300'
							: 'text-white hover:bg-gray-700'
					}`}
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
