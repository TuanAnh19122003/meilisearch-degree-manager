<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Eye } from 'lucide-svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import MajorList from './MajorList.svelte';
	import MajorForm from './MajorForm.svelte';
	import axios from 'axios';

	let majors: any[] = [];
	let departments: any[] = []; // để chọn deptId
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let viewMode: 'list' | 'card' = 'list';
	let search = '';
	let openForm = false;
	let editingMajor: any = null;
	let viewingMajor: any = null;
	let loading = false;

	const API_URL = import.meta.env.VITE_API_URL;
	pageTitle.set('Quản lý ngành học');

	let token = '';
	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) window.location.href = '/auth/login';
			else {
				fetchMajors();
				fetchDepartments();
			}
		}
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchDepartments() {
		try {
			const res = await axios.get(`${API_URL}/departments`, { headers: getAuthHeader() });
			departments = res.data.data || [];
		} catch (err) {
			console.error(err);
			toast.error("Không tải được danh sách phòng ban");
		}
	}

	async function fetchMajors(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			const response = await axios.get(`${API_URL}/majors`, {
				params: { page, pageSize, search },
				headers: getAuthHeader()
			});
			const { success, data, total, message } = response.data;
			if (success) {
				majors = data;
				pagination = { current: page, pageSize, total };
			} else toast.error(message || 'Lỗi tải dữ liệu');
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải danh sách ngành học');
		} finally {
			loading = false;
		}
	}

	function handleAdd() {
		editingMajor = null;
		openForm = true;
	}

	function handleEdit(major: any) {
		editingMajor = major;
		openForm = true;
	}

	function handleView(major: any) {
		viewingMajor = major;
	}

	async function handleDelete(id: string) {
		const major = majors.find((d) => d.id === id);
		const majorName = major?.name || 'ngành này';
		const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa ngành "${majorName}" không?`);
		if (!confirmed) return;

		try {
			await axios.delete(`${API_URL}/majors/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			const newPage =
				majors.length === 1 && pagination.current > 1
					? pagination.current - 1
					: pagination.current;
			fetchMajors(newPage, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	async function handleSubmit(major: any) {
		try {
			if (editingMajor) {
				await axios.put(`${API_URL}/majors/${editingMajor.id}`, major, {
					headers: getAuthHeader()
				});
				toast.success('Cập nhật thành công');
			} else {
				await axios.post(`${API_URL}/majors`, major, { headers: getAuthHeader() });
				toast.success('Thêm mới thành công');
			}
			openForm = false;
			fetchMajors(1, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Thao tác thất bại');
		}
	}
</script>

<div class="space-y-6">
	<!-- HEADER -->
	<div class="flex items-center justify-between">
		<h2 class="flex items-center gap-2 text-2xl font-semibold text-blue-600">
			Ngành học
		</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm ngành học..."
				bind:value={search}
				on:input={() => fetchMajors(1, pagination.pageSize)}
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
		<MajorList
			data={majors}
			{pagination}
			{viewMode}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageChange={(e) => fetchMajors(e.detail, pagination.pageSize)}
			on:viewModeChange={(e) => (viewMode = e.detail)}
		/>
	{/if}

	<!-- Modal Form -->
	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					{#if editingMajor}
						<Pencil class="h-5 w-5 text-blue-600" /> Cập nhật ngành học
					{:else}
						<Plus class="h-5 w-5 text-blue-600" /> Thêm ngành học
					{/if}
				</h3>
				<MajorForm
					initialValues={editingMajor}
					{departments}
					on:submit={(e) => handleSubmit(e.detail)}
					on:cancel={() => (openForm = false)}
				/>
			</div>
		</div>
	{/if}

	<!-- Modal View -->
	{#if viewingMajor}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					<Eye class="h-5 w-5 text-blue-600" /> Chi tiết ngành học
				</h3>
				<div class="space-y-2 text-gray-700">
					<p><strong>ID:</strong> {viewingMajor.id}</p>
					<p><strong>Tên ngành:</strong> {viewingMajor.name}</p>
					<p><strong>Mã:</strong> {viewingMajor.code}</p>
					<p><strong>Phòng ban:</strong> {viewingMajor.department?.name}</p>
					<p><strong>Ngày tạo:</strong> {new Date(viewingMajor.createdAt).toLocaleString()}</p>
				</div>
				<div class="mt-4 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingMajor = null)}>Đóng</button>
				</div>
			</div>
		</div>
	{/if}
</div>
