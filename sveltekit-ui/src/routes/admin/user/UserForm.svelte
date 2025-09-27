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
				password: '' // không load mật khẩu cũ
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

		if (!formData.firstname || !formData.lastname || !formData.email || !formData.roleId) {
			toast.error('Vui lòng nhập đầy đủ thông tin!');
			return;
		}

		const payload = new FormData();
		for (const key in formData) {
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
			<label for="" class="mb-1 block text-sm">Họ</label>
			<input type="text" bind:value={formData.firstname} class="w-full rounded border px-3 py-2" />
		</div>
		<div>
			<label for="" class="mb-1 block text-sm">Tên</label>
			<input type="text" bind:value={formData.lastname} class="w-full rounded border px-3 py-2" />
		</div>
	</div>

	<div>
		<label for="" class="mb-1 block text-sm">Email</label>
		<input type="email" bind:value={formData.email} class="w-full rounded border px-3 py-2" />
	</div>

	{#if !initialValues}
		<div>
			<label for="" class="mb-1 block text-sm">Mật khẩu</label>
			<input
				type="password"
				bind:value={formData.password}
				class="w-full rounded border px-3 py-2"
			/>
		</div>
	{/if}

	<div>
		<label for="" class="mb-1 block text-sm">Số điện thoại</label>
		<input type="text" bind:value={formData.phone} class="w-full rounded border px-3 py-2" />
	</div>

	<div>
		<label for="" class="mb-1 block text-sm">Vai trò</label>
		<select bind:value={formData.roleId} class="w-full rounded border px-3 py-2">
			<option value="">-- Chọn vai trò --</option>
			{#each roles as role}
				<option value={role.id}>{role.name}</option>
			{/each}
		</select>
	</div>

	<div class="flex items-center gap-2">
		<input type="checkbox" bind:checked={formData.is_active} />
		<label for="">Hoạt động</label>
	</div>

	<div>
		<label for="" class="mb-1 block text-sm">Ảnh</label>
		<input type="file" accept="image/*" on:change={handleFileChange} />
		{#if initialValues?.image}
			<img
				src={`http://localhost:5000/${initialValues.image}`}
				alt="preview"
				class="mt-2 h-16 w-16 rounded-full object-cover"
			/>
		{/if}
	</div>

	<div class="flex justify-end gap-3">
		<button type="button" class="rounded bg-gray-200 px-4 py-2" on:click={handleCancel}>Hủy</button>
		<button type="submit" class="rounded bg-blue-600 px-4 py-2 text-white">Lưu</button>
	</div>
</form>
