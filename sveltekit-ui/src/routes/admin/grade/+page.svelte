<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Eye } from 'lucide-svelte';
	import { pageTitle } from '$lib/stores/pageTitle';
	import { toast } from 'svelte-sonner';
	import GradeList from './GradeList.svelte';
	import GradeForm from './GradeForm.svelte';
	import axios from 'axios';

	let grades: any[] = [];
	let pagination = { current: 1, pageSize: 9, total: 0 };
	let viewMode: 'list' | 'card' = 'list';
	let search = '';
	let openForm = false;
	let editingGrade: any = null;
	let viewingGrade: any = null;
	let loading = false;

	const API_URL = import.meta.env.VITE_API_URL;
	pageTitle.set('Quản lý điểm');

	let token = '';
	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			token = localStorage.getItem('token') || '';
			if (!token) window.location.href = '/auth/login';
			else fetchGrades();
		}
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	// FETCH DATA
	async function fetchGrades(page = 1, pageSize = pagination.pageSize) {
		loading = true;
		try {
			const response = await axios.get(`${API_URL}/grades`, {
				params: { page, pageSize, search },
				headers: getAuthHeader()
			});
			const { success, data, total, message } = response.data;
			if (success) {
				grades = data;
				pagination = { current: page, pageSize, total };
			} else toast.error(message || 'Lỗi tải dữ liệu');
		} catch (err) {
			console.error(err);
			toast.error('Lỗi khi tải danh sách điểm');
		} finally {
			loading = false;
		}
	}

	function handleAdd() {
		editingGrade = null;
		openForm = true;
	}

	function handleEdit(grade: any) {
		editingGrade = grade;
		openForm = true;
	}

	function handleView(grade: any) {
		viewingGrade = grade;
	}

	async function handleDelete(id: string) {
		const grade = grades.find((g) => g.id === id);
		const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa điểm này không?`);
		if (!confirmed) return;

		try {
			await axios.delete(`${API_URL}/grades/${id}`, { headers: getAuthHeader() });
			toast.success('Xóa thành công');
			const newPage =
				grades.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
			fetchGrades(newPage, pagination.pageSize);
		} catch (err) {
			console.error(err);
			toast.error('Xóa thất bại');
		}
	}

	async function handleSubmit(grade: any) {
		try {
			if (editingGrade) {
				await axios.put(`${API_URL}/grades/${editingGrade.id}`, grade, {
					headers: getAuthHeader()
				});
				toast.success('Cập nhật thành công');
			} else {
				await axios.post(`${API_URL}/grades`, grade, { headers: getAuthHeader() });
				toast.success('Thêm mới thành công');
			}
			openForm = false;
			fetchGrades(1, pagination.pageSize);
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
			Danh sách điểm
		</h2>
		<div class="flex gap-3">
			<input
				placeholder="Tìm kiếm..."
				bind:value={search}
				on:input={() => fetchGrades(1, pagination.pageSize)}
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
		<GradeList
			data={grades}
			{pagination}
			{viewMode}
			on:edit={(e) => handleEdit(e.detail)}
			on:view={(e) => handleView(e.detail)}
			on:delete={(e) => handleDelete(e.detail)}
			on:pageSizeChange={(e) => fetchGrades(1, e.detail)}
			on:pageChange={(e) => fetchGrades(e.detail, pagination.pageSize)}
			on:viewModeChange={(e) => (viewMode = e.detail)}
		/>
	{/if}

	<!-- Modal Form -->
	{#if openForm}
		<div class="fixed inset-0 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[420px] rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
					{#if editingGrade}
						<Pencil class="h-5 w-5 text-blue-600" /> Cập nhật điểm
					{:else}
						<Plus class="h-5 w-5 text-blue-600" /> Thêm điểm
					{/if}
				</h3>
				<GradeForm
					initialValues={editingGrade}
					on:submit={(e) => handleSubmit(e.detail)}
					on:cancel={() => (openForm = false)}
				/>
			</div>
		</div>
	{/if}

	<!-- Modal View -->
	{#if viewingGrade}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div class="animate-fade-in w-[480px] overflow-hidden rounded-xl bg-white shadow-xl">
				<!-- Header -->
				<div
					class="flex items-center gap-4 border-b bg-gradient-to-r from-green-50 to-green-100 px-6 py-5"
				>
					<div
						class="flex h-14 w-14 items-center justify-center rounded-full bg-green-200 text-lg font-bold tracking-tight text-green-700"
					>
						{(viewingGrade.student?.lastname?.[0] ?? 'S').toUpperCase()}{(
							viewingGrade.student?.firstname?.[0] ?? ''
						).toUpperCase()}
					</div>
					<div>
						<h3 class="text-xl font-semibold text-gray-800">
							{viewingGrade.student?.lastname}
							{viewingGrade.student?.firstname}
						</h3>
						<p class="text-sm text-gray-600">ID: {viewingGrade.student?.code}</p>
					</div>
				</div>

				<!-- Body -->
				<div class="space-y-3 px-6 py-5 text-gray-700">
					<div><b>Mã môn học:</b> {viewingGrade.id}</div>
					<div><b>Môn học:</b> {viewingGrade.course?.name}</div>
					<div class="flex items-center gap-2">
						<b>Điểm:</b>
						<span
							class={`rounded-full px-2 py-1 text-xs font-semibold ${
								parseFloat(viewingGrade.grade) >= 8
									? 'bg-green-100 text-green-700'
									: parseFloat(viewingGrade.grade) >= 5
										? 'bg-yellow-100 text-yellow-700'
										: 'bg-red-100 text-red-700'
							}`}
						>
							{viewingGrade.grade}
						</span>
					</div>
				</div>

				<!-- Footer -->
				<div class="flex justify-between border-t px-6 py-4 text-sm text-gray-500">
					<span>Ngày tạo: {new Date(viewingGrade.createdAt).toLocaleString()}</span>
					<span>Cập nhật: {new Date(viewingGrade.updatedAt).toLocaleString()}</span>
				</div>

				<!-- Actions -->
				<div class="bg-gray-50 px-6 py-3 text-right">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
						on:click={() => (viewingGrade = null)}
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
