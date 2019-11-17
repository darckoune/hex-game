<script>
    import * as Honeycomb from 'honeycomb-grid';
    import { SVG } from '@svgdotjs/svg.js'
    import { onMount, createEventDispatcher } from 'svelte';
    import { BOARD_SIZE, PLAYER_COLORS } from '../../constants';

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
                const { x, y } = this.toPoint();
                const corners = this.corners();;

                this.draw = draw
                    .polygon(corners.map(({ x, y }) => `${x},${y}`))
                    .fill('none')
                    .stroke({ width: 1, color: '#999' })
                    .translate(x, y);

                if (this.q === 0) {
                    this.renderEdges(draw, [2,3,4], PLAYER_COLORS[2]);
                } else if (this.q === BOARD_SIZE - 1) {
                    this.renderEdges(draw, [5,0,1], PLAYER_COLORS[2]);
                }
                
                if (this.r === 0) {
                    this.renderEdges(draw, [4,5,0], PLAYER_COLORS[1]);
                } else if (this.r === BOARD_SIZE - 1) {
                    this.renderEdges(draw, [1,2,3], PLAYER_COLORS[1]);
                }

            },

            renderEdges(draw, cornerIndexes, color) {
                const { x, y } = this.toPoint();
                const corners = this.corners();
                
                draw.polyline(cornerIndexes.map(cornerIndex => [corners[cornerIndex].x, corners[cornerIndex].y]))
                    .fill('none')
                    .stroke({ width: 3, color })
                    .translate(x, y);
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
                            .fill({ opacity: 1, color: PLAYER_COLORS[1] });
                        break;
                    case 2:
                        this.draw
                            .fill({ opacity: 1, color: PLAYER_COLORS[2] });
                        break;
                    default:
                        this.draw
                            .fill({ opacity: 1, color: 'none' });
                        break;
                }
            }
        });

        Grid = Honeycomb.defineGrid(Hex);
        grid = Grid.parallelogram({ 
            width: BOARD_SIZE, 
            height: BOARD_SIZE,
            onCreate(hex) {
                hex.render(draw);
            }
        });
    });

    function clickHex(event) {
        const offsetX = event.pageX - targetElement.getBoundingClientRect().left - window.scrollX;
        const offsetY = event.pageY - targetElement.getBoundingClientRect().top  - window.scrollY;
        const hexCoordinates = Grid.pointToHex([offsetX, offsetY]);
        const clickedHex = grid.get(hexCoordinates);
        if (clickedHex && !clickedHex.playerPiece) {
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
    .flex-1 {
        flex: 1;
    }
</style>

<div class="flex-1">
    <svg 
        bind:this={targetElement} 
        on:click={clickHex}
        class="grid">
    </svg>
</div>