<script>
    import Board from './components/Board.svelte';
    import Peer from 'peerjs';

    let connectionToHost = null;
    let hostId = null;
    let gameState = null;

    const peer = new Peer();

    function connect() {
        connectionToHost = peer.connect(hostId);
        connectionToHost.on('open', () => {
            connectionToHost.send({
                request: 'state'
            });
        });
        connectionToHost.on('data', (data) => {
            console.log('data received', data);
            if (data.type === 'state') {
                gameState = data.data;
            }
        });
    }

    function sendPlayAction(event) {
        if (!connectionToHost) return;
        connectionToHost.send({
            action: 'play',
            data: {
                x: event.detail.x,
                y: event.detail.y
            }
        });
    }

</script>

<h1>Game</h1>

<div>
    <input bind:value={hostId}>
    <button on:click={connect}>Connect</button>
</div>

<Board gameState={gameState} on:play={sendPlayAction}/>