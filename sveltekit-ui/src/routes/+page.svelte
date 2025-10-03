<script lang="ts">
	import { writable } from 'svelte/store';
	import axios from 'axios';

	let query = '';
	const students = writable([]);
	const certificates = writable([]);
	const loading = writable(false);
	const error = writable('');
	const API_URL = import.meta.env.VITE_API_URL;

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
</script>

<div class="flex h-[90vh] w-full items-center justify-center p-4">
	<!-- mobile: form trên, kết quả dưới | desktop: form bên phải, kết quả bên trái -->
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
										{c.student?.firstname}
										{c.student?.lastname} ({c.student?.code})
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
													aria-label={`Xem file văn bằng ${c.number}`}
												>
													Xem file
												</a>
											{:else}
												Chưa có
											{/if}
										</p>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				<!-- Placeholder -->
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
				/>
				{#if $loading}<p class="mt-2 text-gray-500">Đang tìm...</p>{/if}
				{#if $error}<p class="mt-2 text-red-500">{$error}</p>{/if}
			</div>
			<div class="hidden rounded bg-gray-50 p-4 text-sm text-gray-500 md:block">
				Nhập mã sinh viên hoặc số certificate để tra cứu nhanh. Kết quả sẽ hiển thị bên trái.
			</div>
		</div>
	</div>
</div>
