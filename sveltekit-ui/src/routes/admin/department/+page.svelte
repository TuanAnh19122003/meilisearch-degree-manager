<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Eye } from 'lucide-svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import DepartmentList from './DepartmentList.svelte';
	import DepartmentForm from './DepartmentForm.svelte';
	import axios from 'axios';

	let departments: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let viewMode: 'list' | 'card' = 'list';
	let search = '';
	let openForm = false;
	let editingDept: any = null;
	let viewingDept: any = null;
	let loading = false;

	const API_URL = import.meta.env.VITE_API_URL;
	pageTitle.set('Quản lý phòng ban');

	let token = '';
	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) window.location.href = '/auth/login';
			else fetchDepartments();
		}
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	// FETCH DATA
	async function fetchDepartments(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			const response = await axios.get(`${API_URL}/departments`, {
				params: { page, pageSize, search },
				headers: getAuthHeader()
			});
			const { success, data, total, message } = response.data;
			if (success) {
				departments = data;
				pagination = { current: page, pageSize, total };
			} else toast.error(message || 'Lỗi tải dữ liệu');
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải danh sách phòng ban');
		} finally {
			loading = false;
		}
	}

	function handleAdd() {
		editingDept = null;
		openForm = true;
	}

	function handleEdit(dept: any) {
		editingDept = dept;
		openForm = true;
	}

	function handleView(dept: any) {
		viewingDept = dept;
	}

	async function handleDelete(id: string) {
		const dept = departments.find((d) => d.id === id);
		const deptName = dept?.name || 'phòng ban này';
		const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa phòng ban "${deptName}" không?`);
		if (!confirmed) return;

		try {
			await axios.delete(`${API_URL}/departments/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			const newPage =
				departments.length === 1 && pagination.current > 1
					? pagination.current - 1
					: pagination.current;
			fetchDepartments(newPage, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	async function handleSubmit(dept: any) {
		try {
			if (editingDept) {
				await axios.put(`${API_URL}/departments/${editingDept.id}`, dept, {
					headers: getAuthHeader()
				});
				toast.success('Cập nhật thành công');
			} else {
				await axios.post(`${API_URL}/departments`, dept, { headers: getAuthHeader() });
				toast.success('Thêm mới thành công');
			}
			openForm = false;
			fetchDepartments(1, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Thao tác thất bại');
		}
	}
</script>

<div class="space-y-6">
	<!-- HEADER -->
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
			Danh sách phòng ban
		</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm phòng ban..."
				bind:value={search}
				on:input={() => fetchDepartments(1, pagination.pageSize)}
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
		<DepartmentList
			data={departments}
			{pagination}
			{viewMode}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageChange={(e) => fetchDepartments(e.detail, pagination.pageSize)}
			on:viewModeChange={(e) => (viewMode = e.detail)}
		/>
	{/if}

	<!-- Modal Form -->
	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					{#if editingDept}
						<Pencil class="h-5 w-5 text-blue-600" /> Cập nhật phòng ban
					{:else}
						<Plus class="h-5 w-5 text-blue-600" /> Thêm phòng ban
					{/if}
				</h3>
				<DepartmentForm
					initialValues={editingDept}
					on:submit={(e) => handleSubmit(e.detail)}
					on:cancel={() => (openForm = false)}
				/>
			</div>
		</div>
	{/if}

	<!-- Modal View -->
	{#if viewingDept}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					<Eye class="h-5 w-5 text-blue-600" /> Chi tiết phòng ban
				</h3>
				<div class="space-y-2 text-gray-700">
					<p><strong>ID:</strong> {viewingDept.id}</p>
					<p><strong>Tên phòng ban:</strong> {viewingDept.name}</p>
					<p><strong>Mã:</strong> {viewingDept.code}</p>
					<p><strong>Ngày tạo:</strong> {new Date(viewingDept.createdAt).toLocaleString()}</p>
					<p><strong>Ngày cập nhật:</strong> {new Date(viewingDept.updatedAt).toLocaleString()}</p>
				</div>
				<div class="mt-4 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingDept = null)}>Đóng</button
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
