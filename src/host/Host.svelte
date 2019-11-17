<script>
    import { PeerHost } from '../peer-host';

    const host = new PeerHost();
    let hostId;


    function createGameHost() {
        host.start().then(id => hostId = id);
    }

    function restartGame() {
        host.resetGame();
    }
</script>

<h1>Host</h1>

{#if !hostId}
    <button on:click={createGameHost}>Create a host server and start game</button>
{:else}
    <button on:click={restartGame}>Restart the game</button>
{/if}
<p>Id : {hostId}</p>