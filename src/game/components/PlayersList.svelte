<script>
    import { PLAYER_COLORS } from '../../constants';
    
    export let players = [];
</script>

<h2>Players ({players.length})</h2>
<ul>
    {#each players as player}
    <li style="color: {PLAYER_COLORS[player.playerId]}">{player.playerId} : {player.name}</li>
    {/each}
</ul>