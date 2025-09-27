<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import axios from 'axios';
	import { toast } from 'svelte-sonner';

	export let initialValues = { studentId: '', courseId: '', grade: '' };

	const dispatch = createEventDispatcher();
	let formData = { ...initialValues };

	let students: any[] = [];
	let courses: any[] = [];
	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';

	onMount(async () => {
		token = localStorage.getItem('token') || '';
		await fetchStudents();
		await fetchCourses();
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchStudents() {
		try {
			const res = await axios.get(`${API_URL}/students`, { headers: getAuthHeader() });
			students = res.data.data;
			console.log(students);
		} catch {
			toast.error('Lỗi tải danh sách sinh viên');
		}
	}

	async function fetchCourses() {
		try {
			const res = await axios.get(`${API_URL}/courses`, { headers: getAuthHeader() });
			courses = res.data.data;
		} catch {
			toast.error('Lỗi tải danh sách môn học');
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (!formData.studentId || !formData.courseId || !formData.grade) {
			toast.error('Vui lòng nhập đầy đủ!');
			return;
		}
		dispatch('submit', formData);
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
	<div>
		<label for="" class="mb-1 block font-medium">Sinh viên</label>
		<select
			bind:value={formData.studentId}
			class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
			required
		>
			<option value="" disabled>-- Chọn sinh viên --</option>
			{#each students as s}
				<option value={s.id}>{s.lastname} {s.firstname}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="" class="mb-1 block font-medium">Môn học</label>
		<select
			bind:value={formData.courseId}
			class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
			required
		>
			<option value="" disabled>-- Chọn môn học --</option>
			{#each courses as c}
				<option value={c.id}>{c.name}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="" class="mb-1 block font-medium">Điểm</label>
		<input
			type="number"
			step="0.01"
			bind:value={formData.grade}
			class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
			placeholder="Nhập điểm..."
			required
		/>
	</div>

	<div class="flex justify-end gap-3">
		<button
			type="button"
			class="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
			on:click={handleCancel}
		>
			Hủy
		</button>
		<button
			type="submit"
			class="rounded-lg bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700"
		>
			Lưu
		</button>
	</div>
</form>
