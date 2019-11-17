<script>
    import { PeerHost } from '../peer-host';

    const host = new PeerHost();
    let hostId;

    host.start().then(id => hostId = id);
</script>

<h1>Host</h1>

<p>Id : {hostId}</p>