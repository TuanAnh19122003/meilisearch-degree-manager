<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import axios from 'axios';
	import { toast } from 'svelte-sonner';
	import { MeiliSearch } from 'meilisearch';

	export let initialValues = { studentId: '', courseId: '', grade: '' };

	const dispatch = createEventDispatcher();
	let formData = { ...initialValues };

	let students: any[] = [];
	let courses: any[] = [];
	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';

	// Meilisearch
	let studentIndex: any;
	let search = '';
	let loading = false;
	let searchTimeout: NodeJS.Timeout;

	// Pagination (tạm thời)
	let pagination = { current: 1, pageSize: 50, total: 0 };

	onMount(async () => {
		token = localStorage.getItem('token') || '';
		await initSearch(); // Initialize Meilisearch & load students
		await fetchCourses();
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function initSearch() {
		try {
			const res = await fetch(`${API_URL}/meili/public-key`);
			const data = await res.json();
			if (!data.success) throw new Error('Không lấy được Meilisearch public key');

			const client = new MeiliSearch({
				host: import.meta.env.VITE_MEILI_HOST,
				apiKey: data.publicKey
			});
			studentIndex = client.index('students');
			await fetchStudents();
		} catch (err) {
			console.error(err);
			toast.error('Không kết nối được Meilisearch');
		}
	}

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => fetchStudents(1, pagination.pageSize), 400);
	}

	async function fetchStudents(page = 1, pageSize = 50) {
		loading = true;
		try {
			let studentList: any[] = [];
			let total = 0;

			if (search && studentIndex) {
				const filters: string[] = [];
				if (/^[A-Z]{2,}\d+$/.test(search)) filters.push(`code = "${search}"`);
				else if (/\S+@\S+\.\S+/.test(search)) filters.push(`email = "${search}"`);

				const results = await studentIndex.search(search || '', {
					filter: filters.length ? filters.join(' AND ') : undefined,
					offset: (page - 1) * pageSize,
					limit: pageSize
				});

				studentList = results.hits.map((s: any) => ({ ...s, major: s.major || { name: '-' } }));
				total = results.estimatedTotalHits ?? results.hits.length;
			} else {
				const res = await axios.get(`${API_URL}/students`, {
					params: { page, pageSize, keyword: search },
					headers: getAuthHeader()
				});
				const { success, data, total: totalRes, message } = res.data;
				if (success) {
					studentList = data.map((s: any) => ({ ...s, major: s.major || { name: '-' } }));
					total = totalRes ?? data.length;
				} else {
					toast.error(message || 'Lỗi tải danh sách sinh viên');
					studentList = [];
					total = 0;
				}
			}

			students = studentList;
			pagination = { current: page, pageSize, total };
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải dữ liệu sinh viên');
		} finally {
			loading = false;
		}
	}

	async function fetchCourses() {
		try {
			const res = await axios.get(`${API_URL}/courses`, { headers: getAuthHeader() });
			courses = res.data.data;
		} catch {
			toast.error('Lỗi tải danh sách môn học');
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (!formData.studentId || !formData.courseId || !formData.grade) {
			toast.error('Vui lòng nhập đầy đủ!');
			return;
		}
		dispatch('submit', formData);
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
	<div class="relative">
		<label for="" class="mb-1 block font-medium">Sinh viên</label>
		<input
			type="text"
			placeholder="Tìm sinh viên..."
			bind:value={search}
			class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
			on:input={handleSearchInput}
		/>

		{#if search && students.length > 0}
			<ul
				class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg"
			>
				{#each students as s (s.id)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li
						class="cursor-pointer px-3 py-2 hover:bg-blue-100"
						on:click={() => {
							formData.studentId = s.id;
							search = `${s.lastname} ${s.firstname}`;
							students = [];
						}}
					>
						<div>{s.lastname} {s.firstname}</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div>
		<label for="" class="mb-1 block font-medium">Môn học</label>
		<select
			bind:value={formData.courseId}
			class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
			required
		>
			<option value="" disabled>-- Chọn môn học --</option>
			{#each courses as c}
				<option value={c.id}>{c.name}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="" class="mb-1 block font-medium">Điểm</label>
		<input
			type="number"
			step="0.01"
			bind:value={formData.grade}
			class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
			placeholder="Nhập điểm..."
			required
		/>
	</div>

	<div class="flex justify-end gap-3">
		<button
			type="button"
			class="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
			on:click={handleCancel}
		>
			Hủy
		</button>
		<button
			type="submit"
			class="rounded-lg bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700"
		>
			Lưu
		</button>
	</div>
</form>
