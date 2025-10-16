<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { FileText, Users, FileCheck } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import Chart from '$lib/components/Chart.svelte';
	import { pageTitle } from '$lib/stores/pageTitle';

	const API_URL = import.meta.env.VITE_API_URL;

	let stats = {
		totalStudents: 0,
		totalCerts: 0,
		certsByStatus: { issued: 0, draft: 0, revoked: 0 }
	};

	let recentCerts = [];
	let loadingStats = true;
	let loadingRecent = true;

	let certsYearData = { labels: [], datasets: [] };
	let studentsMajorData = { labels: [], datasets: [] };
	let certsStatusData = { labels: [], datasets: [] };
	pageTitle.set('Hệ thống quản lý văn bằng');
	// ===== Fetch thống kê chung =====
	async function fetchStats() {
		try {
			loadingStats = true;

			const [studentsRes, certsRes, certsStatusRes] = await Promise.all([
				axios.get(`${API_URL}/students/count`),
				axios.get(`${API_URL}/certificates/count`),
				axios.get(`${API_URL}/certificates/stats-by-status`)
			]);

			stats.totalStudents = studentsRes.data.total;
			stats.totalCerts = certsRes.data.total;
			stats.certsByStatus = certsStatusRes.data;

			certsStatusData = {
				labels: ['Issued', 'Draft', 'Revoked'],
				datasets: [
					{
						label: 'Chứng chỉ theo trạng thái',
						data: [
							stats.certsByStatus.issued,
							stats.certsByStatus.draft,
							stats.certsByStatus.revoked
						],
						backgroundColor: ['#10b981', '#facc15', '#ef4444']
					}
				]
			};
		} catch (err) {
			console.error(err);
			toast.error('Không thể tải thống kê');
		} finally {
			loadingStats = false;
		}
	}

	// ===== Fetch chứng chỉ mới =====
	async function fetchRecentCerts() {
		try {
			loadingRecent = true;
			const res = await axios.get(`${API_URL}/certificates/recent`, { params: { limit: 5 } });
			recentCerts = res.data || [];
		} catch (err) {
			console.error(err);
			toast.error('Không thể tải chứng chỉ mới');
		} finally {
			loadingRecent = false;
		}
	}

	// ===== Fetch dữ liệu biểu đồ =====
	async function fetchCharts() {
		try {
			// Chứng chỉ theo năm
			const certsYearRes = await axios.get(`${API_URL}/certificates/stats-by-year`);
			certsYearData = {
				labels: certsYearRes.data.map((item) => item.year),
				datasets: [
					{
						label: 'Số chứng chỉ theo năm',
						data: certsYearRes.data.map((item) => item.count),
						backgroundColor: '#3b82f6'
					}
				]
			};

			// Sinh viên theo ngành
			const studentsMajorRes = await axios.get(`${API_URL}/students/by-major`);
			studentsMajorData = {
				labels: studentsMajorRes.data.map((item) => item.major),
				datasets: [
					{
						label: 'Số sinh viên theo ngành',
						data: studentsMajorRes.data.map((item) => item.count),
						backgroundColor: '#f97316'
					}
				]
			};
		} catch (err) {
			console.error(err);
			toast.error('Không thể tải dữ liệu biểu đồ');
		}
	}

	onMount(() => {
		fetchStats();
		fetchRecentCerts();
		fetchCharts();
	});
</script>

<div class="space-y-6 p-6">
	<h2 class="text-2xl font-bold">Dashboard hệ thống văn bằng</h2>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<div class="flex items-center gap-4 rounded-xl bg-blue-100 p-4">
			<Users class="h-8 w-8 text-blue-600" />
			<div>
				<p class="text-sm text-gray-600">Tổng sinh viên</p>
				<p class="text-xl font-bold">{loadingStats ? '...' : stats.totalStudents}</p>
			</div>
		</div>

		<div class="flex items-center gap-4 rounded-xl bg-green-100 p-4">
			<FileText class="h-8 w-8 text-green-600" />
			<div>
				<p class="text-sm text-gray-600">Tổng chứng chỉ</p>
				<p class="text-xl font-bold">{loadingStats ? '...' : stats.totalCerts}</p>
			</div>
		</div>

		<div class="flex items-center gap-4 rounded-xl bg-yellow-100 p-4">
			<FileCheck class="h-8 w-8 text-yellow-600" />
			<div>
				<p class="text-sm text-gray-600">Chứng chỉ theo trạng thái</p>
				<p class="text-xl font-bold">
					{loadingStats
						? '...'
						: `${stats.certsByStatus.issued} / ${stats.certsByStatus.draft} / ${stats.certsByStatus.revoked}`}
				</p>
				<p class="text-xs text-gray-500">issued / draft / revoked</p>
			</div>
		</div>
	</div>

	<!-- Biểu đồ -->
	<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="rounded-lg bg-white p-4 shadow">
			<h3 class="mb-2 text-lg font-semibold">Số chứng chỉ theo năm</h3>
			<Chart type="bar" data={certsYearData} />
		</div>

		<div class="rounded-lg bg-white p-4 shadow">
			<h3 class="mb-2 text-lg font-semibold">Số sinh viên theo ngành</h3>
			<Chart type="bar" data={studentsMajorData} />
		</div>
	</div>

	<!-- Recent Certificates -->
	<div class="mt-6">
		<h3 class="mb-2 text-lg font-semibold">Chứng chỉ mới nhất</h3>
		{#if loadingRecent}
			<div class="text-gray-500">Đang tải...</div>
		{:else if recentCerts.length === 0}
			<div class="text-gray-500">Chưa có chứng chỉ nào</div>
		{:else}
			<table class="w-full border-collapse text-sm">
				<thead class="bg-gray-50 text-gray-700">
					<tr>
						<th class="px-3 py-2 text-left">Số hiệu</th>
						<th class="px-3 py-2 text-left">Sinh viên</th>
						<th class="px-3 py-2 text-left">Loại</th>
						<th class="px-3 py-2 text-left">Ngày tốt nghiệp</th>
						<th class="px-3 py-2 text-left">Trạng thái</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each recentCerts as cert}
						<tr>
							<td class="px-3 py-2">{cert.number}</td>
							<td class="px-3 py-2">{cert.student?.lastname} {cert.student?.firstname}</td>
							<td class="px-3 py-2">{cert.type}</td>
							<td class="px-3 py-2"
								>{cert.grad_date ? new Date(cert.grad_date).toLocaleDateString() : '-'}</td
							>
							<td class="px-3 py-2">{cert.status}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	tbody tr:hover {
		background-color: #f9fafb;
	}
</style>
