<script lang="ts">
	import { writable } from 'svelte/store';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { fade } from 'svelte/transition';

	let query = '';
	const students = writable([]);
	const certificates = writable([]);
	const loading = writable(false);
	const error = writable('');
	const API_URL = import.meta.env.VITE_API_URL;
	const user = writable(null);
	let showUserMenu = false;
	let showPreview = false;
	let previewUrl = '';

	pageTitle.set('Tra cứu văn bằng');
	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function logout() {
		localStorage.removeItem('user');
		user.set(null);
		showUserMenu = false;
	}

	function openPreview(c) {
		if (!c.file_url) {
			alert('Văn bằng chưa có file PDF!');
			return;
		}
		previewUrl = `http://localhost:5000/${c.file_url}`;
		showPreview = true;
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
				// Thêm delay 300ms trước khi set dữ liệu
				await new Promise((resolve) => setTimeout(resolve, 300));

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

	function scrollToInput() {
		if (typeof window !== 'undefined' && document.activeElement) {
			setTimeout(() => {
				document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}, 300);
		}
	}
</script>

<div class="flex min-h-[100vh] w-full items-center justify-center p-5">
	<div
		class="flex w-full max-w-5xl flex-col-reverse gap-6 rounded-2xl
           border border-gray-200 bg-white shadow-2xl md:flex-row"
	>
		<!-- Kết quả -->
		<div
			class="h-[70vh] flex-1 overflow-y-auto transition-all"
			class:bg-white={$students.length || $certificates.length}
			class:p-4={$students.length || $certificates.length}
			class:rounded={$students.length || $certificates.length}
			class:flex={!$students.length && !$certificates.length}
			class:items-center={!$students.length && !$certificates.length}
			class:justify-center={!$students.length && !$certificates.length}
			style="opacity: {$loading ? 0.3 : 1}; transition: opacity 0.3s;"
		>
			{#if $loading}
				<div class="w-full space-y-4">
					{#each Array(3) as _, i}
						<div class="rounded border border-gray-200 bg-white p-4 shadow-sm">
							<div class="mb-3 flex items-center gap-3">
								<div class="skeleton h-10 w-10 rounded-full"></div>
								<div class="flex-1 space-y-2">
									<div class="skeleton h-3 w-1/3 rounded"></div>
									<div class="skeleton h-3 w-1/2 rounded"></div>
								</div>
							</div>
							<div class="space-y-2">
								<div class="skeleton h-3 w-5/6 rounded"></div>
								<div class="skeleton h-3 w-2/3 rounded"></div>
								<div class="skeleton h-3 w-4/5 rounded"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if $students.length || $certificates.length}
				<!-- Dữ liệu sinh viên -->
				{#if $students.length}
					<h2 class="mb-2 text-lg font-semibold">Sinh viên</h2>
					<div class="space-y-3">
						{#each $students as s}
							<div
								class="rounded border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
							>
								<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<div class="flex items-center gap-3">
										{#if s.image}
											<img
												src={`http://localhost:5000/${s.image}`}
												alt={`${s.lastname} ${s.firstname}`}
												class="h-10 w-10 rounded-full object-cover"
											/>
										{:else}
											<div
												class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-bold text-white"
											>
												{getInitials(s)}
											</div>
										{/if}
										<div>
											<p class="font-medium">{s.lastname} {s.firstname}</p>
											<p class="text-sm text-gray-500">{s.code}</p>
										</div>
									</div>
									<button
										class="flex items-center gap-1 text-sm text-blue-600 transition hover:text-blue-800 sm:mt-0"
										on:click={() => toggleStudent(s.id)}
									>
										{openStudent.includes(s.id) ? 'Thu gọn' : 'Chi tiết'}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d={openStudent.includes(s.id) ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
											/>
										</svg>
									</button>
								</div>

								{#if openStudent.includes(s.id)}
									<div
										transition:slide
										class="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 shadow-inner sm:p-4"
									>
										<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
											<p><span class="font-medium text-gray-600">Email:</span> {s.email || '-'}</p>
											<p><span class="font-medium text-gray-600">SĐT:</span> {s.phone || '-'}</p>
											<p>
												<span class="font-medium text-gray-600">Chuyên ngành:</span>
												{s.major?.name || '-'}
											</p>
											<p><span class="font-medium text-gray-600">GPA:</span> {s.gpa || '-'}</p>
											<p>
												<span class="font-medium text-gray-600">Học lực:</span>
												{s.hoc_luc || '-'}
											</p>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				<!-- Dữ liệu văn bằng -->
				{#if $certificates.length}
					<h2 class="mt-6 mb-2 text-lg font-semibold">Văn bằng</h2>
					<div class="space-y-3">
						{#each $certificates as c}
							<div
								class="rounded border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
							>
								<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
										<p class="font-medium">{c.number}</p>
										<p class="text-sm text-gray-500">{c.type} - {c.status}</p>
										<p class="text-sm text-gray-500">
											{c.student?.lastname}
											{c.student?.firstname} ({c.student?.code})
										</p>
									</div>

									<button
										class="flex items-center gap-1 text-sm text-blue-600 transition hover:text-blue-800 sm:mt-0"
										on:click={() => toggleCert(c.id)}
									>
										{openCert.includes(c.id) ? 'Thu gọn' : 'Chi tiết'}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d={openCert.includes(c.id) ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
											/>
										</svg>
									</button>
								</div>

								{#if openCert.includes(c.id)}
									<div
										transition:slide
										class="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 shadow-inner sm:p-4"
									>
										<div class="space-y-1">
											<p>
												<span class="font-medium text-gray-600">Ngày tốt nghiệp:</span>
												{c.grad_date || '-'}
											</p>
											<p>
												<span class="font-medium text-gray-600">Người cấp:</span>
												{c.issuer || '-'}
											</p>
											<p>
												<span class="font-medium text-gray-600">File văn bằng:</span>
												{#if c.file_url}
													<button
														class="ml-1 text-blue-600 underline hover:text-blue-800"
														on:click={() => openPreview(c)}
													>
														Xem file
													</button>
												{:else}
													<span class="ml-1 text-gray-400">Chưa có</span>
												{/if}
											</p>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				<div
					class="h-full w-full overflow-hidden
         rounded-b-2xl shadow-md md:rounded-tl-2xl
         md:rounded-tr-none md:rounded-br-none md:rounded-bl-2xl"
				>
					<img
						src="/img/logo-left.svg"
						alt="Logo"
						class="h-full w-full rounded-b-2xl
           object-cover md:rounded-tl-2xl md:rounded-tr-none md:rounded-br-none md:rounded-bl-2xl"
					/>
				</div>
			{/if}
		</div>

		<!-- Form tra cứu -->
		<div class="flex w-full flex-col gap-4 p-4 md:w-2/5">
			<section class="mb-5 text-center">
				<h1 class="text-2xl font-bold text-blue-600">EPU Smart Lookup</h1>
				<p class="text-gray-600 italic">Verify faster — Trust smarter</p>
			</section>

			<div class="rounded bg-white p-4 shadow">
				<h2 class="mb-2 text-lg font-semibold">Tra cứu</h2>
				<input
					type="text"
					bind:value={query}
					placeholder="Nhập mã sinh viên hoặc số certificate"
					class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-400 focus:ring focus:outline-none"
					on:input={debounceSearch}
					on:focus={scrollToInput}
				/>
				{#if $loading}<p class="mt-2 text-gray-500">Đang tìm...</p>{/if}
				{#if $error}<p class="mt-2 text-red-500">{$error}</p>{/if}
			</div>

			<div class="rounded bg-gray-50 p-4 text-sm text-gray-500 md:hidden">
				Nhập mã sinh viên hoặc số certificate để tra cứu nhanh.
			</div>

			<div class="hidden rounded bg-gray-50 p-4 text-sm text-gray-500 md:block">
				Nhập mã sinh viên hoặc số certificate để tra cứu nhanh. Kết quả sẽ hiển thị bên trái.
			</div>

			<div class="relative mt-2 flex flex-col gap-2">
				{#if $user && !$students.length && !$certificates.length}
					<!-- User menu -->
					<div transition:fade={{ duration: 200 }}>
						<button
							type="button"
							class="flex w-full items-center gap-3 rounded bg-gray-100 p-3 transition hover:bg-gray-200"
							on:click={toggleUserMenu}
							aria-haspopup="true"
							aria-expanded={showUserMenu}
						>
							{#if $user.image}
								<img
									src={`http://localhost:5000/${$user.image}`}
									alt="avatar"
									class="h-10 w-10 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 font-bold text-white"
								>
									{$user.firstname?.[0]}{$user.lastname?.[0]}
								</div>
							{/if}

							<div class="text-left">
								<p class="font-medium text-gray-800">{$user.firstname} {$user.lastname}</p>
								<p class="text-sm text-gray-500">{$user.role?.name || 'User'}</p>
							</div>
						</button>

						{#if showUserMenu}
							<div
								class="absolute right-0 z-10 mt-1 w-48 rounded border border-gray-200 bg-white shadow-lg"
								transition:fade={{ duration: 200 }}
							>
								<a
									href="http://localhost:5173/admin"
									class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
								>
									Trang người dùng
								</a>
								<button
									type="button"
									class="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
									on:click={logout}
								>
									Đăng xuất
								</button>
							</div>
						{/if}
					</div>
				{:else if !$students.length && !$certificates.length}
					<!-- Đăng nhập chỉ hiện khi chưa có kết quả tra cứu -->
					<div transition:fade={{ duration: 200 }} class="flex flex-col gap-2">
						<a
							href="/auth/login"
							class="w-full rounded bg-blue-500 px-4 py-2 text-center font-medium text-white transition hover:bg-blue-600 md:w-auto"
						>
							Đăng nhập
						</a>

						<button
							type="button"
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
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
{#if showPreview}
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        <div class="flex justify-between items-center px-4 py-3 border-b">
            <h2 class="text-lg font-semibold">Xem file PDF</h2>
            <button class="text-gray-500 hover:text-black" on:click={() => showPreview = false}>
                ✕
            </button>
        </div>

        <!-- svelte-ignore a11y_missing_attribute -->
        <iframe src={previewUrl} class="flex-1 w-full" style="min-height:80vh;"></iframe>

        <div class="p-4 flex justify-end bg-gray-50">
            <button class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" 
                on:click={() => showPreview = false}>
                Đóng
            </button>
        </div>
    </div>
</div>
{/if}


<style>
	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.skeleton {
		background: linear-gradient(
			90deg,
			rgba(240, 240, 240, 1) 25%,
			rgba(230, 230, 230, 1) 50%,
			rgba(240, 240, 240, 1) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}
</style>
