<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { MoreVertical } from 'lucide-svelte';
	import ActionMenu from '$lib/ActionMenu.svelte';
	import Pagination from '$lib/Pagination.svelte';

	export let data = [];
	export let pagination = { current: 1, pageSize: 6, total: 0 };
	export let viewMode: 'list' | 'card' = 'list';

	const dispatch = createEventDispatcher();

	let openMenuId: number | null = null;
	let menuPos = { top: 0, left: 0 };
	let currentItem: any = null;

	function toggleMenu(item, event) {
		if (openMenuId === item.id) {
			closeMenu();
			return;
		}
		const rect = event.currentTarget.getBoundingClientRect();
		menuPos = { top: rect.bottom + window.scrollY, left: rect.right - 128 + window.scrollX };
		openMenuId = item.id;
		currentItem = item;
	}
	function closeMenu() {
		openMenuId = null;
		currentItem = null;
	}
	function handleClickOutside(event) {
		if (openMenuId && !event.target.closest('.dropdown-trigger')) closeMenu();
	}
	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	function handleView(item) {
		dispatch('view', item);
		closeMenu();
	}
	function handleEdit(item) {
		dispatch('edit', item);
		closeMenu();
	}
	function handleDelete(id) {
		dispatch('delete', id);
		closeMenu();
	}
	function toggleViewMode(e) {
		dispatch('viewModeChange', e.target.checked ? 'card' : 'list');
	}

</script>

<!-- Toggle view -->
<div class="mb-4 flex items-center justify-end">
	<label class="inline-flex cursor-pointer items-center">
		<span class="mr-2 text-sm text-gray-600">Danh sách</span>
		<div class="relative">
			<input
				type="checkbox"
				class="peer sr-only"
				checked={viewMode === 'card'}
				on:change={toggleViewMode}
			/>
			<div class="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-blue-500"></div>
			<div
				class="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"
			></div>
		</div>
		<span class="ml-2 text-sm text-gray-600">Thẻ</span>
	</label>
</div>

{#if viewMode === 'list'}
	<!-- LIST VIEW -->
	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
		<table class="w-full border-collapse text-sm">
			<thead class="bg-gray-50 text-gray-700">
				<tr>
					<th class="px-2 py-3 text-left font-medium">STT</th>
					<th class="px-4 py-3 text-left font-medium">Mã chuyên ngành</th>
					<th class="px-4 py-3 text-left font-medium">Tên chuyên ngành</th>
					<th class="px-4 py-3 text-left font-medium">Phòng ban</th>
					<th class="px-4 py-3 text-center font-medium">Hành động</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data as item, index}
					<tr class="transition-colors hover:bg-gray-50">
						<td class="px-4 py-3 text-center text-gray-600">
							{(pagination.current - 1) * pagination.pageSize + index + 1}
						</td>
						<td class="px-4 py-3 font-mono text-blue-600">{item.code}</td>
						<td class="px-4 py-3">{item.name}</td>
						<td class="px-4 py-3">{item.department?.name}</td>
						<td class="px-4 py-3 text-center">
							<button
								class="dropdown-trigger rounded-lg p-2 hover:bg-gray-100"
								on:click={(e) => toggleMenu(item, e)}
							>
								<MoreVertical class="h-4 w-4 text-gray-600" />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<!-- CARD VIEW -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data as item}
			<div
				class="relative flex flex-col gap-2 rounded-xl bg-white p-4 shadow-md transition hover:shadow-lg"
			>
				<div class="flex-1">
					<h3 class="text-base font-semibold text-gray-800">{item.name}</h3>
					<p class="text-sm text-gray-500">Mã: {item.code}</p>
					<p class="text-sm text-gray-500">Phòng ban: {item.department?.name}</p>
				</div>
				<div class="absolute top-2 right-2">
					<button
						class="dropdown-trigger rounded-lg p-2 hover:bg-gray-100"
						on:click={(e) => toggleMenu(item, e)}
					>
						<MoreVertical class="h-4 w-4 text-gray-600" />
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}

<!-- Dropdown menu -->
<ActionMenu
	open={!!openMenuId}
	position={menuPos}
	item={currentItem}
	on:view={(e) => handleView(e.detail)}
	on:edit={(e) => handleEdit(e.detail)}
	on:delete={(e) => handleDelete(e.detail)}
/>

<!-- Pagination -->
<Pagination
	current={pagination.current}
	pageSize={pagination.pageSize}
	total={pagination.total}
	on:pageChange={(e) => dispatch('pageChange', e.detail)}
	on:pageSizeChange={(e) => dispatch('pageSizeChange', e.detail)}
/>

