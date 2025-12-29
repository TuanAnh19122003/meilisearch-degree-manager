<script lang="ts">
	import { onMount } from 'svelte';
	import { MeiliSearch } from 'meilisearch';
	import axios from 'axios';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import CertList from './CertList.svelte';
	import CertForm from './CertForm.svelte';
	import { Plus } from 'lucide-svelte';

	let certificates: any[] = [];
	let pagination = { current: 1, pageSize: 9, total: 0 };
	let search = '';
	let searchStatus = '';
	let openForm = false;
	let editingCert: any = null;
	let viewingCert: any = null;
	let loading = false;
	let viewMode: 'list' | 'card' = 'list';

	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';
	let certIndex: any = null;

	pageTitle.set('Quản lý văn bằng');

	onMount(async () => {
		token = localStorage.getItem('token') || '';
		if (!token) return (window.location.href = '/auth/login');
		await initSearch();
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function initSearch() {
		try {
			const res = await fetch(`${API_URL}/meili/public-key`);
			const data = await res.json();
			if (!data.success) throw new Error('Không lấy được Meilisearch public key');

			const client = new MeiliSearch({
				host: import.meta.env.VITE_MEILI_HOST,
				apiKey: data.publicKey
			});

			certIndex = client.index('certificates');
			await fetchCertificates();
		} catch (err) {
			console.error(err);
			toast.error('Không kết nối được MeiliSearch');
		}
	}

	let searchTimeout: NodeJS.Timeout;
	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => fetchCertificates(1), 400);
	}

	async function fetchCertificates(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			let certList: any[] = [];
			let total = 0;

			if ((search || searchStatus) && certIndex) {
				const filters: string[] = [];

				if (searchStatus) {
					filters.push(`status = "${searchStatus}"`);
				}

				// search chính
				let results = await certIndex.search(search || '', {
					filter: filters.length ? filters.join(' AND ') : undefined,
					offset: (page - 1) * pageSize,
					limit: pageSize
				});

				if (search) {
					const exactResults = await certIndex.search('', {
						filter: `number = "${search}" OR student.code = "${search}"`,
						limit: 2
					});

					if (exactResults.hits.length === 1) {
						results = exactResults;
					}
				}

				certList = results.hits;
				total = results.estimatedTotalHits ?? results.hits.length;
			} else {
				const params: any = { page, pageSize };
				if (search) params.identifier = search;
				if (searchStatus) params.status = searchStatus;

				const res = await axios.get(`${API_URL}/certificates`, {
					params,
					headers: getAuthHeader()
				});

				const { success, data, total: totalRes, message } = res.data;
				if (success) {
					certList = data;
					total = totalRes ?? data.length;
				} else {
					toast.error(message || 'Lỗi tải dữ liệu');
					certList = [];
					total = 0;
				}
			}

			certificates = certList;
			pagination = { current: page, pageSize, total };
		} catch (err) {
			console.error(err);
			toast.error('Lỗi tải văn bằng');
		} finally {
			loading = false;
		}
	}

	function handleAdd() {
		editingCert = null;
		openForm = true;
	}
	function normalizeCert(cert: any) {
		return {
			...cert,
			studentId: cert.studentId ?? cert.student?.id ?? cert.student_id ?? ''
		};
	}

	function handleEdit(cert: any) {
		editingCert = normalizeCert(cert);
		openForm = true;
	}

	function handleView(cert: any) {
		viewingCert = cert;
	}
	async function handleDelete(id: string) {
		if (!window.confirm('Bạn có chắc chắn muốn xóa văn bằng này không?')) return;
		try {
			await axios.delete(`${API_URL}/certificates/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			const newPage =
				certificates.length === 1 && pagination.current > 1
					? pagination.current - 1
					: pagination.current;
			fetchCertificates(newPage, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	async function handleSubmit(formData: FormData) {
		try {
			if (editingCert) {
				await axios.put(`${API_URL}/certificates/${editingCert.id}`, formData, {
					headers: getAuthHeader()
				});
				toast.success('Cập nhật thành công');
			} else {
				await axios.post(`${API_URL}/certificates`, formData, { headers: getAuthHeader() });
				toast.success('Thêm mới thành công');
			}
			openForm = false;
			fetchCertificates(1, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Thao tác thất bại');
		}
	}

	function handleViewModeChange(mode: 'list' | 'card') {
		viewMode = mode;
	}

	function statusClass(status: string) {
		switch (status) {
			case 'issued':
				return 'bg-green-100 text-green-700';
			case 'revoked':
				return 'bg-red-100 text-red-700';
			case 'draft':
				return 'bg-yellow-100 text-yellow-700';
			default:
				return 'bg-gray-100 text-gray-600';
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold">Quản lý văn bằng</h2>
		<div class="flex gap-3">
			<input
				type="text"
				placeholder="Số văn bằng hoặc mã sinh viên"
				bind:value={search}
				on:input={handleSearchInput}
				class="w-64 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
			/>
			<select
				bind:value={searchStatus}
				on:change={() => fetchCertificates(1)}
				class="rounded-lg border px-3 py-2"
			>
				<option value="">Tất cả trạng thái</option>
				<option value="draft">Bản nháp</option>
				<option value="issued">Đã cấp</option>
				<option value="revoked">Thu hồi</option>
			</select>
			<button
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				on:click={handleAdd}
			>
				<Plus class="h-4 w-4" /> Thêm
			</button>
		</div>
	</div>

	{#if loading}
		<div class="py-10 text-center text-gray-500">Đang tải...</div>
	{:else}
		<CertList
			data={certificates}
			{pagination}
			{viewMode}
			on:viewModeChange={(e) => handleViewModeChange(e.detail)}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageChange={(e) => fetchCertificates(e.detail, pagination.pageSize)}
			on:pageSizeChange={(e) => fetchCertificates(1, e.detail)}
		/>
	{/if}

	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<CertForm
				initialValues={editingCert}
				on:submit={(e) => handleSubmit(e.detail)}
				on:cancel={() => (openForm = false)}
			/>
		</div>
	{/if}

	{#if viewingCert}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<!-- Modal xem certificate -->
			<div class="animate-fade-in w-[520px] overflow-hidden rounded-xl bg-white shadow-xl">
				<div
					class="flex items-center gap-4 border-b bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4"
				>
					<div
						class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-200 text-lg font-bold text-blue-700"
					>
						{viewingCert.student?.lastname?.[0]}{viewingCert.student?.firstname?.[0]}
					</div>
					<div>
						<h3 class="text-xl font-semibold">
							{viewingCert.student?.lastname}
							{viewingCert.student?.firstname}
						</h3>
						<p class="text-sm text-gray-600">Mã SV: {viewingCert.student?.code ?? '-'}</p>
					</div>
				</div>
				<div class="space-y-3 px-6 py-4 text-gray-700">
					<p><b>Mã VB:</b> {viewingCert.number}</p>
					<p><b>Loại:</b> {viewingCert.type}</p>
					<p><b>Ngày tốt nghiệp:</b> {new Date(viewingCert.grad_date).toLocaleDateString()}</p>
					<p>
						<b>Trạng thái:</b>
						<span
							class={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(viewingCert.status)}`}
						>
							{viewingCert.status === 'issued'
								? 'Đã cấp'
								: viewingCert.status === 'revoked'
									? 'Thu hồi'
									: 'Bản nháp'}
						</span>
					</p>
					{#if viewingCert.file_url}
						<p>
							<b>File:</b>
							<a href={viewingCert.file_url} target="_blank" class="text-blue-600 underline"
								>Xem / tải về</a
							>
						</p>
					{/if}
				</div>
				<div class="flex justify-between border-t px-6 py-3 text-sm text-gray-500">
					<span>Ngày tạo: {new Date(viewingCert.createdAt).toLocaleString()}</span>
					<span>Cập nhật: {new Date(viewingCert.updatedAt).toLocaleString()}</span>
				</div>
				<div class="bg-gray-50 px-6 py-3 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingCert = null)}>Đóng</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>
