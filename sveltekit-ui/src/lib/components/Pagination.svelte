<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	export let current: number = 1;
	export let pageSize: number = 10;
	export let total: number = 0;
	export let pageSizes: number[] = [9, 18, 27, 45];

	const dispatch = createEventDispatcher();

	$: totalPages = Math.max(1, Math.ceil(total / pageSize));

	function getPagesToShow(current, total) {
		const delta = 2;
		const pages: (number | string)[] = [];
		for (let i = 1; i <= total; i++) {
			if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
				pages.push(i);
			}
		}
		const result: (number | string)[] = [];
		let last = 0;
		for (const page of pages) {
			if (typeof page === 'number' && page - last > 1) result.push('...');
			result.push(page);
			last = typeof page === 'number' ? page : last;
		}
		return result;
	}
</script>

<div class="mt-6 flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
	<!-- Left: info + page size -->
	<div class="flex items-center gap-4">
		<span class="text-gray-600">
			Trang <b>{current}</b> / {totalPages}
		</span>

		<!-- Page size selector -->
		<div class="flex items-center gap-2">
			<select
				bind:value={pageSize}
				on:change={() => dispatch('pageSizeChange', +pageSize)}
				class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
			>
				{#each pageSizes as size}
					<option value={size}>{size} / trang</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Right: pagination buttons -->
	<div class="flex items-center gap-2">
		<button
			class="flex items-center rounded-full border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
			on:click={() => dispatch('pageChange', current - 1)}
			disabled={current <= 1}
		>
			<ChevronLeft class="h-4 w-4" />
		</button>

		{#each getPagesToShow(current, totalPages) as page}
			{#if page === '...'}
				<span class="px-2 text-gray-400">...</span>
			{:else}
				<button
					class={`rounded-full border px-3 py-1.5 text-sm transition ${
						current === page
							? 'border-blue-500 bg-blue-500 text-white shadow'
							: 'border-gray-300 text-gray-700 hover:bg-gray-100'
					}`}
					on:click={() => dispatch('pageChange', page)}
				>
					{page}
				</button>
			{/if}
		{/each}

		<button
			class="flex items-center rounded-full border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
			on:click={() => dispatch('pageChange', current + 1)}
			disabled={current >= totalPages}
		>
			<ChevronRight class="h-4 w-4" />
		</button>
	</div>
</div>
