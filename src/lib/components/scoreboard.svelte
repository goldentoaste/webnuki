<script lang="ts">
    import {
        blackScore,
        currentPlayer,
        opponent,
        whiteScore,
        winningPlayer,
    } from "$lib/board";
    import { BLACK, WHITE } from "$lib/boardLib";

    export let hostName = "";
    export let clientName = "";
    export let hostColor: number;
    $: clientColor = opponent(hostColor);
</script>

<div class="parent">
    <!--  -->
    <div
        class="col"
        class:active={hostColor === $currentPlayer}
        class:winner={hostColor === $winningPlayer}
    >
        <!-- host -->
        <div class="row">
            <div
                class="circle"
                class:black={hostColor === BLACK}
                class:white={hostColor === WHITE}
            ></div>

            <span> {hostName} </span>
        </div>

        <span>Score: {hostColor === BLACK ? $blackScore : $whiteScore}</span>
    </div>

    <div class="vertDivider"></div>

    <div
        class="col"
        class:active={clientColor === $currentPlayer}
        class:winner={clientColor === $winningPlayer}
    >
        <!-- client -->
        <div class="row">
            <div
                class="circle"
                class:black={clientColor === BLACK}
                class:white={clientColor === WHITE}
            ></div>

            <span> {clientName} </span>
        </div>

        <span>Score: {clientColor === BLACK ? $blackScore : $whiteScore}</span>
    </div>
</div>

<style>
    .active {
        border: 2px solid var(--red) !important;
    }

    .winner {
        border: 2px solid var(--yellow) !important;
    }

    .row {
        display: flex;
        flex-direction: row;
        margin: 0.25rem;
    }
    .col {
        display: flex;
        flex-direction: column;
        margin: 0.2rem;
        flex: 1;
        padding: 0.4rem;

        border: 2px solid transparent;
    }

    .parent {
        display: flex;
        flex-direction: row;

        border: 2px solid var(--fg1);
    }
    .circle {
        width: 1rem;
        height: 1rem;
        min-width: 1rem;

        border: 2px solid var(--fg1);

        border-radius: 50%;
    }
    .black {
        background-color: var(--bg1);
    }

    .white {
        background-color: var(--fg);
    }

    .vertDivider {
        height: auto;
        width: 2px;
        background-color: var(--bg3);
        margin: 0.5rem 0;
    }

    span {
        margin-left: 0.5rem;
        max-width: 100px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
</style>
