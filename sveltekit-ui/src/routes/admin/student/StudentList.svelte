<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { MoreVertical } from 'lucide-svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import ActionMenu from '$lib/components/ActionMenu.svelte';

	export let data = [];
	export let pagination = { current: 1, pageSize: 6, total: 0 };
	export let viewMode = 'list';

	const dispatch = createEventDispatcher();

	let openMenuId = null;
	let menuPos = { top: 0, left: 0 };
	let currentItem = null;

	// Tối ưu: Đóng menu khi dữ liệu thay đổi (chuyển trang)
	$: if (data) closeMenu();

	function toggleMenu(item, event) {
		if (openMenuId === item.id) return closeMenu();
		const rect = event.currentTarget.getBoundingClientRect();
		// Tối ưu: Tính toán vị trí menu chuẩn hơn
		menuPos = {
			top: rect.bottom + window.scrollY,
			left: rect.right - 128 + window.scrollX
		};
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

	// Tối ưu: Sử dụng cơ chế gộp các handler để giảm số lượng function khởi tạo
	function handleAction(type: 'view' | 'edit' | 'delete', payload) {
		dispatch(type, payload);
		closeMenu();
	}

	function toggleViewMode(e) {
		dispatch('viewModeChange', e.target.checked ? 'card' : 'list');
	}

	// Tối ưu: Memoize initials (tùy chọn) hoặc giữ hàm đơn giản
	function getInitials(lastname: string, firstname: string) {
		const last = (lastname || '').charAt(0).toUpperCase();
		const first = (firstname || '').charAt(0).toUpperCase();
		return last + first || '?';
	}
</script>

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
	<div class="overflow-x-auto rounded-xl shadow">
		<table class="w-full border-collapse bg-white text-sm">
			<thead class="bg-gray-50 text-gray-700">
				<tr>
					<th class="px-4 py-3 text-left font-medium">STT</th>
					<th class="px-4 py-3 text-left font-medium">Mã</th>
					<th class="px-4 py-3 text-left font-medium">Họ tên</th>
					<th class="px-4 py-3 text-left font-medium">Email</th>
					<th class="px-4 py-3 text-left font-medium">Ngành</th>
					<th class="px-4 py-3 text-center font-medium">GPA</th>
					<th class="px-4 py-3 text-center font-medium">Hành động</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data as item, index (item.id)}
					<tr class="transition-colors hover:bg-gray-50/50">
						<td class="px-4 py-3 text-gray-500">
							{(pagination.current - 1) * pagination.pageSize + index + 1}
						</td>
						<td class="px-4 py-3 font-medium text-blue-600">{item.code}</td>
						<td class="px-4 py-3">{item.lastname} {item.firstname}</td>
						<td class="px-4 py-3 text-gray-600">{item.email}</td>
						<td class="px-4 py-3">{item.major?.name ?? '-'}</td>
						<td class="px-4 py-3 text-center">
							<span class="rounded bg-blue-50 px-2 py-1 font-semibold text-blue-700">
								{item.gpa ?? '-'}
							</span>
						</td>
						<td class="px-4 py-3 text-center">
							<button
								class="dropdown-trigger rounded-full p-2 transition-colors hover:bg-gray-200"
								on:click|stopPropagation={(e) => toggleMenu(item, e)}
							>
								<MoreVertical class="h-4 w-4 text-gray-600" />
							</button>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="py-10 text-center text-gray-400">Không tìm thấy sinh viên nào</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data as item (item.id)}
			<div
				class="relative flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
			>
				<div class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
					{#if item.image}
						<img
							src={`http://localhost:5000/${item.image}`}
							alt=""
							class="h-full w-full object-cover"
						/>
					{:else}
						<div
							class="flex h-full w-full items-center justify-center bg-blue-100 font-bold text-blue-600"
						>
							{getInitials(item.lastname, item.firstname)}
						</div>
					{/if}
				</div>
				<div class="min-w-0 flex-1">
					<h3 class="truncate font-semibold text-gray-800">{item.lastname} {item.firstname}</h3>
					<p class="truncate text-xs text-gray-500">{item.email}</p>
					<p class="mt-1 text-xs font-medium text-blue-600">{item.major?.name ?? '-'}</p>
				</div>
				<button
					class="dropdown-trigger absolute top-2 right-2 rounded-full p-1.5 hover:bg-gray-100"
					on:click|stopPropagation={(e) => toggleMenu(item, e)}
				>
					<MoreVertical class="h-4 w-4 text-gray-500" />
				</button>
			</div>
		{/each}
	</div>
{/if}

<ActionMenu
	open={!!openMenuId}
	position={menuPos}
	item={currentItem}
	on:view={(e) => handleAction('view', e.detail)}
	on:edit={(e) => handleAction('edit', e.detail)}
	on:delete={(e) => handleAction('delete', e.detail)}
/>

<div class="mt-6">
	<Pagination
		current={pagination.current}
		pageSize={pagination.pageSize}
		total={pagination.total}
		on:pageChange
		on:pageSizeChange
	/>
</div>
