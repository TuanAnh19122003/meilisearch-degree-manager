<script lang="ts">
	import { onMount } from 'svelte';
	import { MeiliSearch } from 'meilisearch';
	import { Plus, Pencil } from 'lucide-svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import RoleList from './RoleList.svelte';
	import RoleForm from './RoleForm.svelte';
	import axios from 'axios';

	let roles: any[] = [];
	let pagination = { current: 1, pageSize: 9, total: 0 };
	let viewMode: 'list' | 'card' = 'list';
	let search = '';
	let openForm = false;
	let editingRole: any = null;
	let viewingRole: any = null;
	let loading = false;

	const API_URL = import.meta.env.VITE_API_URL;
	pageTitle.set('Quản lý vai trò');

	let token = '';
	let roleIndex: any = null;

	onMount(async () => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) window.location.href = '/auth/login';
			else await initSearch();
		}
	});

	async function initSearch() {
		try {
			const res = await fetch(`${API_URL}/meili/public-key`);
			const data = await res.json();
			if (!data.success) throw new Error('Không lấy được Meilisearch public key');

			const client = new MeiliSearch({
				host: import.meta.env.VITE_MEILI_HOST,
				apiKey: data.publicKey
			});

			roleIndex = client.index('roles');
			await fetchRoles();
		} catch (err) {
			console.error(err);
			toast.error('Không kết nối được Meilisearch');
		}
	}

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchRoles(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			if (search && roleIndex) {
				const results = await roleIndex.search(search, {
					offset: (page - 1) * pageSize,
					limit: pageSize
				});
				roles = results.hits;
				pagination = {
					current: page,
					pageSize,
					total: results.estimatedTotalHits ?? 0
				};
			} else {
				const res = await axios.get(`${API_URL}/roles`, {
					params: { page, pageSize, search },
					headers: getAuthHeader()
				});
				const { success, data, total, message } = res.data;
				if (success) {
					roles = data;
					pagination = { current: page, pageSize, total };
				} else toast.error(message || 'Lỗi tải dữ liệu');
			}
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải danh sách vai trò');
		} finally {
			loading = false;
		}
	}

	function handleAdd() {
		editingRole = null;
		openForm = true;
	}
	function handleEdit(role: any) {
		editingRole = role;
		openForm = true;
	}
	function handleView(role: any) {
		viewingRole = role;
	}
	async function handleDelete(id: string) {
		if (!window.confirm('Bạn có chắc chắn muốn xóa vai trò này?')) return;

		try {
			await axios.delete(`${API_URL}/roles/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			const newPage = roles.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
			fetchRoles(newPage, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	async function handleSubmit(role: any) {
		try {
			if (editingRole) {
				await axios.put(`${API_URL}/roles/${editingRole.id}`, role, { headers: getAuthHeader() });
				toast.success('Cập nhật thành công');
			} else {
				await axios.post(`${API_URL}/roles`, role, { headers: getAuthHeader() });
				toast.success('Thêm mới thành công');
			}
			openForm = false;
			fetchRoles(1, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Thao tác thất bại');
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold">Danh sách vai trò</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm vai trò..."
				bind:value={search}
				on:input={() => fetchRoles(1, pagination.pageSize)}
				class="w-64 rounded-lg border px-3 py-2"
			/>
			<button class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white" on:click={handleAdd}>
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
			on:pageSizeChange={(e) => fetchRoles(1, e.detail)}
			on:pageChange={(e) => fetchRoles(e.detail, pagination.pageSize)}
			on:viewModeChange={(e) => (viewMode = e.detail)}
		/>
	{/if}

	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-bold">{editingRole ? 'Cập nhật vai trò' : 'Thêm vai trò'}</h3>
				<RoleForm initialValues={editingRole} on:submit={(e) => handleSubmit(e.detail)} on:cancel={() => (openForm = false)} />
			</div>
		</div>
	{/if}

	{#if viewingRole}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="w-[480px] rounded-xl bg-white shadow-xl">
				<div class="flex items-center gap-4 border-b px-6 py-5">
					<div class="flex h-14 w-14 items-center justify-center rounded-full bg-purple-200 text-lg font-bold text-purple-700">
						{(viewingRole.name?.[0] ?? 'R').toUpperCase()}
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-800">{viewingRole.name}</h3>
						<p class="text-sm text-gray-600">Mã: {viewingRole.code}</p>
					</div>
				</div>
				<div class="space-y-3 px-6 py-5 text-gray-700">
					<div><b>ID:</b> {viewingRole.id}</div>
					<div><b>Ngày tạo:</b> {new Date(viewingRole.createdAt).toLocaleString()}</div>
					<div><b>Ngày cập nhật:</b> {new Date(viewingRole.updatedAt).toLocaleString()}</div>
				</div>
				<div class="flex justify-end bg-gray-50 px-6 py-3">
					<button class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300" on:click={() => (viewingRole = null)}>
						Đóng
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
