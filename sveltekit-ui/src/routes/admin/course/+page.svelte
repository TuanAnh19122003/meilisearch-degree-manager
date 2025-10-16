<script lang="ts">
	import { onMount } from 'svelte';
	import { MeiliSearch } from 'meilisearch';
	import axios from 'axios';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import CourseList from './CourseList.svelte';
	import CourseForm from './CourseForm.svelte';
	import { Plus, Book } from 'lucide-svelte';

	let courses: any[] = [];
	let pagination = { current: 1, pageSize: 9, total: 0 };
	let search = '';
	let credit: string = ''; // lọc tín chỉ
	let openForm = false;
	let editingCourse: any = null;
	let viewingCourse: any = null;
	let loading = false;
	let viewMode: 'list' | 'card' = 'list';

	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';
	let courseIndex: any = null;

	pageTitle.set('Quản lý môn học');

	onMount(async () => {
		token = localStorage.getItem('token') || '';
		if (!token) return (window.location.href = '/auth/login');
		await initSearch();
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

			courseIndex = client.index('courses');
			await fetchCourses();
		} catch (err) {
			console.error(err);
			toast.error('Không kết nối được MeiliSearch');
		}
	}

	let searchTimeout: NodeJS.Timeout;
	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => fetchCourses(1), 400);
	}

	async function fetchCourses(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			let list: any[] = [];
			let total = 0;

			if (search && courseIndex) {
				// chỉ search Meili khi có từ khóa
				const filters: string[] = [];
				if (credit) filters.push(`credit = ${credit}`);

				const results = await courseIndex.search(search, {
					filter: filters.length ? filters.join(' AND ') : undefined,
					offset: (page - 1) * pageSize,
					limit: pageSize
				});
				list = results.hits;
				total = results.estimatedTotalHits ?? results.hits.length;
			} else {
				// còn lại thì gọi API backend để có dữ liệu mới nhất
				const res = await axios.get(`${API_URL}/courses`, {
					params: { page, pageSize, search, credit },
					headers: getAuthHeader()
				});
				const { success, data, total: totalRes, message } = res.data;
				if (success) {
					list = data;
					total = totalRes ?? data.length;
				} else {
					toast.error(message || 'Lỗi tải dữ liệu');
				}
			}

			courses = list;
			pagination = { current: page, pageSize, total };
		} catch (err) {
			console.error(err);
			toast.error('Lỗi tải môn học');
		} finally {
			loading = false;
		}
	}

	function handleAdd() {
		editingCourse = null;
		openForm = true;
	}
	function handleEdit(course: any) {
		editingCourse = course;
		openForm = true;
	}
	function handleView(course: any) {
		viewingCourse = course;
	}
	async function handleDelete(id: string) {
		if (!window.confirm('Bạn có chắc chắn muốn xóa môn học này không?')) return;
		try {
			await axios.delete(`${API_URL}/courses/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			const newPage =
				courses.length === 1 && pagination.current > 1
					? pagination.current - 1
					: pagination.current;
			fetchCourses(newPage, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	async function handleSubmit(course: any) {
		try {
			if (editingCourse) {
				await axios.put(`${API_URL}/courses/${editingCourse.id}`, course, {
					headers: getAuthHeader()
				});
				toast.success('Cập nhật thành công');
			} else {
				await axios.post(`${API_URL}/courses`, course, { headers: getAuthHeader() });
				toast.success('Thêm mới thành công');
			}
			openForm = false;
			fetchCourses(1, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Thao tác thất bại');
		}
	}

	function handleViewModeChange(mode: 'list' | 'card') {
		viewMode = mode;
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold">Quản lý môn học</h2>
		<div class="flex gap-3">
			<input
				type="text"
				placeholder="Tìm theo mã hoặc tên"
				bind:value={search}
				on:input={handleSearchInput}
				class="w-64 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
			/>
			<select
				bind:value={credit}
				on:change={() => fetchCourses(1)}
				class="rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
			>
				<option value="">Tất cả tín chỉ</option>
				<option value="2">2 tín chỉ</option>
				<option value="3">3 tín chỉ</option>
				<option value="4">4 tín chỉ</option>
			</select>
			<button
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				on:click={handleAdd}
			>
				<Plus class="h-4 w-4" /> Thêm
			</button>
		</div>
	</div>

	{#if loading}
		<div class="py-10 text-center text-gray-500">Đang tải...</div>
	{:else}
		<CourseList
			data={courses}
			{pagination}
			{viewMode}
			on:viewModeChange={(e) => handleViewModeChange(e.detail)}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageChange={(e) => fetchCourses(e.detail, pagination.pageSize)}
			on:pageSizeChange={(e) => fetchCourses(1, e.detail)}
		/>
	{/if}

	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<CourseForm
				initialValues={editingCourse}
				on:submit={(e) => handleSubmit(e.detail)}
				on:cancel={() => (openForm = false)}
			/>
		</div>
	{/if}

	{#if viewingCourse}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[480px] overflow-hidden rounded-xl bg-white shadow-xl">
				<div
					class="flex items-center gap-3 border-b bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4"
				>
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-200">
						<Book class="h-6 w-6 text-indigo-700" />
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-800">{viewingCourse.name}</h3>
						<p class="text-sm text-gray-600">
							Mã môn học: <span class="font-medium">{viewingCourse.code}</span>
						</p>
					</div>
				</div>
				<div class="space-y-3 px-6 py-4 text-gray-700">
					<p><b>ID:</b> {viewingCourse.id}</p>
					<p><b>Số tín chỉ:</b> {viewingCourse.credit}</p>
				</div>
				<div class="flex justify-between border-t px-6 py-4 text-sm text-gray-500">
					<span>Ngày tạo: {new Date(viewingCourse.createdAt).toLocaleString()}</span>
					<span>Cập nhật: {new Date(viewingCourse.updatedAt).toLocaleString()}</span>
				</div>
				<div class="bg-gray-50 px-6 py-3 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingCourse = null)}
					>
						Đóng
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.animate-fade-in {
		animation: fade-in 0.25s ease-out;
	}
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
