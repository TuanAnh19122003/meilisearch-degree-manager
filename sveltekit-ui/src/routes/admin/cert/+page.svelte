<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';
	import CertList from './CertList.svelte';
	import CertForm from './CertForm.svelte';
	import { pageTitle } from '$lib/stores/pageTitle';

	let certificates: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let search = '';
	let loading = false;
	let openForm = false;
	let editingItem: any = null;
	let viewingItem: any = null;
	let viewMode: 'list' | 'card' = 'list';

	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';
	pageTitle.set('Quản lý văn bằng');

	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) window.location.href = '/auth/login';
			else fetchCertificates();
		}
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchCertificates(page = 1) {
		loading = true;
		try {
			const res = await axios.get(`${API_URL}/certificates`, {
				params: { page, pageSize: pagination.pageSize, search },
				headers: getAuthHeader()
			});
			const { success, data, total, message } = res.data;
			if (success) {
				certificates = data;
				pagination = { ...pagination, current: page, total };
			} else toast.error(message || 'Lỗi tải dữ liệu');
		} catch (err) {
			console.error(err);
			toast.error('Lỗi tải văn bằng');
		} finally {
			loading = false;
		}
	}

	function handleAdd() {
		editingItem = null;
		openForm = true;
	}
	function handleEdit(item) {
		editingItem = item;
		openForm = true;
	}

	async function handleDelete(id: number) {
		if (!window.confirm('Bạn có chắc chắn muốn xóa văn bằng này không?')) return;
		try {
			await axios.delete(`${API_URL}/certificates/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			fetchCertificates(pagination.current);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	async function handleSubmit(formData) {
		try {
			if (editingItem) {
				const res = await axios.put(`${API_URL}/certificates/${editingItem.id}`, formData, {
					headers: getAuthHeader()
				});
				toast.success('Cập nhật thành công');
				certificates = certificates.map((cert) =>
					cert.id === editingItem.id ? { ...cert, ...res.data.data } : cert
				);
			} else {
				const res = await axios.post(`${API_URL}/certificates`, formData, {
					headers: getAuthHeader()
				});
				toast.success('Thêm mới thành công');
				certificates = [res.data.data, ...certificates];
			}
			openForm = false;
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
				placeholder="Tìm kiếm..."
				bind:value={search}
				on:input={() => fetchCertificates(1)}
				class="w-64 rounded-lg border px-3 py-2"
			/>
			<button
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
				on:click={handleAdd}>Thêm</button
			>
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
			on:delete={(e) => handleDelete(e.detail)}
			on:pageChange={(e) => fetchCertificates(e.detail)}
			on:view={(e) => (viewingItem = e.detail)}
		/>
	{/if}

	{#if viewingItem}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="w-[500px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-bold">Chi tiết văn bằng</h3>
				<p><b>ID:</b> {viewingItem.id}</p>
				<p><b>Sinh viên:</b> {viewingItem.student?.lastname} {viewingItem.student?.firstname}</p>
				<p><b>Loại:</b> {viewingItem.type}</p>
				<p><b>Số hiệu:</b> {viewingItem.number}</p>
				<p><b>Ngày tốt nghiệp:</b> {viewingItem.grad_date}</p>
				<p>
					<b>Trạng thái:</b>
					<span
						class={`inline-block px-2 py-1 text-xs font-semibold ${statusClass(viewingItem.status)}`}
						>{viewingItem.status === 'issued'
							? 'Đã cấp'
							: viewingItem.status === 'revoked'
								? 'Thu hồi'
								: 'Bản nháp'}</span
					>
				</p>
				{#if viewingItem.file_url}<p>
						<a href={viewingItem.file_url} target="_blank" class="text-sm text-blue-600 underline"
							>Xem file</a
						>
					</p>{/if}
				<div class="mt-4 text-right">
					<button class="rounded-lg bg-gray-200 px-4 py-2" on:click={() => (viewingItem = null)}
						>Đóng</button
					>
				</div>
			</div>
		</div>
	{/if}

	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="w-[520px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-bold">
					{editingItem ? 'Cập nhật văn bằng' : 'Thêm văn bằng'}
				</h3>
				<CertForm
					initialValues={editingItem}
					on:submit={(e) => handleSubmit(e.detail)}
					on:cancel={() => (openForm = false)}
				/>
			</div>
		</div>
	{/if}
</div>
