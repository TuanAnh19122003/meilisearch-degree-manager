<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';

	const dispatch = createEventDispatcher();
	export let initialValues: any = null;

	// 1. Khởi tạo cấu trúc form sạch
	let formData = {
		code: '',
		firstname: '',
		lastname: '',
		email: '',
		phone: '',
		dob: '',
		address: '',
		majorId: '',
		image: null as File | null
	};

	let previewUrl = '';
	let majors: any[] = [];
	let currentEditId = null; // Biến tạm để chặn lag khi re-render trang lớn

	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';

	// 2. CHỈ cập nhật dữ liệu vào form khi ID thay đổi (Bấm nút Sửa mới)
	// Điều này cực kỳ quan trọng để tránh việc Svelte cố gắng tính toán lại form mỗi khi danh sách trang 1000 thay đổi ngầm
	$: if (initialValues && initialValues.id !== currentEditId) {
		currentEditId = initialValues.id;
		formData = {
			code: initialValues.code ?? '',
			firstname: initialValues.firstname ?? '',
			lastname: initialValues.lastname ?? '',
			email: initialValues.email ?? '',
			phone: initialValues.phone ?? '',
			dob: initialValues.dob ?? '',
			address: initialValues.address ?? '',
			majorId: initialValues.majorId ? String(initialValues.majorId) : '',
			image: null // Reset file input khi chuyển record
		};

		// Xử lý ảnh cũ nếu có
		if (initialValues.image) {
			previewUrl = `http://localhost:5000/${initialValues.image}`;
		} else {
			previewUrl = '';
		}
	}

	// 3. Tối ưu danh sách chuyên ngành (Majors)
	$: computedMajors = (() => {
		let baseList = [...majors];
		if (initialValues?.major) {
			const exists = baseList.some((m) => String(m.id) === String(initialValues.major.id));
			if (!exists) return [initialValues.major, ...baseList];
		}
		return baseList;
	})();

	onMount(async () => {
		token = localStorage.getItem('token') || '';
		await fetchMajors();
	});

	// Thu hồi bộ nhớ khi đóng form
	onDestroy(() => {
		if (previewUrl && previewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(previewUrl);
		}
	});

	async function fetchMajors() {
		try {
			const res = await axios.get(`${API_URL}/majors`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {}
			});
			majors = res.data.data || [];
		} catch (err) {
			console.error(err);
			toast.error('Lỗi tải danh sách chuyên ngành');
		}
	}

	function handleFileChange(e: any) {
		const file = e.target.files[0];
		if (!file) return;

		// Giải phóng bộ nhớ ảnh cũ nếu là ảnh preview mới (blob)
		if (previewUrl && previewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(previewUrl);
		}

		formData.image = file;
		previewUrl = URL.createObjectURL(file);
	}

	function handleSubmit() {
		if (!formData.code || !formData.firstname || !formData.lastname || !formData.majorId) {
			toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
			return;
		}

		const payload = new FormData();
		// Lặp qua object để append vào FormData
		Object.keys(formData).forEach((key) => {
			if (formData[key] !== null) {
				payload.append(key, formData[key]);
			}
		});

		dispatch('submit', payload);
	}

	function handleCancel() {
		currentEditId = null;
		dispatch('cancel');
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
	<div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
		<h3 class="mb-4 text-xl font-bold text-gray-800">
			{initialValues ? 'Cập nhật sinh viên' : 'Thêm sinh viên mới'}
		</h3>
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<form on:submit|preventDefault={handleSubmit} class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="mb-1 block text-sm font-medium">Mã SV *</label>
					<input
						type="text"
						bind:value={formData.code}
						class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium">Chuyên ngành *</label>
					<select
						bind:value={formData.majorId}
						class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
						required
					>
						<option value="" disabled>-- Chọn --</option>
						{#each computedMajors as m (m.id)}
							<option value={String(m.id)}>{m.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="mb-1 block text-sm font-medium">Họ *</label>
					<input
						type="text"
						bind:value={formData.lastname}
						class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium">Tên *</label>
					<input
						type="text"
						bind:value={formData.firstname}
						class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium">Email</label>
				<input
					type="email"
					bind:value={formData.email}
					class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="mb-1 block text-sm font-medium">Số điện thoại</label>
					<input
						type="text"
						bind:value={formData.phone}
						class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium">Ngày sinh</label>
					<input
						type="date"
						bind:value={formData.dob}
						class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium">Địa chỉ</label>
				<textarea
					bind:value={formData.address}
					rows="2"
					class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
				></textarea>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium">Ảnh đại diện</label>
				<input type="file" accept="image/*" on:change={handleFileChange} class="w-full text-sm" />
				{#if previewUrl}
					<div class="mt-2 flex justify-center">
						<img
							src={previewUrl}
							alt="Preview"
							class="h-20 w-20 rounded-full border-2 border-blue-100 object-cover shadow-sm"
						/>
					</div>
				{/if}
			</div>

			<div class="mt-6 flex justify-end gap-3 border-t pt-4">
				<button
					type="button"
					on:click={handleCancel}
					class="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-200"
				>
					Hủy
				</button>
				<button
					type="submit"
					class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-blue-700"
				>
					Lưu thông tin
				</button>
			</div>
		</form>
	</div>
</div>
