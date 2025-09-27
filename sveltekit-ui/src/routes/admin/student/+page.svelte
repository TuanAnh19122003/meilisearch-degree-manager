<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Eye } from 'lucide-svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import StudentList from './StudentList.svelte';
	import StudentForm from './StudentForm.svelte';
	import axios from 'axios';

	let students: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let viewMode: 'list' | 'card' = 'list';
	let search = '';
	let openForm = false;
	let editingStudent: any = null;
	let viewingStudent: any = null;
	let loading = false;

	const API_URL = import.meta.env.VITE_API_URL;
	pageTitle.set('Quản lý sinh viên');

	let token = '';
	onMount(() => {
		token = localStorage.getItem('token') || '';
		if (!token) window.location.href = '/auth/login';
		else fetchStudents();
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchStudents(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			const res = await axios.get(`${API_URL}/students`, {
				params: { page, pageSize, search },
				headers: getAuthHeader()
			});
			const { success, data, total, message } = res.data;
			if (success) {
				students = data;

				// Fetch GPA từng sinh viên
				const gpaPromises = students.map(async (s) => {
					try {
						const resGpa = await axios.get(`${API_URL}/student-gpa/${s.id}`, {
							headers: getAuthHeader()
						});
						s.gpa = resGpa.data.data.gpa;
					} catch {
						s.gpa = null;
					}
				});
				await Promise.all(gpaPromises);

				pagination = { current: page, pageSize, total };
			} else toast.error(message || 'Lỗi tải danh sách sinh viên');
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải dữ liệu');
		} finally {
			loading = false;
		}
	}

	function handleAdd() {
		editingStudent = null;
		openForm = true;
	}

	function handleEdit(student: any) {
		editingStudent = student;
		openForm = true;
	}

	function handleView(student: any) {
		viewingStudent = student;
	}

	async function handleDelete(id: string) {
		const confirmed = window.confirm('Bạn có chắc chắn muốn xóa sinh viên này không?');
		if (!confirmed) return;
		try {
			await axios.delete(`${API_URL}/students/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			const newPage =
				students.length === 1 && pagination.current > 1
					? pagination.current - 1
					: pagination.current;
			fetchStudents(newPage, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	async function handleSubmit(student: any) {
		try {
			if (editingStudent) {
				await axios.put(`${API_URL}/students/${editingStudent.id}`, student, {
					headers: getAuthHeader()
				});
				toast.success('Cập nhật thành công');
			} else {
				await axios.post(`${API_URL}/students`, student, { headers: getAuthHeader() });
				toast.success('Thêm mới thành công');
			}
			openForm = false;
			fetchStudents(1, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Thao tác thất bại');
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="flex items-center gap-2 text-2xl font-semibold">
			<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 7h18M3 12h18M3 17h18"
				/>
			</svg>
			Danh sách sinh viên
		</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm..."
				bind:value={search}
				on:input={() => fetchStudents(1, pagination.pageSize)}
				class="w-64 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
			/>
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
		<StudentList
			data={students}
			{pagination}
			{viewMode}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageChange={(e) => fetchStudents(e.detail, pagination.pageSize)}
			on:viewModeChange={(e) => (viewMode = e.detail)}
		/>
	{/if}

	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<StudentForm
				initialValues={editingStudent}
				on:submit={(e) => handleSubmit(e.detail)}
				on:cancel={() => (openForm = false)}
			/>
		</div>
	{/if}

	{#if viewingStudent}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					<Eye class="h-5 w-5 text-blue-600" /> Chi tiết sinh viên
				</h3>
				<p><strong>Mã:</strong> {viewingStudent.code}</p>
				<p><strong>Họ tên:</strong> {viewingStudent.lastname} {viewingStudent.firstname}</p>
				<p><strong>Email:</strong> {viewingStudent.email}</p>
				<p><strong>Phone:</strong> {viewingStudent.phone}</p>
				<p><strong>Ngày sinh:</strong> {viewingStudent.dob}</p>
				<p><strong>Địa chỉ:</strong> {viewingStudent.address}</p>
				<p><strong>Ngày tạo:</strong> {new Date(viewingStudent.createdAt).toLocaleString()}</p>
				<p><strong>Ngày cập nhật:</strong> {new Date(viewingStudent.updatedAt).toLocaleString()}</p>
				<div class="mt-4 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingStudent = null)}>Đóng</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>
