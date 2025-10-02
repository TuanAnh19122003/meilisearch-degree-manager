<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil } from 'lucide-svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import DepartmentList from './DepartmentList.svelte';
	import DepartmentForm from './DepartmentForm.svelte';
	import axios from 'axios';
	import { MeiliSearch } from 'meilisearch';

	let departments: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let viewMode: 'list' | 'card' = 'list';
	let search = '';
	let openForm = false;
	let editingDept: any = null;
	let viewingDept: any = null;
	let loading = false;

	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';
	let departmentIndex: any = null;

	pageTitle.set('Quản lý phòng ban');

	onMount(async () => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) return (window.location.href = '/auth/login');
			await initSearch();
		}
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	// Khởi tạo MeiliSearch
	async function initSearch() {
		try {
			const res = await fetch(`${API_URL}/meili/public-key`);
			const data = await res.json();
			if (!data.success) throw new Error('Không lấy được Meilisearch public key');

			const client = new MeiliSearch({
				host: import.meta.env.VITE_MEILI_HOST,
				apiKey: data.publicKey
			});
			departmentIndex = client.index('departments');
			await fetchDepartments();
		} catch (err) {
			console.error(err);
			toast.error('Không kết nối được MeiliSearch');
		}
	}

	let searchTimeout: NodeJS.Timeout;
	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => fetchDepartments(1), 400);
	}

	// FETCH DATA
	async function fetchDepartments(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			let deptList: any[] = [];
			let total = 0;

			if (search && departmentIndex) {
				// Nếu có search thì ưu tiên tìm trong MeiliSearch
				let results = await departmentIndex.search(search, {
					offset: (page - 1) * pageSize,
					limit: pageSize
				});

				// Nếu bạn muốn ưu tiên tìm theo code chính xác:
				if (!results.hits.length) {
					results = await departmentIndex.search(search, {
						filter: `code = "${search}"`,
						offset: (page - 1) * pageSize,
						limit: pageSize
					});
				}

				deptList = results.hits;
				total = results.estimatedTotalHits ?? results.hits.length;
			} else {
				// Không search → lấy từ backend (dữ liệu chắc chắn mới nhất)
				const response = await axios.get(`${API_URL}/departments`, {
					params: { page, pageSize },
					headers: getAuthHeader()
				});
				const { success, data, total: totalRes, message } = response.data;
				if (success) {
					deptList = data;
					total = totalRes ?? data.length;
				} else {
					toast.error(message || 'Lỗi tải dữ liệu');
					deptList = [];
					total = 0;
				}
			}

			departments = deptList;
			pagination = { current: page, pageSize, total };
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải danh sách phòng ban');
		} finally {
			loading = false;
		}
	}

	// CRUD
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
		if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng ban "${deptName}" không?`)) return;
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
		<h2 class="flex items-center gap-2 text-2xl font-semibold">Danh sách phòng ban</h2>
		<div class="flex gap-3">
			<input
				placeholder="Mã hoặc tên phòng ban"
				bind:value={search}
				on:input={handleSearchInput}
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
			on:pageSizeChange={(e) => fetchDepartments(1, e.detail)}
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
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[480px] overflow-hidden rounded-xl bg-white shadow-xl">
				<div
					class="flex items-center gap-4 border-b bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-5"
				>
					<div
						class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-200 text-lg font-bold text-blue-700"
					>
						{viewingDept.name
							? viewingDept.name
									.split(' ')
									.map((w) => w[0])
									.join('')
									.toUpperCase()
							: 'PB'}
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-800">{viewingDept.name}</h3>
						<p class="text-sm text-gray-600">
							Mã phòng ban: <span class="font-medium">{viewingDept.code}</span>
						</p>
					</div>
				</div>
				<div class="space-y-3 px-6 py-5 text-gray-700">
					<div><b>ID:</b> {viewingDept.id}</div>
					<div><b>Tên phòng ban:</b> {viewingDept.name}</div>
					<div><b>Mã phòng ban:</b> {viewingDept.code}</div>
				</div>
				<div class="flex justify-between border-t px-6 py-4 text-sm text-gray-500">
					<span>Ngày tạo: {new Date(viewingDept.createdAt).toLocaleString()}</span>
					<span>Cập nhật: {new Date(viewingDept.updatedAt).toLocaleString()}</span>
				</div>
				<div class="bg-gray-50 px-6 py-3 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingDept = null)}
					>
						Đóng
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
