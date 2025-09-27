<script>
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';

	export let initialValues = { name: '', code: '' };
	const dispatch = createEventDispatcher();
	let formData = { ...initialValues };

	function handleSubmit(e) {
		e.preventDefault();
		if (!formData.name || !formData.code) {
			toast.error('Vui lòng nhập đầy đủ thông tin phòng ban!');
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
		<label for="deptCode" class="mt-3 mb-1 block font-medium">Mã phòng ban</label>
		<input
			id="deptCode"
			type="text"
			bind:value={formData.code}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			placeholder="Nhập mã phòng ban..."
			required
		/>

		<label for="deptName" class="mb-1 block font-medium">Tên phòng ban</label>
		<input
			id="deptName"
			type="text"
			bind:value={formData.name}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			placeholder="Nhập tên phòng ban..."
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
