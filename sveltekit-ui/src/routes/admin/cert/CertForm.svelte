<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';

	const dispatch = createEventDispatcher();
	export let initialValues: any = null;

	let form = {
		studentId: '',
		type: 'BA',
		number: '',
		grad_date: '',
		issuer: 'ĐH Điện lực',
		status: 'draft',
		file_url: ''
	};

	let students: { id: number; firstname: string; lastname: string }[] = [];
	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';

	// Biến tạm để tránh re-render danh sách sinh viên không cần thiết
	let currentEditId = null;

	// 1. CHỈ cập nhật form khi thực sự thay đổi record (bấm nút Sửa mới)
	$: if (initialValues && initialValues.id !== currentEditId) {
		currentEditId = initialValues.id;
		form = {
			studentId: String(
				initialValues.studentId ?? initialValues.student?.id ?? initialValues.student_id ?? ''
			),
			type: initialValues.type ?? 'BA',
			number: initialValues.number ?? '',
			grad_date: initialValues.grad_date ?? '',
			issuer: initialValues.issuer ?? 'ĐH Điện lực',
			status: initialValues.status ?? 'draft',
			file_url: initialValues.file_url ?? ''
		};
	}

	// 2. Tối ưu hóa computedStudents - Chỉ tính toán lại khi 'students' hoặc 'initialValues' thay đổi
	// Không cho phụ thuộc vào biến 'form' để tránh lag khi gõ phím
	$: computedStudents = (() => {
		let baseList = [...students];
		if (initialValues?.student) {
			const exists = baseList.some((s) => String(s.id) === String(initialValues.student.id));
			if (!exists) {
				return [initialValues.student, ...baseList];
			}
		}
		return baseList;
	})();

	onMount(async () => {
		if (typeof localStorage !== 'undefined') token = localStorage.getItem('token') || '';
		try {
			const res = await axios.get(`${API_URL}/students`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {}
			});
			students = res.data.data || [];
		} catch (err) {
			console.error(err);
			toast.error('Lỗi tải danh sách sinh viên');
		}
	});

	function handleSubmit() {
		if (!form.studentId || !form.number) {
			toast.error('Sinh viên và số hiệu là bắt buộc');
			return;
		}
		// Tạo một bản sao để gửi đi
		dispatch('submit', { ...form });
	}

	function handleCancel() {
		currentEditId = null; // Reset ID khi đóng
		dispatch('cancel');
	}
</script>

<div class="w-full max-w-md space-y-4 rounded-xl border bg-white p-6 shadow-lg">
	<div class="mb-4 flex items-center justify-between border-b pb-2">
		<h3 class="text-lg font-bold text-gray-800">
			{initialValues ? 'Cập nhật văn bằng' : 'Thêm văn bằng mới'}
		</h3>
	</div>

	<div>
		<label for="student" class="mb-1 block text-sm font-medium text-gray-700">Sinh viên</label>
		<select
			id="student"
			bind:value={form.studentId}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
		>
			<option value="" disabled>-- Chọn sinh viên --</option>
			{#each computedStudents as s (s.id)}
				<option value={String(s.id)}>
					{s.lastname}
					{s.firstname}
				</option>
			{/each}
		</select>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="type" class="mb-1 block text-sm font-medium text-gray-700">Loại</label>
			<select
				id="type"
				bind:value={form.type}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
			>
				<option value="BA">BA</option>
				<option value="MA">MA</option>
				<option value="PhD">PhD</option>
				<option value="CERT">CERT</option>
			</select>
		</div>

		<div>
			<label for="status" class="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
			<select
				id="status"
				bind:value={form.status}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
			>
				<option value="draft">Draft</option>
				<option value="issued">Issued</option>
				<option value="revoked">Revoked</option>
			</select>
		</div>
	</div>

	<div>
		<label for="number" class="mb-1 block text-sm font-medium text-gray-700">Số hiệu văn bằng</label
		>
		<input
			id="number"
			type="text"
			bind:value={form.number}
			placeholder="Ví dụ: ĐH-2024-001"
			class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
		/>
	</div>

	<div>
		<label for="date" class="mb-1 block text-sm font-medium text-gray-700">Ngày tốt nghiệp</label>
		<input
			id="date"
			type="date"
			bind:value={form.grad_date}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
		/>
	</div>

	<div>
		<label for="file" class="mb-1 block text-sm font-medium text-gray-700"
			>Đường dẫn file (PDF)</label
		>
		<input
			id="file"
			type="text"
			placeholder="05-01-2026-abc.pdf"
			bind:value={form.file_url}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
		/>
	</div>

	<div class="flex justify-end gap-3 border-t pt-6">
		<button
			type="button"
			class="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
			on:click={handleCancel}
		>
			Hủy bỏ
		</button>
		<button
			type="button"
			class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
			on:click={handleSubmit}
		>
			{initialValues ? 'Cập nhật' : 'Thêm mới'}
		</button>
	</div>
</div>
