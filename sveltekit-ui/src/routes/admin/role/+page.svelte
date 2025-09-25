<script>
	import RoleList from './RoleList.svelte';
	import RoleForm from './RoleForm.svelte';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import { Plus, Pencil, Eye } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let roles = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let viewMode = 'list';
	let search = '';
	let openForm = false;
	let editingRole = null;
	let viewingRole = null;
	let loading = false;

	const API_URL = import.meta.env.VITE_API_URL;

	function getAuthHeader() {
		const token = localStorage.getItem('token');
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchData(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			const response = await axios.get(`${API_URL}/roles`, {
				params: { page, pageSize },
				headers: getAuthHeader()
			});
			const { success, data, total, message } = response.data;
			if (success) {
				roles = data;
				pagination = { current: page, pageSize, total };
			} else toast.error(message || 'Có lỗi xảy ra');
		} catch (e) {
			console.error(e);
			toast.error('Lỗi khi tải danh sách vai trò!');
		} finally {
			loading = false;
		}
	}

	onMount(() => fetchData());

	function handleAdd() {
		editingRole = null;
		openForm = true;
	}
	function handleEdit(role) {
		editingRole = role;
		openForm = true;
	}
	function handleView(role) {
		viewingRole = role;
	}
	async function handleDelete(id) {
		try {
			const response = await axios.delete(`${API_URL}/roles/${id}`, { headers: getAuthHeader() });
			toast.success(response.data.message || 'Xóa thành công');

			const newPage =
				roles.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
			await fetchData(newPage, pagination.pageSize);
		} catch (err) {
			toast.error(err.response?.data?.message || 'Thao tác thất bại');
		}
	}
	async function handleSubmit(role) {
		try {
			let response;
			if (editingRole) {
				response = await axios.put(`${API_URL}/roles/${editingRole.id}`, role, {
					headers: getAuthHeader()
				});
			} else {
				response = await axios.post(`${API_URL}/roles`, role, { headers: getAuthHeader() });
			}
			toast.success(response.data.message || 'Thành công');
			openForm = false;
			fetchData(1, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.message || 'Thao tác thất bại');
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
			Danh sách vai trò
		</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm vai trò..."
				bind:value={search}
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
		<RoleList
			data={roles}
			{pagination}
			{viewMode}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageChange={(e) => fetchData(e.detail, pagination.pageSize)}
			on:viewModeChange={(e) => (viewMode = e.detail)}
		/>
	{/if}

	<!-- Modal Form -->
	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					{#if editingRole}
						<Pencil class="h-5 w-5 text-blue-600" /> Cập nhật vai trò
					{:else}
						<Plus class="h-5 w-5 text-blue-600" /> Thêm vai trò
					{/if}
				</h3>
				<RoleForm
					initialValues={editingRole}
					on:submit={(e) => handleSubmit(e.detail)}
					on:cancel={() => (openForm = false)}
				/>
			</div>
		</div>
	{/if}

	<!-- Modal View -->
	{#if viewingRole}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					<Eye class="h-5 w-5 text-blue-600" /> Chi tiết vai trò
				</h3>
				<div class="space-y-2 text-gray-700">
					<p><strong>ID:</strong> {viewingRole.id}</p>
					<p><strong>Tên vai trò:</strong> {viewingRole.name}</p>
					<p><strong>Ngày tạo:</strong> {new Date(viewingRole.createdAt).toLocaleString()}</p>
					<p><strong>Ngày cập nhật:</strong> {new Date(viewingRole.updatedAt).toLocaleString()}</p>
				</div>
				<div class="mt-4 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingRole = null)}>Đóng</button
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
