<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Eye } from 'lucide-svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import UserList from './UserList.svelte';
	import UserForm from './UserForm.svelte';
	import { indexUsers } from '$lib/meili';
	import axios from 'axios';

	let users: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let viewMode: 'list' | 'card' = 'list';
	let search = '';
	let openForm = false;
	let editingUser: any = null;
	let viewingUser: any = null;
	let loading = false;

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

	// FETCH USERS
	async function fetchUsers(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			if (search.trim()) {
				const offset = (page - 1) * pageSize;
				const res = await indexUsers.search(search, {
					limit: pageSize,
					offset,
					attributesToRetrieve: [
						'id',
						'firstname',
						'lastname',
						'email',
						'phone',
						'role',
						'role_name',
						'is_active'
					]
				});

				users = res.hits.map((u) => ({
					...u,
					role_name: u.role_name || u.role?.name || ''
				}));

				pagination = {
					current: page,
					pageSize,
					total: res.estimatedTotalHits || res.hits.length
				};
			} else {
				const response = await axios.get(`${API_URL}/users`, {
					params: { page, pageSize },
					headers: getAuthHeader()
				});
				const { success, data, total, message } = response.data;
				if (success) {
					users = data.map((u) => ({ ...u, role_name: u.role?.name || '' }));
					pagination = { current: page, pageSize, total };
				} else toast.error(message || 'Lỗi tải dữ liệu');
			}
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải danh sách người dùng');
		} finally {
			loading = false;
		}
	}

	// ADD / UPDATE USER
	async function handleSubmit(user: any) {
		try {
			let dbResponse;
			const role_name = user.role?.name || '';

			if (editingUser) {
				dbResponse = await axios.put(`${API_URL}/users/${editingUser.id}`, user, {
					headers: getAuthHeader()
				});
				await indexUsers.updateDocuments([{ ...user, id: editingUser.id, role_name }]);
				toast.success('Cập nhật thành công');
			} else {
				dbResponse = await axios.post(`${API_URL}/users`, user, { headers: getAuthHeader() });
				await indexUsers.addDocuments([{ ...user, id: dbResponse.data.id, role_name }]);
				toast.success('Thêm mới thành công');
			}

			openForm = false;
			fetchUsers(1, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Thao tác thất bại');
		}
	}

	// DELETE USER
	async function handleDelete(id: string) {
		const user = users.find((u) => u.id === id);
		if (
			!confirm(`Bạn có chắc chắn muốn xóa người dùng "${user?.firstname} ${user?.lastname}" không?`)
		)
			return;

		try {
			await axios.delete(`${API_URL}/users/${id}`, { headers: getAuthHeader() });
			await indexUsers.deleteDocument(id);
			toast.success('Xóa thành công');
			const newPage =
				users.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
			fetchUsers(newPage, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	function handleAdd() {
		editingUser = null;
		openForm = true;
	}

	function handleEdit(user: any) {
		editingUser = user;
		openForm = true;
	}

	function handleView(user: any) {
		viewingUser = user;
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
			Danh sách người dùng
		</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm người dùng..."
				bind:value={search}
				on:input={() => fetchUsers(1, pagination.pageSize)}
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
		<UserList
			data={users}
			{pagination}
			{viewMode}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageChange={(e) => fetchUsers(e.detail, pagination.pageSize)}
			on:viewModeChange={(e) => (viewMode = e.detail)}
		/>
	{/if}

	<!-- Modal Form -->
	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[480px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					{#if editingUser}
						<Pencil class="h-5 w-5 text-blue-600" /> Cập nhật người dùng
					{:else}
						<Plus class="h-5 w-5 text-blue-600" /> Thêm người dùng
					{/if}
				</h3>
				<UserForm
					initialValues={editingUser}
					on:submit={(e) => handleSubmit(e.detail)}
					on:cancel={() => (openForm = false)}
				/>
			</div>
		</div>
	{/if}

	<!-- Modal View -->
	{#if viewingUser}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[480px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					<Eye class="h-5 w-5 text-blue-600" /> Chi tiết người dùng
				</h3>
				<div class="space-y-2 text-gray-700">
					<p><strong>ID:</strong> {viewingUser.id}</p>
					<p><strong>Họ:</strong> {viewingUser.firstname}</p>
					<p><strong>Tên:</strong> {viewingUser.lastname}</p>
					<p><strong>Email:</strong> {viewingUser.email}</p>
					<p><strong>Số điện thoại:</strong> {viewingUser.phone}</p>
					<p><strong>Vai trò:</strong> {viewingUser.role_name}</p>
					<p>
						<strong>Trạng thái:</strong>
						{viewingUser.is_active ? 'Hoạt động' : 'Không hoạt động'}
					</p>
					<p><strong>Ngày tạo:</strong> {new Date(viewingUser.createdAt).toLocaleString()}</p>
					<p><strong>Ngày cập nhật:</strong> {new Date(viewingUser.updatedAt).toLocaleString()}</p>
				</div>
				<div class="mt-4 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingUser = null)}>Đóng</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>
