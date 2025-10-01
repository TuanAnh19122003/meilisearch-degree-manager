<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { MoreVertical } from 'lucide-svelte';
	import Pagination from '$lib/Pagination.svelte';
	import ActionMenu from '$lib/ActionMenu.svelte';

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

	async function handlePrint(item) {
		const resApi = await fetch(`http://localhost:5000/api/certificate-print/${item.id}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token') || ''}`
			}
		});
		const apiData = await resApi.json();
		if (!apiData.success) {
			alert('Không lấy được dữ liệu in văn bằng');
			return;
		}
		const cert = apiData.data;

		// mapping học lực
		function translateClassification(hocLuc: string) {
			switch (hocLuc) {
				case 'Xuất sắc':
					return 'Distinction';
				case 'Giỏi':
					return 'Excellent';
				case 'Khá':
					return 'Good';
				case 'Trung bình':
					return 'Average';
				default:
					return '';
			}
		}

		const url = `/templates/${cert.type.toLowerCase()}.html`;
		const res = await fetch(url);
		let template = await res.text();
		const logoRes = await fetch('/templates/logo.png');
		const logoBlob = await logoRes.blob();
		const logoBase64 = await new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.readAsDataURL(logoBlob);
		});

		const html = template
			.replace(/<%= logoBase64 %>/g, String(logoBase64))
			.replace(/<%= fullname %>/g, `${cert.lastname} ${cert.firstname}`)
			.replace(/<%= dob %>/g, new Date(cert.dob).toLocaleDateString('vi-VN'))
			.replace(/<%= gradYear %>/g, new Date(cert.grad_date).getFullYear().toString())
			.replace(/<%= classification %>/g, cert.hoc_luc || '')
			.replace(/<%= classificationEn %>/g, translateClassification(cert.hoc_luc))
			.replace(/<%= number %>/g, cert.number);

		const win = window.open('', '_blank');
		win.document.write(html);
		win.document.close();
		win.focus();
		win.print();

		closeMenu();
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

<!-- Dropdown menu -->
<ActionMenu
	open={!!openMenuId}
	position={menuPos}
	item={currentItem}
	showPrint={currentItem?.status === 'issued'}
	on:view={(e) => handleView(e.detail)}
	on:edit={(e) => handleEdit(e.detail)}
	on:delete={(e) => handleDelete(e.detail)}
	on:print={(e) => handlePrint(e.detail)}
/>

<!-- Pagination -->
<Pagination
	current={pagination.current}
	pageSize={pagination.pageSize}
	total={pagination.total}
	on:pageChange={(e) => dispatch('pageChange', e.detail)}
	on:pageSizeChange={(e) => dispatch('pageSizeChange', e.detail)}
/>
