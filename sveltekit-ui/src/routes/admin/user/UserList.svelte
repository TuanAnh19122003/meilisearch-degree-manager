<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { MoreVertical } from 'lucide-svelte';
	import Pagination from '$lib/Pagination.svelte';
	import ActionMenu from '$lib/ActionMenu.svelte';

	export let users = [];
	export let pagination = { current: 1, pageSize: 6, total: 0 };
	export let viewMode: 'list' | 'card' = 'list';

	const dispatch = createEventDispatcher();

	let openMenuId: string | null = null;
	let menuPos = { top: 0, left: 0 };
	let currentItem: any = null;

	function toggleMenu(item, event) {
		if (openMenuId === item.id) {
			closeMenu();
			return;
		}
		const rect = event.currentTarget.getBoundingClientRect();
		menuPos = {
			top: rect.bottom + window.scrollY,
			left: rect.right - 160 + window.scrollX
		};
		openMenuId = item.id;
		currentItem = item;
	}

	function closeMenu() {
		openMenuId = null;
		currentItem = null;
	}

	function handleClickOutside(event) {
		if (openMenuId && !event.target.closest('.dropdown-trigger')) {
			closeMenu();
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	function handleView() {
		dispatch('view', currentItem);
		closeMenu();
	}
	function handleEdit() {
		dispatch('edit', currentItem);
		closeMenu();
	}
	function handleDelete() {
		dispatch('delete', currentItem.id);
		closeMenu();
	}

	function toggleViewMode(e) {
		dispatch('viewModeChange', e.target.checked ? 'card' : 'list');
	}

	function getInitials(lastname: string, firstname: string) {
		if (!lastname && !firstname) return '?';
		const last = lastname ? lastname.charAt(0).toUpperCase() : '';
		const first = firstname ? firstname.charAt(0).toUpperCase() : '';
		return last + first;
	}
</script>

<!-- View Toggle -->
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
	<!-- TABLE VIEW -->
	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
		<table class="w-full border-collapse text-sm">
			<thead class="bg-gray-50 text-gray-700">
				<tr>
					<th class="px-2 py-3 text-left font-medium">STT</th>
					<th class="px-4 py-3 text-left font-medium">Tên</th>
					<th class="px-4 py-3 text-left font-medium">Email</th>
					<th class="px-4 py-3 text-left font-medium">Điện thoại</th>
					<th class="px-4 py-3 text-left font-medium">Vai trò</th>
					<th class="px-4 py-3 text-left font-medium">Trạng thái</th>
					<th class="px-4 py-3 text-center font-medium">Hành động</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each users as item, index}
					<tr class="transition-colors hover:bg-gray-50">
						<td class="px-4 py-3 text-center text-gray-600">
							{(pagination.current - 1) * pagination.pageSize + index + 1}
						</td>
						<td class="px-4 py-3">{item.firstname} {item.lastname}</td>
						<td class="px-4 py-3">{item.email}</td>
						<td class="px-4 py-3">{item.phone ?? '-'}</td>
						<td class="px-4 py-3">{item.role?.name ?? '-'}</td>
						<td class="px-4 py-3">
							<span
								class={`rounded-full px-3 py-1 text-xs font-medium ${
									item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
								}`}
							>
								{item.is_active ? 'Hoạt động' : 'Ngưng hoạt động'}
							</span>
						</td>
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
		{#each users as item}
			<div class="relative flex items-center gap-4 rounded-xl bg-white p-4 shadow-md transition hover:shadow-lg">
				<div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-300 text-base font-semibold text-white">
					{#if item.image}
						<img src={`http://localhost:5000/${item.image}`} alt="Avatar" class="h-full w-full object-cover" />
					{:else}
						{getInitials(item.lastname, item.firstname)}
					{/if}
				</div>
				<div class="flex-1">
					<h3 class="text-base font-semibold text-gray-800">{item.firstname} {item.lastname}</h3>
					<p class="text-sm text-gray-500">{item.email}</p>
					<p class="text-sm text-gray-500">{item.role?.name ?? '-'}</p>
					<span
						class={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
							item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
						}`}
					>
						{item.is_active ? 'Hoạt động' : 'Ngưng hoạt động'}
					</span>
				</div>
				<div class="absolute top-2 right-2">
					<button class="dropdown-trigger rounded-lg p-2 hover:bg-gray-100" on:click={(e) => toggleMenu(item, e)}>
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
	on:view={handleView}
	on:edit={handleEdit}
	on:delete={handleDelete}
/>

<!-- Pagination -->
<Pagination
	current={pagination.current}
	pageSize={pagination.pageSize}
	total={pagination.total}
	on:pageChange={(e) => dispatch('pageChange', e.detail)}
	on:pageSizeChange={(e) => dispatch('pageSizeChange', e.detail)}
/>
