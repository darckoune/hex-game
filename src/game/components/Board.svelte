<script>
    import * as Honeycomb from 'honeycomb-grid';
    import { SVG } from '@svgdotjs/svg.js'
    import { onMount, createEventDispatcher } from 'svelte';

    let targetElement;
    let Hex;
    let Grid;
    let grid;

    export let gameState = null;
    const dispatch = createEventDispatcher();

    $: updateGameState(gameState);

    onMount(() => {
        const draw = SVG(targetElement);

        Hex = Honeycomb.extendHex({
            size: 30,
            playerPiece: null,

            render(draw) {
                const { x, y } = this.toPoint()
                const corners = this.corners()

                this.draw = draw
                    .polygon(corners.map(({ x, y }) => `${x},${y}`))
                    .fill('none')
                    .stroke({ width: 1, color: '#999' })
                    .translate(x, y)
            },

            setPlayerPiece(playerPiece) {
                if (playerPiece !== this.playerPiece) {
                    this.playerPiece = playerPiece;
                    this.updateColor();
                }
            },

            updateColor() {
                switch(this.playerPiece) {
                    case 1:
                        this.draw
                            .fill({ opacity: 1, color: 'aquamarine' });
                        break;
                    case 2:
                        this.draw
                            .fill({ opacity: 1, color: 'red' })
                        break;
                    default:
                        this.draw
                            .fill({ opacity: 1, color: 'none' })
                        break;
                }
            }
        });

        Grid = Honeycomb.defineGrid(Hex);
        grid = Grid.parallelogram({ 
            width: 5, 
            height: 5,
            onCreate(hex) {
                hex.render(draw)
            }
        });
    });

    function clickHex({ offsetX, offsetY }) {
        const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
        const clickedHex = grid.get(hexCoordinates)

        if (clickedHex) {
            dispatch('play', clickedHex);
        }
    }

    function updateGameState(state) {
        console.log('updating state !', state);
        if (!state) return;
        updateGrid(state.grid);
    }

    function updateGrid (gridData) {
        gridData.forEach(hexData => {
            const hex = grid.get({ x: hexData.x, y: hexData.y });
            if (hex) {
                hex.setPlayerPiece(hexData.playerPiece);
            }
        })
    }
</script>

<style>
    .grid {
        width: 100%;
        height: 100%;
    }
</style>

<svg 
    bind:this={targetElement} 
    on:click={clickHex}
    class="grid">
</svg>

<div>{gameState}</div>