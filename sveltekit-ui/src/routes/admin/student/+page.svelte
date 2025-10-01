<script lang="ts">
	import { onMount } from 'svelte';
	import { MeiliSearch } from 'meilisearch';
	import axios from 'axios';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import StudentList from './StudentList.svelte';
	import StudentForm from './StudentForm.svelte';
	import { Plus } from 'lucide-svelte';

	let students: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let search = '';
	let openForm = false;
	let editingStudent: any = null;
	let viewingStudent: any = null;
	let loading = false;
	let viewMode: 'list' | 'card' = 'list';

	const API_URL = import.meta.env.VITE_API_URL;
	pageTitle.set('Quản lý sinh viên');

	let token = '';
	let studentIndex: any = null;

	onMount(async () => {
		token = localStorage.getItem('token') || '';
		if (!token) return (window.location.href = '/auth/login');
		await initSearch();
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	// Khởi tạo MeiliSearch public key
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

	// Debounce search
	let searchTimeout: NodeJS.Timeout;
	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => fetchStudents(1, pagination.pageSize), 400);
	}

	// Lấy danh sách sinh viên
	async function fetchGpaForStudents(students: any[]) {
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
	}

	async function fetchStudents(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			let studentList: any[] = [];
			let total = 0;

			if (search && studentIndex) {
				const isUniqueField = /^[A-Z]{2}\d+$/.test(search) || /\S+@\S+\.\S+/.test(search);

				if (isUniqueField) {
					const res = await fetch(`${API_URL}/meili/student/${search}`);
					const data = await res.json();
					if (data.success && data.data) {
						studentList = [{ ...data.data, major: data.data.major || { name: '-' } }];
						total = 1;
					} else {
						studentList = [];
						total = 0;
						toast.error('Không tìm thấy sinh viên với mã hoặc email này');
					}
				} else {
					const results = await studentIndex.search(search, {
						offset: (page - 1) * pageSize,
						limit: pageSize
					});
					studentList = results.hits.map((s: any) => ({
						...s,
						major: s.major || { name: '-' }
					}));
					total = results.estimatedTotalHits ?? 0;
				}
			} else {
				const res = await axios.get(`${API_URL}/students`, {
					params: { page, pageSize, search },
					headers: getAuthHeader()
				});
				const { success, data, total: totalRes, message } = res.data;
				if (success) {
					studentList = data.map((s: any) => ({ ...s, major: s.major || { name: '-' } }));
					total = totalRes;
				} else {
					toast.error(message || 'Lỗi tải danh sách sinh viên');
				}
			}

			// Lấy GPA cho tất cả student nếu có
			if (studentList.length > 0) {
				await fetchGpaForStudents(studentList);
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
		if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này không?')) return;
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

	async function handleSubmit(formData: FormData) {
		try {
			if (editingStudent) {
				await axios.put(`${API_URL}/students/${editingStudent.id}`, formData, {
					headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
				});
				toast.success('Cập nhật thành công');
			} else {
				await axios.post(`${API_URL}/students`, formData, {
					headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
				});
				toast.success('Thêm mới thành công');
			}
			openForm = false;
			fetchStudents(1, pagination.pageSize);
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
				placeholder="Tìm kiếm theo tên, email, mã sinh viên..."
				bind:value={search}
				on:input={handleSearchInput}
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
			on:pageSizeChange={(e) => fetchStudents(1, e.detail)}
			on:viewModeChange={(e) => handleViewModeChange(e.detail)}
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
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[480px] overflow-hidden rounded-xl bg-white shadow-xl">
				<div
					class="flex items-center gap-4 border-b bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-5"
				>
					<div
						class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-200 text-xl font-bold text-blue-700"
					>
						{#if viewingStudent.image}
							<img
								src={`http://localhost:5000/${viewingStudent.image}`}
								alt="Avatar"
								class="h-full w-full object-cover"
							/>
						{:else}
							{(viewingStudent.firstname?.[0] ?? 'S').toUpperCase()}{(
								viewingStudent.lastname?.[0] ?? ''
							).toUpperCase()}
						{/if}
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-800">
							{viewingStudent.firstname}
							{viewingStudent.lastname}
						</h3>
						<p class="text-sm text-gray-600">Mã sinh viên: {viewingStudent.code}</p>
					</div>
				</div>
				<div class="space-y-3 px-6 py-5 text-gray-700">
					<p><b>Email:</b> {viewingStudent.email}</p>
					<p><b>Phone:</b> {viewingStudent.phone}</p>
					<p><b>Ngày sinh:</b> {viewingStudent.dob}</p>
					<p><b>Địa chỉ:</b> {viewingStudent.address ?? '-'}</p>
					<p><b>GPA:</b> {viewingStudent.gpa ?? 'Chưa có'}</p>
				</div>
				<div class="flex justify-between border-t px-6 py-4 text-sm text-gray-500">
					<span>Ngày tạo: {new Date(viewingStudent.createdAt).toLocaleString()}</span>
					<span>Cập nhật: {new Date(viewingStudent.updatedAt).toLocaleString()}</span>
				</div>
				<div class="bg-gray-50 px-6 py-3 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingStudent = null)}>Đóng</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>
