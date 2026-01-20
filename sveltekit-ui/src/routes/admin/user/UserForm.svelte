<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';

	export let initialValues: any = null;
	const dispatch = createEventDispatcher();

	const API_URL = import.meta.env.VITE_API_URL;
	let roles: any[] = [];
	let formData: any = {
		firstname: '',
		lastname: '',
		email: '',
		password: '',
		phone: '',
		roleId: '',
		is_active: true,
		image: null
	};

	onMount(async () => {
		try {
			const res = await axios.get(`${API_URL}/roles`);
			if (res.data.success) roles = res.data.data;
		} catch (err) {
			console.error(err);
			toast.error('Không tải được danh sách vai trò');
		}

		if (initialValues) {
			formData = {
				...formData,
				...initialValues,
				password: '' // Luôn để trống khi load form edit để an toàn
			};
		}
	});

	function handleFileChange(e) {
		const file = e.target.files[0];
		if (file) {
			formData.image = file;
		}
	}

	function handleSubmit(e) {
		e.preventDefault();

		// 1. Kiểm tra các thông tin cơ bản
		if (!formData.firstname || !formData.lastname || !formData.email || !formData.roleId) {
			toast.error('Vui lòng nhập đầy đủ thông tin!');
			return;
		}

		// 2. Logic Mật khẩu quan trọng:
		// Nếu là tạo mới (!initialValues) thì BẮT BUỘC có mật khẩu
		if (!initialValues && !formData.password) {
			toast.error('Vui lòng nhập mật khẩu cho tài khoản mới!');
			return;
		}

		const payload = new FormData();
		for (const key in formData) {
			// 3. Xử lý gửi mật khẩu:
			// Nếu đang Edit và ô mật khẩu trống -> Bỏ qua không gửi (để giữ pass cũ)
			if (key === 'password' && initialValues && !formData.password) {
				continue;
			}

			if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
				payload.append(key, formData[key]);
			}
		}

		dispatch('submit', payload);
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="" class="mb-1 block text-sm font-medium">Họ</label>
			<input
				type="text"
				bind:value={formData.firstname}
				class="w-full rounded border px-3 py-2"
				placeholder="VD: Trịnh"
			/>
		</div>
		<div>
			<label for="" class="mb-1 block text-sm font-medium">Tên</label>
			<input
				type="text"
				bind:value={formData.lastname}
				class="w-full rounded border px-3 py-2"
				placeholder="VD: Tuấn Anh"
			/>
		</div>
	</div>

	<div>
		<label for="" class="mb-1 block text-sm font-medium">Email</label>
		<input
			type="email"
			bind:value={formData.email}
			class="w-full rounded border px-3 py-2"
			placeholder="example@epu.edu.vn"
		/>
	</div>

	<div>
		<label for="" class="mb-1 block text-sm font-medium">
			Mật khẩu
			{#if initialValues}
				<span class="text-xs font-normal text-gray-500">(Để trống nếu không muốn đổi)</span>
			{/if}
		</label>
		<input
			type="password"
			bind:value={formData.password}
			class="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
			placeholder={initialValues ? '••••••••' : 'Nhập mật khẩu mới'}
		/>
	</div>

	<div>
		<label for="" class="mb-1 block text-sm font-medium">Số điện thoại</label>
		<input
			type="text"
			bind:value={formData.phone}
			class="w-full rounded border px-3 py-2"
			placeholder="034..."
		/>
	</div>

	<div>
		<label for="" class="mb-1 block text-sm font-medium">Vai trò</label>
		<select bind:value={formData.roleId} class="w-full rounded border px-3 py-2">
			<option value="">-- Chọn vai trò --</option>
			{#each roles as role}
				<option value={role.id}>{role.name}</option>
			{/each}
		</select>
	</div>

	<div class="flex items-center gap-2">
		<input type="checkbox" id="active" bind:checked={formData.is_active} class="h-4 w-4" />
		<label for="active" class="text-sm">Tài khoản đang hoạt động</label>
	</div>

	<div class="rounded-lg border border-dashed border-gray-300 p-4">
		<label for="" class="mb-2 block text-sm font-medium">Ảnh đại diện</label>
		<input type="file" accept="image/*" on:change={handleFileChange} class="text-sm" />

		{#if formData.image && typeof formData.image !== 'string'}
			<p class="mt-2 text-center text-xs font-medium text-blue-600 italic">
				Đã chọn ảnh mới: {formData.image.name}
			</p>
		{:else if initialValues?.image}
			<div class="mt-2 flex items-center gap-3">
				<img
					src={`http://localhost:5000/${initialValues.image}`}
					alt="current"
					class="h-12 w-12 rounded-full border object-cover"
				/>
				<span class="text-xs text-gray-400 italic">Ảnh hiện tại</span>
			</div>
		{/if}
	</div>

	<div class="flex justify-end gap-3 pt-4">
		<button
			type="button"
			class="rounded bg-gray-100 px-6 py-2 font-medium text-gray-600 hover:bg-gray-200"
			on:click={handleCancel}>Hủy</button
		>
		<button
			type="submit"
			class="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
			>Lưu thông tin</button
		>
	</div>
</form>
