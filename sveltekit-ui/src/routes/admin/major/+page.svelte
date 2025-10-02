<script lang="ts">
	import { onMount } from 'svelte';
	import { MeiliSearch } from 'meilisearch';
	import axios from 'axios';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import MajorList from './MajorList.svelte';
	import MajorForm from './MajorForm.svelte';
	import { Plus } from 'lucide-svelte';

	let majors: any[] = [];
	let departments: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let search = '';
	let openForm = false;
	let editingMajor: any = null;
	let viewingMajor: any = null;
	let loading = false;
	let viewMode: 'list' | 'card' = 'list';

	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';
	let majorIndex: any = null;

	pageTitle.set('Quản lý ngành học');

	let searchTimeout: NodeJS.Timeout;

	onMount(async () => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) window.location.href = '/auth/login';
			else {
				await initSearch();
				await fetchDepartments();
			}
		}
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

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

			majorIndex = client.index('majors');
			await fetchMajors();
		} catch (err) {
			console.error(err);
			toast.error('Không kết nối được Meilisearch');
		}
	}

	async function fetchDepartments() {
		try {
			const res = await axios.get(`${API_URL}/departments`, { headers: getAuthHeader() });
			departments = res.data.data || [];
		} catch (err) {
			console.error(err);
			toast.error('Không tải được danh sách phòng ban');
		}
	}

	// Debounce search
	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => fetchMajors(1, pagination.pageSize), 400);
	}

	// Lấy danh sách ngành học
	async function fetchMajors(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			let results: any;

			if (search && majorIndex) {
				const isCode = /^[A-Z]{2,}-?\d+$/.test(search.trim());
				let filterQuery: string | undefined;
				let searchQuery = '';

				if (isCode) {
					filterQuery = `department.code = "${search.toUpperCase()}"`;
				} else {
					searchQuery = search;
				}

				results = await majorIndex.search(searchQuery, {
					offset: (page - 1) * pageSize,
					limit: pageSize,
					filter: filterQuery
				});

				majors = results.hits.map((m: any) => ({
					...m,
					department: m.department || { name: '-', code: '-' }
				}));
				pagination = { current: page, pageSize, total: results.estimatedTotalHits ?? 0 };
			} else {
				const res = await axios.get(`${API_URL}/majors`, {
					params: { page, pageSize },
					headers: getAuthHeader()
				});
				const { success, data, total, message } = res.data;
				if (success) {
					majors = data.map((m) => ({
						...m,
						department: m.department || { name: '-', code: '-' }
					}));
					pagination = { current: page, pageSize, total };
				} else toast.error(message || 'Lỗi tải dữ liệu');
			}
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
		if (!window.confirm('Bạn có chắc chắn muốn xóa ngành học này không?')) return;
		try {
			await axios.delete(`${API_URL}/majors/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			const newPage =
				majors.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
			fetchMajors(newPage, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}
	async function handleSubmit(formData: any) {
		try {
			if (editingMajor) {
				await axios.put(`${API_URL}/majors/${editingMajor.id}`, formData, {
					headers: getAuthHeader()
				});
				toast.success('Cập nhật thành công');
			} else {
				await axios.post(`${API_URL}/majors`, formData, { headers: getAuthHeader() });
				toast.success('Thêm mới thành công');
			}
			openForm = false;
			fetchMajors(1, pagination.pageSize);
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
		<h2 class="text-2xl font-semibold">Danh sách ngành học</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm ngành học hoặc phòng ban..."
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
		<MajorList
			data={majors}
			{pagination}
			{viewMode}
			on:viewModeChange={(e) => handleViewModeChange(e.detail)}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageSizeChange={(e) => fetchMajors(1, e.detail)}
			on:pageChange={(e) => fetchMajors(e.detail, pagination.pageSize)}
		/>
	{/if}

	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="w-[520px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-bold">
					{editingMajor ? 'Cập nhật ngành học' : 'Thêm ngành học'}
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

	{#if viewingMajor}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[480px] overflow-hidden rounded-xl bg-white shadow-xl">
				<div
					class="flex items-center gap-4 border-b bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-5"
				>
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-200 text-xl font-bold tracking-tight text-indigo-700"
					>
						{(viewingMajor.name?.[0] ?? 'N').toUpperCase()}
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-800">{viewingMajor.name}</h3>
						<p class="text-sm text-gray-600">Mã ngành: {viewingMajor.code}</p>
					</div>
				</div>
				<div class="space-y-3 px-6 py-5 text-gray-700">
					<p><b>ID:</b> {viewingMajor.id}</p>
					<p><b>Phòng ban:</b> {viewingMajor.department?.name} ({viewingMajor.department?.code})</p>
					<p><b>Ngày tạo:</b> {new Date(viewingMajor.createdAt).toLocaleString()}</p>
					<p><b>Ngày cập nhật:</b> {new Date(viewingMajor.updatedAt).toLocaleString()}</p>
				</div>
				<div class="bg-gray-50 px-6 py-3 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingMajor = null)}>Đóng</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>
