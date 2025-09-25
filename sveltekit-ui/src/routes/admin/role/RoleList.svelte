<script>
	import ItemList from '$lib/components/ItemList.svelte';
	import { createEventDispatcher } from 'svelte';
	export let data = [];
	export let pagination = { current: 1, pageSize: 6, total: 0 };
	export let viewMode = 'list';

	const dispatch = createEventDispatcher();
</script>

<ItemList
	{data}
	{pagination}
	{viewMode}
	on:view={(e) => dispatch('view', e.detail)}
	on:edit={(e) => dispatch('edit', e.detail)}
	on:delete={(e) => dispatch('delete', e.detail)}
	on:pageChange={(e) => dispatch('pageChange', e.detail)}
	on:viewModeChange={(e) => dispatch('viewModeChange', e.detail)}
/>
