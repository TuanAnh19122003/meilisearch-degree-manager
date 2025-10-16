<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Eye, Pencil, Trash2, Printer } from 'lucide-svelte';

	export let open = false;
	export let position = { top: 0, left: 0 };
	export let item: any = null;
	export let showPrint = false;

	const dispatch = createEventDispatcher();

	function handleView() {
		dispatch('view', item);
	}
	function handleEdit() {
		dispatch('edit', item);
	}
	function handleDelete() {
		dispatch('delete', item.id);
	}
	function handlePrint() {
		dispatch('print', item);
	}
</script>

{#if open && item}
	<div
		class="animate-fade-in absolute z-20 min-w-[160px] rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5"
		style="top:{position.top}px; left:{position.left}px;"
	>
		<ul class="py-1 text-sm font-medium">
			<li>
				<button
					class="flex w-full items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50"
					on:click={handleView}
				>
					<Eye class="h-4 w-4" /> Xem
				</button>
			</li>
			<li>
				<button
					class="flex w-full items-center gap-2 px-4 py-2 text-yellow-600 hover:bg-yellow-50"
					on:click={handleEdit}
				>
					<Pencil class="h-4 w-4" /> Sửa
				</button>
			</li>
			{#if showPrint}
				<li>
					<button
						class="flex w-full items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50"
						on:click={handlePrint}
					>
						<Printer class="h-4 w-4" /> In
					</button>
				</li>
			{/if}
			<li>
				<button
					class="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
					on:click={handleDelete}
				>
					<Trash2 class="h-4 w-4" /> Xóa
				</button>
			</li>
		</ul>
	</div>
{/if}

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fade-in 0.15s ease-out;
	}
</style>
