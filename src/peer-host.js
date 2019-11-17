import Peer from 'peerjs';

export class PeerHost {
    constructor() {
        this.peer = null;
        this.coonections = [];
    }

    start() {
        return new Promise((resolve, reject) => {
            this.peer = new Peer();
            this.peer.on('open', function(id) {
                resolve(id);
            });
            this.peer.on('connection', (conn) => {
                this.coonections.push(conn);
                conn.on('data', (data) => {
                    console.log('data received', data);
                });
            });
        });
    }
}