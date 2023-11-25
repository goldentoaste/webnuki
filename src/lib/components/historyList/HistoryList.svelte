<script lang="ts">
    import type { History } from "$lib/boardLib";
    import { createEventDispatcher } from "svelte";
    import HistoryItem from "./HistoryItem.svelte";

    export let histories: History[];

    const dispatch = createEventDispatcher();
    let currentIndex = 0;

    $: {
        dispatch("indexChange", { index: currentIndex });
    }
</script>
<p>Current indfex is: {currentIndex}</p>
<div class="historyContainer">

    {#each histories as history, index}
        <HistoryItem
            {history}
            {index}
            highLight={index == histories.length - 1}
            on:click={() => {
                currentIndex = index;
            }}
        />
    {/each}
</div>

<style>
    .historyContainer {
        display: flex;
        flex-direction: column;
        overflow-y: scroll;

        border: solid 2px var(--fg1);

        flex: 1 1 auto;

        width: fit-content;
    }


</style>
