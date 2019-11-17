<script>
	import Host from './host/Host.svelte';
	import Game from './game/Game.svelte';
</script>

<style>
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.container div {
		padding: 10px;
	}
	.game-section {
		flex: 1;
	}
</style>

<div class="container">
	<div class="host-section">
		<Host/>
	</div>
	
	<div class="game-section">
		<Game/>
	</div>
</div>
