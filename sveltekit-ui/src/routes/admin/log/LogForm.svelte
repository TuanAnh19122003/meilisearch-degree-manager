<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';

	const dispatch = createEventDispatcher();

	export let initialValues = null;

	let form = {
		action: '',
		target_type: '',
		target_id: '',
		ip: ''
	};

	if (initialValues) form = { ...form, ...initialValues };

	function handleSubmit() {
		if (!form.action) {
			toast.error('Hành động là bắt buộc');
			return;
		}
		dispatch('submit', { ...form });
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<div class="space-y-4">
	<div>
		<label for="" class="mb-1 block text-sm font-medium">Hành động</label>
		<input type="text" bind:value={form.action} class="w-full rounded border px-3 py-2" />
	</div>
	<div>
		<label for="" class="mb-1 block text-sm font-medium">Target Type</label>
		<input type="text" bind:value={form.target_type} class="w-full rounded border px-3 py-2" />
	</div>
	<div>
		<label for="" class="mb-1 block text-sm font-medium">Target ID</label>
		<input type="number" bind:value={form.target_id} class="w-full rounded border px-3 py-2" />
	</div>
	<div>
		<label for="" class="mb-1 block text-sm font-medium">IP</label>
		<input type="text" bind:value={form.ip} class="w-full rounded border px-3 py-2" />
	</div>

	<div class="flex justify-end gap-2">
		<button class="rounded bg-gray-200 px-4 py-2" on:click={handleCancel}>Hủy</button>
		<button class="rounded bg-blue-600 px-4 py-2 text-white" on:click={handleSubmit}>Lưu</button>
	</div>
</div>
