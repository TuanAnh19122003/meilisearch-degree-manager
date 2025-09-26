<script>
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';

	export let initialValues = { name: '', code: '' };

	const dispatch = createEventDispatcher();
	let formData = { ...initialValues };

	function handleSubmit(e) {
		e.preventDefault();

		if (!formData.name || !formData.code) {
			toast.error('Vui lòng nhập đầy đủ thông tin vai trò!');
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
		<label for="roleCode" class="mt-3 mb-1 block font-medium">Mã vai trò</label>
		<input
			id="roleCode"
			type="text"
			bind:value={formData.code}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			placeholder="Nhập mã vai trò..."
			required
		/>

		<label for="roleName" class="mb-1 block font-medium">Tên vai trò</label>
		<input
			id="roleName"
			type="text"
			bind:value={formData.name}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			placeholder="Nhập tên vai trò..."
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
