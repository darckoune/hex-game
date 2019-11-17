import Peer from 'peerjs';
import * as Honeycomb from 'honeycomb-grid';

export class PeerHost {
    constructor() {
        this.peer = null;
        this.connections = [];
        this.players = [];
        this.createGame();
    }

    start() {
        return new Promise((resolve, reject) => {
            this.peer = new Peer();
            this.peer.on('open', function(id) {
                resolve(id);
            });
            this.peer.on('connection', (conn) => {
                this.connections.push(conn);
                this.players.push({
                    peerId: conn.peer,
                    playerId: this.players.length ? Math.max(this.players.map(p  => p.playerId)) + 1 : 1
                });
                conn.on('data', (data) => {
                    if (data.request) {
                        this.handleRequest(conn, data.request);
                    }
                    if (data.action) {
                        this.handleAction(conn, data.action, data.data);
                    }
                });
            });
        });
    }

    createGame() {
        const Grid = Honeycomb.defineGrid();
        const grid = [];
        Grid.parallelogram({ 
            width: 5, 
            height: 5
        })
        .forEach(hex => {
            grid.push({
                x: hex.x,
                y: hex.y,
                playerPiece: null
            });
        })
        this.gameState = {
            playerTurn: 1,
            grid
        }
    }

    handleRequest(conn, request) {
        switch (request) {
            case 'state':
                conn.send({
                    type: 'state',
                    data: this.gameState
                });
                break;
            default:
                console.error('Unable to handle request: ' + request);
                break;
        }
    }

    handleAction(conn, action, data) {
        const player = this.getPlayerFromConnection(conn);
        if (!player) return;
        switch (action) {
            case 'play':
                this.gameState.grid.find(item => data.x === item.x && data.y === item.y).playerPiece = player.playerId;
                this.broadcastGameState();
                break;
            default:
                console.error('Unable to handle action: ' + action);
                break;
        }
    }

    broadcastGameState() {
        this.connections.forEach(conn => {
            conn.send({
                type: 'state',
                data: this.gameState
            });
        })
    }

    getPlayerFromConnection(conn) {
        return this.players.find(p => p.peerId === conn.peer);
    }
}