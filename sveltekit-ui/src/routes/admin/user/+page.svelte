<script lang="ts">
	import { onMount } from 'svelte';
	import { MeiliSearch } from 'meilisearch';
	import axios from 'axios';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import UserList from './UserList.svelte';
	import UserForm from './UserForm.svelte';
	import { Plus } from 'lucide-svelte';

	let users: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let search = '';
	let openForm = false;
	let editingUser: any = null;
	let viewingUser: any = null;
	let loading = false;
	let viewMode: 'list' | 'card' = 'list';

	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';
	let userIndex: any = null;

	pageTitle.set('Quản lý người dùng');

	onMount(async () => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) window.location.href = '/auth/login';
			else await initSearch();
		}
	});

	// Khởi tạo MeiliSearch public key cho tìm kiếm
	async function initSearch() {
		try {
			const res = await fetch(`${API_URL}/meili/public-key`);
			const data = await res.json();
			if (!data.success) throw new Error('Không lấy được Meilisearch public key');

			const client = new MeiliSearch({
				host: import.meta.env.VITE_MEILI_HOST,
				apiKey: data.publicKey
			});

			userIndex = client.index('users');
			await fetchUsers();
		} catch (err) {
			console.error(err);
			toast.error('Không kết nối được Meilisearch');
		}
	}

	// Debounce search
	let searchTimeout: NodeJS.Timeout;
	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => fetchUsers(1, pagination.pageSize), 400);
	}

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	// Lấy danh sách người dùng
	async function fetchUsers(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			if (search && userIndex) {
				// Tìm kiếm trực tiếp từ Meili
				const results = await userIndex.search(search, {
					offset: (page - 1) * pageSize,
					limit: pageSize
				});
				users = results.hits.map((u: any) => ({ ...u, role: u.role || { name: '-' } }));
				pagination = { current: page, pageSize, total: results.estimatedTotalHits ?? 0 };
			} else {
				// Lấy toàn bộ từ backend
				const res = await axios.get(`${API_URL}/users`, {
					params: { page, pageSize },
					headers: getAuthHeader()
				});
				const { success, data, total, message } = res.data;
				if (success) {
					users = data.map((u) => ({ ...u, role: u.role || { name: '-' } }));
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
	async function handleDelete(id: string) {
		if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) return;
		try {
			await axios.delete(`${API_URL}/users/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			const newPage =
				users.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
			fetchUsers(newPage, pagination.pageSize);
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
				placeholder="Tìm kiếm theo tên, email, vai trò..."
				bind:value={search}
				on:input={handleSearchInput}
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
			{users}
			{pagination}
			{viewMode}
			on:viewModeChange={(e) => handleViewModeChange(e.detail)}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageSizeChange={(e) => fetchUsers(1, e.detail)}
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

	<!-- Modal View -->
	{#if viewingUser}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[480px] overflow-hidden rounded-xl bg-white shadow-xl">
				<div
					class="flex items-center gap-4 border-b bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-5"
				>
					<div
						class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-purple-200 text-xl font-bold tracking-tight text-purple-700"
					>
						{#if viewingUser.image}
							<img
								src={`${API_URL}/${viewingUser.image}`}
								alt="Avatar"
								class="h-full w-full object-cover"
							/>
						{:else}
							{(viewingUser.firstname?.[0] ?? 'U').toUpperCase()}{(
								viewingUser.lastname?.[0] ?? ''
							).toUpperCase()}
						{/if}
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-800">
							{viewingUser.firstname}
							{viewingUser.lastname}
						</h3>
						<p class="text-sm text-gray-600">ID: {viewingUser.id}</p>
					</div>
				</div>
				<div class="space-y-3 px-6 py-5 text-gray-700">
					<p><b>Email:</b> {viewingUser.email}</p>
					<p><b>Số điện thoại:</b> {viewingUser.phone ?? '-'}</p>
					<p><b>Vai trò:</b> {viewingUser.role?.name ?? '-'}</p>
					<p><b>Trạng thái:</b> {viewingUser.is_active ? 'Hoạt động' : 'Khóa'}</p>
				</div>
				<div class="flex justify-between border-t px-6 py-4 text-sm text-gray-500">
					<span>Ngày tạo: {new Date(viewingUser.createdAt).toLocaleString()}</span>
					<span>Cập nhật: {new Date(viewingUser.updatedAt).toLocaleString()}</span>
				</div>
				<div class="bg-gray-50 px-6 py-3 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingUser = null)}>Đóng</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>
