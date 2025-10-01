<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { Plus } from 'lucide-svelte';
	import LogList from './LogList.svelte';

	let logs: any[] = [];
	let pagination = { current: 1, pageSize: 6, total: 0 };
	let search = '';
	let loading = false;
	let viewMode: 'list' | 'card' = 'list';
	let viewingLog: any = null;

	const API_URL = import.meta.env.VITE_API_URL;

	pageTitle.set('Quản lý Log');

	let token = '';
	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) window.location.href = '/auth/login';
			else fetchLogs();
		}
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchLogs(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			const res = await axios.get(`${API_URL}/logs`, {
				params: { page, pageSize, search },
				headers: getAuthHeader()
			});
			const { success, data, total, message } = res.data;
			if (success) {
				logs = data;
				pagination = { current: page, pageSize, total };
			} else toast.error(message || 'Lỗi tải dữ liệu');
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải danh sách log');
		} finally {
			loading = false;
		}
	}

	function handleView(log: any) {
		viewingLog = log;
	}

	async function handleDelete(id: string) {
		const confirmed = window.confirm('Bạn có chắc chắn muốn xóa log này không?');
		if (!confirmed) return;
		try {
			await axios.delete(`${API_URL}/logs/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			fetchLogs(pagination.current, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	function handleViewModeChange(mode: 'list' | 'card') {
		viewMode = mode;
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold">Danh sách Log</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm..."
				bind:value={search}
				on:input={() => fetchLogs(1, pagination.pageSize)}
				class="w-64 rounded-lg border px-3 py-2"
			/>
		</div>
	</div>

	{#if loading}
		<div class="py-10 text-center text-gray-500">Đang tải...</div>
	{:else}
		<LogList
			data={logs}
			{pagination}
			{viewMode}
			{loading}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageSizeChange={(e) => fetchLogs(1, e.detail)}
			on:pageChange={(e) => fetchLogs(e.detail, pagination.pageSize)}
			on:viewModeChange={(e) => handleViewModeChange(e.detail)}
		/>
	{/if}

	{#if viewingLog}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[520px] overflow-hidden rounded-xl bg-white shadow-xl">
				<!-- Header -->
				<div
					class="flex items-center gap-4 border-b bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-5"
				>
					<div
						class="flex h-14 w-14 items-center justify-center rounded-full bg-purple-200 text-lg font-bold tracking-tight text-purple-700"
					>
						{(viewingLog.user?.firstname?.[0] ?? 'U').toUpperCase()}{(
							viewingLog.user?.lastname?.[0] ?? ''
						).toUpperCase()}
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-800">
							{viewingLog.user?.firstname}
							{viewingLog.user?.lastname}
						</h3>
						<p class="text-sm text-gray-600">{viewingLog.user?.email}</p>
					</div>
				</div>

				<!-- Body -->
				<div class="space-y-3 px-6 py-5 text-gray-700">
					<div><b>ID Log:</b> {viewingLog.id}</div>
					<div class="flex items-center gap-2">
						<b>Hành động:</b>
						<span class="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white"
							>{viewingLog.action}</span
						>
					</div>
					<div><b>Target:</b> {viewingLog.target_type || '-'} #{viewingLog.target_id || '-'}</div>
					<div><b>IP:</b> {viewingLog.ip_address || '-'}</div>
					<div><b>Thời gian:</b> {new Date(viewingLog.createdAt).toLocaleString()}</div>
				</div>

				<!-- Footer -->
				<div class="flex justify-end bg-gray-50 px-6 py-3">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingLog = null)}
					>
						Đóng
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
