<script lang="ts">
	import { writable } from 'svelte/store';
	import axios from 'axios';
	import { onMount } from 'svelte';

	let query = '';
	const students = writable([]);
	const certificates = writable([]);
	const loading = writable(false);
	const error = writable('');
	const API_URL = import.meta.env.VITE_API_URL;
	const user = writable(null);
	let showUserMenu = false;

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function logout() {
		localStorage.removeItem('user');
		user.set(null);
		showUserMenu = false;
	}

	onMount(() => {
		const userData = localStorage.getItem('user');
		if (userData) user.set(JSON.parse(userData));
	});

	let openStudent: number[] = [];
	let openCert: number[] = [];

	function toggleStudent(id: number) {
		if (openStudent.includes(id)) openStudent = openStudent.filter((x) => x !== id);
		else openStudent = [...openStudent, id];
	}

	function toggleCert(id: number) {
		if (openCert.includes(id)) openCert = openCert.filter((x) => x !== id);
		else openCert = [...openCert, id];
	}

	let debounceTimeout;
	function debounceSearch() {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => search(), 400);
	}

	async function search() {
		if (!query) {
			students.set([]);
			certificates.set([]);
			return;
		}
		loading.set(true);
		error.set('');
		students.set([]);
		certificates.set([]);

		try {
			const res = await axios.get(`${API_URL}/meili/search`, { params: { q: query } });
			const data = res.data;
			if (!data.success) error.set(data.message || 'Lỗi khi tìm');
			else {
				students.set(data.student || []);
				certificates.set(data.certificates || []);
			}
		} catch (err: any) {
			console.error(err);
			error.set(err.response?.data?.message || 'Lỗi khi gọi API');
		} finally {
			loading.set(false);
		}
	}

	function getInitials(student) {
		return `${student.firstname?.[0] || ''}${student.lastname?.[0] || ''}`.toUpperCase();
	}

	// --- Scroll khi focus input (chỉ client) ---
	function scrollToInput() {
		if (typeof window !== 'undefined' && document.activeElement) {
			setTimeout(() => {
				document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}, 300);
		}
	}
</script>

<div class="flex min-h-[90vh] w-full items-center justify-center p-4">
	<div class="flex w-full max-w-5xl flex-col-reverse gap-6 md:flex-row">
		<!-- Kết quả -->
		<div
			class="h-[70vh] flex-1 overflow-y-auto rounded p-4 shadow
                    {$students.length || $certificates.length
				? 'bg-white'
				: 'flex items-center justify-center bg-gray-50'}"
		>
			{#if $students.length || $certificates.length}
				{#if $students.length}
					<h2 class="mb-2 text-lg font-semibold">Sinh viên</h2>
					<div class="space-y-2">
						{#each $students as s}
							<div
								class="flex flex-col rounded border border-gray-200 p-2 sm:flex-row sm:items-center sm:justify-between"
							>
								<div class="flex items-center gap-2">
									{#if s.image}
										<img
											src={`http://localhost:5000/${s.image}`}
											alt={`Ảnh của ${s.firstname} ${s.lastname}`}
											class="h-10 w-10 rounded-full object-cover"
										/>
									{:else}
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 font-bold text-white"
										>
											{getInitials(s)}
										</div>
									{/if}
									<div>
										<p class="font-medium">{s.firstname} {s.lastname}</p>
										<p class="text-sm text-gray-500">{s.code}</p>
									</div>
								</div>
								<button
									class="mt-2 text-sm text-blue-500 sm:mt-0"
									on:click={() => toggleStudent(s.id)}
								>
									{openStudent.includes(s.id) ? 'Thu gọn' : 'Chi tiết'}
								</button>
								{#if openStudent.includes(s.id)}
									<div class="mt-2 space-y-1 text-sm text-gray-700 sm:mt-4">
										<p>Email: {s.email}</p>
										<p>Phone: {s.phone}</p>
										<p>Major: {s.major?.name || '-'}</p>
										<p>GPA: {s.gpa || '-'}</p>
										<p>Học lực: {s.hoc_luc}</p>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				{#if $certificates.length}
					<h2 class="mt-4 mb-2 text-lg font-semibold">Văn bằng</h2>
					<div class="space-y-2">
						{#each $certificates as c}
							<div
								class="flex flex-col rounded border border-gray-200 p-2 sm:flex-row sm:items-center sm:justify-between"
							>
								<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
									<p class="font-medium">{c.number}</p>
									<p class="text-sm text-gray-500 sm:ml-4">{c.type} - {c.status}</p>
									<p class="text-sm text-gray-500 sm:ml-4">
										{c.student?.firstname}{c.student?.lastname} ({c.student?.code})
									</p>
								</div>
								<button
									class="mt-2 text-sm text-blue-500 sm:mt-0"
									on:click={() => toggleCert(c.id)}
								>
									{openCert.includes(c.id) ? 'Thu gọn' : 'Chi tiết'}
								</button>
								{#if openCert.includes(c.id)}
									<div class="mt-2 space-y-1 text-sm text-gray-700 sm:mt-4">
										<p>Ngày tốt nghiệp: {c.grad_date}</p>
										<p>Issuer: {c.issuer}</p>
										<p>
											File:
											{#if c.file_url}
												<a
													href={c.file_url}
													class="text-blue-500"
													target="_blank"
													rel="noopener noreferrer"
													aria-label={`Xem file văn bằng ${c.number}`}>Xem file</a
												>
											{:else}Chưa có{/if}
										</p>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				<div class="text-center text-gray-500">
					<svg
						class="mx-auto mb-3 h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<p class="font-medium">Chưa có dữ liệu</p>
					<p class="text-sm">Nhập mã sinh viên hoặc số certificate để tra cứu</p>
				</div>
			{/if}
		</div>

		<!-- Form tra cứu -->
		<div class="flex w-full flex-col gap-4 md:w-1/3">
			<div class="rounded bg-white p-4 shadow">
				<h2 class="mb-2 text-lg font-semibold">Tra cứu</h2>
				<input
					type="text"
					bind:value={query}
					placeholder="Nhập mã sinh viên hoặc số certificate"
					class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-300 focus:ring focus:outline-none"
					on:input={debounceSearch}
					on:focus={scrollToInput}
				/>
				{#if $loading}<p class="mt-2 text-gray-500">Đang tìm...</p>{/if}
				{#if $error}<p class="mt-2 text-red-500">{$error}</p>{/if}
			</div>

			<!-- Mobile -->
			<div class="rounded bg-gray-50 p-4 text-sm text-gray-500 md:hidden">
				Nhập mã sinh viên hoặc số certificate để tra cứu nhanh.
			</div>

			<!-- Desktop -->
			<div class="hidden rounded bg-gray-50 p-4 text-sm text-gray-500 md:block">
				Nhập mã sinh viên hoặc số certificate để tra cứu nhanh. Kết quả sẽ hiển thị bên trái.
			</div>

			<div class="mt-2 flex flex-col gap-2 relative">
				{#if $user}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						class="flex cursor-pointer items-center gap-3 rounded bg-gray-100 p-3"
						on:click={toggleUserMenu}
					>
						<img
							src={`http://localhost:5000/${$user.image}`}
							alt="avatar"
							class="h-10 w-10 rounded-full object-cover"
						/>
						<div>
							<p class="font-medium text-gray-800">{$user.firstname} {$user.lastname}</p>
							<p class="text-sm text-gray-500">{$user.role?.name || 'User'}</p>
						</div>
					</div>

					<!-- Dropdown menu -->
					{#if showUserMenu}
						<div
							class="absolute right-0 z-10 mt-1 w-48 rounded border border-gray-200 bg-white shadow-lg"
						>
							<a
								href="http://localhost:5173/admin"
								class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
							>
								Trang người dùng
							</a>
							<button
								class="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
								on:click={logout}
							>
								Đăng xuất
							</button>
						</div>
					{/if}
				{:else}
					<!-- Nếu chưa login: giữ nguyên Đăng nhập / Login với Google -->
					<a
						href="/auth/login"
						class="w-full rounded bg-blue-500 px-4 py-2 text-center font-medium text-white transition hover:bg-blue-600 md:w-auto"
					>
						Đăng nhập
					</a>

					<button
						class="flex w-full items-center justify-center gap-2 rounded border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100 md:w-auto"
						on:click={() => console.log('Login với Google')}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 48 48">
							<path
								fill="#EA4335"
								d="M24 9.5c3.2 0 5.9 1.1 8 2.9l6-6C34.5 2.4 29.5 0 24 0 14 0 5.7 6 2.4 14.5l7.2 5.6C12.4 15.1 17.8 9.5 24 9.5z"
							/>
							<path
								fill="#34A853"
								d="M46.5 24c0-1.5-.1-2.9-.4-4.3H24v8.1h12.6c-.5 2.4-2 4.5-4.2 5.9l6.5 5C43.9 35.5 46.5 30.2 46.5 24z"
							/>
							<path
								fill="#4A90E2"
								d="M10 29.1l-7.2 5.6C5.7 42 14 48 24 48c6.5 0 12.5-2.4 17-6.5l-6.5-5C29.5 41.1 26 42 24 42c-6.2 0-11.6-4.6-12.8-10.9z"
							/>
							<path
								fill="#FBBC05"
								d="M2.4 14.5C.8 19.5 0 24 0 24s0 4.5 2.4 9l7.2-5.6C8.6 28.5 8 26 8 24s.6-4.5 1.6-6.5z"
							/>
						</svg>
						Đăng nhập với Google
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
