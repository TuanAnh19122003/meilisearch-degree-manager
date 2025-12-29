<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';

	export let initialValues: any = {
		code: '',
		firstname: '',
		lastname: '',
		email: '',
		phone: '',
		dob: '',
		address: '',
		majorId: '',
		major: null,
		image: null
	};

	const dispatch = createEventDispatcher();
	let formData = {
		...initialValues,
		majorId: initialValues?.majorId ? String(initialValues.majorId) : ''
	};

	let previewUrl = formData.image ? URL.createObjectURL(formData.image) : '';
	let majors: any[] = [];

	$: computedMajors = (() => {
		if (!formData.majorId) return majors;

		const exists = majors.some((m) => String(m.id) === String(formData.majorId));

		if (exists) return majors;

		// ⭐ thêm major của sinh viên đang sửa
		if (initialValues?.major) {
			return [initialValues.major, ...majors];
		}

		return majors;
	})();

	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';

	onMount(async () => {
		token = localStorage.getItem('token') || '';
		await fetchMajors();
	});

	function getAuthHeader() {
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchMajors() {
		try {
			const res = await axios.get(`${API_URL}/majors`, { headers: getAuthHeader() });
			majors = res.data.data;
		} catch (err) {
			console.error(err);
			toast.error('Lỗi tải danh sách chuyên ngành');
		}
	}

	function handleFileChange(e) {
		const file = e.target.files[0];
		if (!file) return;
		formData.image = file;
		previewUrl = URL.createObjectURL(file);
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (!formData.code || !formData.firstname || !formData.lastname || !formData.majorId) {
			toast.error('Vui lòng nhập đầy đủ thông tin!');
			return;
		}

		// tạo FormData để gửi file + dữ liệu
		const payload = new FormData();
		for (const key in formData) {
			if (formData[key] !== null) payload.append(key, formData[key]);
		}

		dispatch('submit', payload);
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<!-- Modal backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
	<!-- Scrollable container -->
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<div class="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white p-6 shadow-lg">
		<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
			<!-- Các input như trước -->
			<div>
				<label class="mb-1 block font-medium">Mã sinh viên</label>
				<input
					type="text"
					bind:value={formData.code}
					class="w-full rounded-lg border px-3 py-2"
					required
				/>

				<label class="mb-1 block font-medium">Họ</label>
				<input
					type="text"
					bind:value={formData.lastname}
					class="w-full rounded-lg border px-3 py-2"
					required
				/>

				<label class="mb-1 block font-medium">Tên</label>
				<input
					type="text"
					bind:value={formData.firstname}
					class="w-full rounded-lg border px-3 py-2"
					required
				/>

				<label class="mb-1 block font-medium">Email</label>
				<input
					type="email"
					bind:value={formData.email}
					class="w-full rounded-lg border px-3 py-2"
				/>

				<label class="mb-1 block font-medium">Phone</label>
				<input type="text" bind:value={formData.phone} class="w-full rounded-lg border px-3 py-2" />

				<label class="mb-1 block font-medium">Ngày sinh</label>
				<input type="date" bind:value={formData.dob} class="w-full rounded-lg border px-3 py-2" />

				<label class="mb-1 block font-medium">Địa chỉ</label>
				<textarea bind:value={formData.address} class="w-full rounded-lg border px-3 py-2"
				></textarea>

				<label class="mb-1 block font-medium">Chuyên ngành</label>
				<select bind:value={formData.majorId} class="w-full rounded-lg border px-3 py-2" required>
					<option value="" disabled>-- Chọn chuyên ngành --</option>
					{#each computedMajors as m}
						<option value={String(m.id)}>
							{m.name}
						</option>
					{/each}
				</select>

				<label class="mb-1 block font-medium">Ảnh đại diện</label>
				<input
					type="file"
					accept="image/*"
					on:change={handleFileChange}
					class="w-full rounded-lg border px-3 py-2"
				/>
				{#if previewUrl}
					<img src={previewUrl} alt="Preview" class="mt-2 h-24 w-24 rounded-full object-cover" />
				{/if}
			</div>

			<div class="mt-4 flex justify-end gap-3">
				<button
					type="button"
					class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
					on:click={handleCancel}
				>
					Hủy
				</button>
				<button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
					Lưu
				</button>
			</div>
		</form>
	</div>
</div>
