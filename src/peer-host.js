import Peer from 'peerjs';
import * as Honeycomb from 'honeycomb-grid';
import { BOARD_SIZE } from './constants';

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
                    playerId: this.players.length ? Math.max(this.players.map(p  => p.playerId)) + 1 : 1,
                    name: 'No name'
                });
                conn.on('data', (data) => {
                    if (data.request) {
                        this.handleRequest(conn, data.request);
                    }
                    if (data.action) {
                        this.handleAction(conn, data.action, data.data);
                    }
                });
                conn.on('close', () => {
                    this.players.splice(this.players.indexOf(this.getPlayerFromConnection(conn)), 1);
                    this.broadcastPlayers();
                });
                this.broadcastPlayers();
            });
        });
    }

    createGame() {
        const Grid = Honeycomb.defineGrid(
            Honeycomb.extendHex({
                playerPiece: null
            })
        );
        const grid = Grid.parallelogram({ 
            width: BOARD_SIZE, 
            height: BOARD_SIZE
        });
        this.gameState = {
            playerTurn: 1,
            win: null,
            grid
        };
    }

    resetGame() {
        this.createGame();
        this.broadcastGameState();
    }

    handleRequest(conn, request) {
        switch (request) {
            case 'state':
                conn.send({
                    type: 'state',
                    data: this.getSendableGameState()
                });
                break;
            case 'players':
                conn.send({
                    type: 'players',
                    data: this.getSendablePlayers()
                });
                break;
            default:
                console.error('Unable to handle request: ' + request);
                break;
        }
    }

    handleAction(conn, action, data) {
        // if (!this.playerCount() !== 2) return;
        const player = this.getPlayerFromConnection(conn);
        // console.log('handling action', action, data);
        if (!player) return;
        switch (action) {
            case 'play':
                if (player.playerId !== this.gameState.playerTurn) return;
                this.gameState.grid.get({ x: data.x, y: data.y }).playerPiece = player.playerId;
                if (this.checkVictory(player)) {
                    this.gameState.win = player.playerId;
                }
                this.gameState.playerTurn = (this.gameState.playerTurn % this.playerCount()) + 1
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
                data: this.getSendableGameState()
            });
        })
    }

    getSendableGameState() {
        const sendableGrid = [];
        this.gameState.grid.forEach(hex => {
            sendableGrid.push({
                x: hex.x,
                y: hex.y,
                playerPiece: hex.playerPiece
            });
        });
        return {
            ...this.gameState,
            grid: sendableGrid
        };
    }

    broadcastPlayers() {
        this.connections.forEach(conn => {
            conn.send({
                type: 'players',
                data: this.getSendablePlayers()
            })
        })
    }

    getSendablePlayers() {
        return this.players.map(player => {
            return {
                playerId: player.playerId,
                name: player.name
            }
        })
    }

    getPlayerFromConnection(conn) {
        return this.players.find(p => p.peerId === conn.peer);
    }

    playerCount() {
        return this.players.length;
    }

    checkVictory(player) {
        let startLine;
        switch (player.playerId) {
            case 1:
                startLine = 'r';
                break;
            case 2:
                startLine = 'q';
                break;
        }

        const startingHexes = this.gameState.grid
            .filter(hex => hex[startLine] === 0)
            .filter(hex => hex.playerPiece === player.playerId);

        for (const startingHex of startingHexes) {
            const hexToExplore = [startingHex];
            const exploredHex = [];
            
            while (hexToExplore.length) {
                const exploring = hexToExplore.pop();
                if (exploring[startLine] === BOARD_SIZE - 1) {
                    return true
                }
                const newHexesToExplore = this.gameState.grid.neighborsOf(exploring)
                    .filter(neighbor => !!neighbor)
                    .filter(neighbor => exploredHex.findIndex(e => e.x === neighbor.x && e.y === neighbor.y) === -1)
                    .filter(neighbor => hexToExplore.findIndex(e => e.x === neighbor.x && e.y === neighbor.y) === -1)
                    .filter(neighbor => neighbor.playerPiece === player.playerId);
                hexToExplore.push(...newHexesToExplore);
                exploredHex.push(exploring);
            }
        }

        return false;
    }
}