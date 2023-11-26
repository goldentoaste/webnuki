<script lang="ts">
    import type { History } from "$lib/boardLib";
    import { createEventDispatcher } from "svelte";
    import HistoryItem from "./HistoryItem.svelte";

    export let histories: History[];
    export let currentIndex: number;

    const dispatch = createEventDispatcher<{ indexChange: number }  >();

    let container : HTMLDivElement;



</script>

<div class="historyContainer" bind:this={container}>
    {#each histories as history, index}
        <HistoryItem
            {history}
            {index}
            highLight={index == currentIndex}
            on:click={() => {
               

                if (index == currentIndex){
                    // @ts-ignore
                    dispatch("commit", index);
                }else{
                    currentIndex = index;
                    dispatch("indexChange", currentIndex);
                }
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

        width: 300px;
    }
</style>
