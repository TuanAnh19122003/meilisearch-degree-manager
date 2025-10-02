<script>
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';

	export let initialValues = { code: '', name: '', credit: 1 };

	const dispatch = createEventDispatcher();
	let formData = { ...initialValues };

	function handleSubmit(e) {
		e.preventDefault();
		if (!formData.code || !formData.name || !formData.credit) {
			toast.error('Vui lòng nhập đầy đủ thông tin môn học!');
			return;
		}
		dispatch('submit', formData);
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<form class="space-y-4 p-6 bg-white rounded-xl shadow-lg w-full max-w-md" on:submit|preventDefault={handleSubmit}>
	<div>
		<label for="" class="mb-1 block font-medium">Mã môn học</label>
		<input
			type="text"
			bind:value={formData.code}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
			placeholder="Nhập mã môn học..."
			required
		/>

		<label for="" class="mt-3 mb-1 block font-medium">Tên môn học</label>
		<input
			type="text"
			bind:value={formData.name}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
			placeholder="Nhập tên môn học..."
			required
		/>

		<label for="" class="mt-3 mb-1 block font-medium">Số tín chỉ</label>
		<input
			type="number"
			min="1"
			bind:value={formData.credit}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
			placeholder="Nhập số tín chỉ..."
			required
		/>
	</div>

	<div class="flex justify-end gap-3">
		<button
			type="button"
			class="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
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
