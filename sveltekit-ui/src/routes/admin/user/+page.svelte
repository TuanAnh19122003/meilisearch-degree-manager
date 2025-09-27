<script lang="ts">
	import { onMount } from 'svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';
	import { Plus } from 'lucide-svelte';
	import UserList from './UserList.svelte';
	import UserForm from './UserForm.svelte';

	let users: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let search = '';
	let openForm = false;
	let editingUser: any = null;
	let viewingUser: any = null;
	let loading = false;
	let viewMode: 'list' | 'card' = 'list';

	const API_URL = import.meta.env.VITE_API_URL;
	pageTitle.set('Quản lý người dùng');

	let token = '';
	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) window.location.href = '/auth/login';
			else fetchUsers();
		}
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchUsers(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			const res = await axios.get(`${API_URL}/users`, {
				params: { page, pageSize, search },
				headers: getAuthHeader()
			});
			const { success, data, total, message } = res.data;
			if (success) {
				users = data;
				pagination = { current: page, pageSize, total };
			} else toast.error(message || 'Lỗi tải dữ liệu');
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải danh sách người dùng');
		} finally {
			loading = false;
		}
	}

	function handleAdd() {
		editingUser = null;
		openForm = true;
	}
	function handleEdit(user) {
		editingUser = user;
		openForm = true;
	}
	function handleView(user) {
		viewingUser = user;
	}
	async function handleDelete(id: string) {
		const confirmed = window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?');
		if (!confirmed) return;
		try {
			await axios.delete(`${API_URL}/users/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			fetchUsers(pagination.current, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}
	async function handleSubmit(formData: FormData) {
		try {
			if (editingUser) {
				await axios.put(`${API_URL}/users/${editingUser.id}`, formData, {
					headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
				});
				toast.success('Cập nhật thành công');
			} else {
				await axios.post(`${API_URL}/users`, formData, {
					headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
				});
				toast.success('Thêm mới thành công');
			}
			openForm = false;
			fetchUsers(1, pagination.pageSize);
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
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold">Danh sách người dùng</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm..."
				bind:value={search}
				on:input={() => fetchUsers(1, pagination.pageSize)}
				class="w-64 rounded-lg border px-3 py-2"
			/>
			<button
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
				on:click={handleAdd}
			>
				<Plus class="h-4 w-4" /> Thêm
			</button>
		</div>
	</div>

	{#if loading}
		<div class="py-10 text-center text-gray-500">Đang tải...</div>
	{:else}
		<UserList
			data={users}
			{pagination}
			{viewMode} 
			on:viewModeChange={(e) => handleViewModeChange(e.detail)}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageChange={(e) => fetchUsers(e.detail, pagination.pageSize)}
		/>
	{/if}

	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="w-[520px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-bold">
					{editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng'}
				</h3>
				<UserForm
					initialValues={editingUser}
					on:submit={(e) => handleSubmit(e.detail)}
					on:cancel={() => (openForm = false)}
				/>
			</div>
		</div>
	{/if}

	{#if viewingUser}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="w-[500px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-bold">Chi tiết người dùng</h3>
				<div class="space-y-2">
					<p><b>ID:</b> {viewingUser.id}</p>
					<p><b>Họ tên:</b> {viewingUser.firstname} {viewingUser.lastname}</p>
					<p><b>Email:</b> {viewingUser.email}</p>
					<p><b>Số điện thoại:</b> {viewingUser.phone}</p>
					<p><b>Vai trò:</b> {viewingUser.role?.name}</p>
					<p><b>Trạng thái:</b> {viewingUser.is_active ? 'Hoạt động' : 'Khóa'}</p>
					{#if viewingUser.image}
						<img
							src={`http://localhost:5000/${viewingUser.image}`}
							alt="Ảnh người dùng"
							class="h-24 w-24 rounded-full object-cover"
						/>
					{/if}
				</div>
				<div class="mt-4 text-right">
					<button class="rounded-lg bg-gray-200 px-4 py-2" on:click={() => (viewingUser = null)}>
						Đóng
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
