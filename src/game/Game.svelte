<script>
    import Board from './components/Board.svelte';
    import Peer from 'peerjs';

    let connectionToHost = null;
    let hostId = null;

    const peer = new Peer();

    function connect() {
        connectionToHost = peer.connect(hostId);
        connectionToHost.on('open', () => {
            connectionToHost.send('hi!');
        });
    }

</script>

<h1>Game</h1>

<div>
    <input bind:value={hostId}>
    <button on:click={connect}>Connect</button>
</div>

<Board/>