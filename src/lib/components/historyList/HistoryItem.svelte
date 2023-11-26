<script lang="ts">
    import type { History } from "$lib/boardLib";
    import { BLACK, EMPTY, WHITE, coord2Str } from "$lib/boardLib";
    import { boardSize } from "$lib/board";
    import Button from "../Button.svelte";

    export let history: History;
    export let index: number;
    export let highLight = true;

    let showButton = false;

 


</script>

<div
    id="itemContainer"
    class:highLight
    on:mouseenter={() => {
        showButton = true;
    }}
    on:mouseleave={() => (showButton = false)}
>
    <div class="horiLayout" style="justify-content: space-between;">
        <div>
            <div class="horiLayout">
                <span>{index + 1}.</span>
                <div
                    id="circle"
                    class:black={history.color == BLACK}
                    class:white={history.color == WHITE}
                />
                <span
                    >{history.color == BLACK ? "Black" : "White"}
                    {coord2Str(
                        history.position[0],
                        history.position[1],
                        $boardSize,
                    )}</span
                >
            </div>
            {#if history.winner != EMPTY}
                <span>
                    {history.winner == BLACK ? "Black" : "White"} wins by {history.captures.length > 0? "10 captures" : "Pente"}.</span
                >
            {:else if history.captures.length === 0}
                <span class="lowVis">No capture</span>
            {:else if history.captures.length <= 2}
                <span id="captures"
                    >Captures: {history.captures
                        .map((item) => coord2Str(item[0], item[1], $boardSize))
                        .join(" ")}</span
                >
            {:else}
                <span>Captures:</span>
                <br />
                <span>
                    {history.captures
                        .map((item) => coord2Str(item[0], item[1], $boardSize))
                        .join(" ")}</span
                >
            {/if}
        </div>
        <div id="buttonWrapper" class:disabled={!showButton || highLight}>
            <Button on:click disabled={!showButton}>Rewind</Button>
        </div>
    </div>
</div>

<style>
    .horiLayout {
        display: flex;
        flex-direction: row;

        gap: 0.5rem;
        margin: 0.25rem;
        align-items: center;
    }

    #circle {
        width: 1rem;
        height: 1rem;

        border: 2px solid var(--fg1);

        border-radius: 50%;
    }

    .black {
        background-color: var(--bg1);
    }

    .white {
        background-color: var(--fg);
    }

    #itemContainer:not(.highLight) {
        border-top: 2px solid var(--bg3);
    }

    #itemContainer:first-child:not(.highLight) {
        border: none;
    }

    #itemContainer {
        padding: 0.5rem;

        /* width: fit-content; */
    }

    .lowVis {
        color: var(--bg3);
    }

    .disabled {
        transition: opacity 0.4s ease-out;

        opacity: 0;
        visibility: hidden;
    }

    #captures {
        width: 160px;
        display: block;
    }

    .highLight {
        border: 2px solid var(--red);
    }
</style>
