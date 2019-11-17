<script>
    import { PeerHost } from '../peer-host';

    const host = new PeerHost();
    let hostId;


    function createGameHost() {
        host.start().then(id => hostId = id);
    }
</script>

<h1>Host</h1>

<button on:click={createGameHost}>Create a game</button>
<p>Id : {hostId}</p>