<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { MoreVertical } from 'lucide-svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import ActionMenu from '$lib/components/ActionMenu.svelte';

	export let data: any[] = [];
	export let pagination = { current: 1, pageSize: 6, total: 0 };
	export let viewMode: 'list' | 'card' = 'list';

	const dispatch = createEventDispatcher();

	let openMenuId: string | null = null;
	let menuPos = { top: 0, left: 0 };
	let currentItem: any = null;
	let html2pdf: any = null;
	let previewHTML = '';
	let showPreview = false;
	let previewCert: any = null;

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
	onMount(async () => {
		const module = await import('html2pdf.js');
		html2pdf = module.default;
	});

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

	async function handlePrint(item: any) {
		if (!html2pdf) {
			const module = await import('html2pdf.js');
			html2pdf = module.default;
		}

		try {
			// 1. Lấy certificate
			const resApi = await fetch(`http://localhost:5000/api/certificate-print/${item.id}`, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
			});

			const apiData = await resApi.json();
			if (!apiData.success) {
				alert('Không lấy được dữ liệu in văn bằng');
				return;
			}

			const cert = apiData.data;

			// 2. Load template + logo
			const url = `/templates/${cert.type.toLowerCase()}.html`;
			const res = await fetch(url);
			let template = await res.text();

			const logoBlob = await (await fetch('/templates/logo.png')).blob();
			const logoBase64 = await new Promise((resolve) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result);
				reader.readAsDataURL(logoBlob);
			});

			// mapping
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

			// 3. Build HTML
			const html = template
				.replace(/<%= logoBase64 %>/g, String(logoBase64))
				.replace(/<%= fullname %>/g, `${cert.lastname} ${cert.firstname}`)
				.replace(/<%= dob %>/g, new Date(cert.dob).toLocaleDateString('vi-VN'))
				.replace(/<%= gradYear %>/g, new Date(cert.grad_date).getFullYear().toString())
				.replace(/<%= classification %>/g, cert.hoc_luc || '')
				.replace(/<%= classificationEn %>/g, translateClassification(cert.hoc_luc))
				.replace(/<%= number %>/g, cert.number);

			// 4. Gán vào preview
			previewHTML = html;
			previewCert = cert;
			showPreview = true;

			closeMenu();
		} catch (err: any) {
			console.error(err);
			alert('Có lỗi xảy ra khi tạo preview văn bằng:\n' + err.message);
		}
	}

	async function confirmExportPDF() {
		showPreview = false;

		// tạo container ẩn
		const container = document.createElement('div');
		container.style.width = '297mm';
		container.style.minHeight = '210mm';
		container.style.position = 'fixed';
		container.style.top = '-9999px';
		container.innerHTML = previewHTML;
		document.body.appendChild(container);

		const opt = {
			margin: 0,
			filename: `${previewCert.number}.pdf`,
			image: { type: 'jpeg', quality: 1 },
			html2canvas: { scale: 2 },
			jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
		};

		const pdfBlob: Blob = await new Promise((resolve) => {
			html2pdf()
				.from(container)
				.set(opt)
				.toPdf()
				.output('blob')
				.then((blob: Blob) => resolve(blob));
		});

		document.body.removeChild(container);

		// Upload
		const form = new FormData();
		form.append('file', pdfBlob, `${previewCert.number}.pdf`);

		const uploadRes = await fetch(
			`http://localhost:5000/api/certificate-print/upload/${previewCert.cert_id}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token') || ''}`
				},
				body: form
			}
		);

		const uploadJson = await uploadRes.json();

		if (!uploadJson.success) {
			alert('Lỗi khi upload file:\n' + (uploadJson.message || uploadJson.error));
			return;
		}

		alert('Lưu file văn bằng thành công!');
		dispatch('fileUploaded', uploadJson.data);
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

{#if showPreview}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div
			class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
		>
			<div class="flex items-center justify-between border-b px-4 py-3">
				<h2 class="text-lg font-semibold">Xem trước văn bằng</h2>
				<button class="text-gray-500 hover:text-black" on:click={() => (showPreview = false)}>
					✕
				</button>
			</div>

			<div class="flex-1 overflow-auto border-b bg-gray-100 p-4">
				<div class="mx-auto bg-white p-4 shadow" style="width: 297mm; min-height: 210mm;">
					{@html previewHTML}
				</div>
			</div>

			<div class="flex justify-end gap-3 bg-gray-50 p-4">
				<button
					class="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
					on:click={() => (showPreview = false)}
				>
					Hủy
				</button>

				<button
					class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					on:click={confirmExportPDF}
				>
					Xuất PDF
				</button>
			</div>
		</div>
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
