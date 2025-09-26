<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import {
		Eye,
		Pencil,
		Trash2,
		MoreVertical,
		ChevronLeft,
		ChevronRight,
		CheckCircle,
		XCircle
	} from 'lucide-svelte';

	export let data = [];
	export let pagination = { current: 1, pageSize: 6, total: 0 };
	export let viewMode = 'list';

	const dispatch = createEventDispatcher();

	let openMenuId = null;
	let menuPos = { top: 0, left: 0 };
	let currentItem = null;

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

	$: totalPages = Math.ceil(pagination.total / pagination.pageSize);

	function getPagesToShow(current, total) {
		const delta = 2;
		const pages = [];
		for (let i = 1; i <= total; i++)
			if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) pages.push(i);
		const result = [];
		let last = 0;
		for (const page of pages) {
			if (page - last > 1) result.push('...');
			result.push(page);
			last = page;
		}
		return result;
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
	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
		<table class="w-full border-collapse text-sm">
			<thead class="bg-gray-50 text-gray-700">
				<tr>
					<th class="px-2 py-3 text-left font-medium">STT</th>
					<th class="px-4 py-3 text-left font-medium">Họ & Tên</th>
					<th class="px-4 py-3 text-left font-medium">Email</th>
					<th class="px-4 py-3 text-left font-medium">Điện thoại</th>
					<th class="px-4 py-3 text-left font-medium">Vai trò</th>
					<th class="px-4 py-3 text-center font-medium">Trạng thái</th>
					<th class="px-4 py-3 text-center font-medium">Hành động</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data as item, index}
					<tr class="transition-colors hover:bg-gray-50">
						<td class="px-4 py-3 text-center text-gray-600"
							>{(pagination.current - 1) * pagination.pageSize + index + 1}</td
						>
						<td class="px-4 py-3">{item.lastname} {item.firstname}</td>
						<td class="px-4 py-3 font-mono text-blue-600">{item.email}</td>
						<td class="px-4 py-3">{item.phone}</td>
						<td class="px-4 py-3">{item.role_name}</td>
						<td class="px-4 py-3 text-center">
							{#if item.is_active}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800"
								>
									<CheckCircle class="h-4 w-4" /> Hoạt động
								</span>
							{:else}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800"
								>
									<XCircle class="h-4 w-4" /> Ngưng hoạt động
								</span>
							{/if}
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
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data as item}
			<div
				class="relative flex items-center gap-4 rounded-xl bg-white p-4 shadow-md transition hover:shadow-lg"
			>
				<div class="flex h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
					{#if item.image}
						<img
							src={`http://localhost:5000/${item.image}`}
							alt="{item.firstname} {item.lastname}"
							class="h-full w-full object-cover"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center font-bold text-blue-600">
							{item.firstname?.[0]?.toUpperCase() || '?'}
						</div>
					{/if}
				</div>
				<div class="flex-1">
					<h3 class="text-base font-semibold text-gray-800">{item.firstname} {item.lastname}</h3>
					<p class="text-sm text-gray-500">{item.email}</p>
					<p class="text-sm text-gray-500">{item.role_name}</p>
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

{#if openMenuId && currentItem}
	<div
		class="fixed z-50 w-32 rounded-lg bg-white shadow-md"
		style="top:{menuPos.top}px; left:{menuPos.left}px"
	>
		<button
			class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
			on:click={() => handleView(currentItem)}
		>
			<Eye class="h-4 w-4 text-gray-600" /> Xem
		</button>
		<button
			class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
			on:click={() => handleEdit(currentItem)}
		>
			<Pencil class="h-4 w-4 text-blue-600" /> Sửa
		</button>
		<button
			class="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
			on:click={() => handleDelete(currentItem.id)}
		>
			<Trash2 class="h-4 w-4" /> Xóa
		</button>
	</div>
{/if}

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
					class={`rounded-full border px-3 py-1.5 ${pagination.current === page ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 hover:bg-gray-100'}`}
					on:click={() => dispatch('pageChange', page)}>{page}</button
				>
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
