<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Eye, Pencil, Trash2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-svelte';

	export let data: any[] = [];
	export let pagination = { current: 1, pageSize: 6, total: 0 };
	export let viewMode: 'list' | 'card' = 'list';

	const dispatch = createEventDispatcher();

	let openMenuId: string | null = null;
	let menuPos = { top: 0, left: 0 };
	let currentItem: any = null;

	function toggleMenu(item, event) {
		if (openMenuId === item.id) return closeMenu();
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
		if (openMenuId && !(event.target as HTMLElement).closest('.dropdown-trigger')) closeMenu();
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

	$: totalPages = Math.ceil(pagination.total / pagination.pageSize);

	function getPagesToShow(current, total) {
		const delta = 2;
		const pages = [];
		for (let i = 1; i <= total; i++) {
			if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) pages.push(i);
		}
		const result = [];
		let last = 0;
		for (const page of pages) {
			if (page - last > 1) result.push('...');
			result.push(page);
			last = page;
		}
		return result;
	}

	function statusClass(status: string) {
		switch (status) {
			case 'issued':
				return 'bg-green-100 text-green-700';
			case 'revoked':
				return 'bg-red-100 text-red-700';
			case 'draft':
				return 'bg-yellow-100 text-yellow-700';
			default:
				return 'bg-gray-100 text-gray-600';
		}
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
				on:change={(e) =>
					dispatch('viewModeChange', (e.target as HTMLInputElement).checked ? 'card' : 'list')}
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
	<table
		class="w-full border-collapse rounded-xl border border-gray-200 bg-white text-sm shadow-sm"
	>
		<thead class="bg-gray-50 text-gray-700">
			<tr>
				<th class="px-2 py-3">#</th>
				<th class="px-4 py-3 text-left">Sinh viên</th>
				<th class="px-4 py-3 text-left">Loại</th>
				<th class="px-4 py-3 text-left">Số hiệu</th>
				<th class="px-4 py-3 text-left">Ngày tốt nghiệp</th>
				<th class="px-4 py-3 text-left">Trạng thái</th>
				<th class="px-4 py-3 text-center">Hành động</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-100">
			{#each data as item, index}
				<tr class="hover:bg-gray-50">
					<td class="px-4 py-3 text-center"
						>{(pagination.current - 1) * pagination.pageSize + index + 1}</td
					>
					<td class="px-4 py-3">{item.student?.lastname} {item.student?.firstname}</td>
					<td class="px-4 py-3">{item.type}</td>
					<td class="px-4 py-3">{item.number}</td>
					<td class="px-4 py-3">{item.grad_date}</td>
					<td class="px-4 py-3">
						<span
							class={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}
						>
							{item.status === 'issued'
								? 'Đã cấp'
								: item.status === 'revoked'
									? 'Thu hồi'
									: 'Bản nháp'}
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
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data as item}
			<div class="relative flex flex-col gap-2 rounded-xl bg-white p-4 shadow-md hover:shadow-lg">
				<h3 class="font-semibold">{item.student?.lastname} {item.student?.firstname}</h3>
				<p>Loại: {item.type}</p>
				<p>Số hiệu: {item.number}</p>
				<p>Ngày tốt nghiệp: {item.grad_date}</p>
				<span class={`inline-block px-2 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
					{item.status === 'issued' ? 'Đã cấp' : item.status === 'revoked' ? 'Thu hồi' : 'Bản nháp'}
				</span>
				{#if item.file_url}
					<a href={item.file_url} target="_blank" class="text-xs text-blue-600 underline"
						>Xem file</a
					>
				{/if}
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

{#if openMenuId && currentItem}
	<div
		class="fixed z-50 w-32 rounded-lg bg-white shadow-md"
		style="top:{menuPos.top}px; left:{menuPos.left}px"
	>
		<button
			class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
			on:click={() => handleView(currentItem)}
		>
			<Eye class="h-4 w-4 text-gray-600" /> Xem
		</button>
		<button
			class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
			on:click={() => handleEdit(currentItem)}
		>
			<Pencil class="h-4 w-4 text-blue-600" /> Sửa
		</button>
		<button
			class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
			on:click={() => handleDelete(currentItem.id)}
		>
			<Trash2 class="h-4 w-4" /> Xóa
		</button>
	</div>
{/if}

<!-- Pagination -->
<div class="mt-6 flex items-center justify-between text-sm">
	<span class="text-gray-600">Trang {pagination.current} / {totalPages}</span>
	<div class="flex items-center gap-1">
		<button
			class="flex items-center rounded-full border border-gray-300 px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50"
			on:click={() => dispatch('pageChange', pagination.current - 1)}
			disabled={pagination.current <= 1}
		>
			<ChevronLeft class="h-4 w-4" />
		</button>
		{#each getPagesToShow(pagination.current, totalPages) as page}
			{#if page === '...'}
				<span class="px-2 text-gray-400">...</span>
			{:else}
				<button
					class={`rounded-full border px-3 py-1.5 ${
						pagination.current === page
							? 'border-blue-500 bg-blue-500 text-white'
							: 'border-gray-300 hover:bg-gray-100'
					}`}
					on:click={() => dispatch('pageChange', page)}
				>
					{page}
				</button>
			{/if}
		{/each}
		<button
			class="flex items-center rounded-full border border-gray-300 px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50"
			on:click={() => dispatch('pageChange', pagination.current + 1)}
			disabled={pagination.current >= totalPages}
		>
			<ChevronRight class="h-4 w-4" />
		</button>
	</div>
</div>
