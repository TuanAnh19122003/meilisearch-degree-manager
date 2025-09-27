<script>
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';

	export let initialValues = { name: '', code: '', deptId: '' };
	export let departments = [];
	const dispatch = createEventDispatcher();
	let formData = { ...initialValues };

	function handleSubmit(e) {
		e.preventDefault();
		if (!formData.name || !formData.code || !formData.deptId) {
			toast.error('Vui lòng nhập đầy đủ thông tin ngành học!');
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
		<label for="" class="mb-1 block font-medium">Mã ngành</label>
		<input
			bind:value={formData.code}
			placeholder="Nhập mã ngành"
			class="w-full rounded-lg border px-3 py-2"
		/>

		<label for="" class="mb-1 block font-medium">Tên ngành</label>
		<input
			bind:value={formData.name}
			placeholder="Nhập tên ngành"
			class="w-full rounded-lg border px-3 py-2"
		/>

		<label for="" class="mb-1 block font-medium">Phòng ban</label>
		<select bind:value={formData.deptId} class="w-full rounded-lg border px-3 py-2">
			<option value="">-- Chọn phòng ban --</option>
			{#each departments as dept}
				<option value={dept.id}>{dept.name}</option>
			{/each}
		</select>
	</div>

	<div class="flex justify-end gap-3">
		<button type="button" class="rounded bg-gray-200 px-4 py-2" on:click={handleCancel}>Hủy</button>
		<button type="submit" class="rounded bg-blue-600 px-4 py-2 text-white">Lưu</button>
	</div>
</form>
