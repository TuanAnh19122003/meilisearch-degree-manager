<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';

	export let initialValues = {
		firstname: '',
		lastname: '',
		email: '',
		password: '',
		phone: '',
		roleId: null,
		is_active: true,
		image: null
	};

	const dispatch = createEventDispatcher();
	let formData = { ...initialValues, imageFile: null, imagePreview: '' };
	let roles: { id: number; name: string }[] = [];

	const API_URL = import.meta.env.VITE_API_URL;
	let token = '';
	if (typeof localStorage !== 'undefined') token = localStorage.getItem('token') || '';

	onMount(async () => {
		try {
			const res = await axios.get(`${API_URL}/roles`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {}
			});
			if (res.data.success) roles = res.data.data;
		} catch (err) {
			console.error(err);
			toast.error('Không thể tải danh sách vai trò');
		}

		if (formData.image) {
			formData.imagePreview = `${API_URL}/${formData.image}`;
		}
	});

	function handleFileChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			formData.imageFile = file;
			const reader = new FileReader();
			reader.onload = () => {
				formData.imagePreview = reader.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!formData.firstname || !formData.lastname || !formData.email || !formData.roleId) {
			toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
			return;
		}

		const payload = new FormData();
		payload.append('firstname', formData.firstname);
		payload.append('lastname', formData.lastname);
		payload.append('email', formData.email);
		payload.append('password', formData.password);
		payload.append('phone', formData.phone);
		payload.append('roleId', formData.roleId.toString());
		payload.append('is_active', formData.is_active.toString());

		if (formData.imageFile) payload.append('image', formData.imageFile);

		dispatch('submit', payload);
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="" class="mb-1 block font-medium">Họ</label>
			<input
				type="text"
				bind:value={formData.firstname}
				placeholder="Nhập họ"
				required
				class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
			/>
		</div>
		<div>
			<label for="" class="mb-1 block font-medium">Tên</label>
			<input
				type="text"
				bind:value={formData.lastname}
				placeholder="Nhập tên"
				required
				class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
			/>
		</div>
	</div>

	<div>
		<label for="" class="mb-1 block font-medium">Email</label>
		<input
			type="email"
			bind:value={formData.email}
			placeholder="Nhập email"
			required
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
		/>
	</div>

	<div>
		<label for="" class="mb-1 block font-medium">Mật khẩu</label>
		<input
			type="password"
			bind:value={formData.password}
			placeholder="Nhập mật khẩu"
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
		/>
	</div>

	<div>
		<label for="" class="mb-1 block font-medium">Điện thoại</label>
		<input
			type="text"
			bind:value={formData.phone}
			placeholder="Nhập số điện thoại"
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
		/>
	</div>

	<div>
		<label for="" class="mb-1 block font-medium">Vai trò</label>
		<select
			bind:value={formData.roleId}
			required
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
		>
			<option value="" disabled>Chọn vai trò</option>
			{#each roles as role}
				<option value={role.id}>{role.name}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="" class="mb-1 block font-medium">Ảnh đại diện</label>
		<input
			type="file"
			accept="image/*"
			on:change={handleFileChange}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
		/>
		{#if formData.imagePreview}
			<img
				src={formData.imagePreview}
				alt="Preview"
				class="mt-2 h-24 w-24 rounded-full object-cover"
			/>
		{/if}
	</div>

	<div class="flex items-center gap-4">
		<label class="inline-flex items-center">
			<input type="checkbox" bind:checked={formData.is_active} class="mr-2" /> Hoạt động
		</label>
	</div>

	<div class="flex justify-end gap-3">
		<button
			type="button"
			class="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
			on:click={handleCancel}
		>
			Hủy
		</button>
		<button
			type="submit"
			class="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
		>
			Lưu
		</button>
	</div>
</form>
