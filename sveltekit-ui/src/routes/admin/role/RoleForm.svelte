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
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<div>
		<label class="mb-1 mt-3 block font-medium">Mã vai trò</label>
		<input
			type="text"
			bind:value={formData.code}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			placeholder="Nhập mã vai trò..."
			required
		/>

		<label class="mb-1 block font-medium">Tên vai trò</label>
		<input
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
