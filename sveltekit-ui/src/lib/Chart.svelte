<script>
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	export let data;
	export let type = 'bar';
	let canvas;
	let chart;

	onMount(() => {
		Chart.register(...registerables);
		chart = new Chart(canvas, { type, data, options: { responsive: true } });
	});

	$: if (chart && data) {
		chart.data = data;
		chart.update();
	}
</script>

<canvas bind:this={canvas}></canvas>
