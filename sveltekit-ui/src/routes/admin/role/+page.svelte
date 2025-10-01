<script lang="ts">
	import { onMount } from 'svelte';
	import { MeiliSearch } from 'meilisearch';
	import { Plus, Pencil, Eye } from 'lucide-svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import RoleList from './RoleList.svelte';
	import RoleForm from './RoleForm.svelte';
	import axios from 'axios';

	let roles: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
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

	// Lấy public key và tạo Meilisearch client
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

	// FETCH DATA
	async function fetchRoles(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			if (search && roleIndex) {
				// Tìm kiếm trên Meilisearch
				const searchResults = await roleIndex.search(search, {
					offset: (page - 1) * pageSize,
					limit: pageSize
				});

				roles = searchResults.hits;
				pagination = {
					current: page,
					pageSize,
					total: searchResults.estimatedTotalHits ?? 0
				};
			} else {
				// Fallback: gọi API backend
				const response = await axios.get(`${API_URL}/roles`, {
					params: { page, pageSize },
					headers: getAuthHeader()
				});
				const { success, data, total, message } = response.data;
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

	// CRUD HANDLERS
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
		const role = roles.find((r) => r.id === id);
		const roleName = role?.name || 'vai trò này';
		const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${roleName}" không?`);
		if (!confirmed) return;

		try {
			await axios.delete(`${API_URL}/roles/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			const newPage =
				roles.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
			fetchRoles(newPage, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	async function handleSubmit(role: any) {
		try {
			if (editingRole) {
				await axios.put(`${API_URL}/roles/${editingRole.id}`, role, {
					headers: getAuthHeader()
				});
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
			Danh sách vai trò
		</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm vai trò..."
				bind:value={search}
				on:input={() => fetchRoles(1, pagination.pageSize)}
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
			on:pageSizeChange={(e) => fetchRoles(1, e.detail)}
			on:pageChange={(e) => fetchRoles(e.detail, pagination.pageSize)}
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
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[480px] overflow-hidden rounded-xl bg-white shadow-xl">
				<!-- Header -->
				<div
					class="flex items-center gap-4 border-b bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-5"
				>
					<div
						class="flex h-14 w-14 items-center justify-center rounded-full bg-purple-200 text-lg font-bold tracking-tight text-purple-700"
					>
						{(viewingRole.name?.[0] ?? 'R').toUpperCase()}
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-800">{viewingRole.name}</h3>
						<p class="text-sm text-gray-600">Mã: {viewingRole.code}</p>
					</div>
				</div>

				<!-- Body -->
				<div class="space-y-3 px-6 py-5 text-gray-700">
					<div><b>ID:</b> {viewingRole.id}</div>
					<div><b>Ngày tạo:</b> {new Date(viewingRole.createdAt).toLocaleString()}</div>
					<div><b>Ngày cập nhật:</b> {new Date(viewingRole.updatedAt).toLocaleString()}</div>
				</div>

				<!-- Footer -->
				<div class="flex justify-end bg-gray-50 px-6 py-3">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingRole = null)}
					>
						Đóng
					</button>
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
