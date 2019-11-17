<script>
    import * as Honeycomb from 'honeycomb-grid';
    import { SVG } from '@svgdotjs/svg.js'
    import { onMount } from 'svelte';

    let targetElement;
    let Hex;
    let Grid;
    let grid;
    const gridState = [];

    onMount(() => {
        const draw = SVG(targetElement);
        console.log('initialdraw', draw);

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

        const corners = Hex().corners();
    });

    function clickHex({ offsetX, offsetY }) {
        const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
        const clickedHex = grid.get(hexCoordinates)

        if (clickedHex) {
            const data = grid.map(hex => {
                return {
                    x: hex.x,
                    y: hex.y,
                    playerPiece: hex.playerPiece
                };
            })
            data.find(item => item.x === clickedHex.x && item.y === clickedHex.y).playerPiece = Math.floor(Math.random() * 2 + 1);
            console.log('mapped grid', data)
            updateGrid(data);
        }
    }

    function updateGrid (data) {
        data.forEach(hexData => {
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