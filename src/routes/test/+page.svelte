<script lang="ts">
    import HistoryItem from "$lib/components/historyList/HistoryItem.svelte";
    import InputField from "$lib/components/inputField.svelte";
    import { onMount } from "svelte";
    import type { History } from "$lib/boardLib";
    import HistoryList from "$lib/components/historyList/HistoryList.svelte";
    import Button from "$lib/components/Button.svelte";

    onMount(async () => {
        const { test } = await import("$lib/test");
        test();
    });

    const history: History[] = [
        {
            captures: [
                [2, 2],
                [4, 8],
                [4, 8],
                [4, 8],
                [4, 8],
            ],
            color: 2,
            position: [1, 1],
            winner: 0
        },
        {
            captures: [
                [2, 2],
                [4, 8],
                [4, 8],
                [4, 8],
                [4, 8],
            ],
            color: 1,
            position: [1, 1], winner: 0
        },
        {
            captures: [
                [2, 2],
                [4, 8],
                [4, 8],
                [4, 8],
                [4, 8],
            ],
            color: 1,
            position: [1, 1], winner: 0
        },
    ];



    let stuff : string[]= [];
</script>

<h1>testing page</h1>



<div class="flex">
    <div class="item1"></div>
    <div class="item2">

        {#each stuff as s}
            <p>{s}</p>
        {/each}
    </div>
    <div class="item3"> {#each stuff as s}
        <p>{s}</p>
    {/each}</div>
</div>

<Button on:click={()=>{stuff = [...stuff, "stuff"]}} > Test</Button>

<style>


    .flex{
        display: flex;
        flex-direction: row;
        width: fit-content;

        max-height: min-content;
    }

    .item1{
        background-color: var(--green);
        width: 300px;
        height:200px;

        flex: 0 0 auto;
    }

    .item2{
        background-color: var(--blue);
        overflow-y:scroll;

        width: 300px;
        max-height: 100%;

    }

    .item3{
        background-color: var(--purple);
        overflow-y: scroll;
        width:300px;
        max-height: 100%;
 
    }
</style>