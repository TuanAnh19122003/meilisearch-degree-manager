<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Eye } from 'lucide-svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import CourseList from './CourseList.svelte';
	import CourseForm from './CourseForm.svelte';
	import axios from 'axios';

	let courses: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let viewMode: 'list' | 'card' = 'list';
	let search = '';
	let openForm = false;
	let editingCourse: any = null;
	let viewingCourse: any = null;
	let loading = false;

	const API_URL = import.meta.env.VITE_API_URL;
	pageTitle.set('Quản lý môn học');

	let token = '';
	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) window.location.href = '/auth/login';
			else fetchCourses();
		}
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchCourses(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			const response = await axios.get(`${API_URL}/courses`, {
				params: { page, pageSize, search },
				headers: getAuthHeader()
			});
			const { success, data, total, message } = response.data;
			if (success) {
				courses = data;
				pagination = { current: page, pageSize, total };
			} else toast.error(message || 'Lỗi tải dữ liệu');
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải danh sách môn học');
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
		const course = courses.find((c) => c.id === id);
		const courseName = course?.name || 'môn học này';
		const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa "${courseName}" không?`);
		if (!confirmed) return;

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
</script>

<div class="space-y-6">
	<!-- HEADER -->
	<div class="flex items-center justify-between">
		<h2 class="flex items-center gap-2 text-2xl font-semibold">📚 Danh sách môn học</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm môn học..."
				bind:value={search}
				on:input={() => fetchCourses(1, pagination.pageSize)}
				class="w-64 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
			/>
			<button
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
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
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageChange={(e) => fetchCourses(e.detail, pagination.pageSize)}
			on:viewModeChange={(e) => (viewMode = e.detail)}
		/>
	{/if}

	<!-- Modal Form -->
	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					{#if editingCourse}
						<Pencil class="h-5 w-5 text-blue-600" /> Cập nhật môn học
					{:else}
						<Plus class="h-5 w-5 text-blue-600" /> Thêm môn học
					{/if}
				</h3>
				<CourseForm
					initialValues={editingCourse}
					on:submit={(e) => handleSubmit(e.detail)}
					on:cancel={() => (openForm = false)}
				/>
			</div>
		</div>
	{/if}

	<!-- Modal View -->
	{#if viewingCourse}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					<Eye class="h-5 w-5 text-blue-600" /> Chi tiết môn học
				</h3>
				<div class="space-y-2 text-gray-700">
					<p><strong>ID:</strong> {viewingCourse.id}</p>
					<p><strong>Mã môn học:</strong> {viewingCourse.code}</p>
					<p><strong>Tên môn học:</strong> {viewingCourse.name}</p>
					<p><strong>Số tín chỉ:</strong> {viewingCourse.credit}</p>
					<p><strong>Ngày tạo:</strong> {new Date(viewingCourse.createdAt).toLocaleString()}</p>
					<p>
						<strong>Ngày cập nhật:</strong>
						{new Date(viewingCourse.updatedAt).toLocaleString()}
					</p>
				</div>
				<div class="mt-4 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingCourse = null)}>Đóng</button
					>
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
