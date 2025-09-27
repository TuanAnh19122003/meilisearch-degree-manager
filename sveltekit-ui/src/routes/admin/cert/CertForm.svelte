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

	if (initialValues) form = { ...form, ...initialValues };

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
		dispatch('submit', { ...form });
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<div class="space-y-4">
	<div>
		<label for="" class="mb-1 block text-sm font-medium">Sinh viên</label>
		<select bind:value={form.studentId} class="w-full rounded border px-3 py-2">
			<option value="" disabled>Chọn sinh viên</option>
			{#each students as s}
				<option value={s.id}>{s.lastname} {s.firstname}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="" class="mb-1 block text-sm font-medium">Loại</label>
		<select bind:value={form.type} class="w-full rounded border px-3 py-2">
			<option value="BA">BA</option>
			<option value="MA">MA</option>
			<option value="PhD">PhD</option>
			<option value="CERT">CERT</option>
		</select>
	</div>

	<div>
		<label for="" class="mb-1 block text-sm font-medium">Số hiệu</label>
		<input type="text" bind:value={form.number} class="w-full rounded border px-3 py-2" />
	</div>

	<div>
		<label for="" class="mb-1 block text-sm font-medium">Ngày tốt nghiệp</label>
		<input type="date" bind:value={form.grad_date} class="w-full rounded border px-3 py-2" />
	</div>

	<div>
		<label for="" class="mb-1 block text-sm font-medium">Trạng thái</label>
		<select bind:value={form.status} class="w-full rounded border px-3 py-2">
			<option value="draft">Draft</option>
			<option value="issued">Issued</option>
			<option value="revoked">Revoked</option>
		</select>
	</div>

	<div>
		<label for="" class="mb-1 block text-sm font-medium">File URL</label>
		<input
			type="text"
			placeholder="Nhập đường dẫn file"
			bind:value={form.file_url}
			class="w-full rounded border px-3 py-2"
		/>
	</div>

	<div class="flex justify-end gap-2">
		<button class="rounded bg-gray-200 px-4 py-2" on:click={handleCancel}>Hủy</button>
		<button class="rounded bg-blue-600 px-4 py-2 text-white" on:click={handleSubmit}>Lưu</button>
	</div>
</div>
