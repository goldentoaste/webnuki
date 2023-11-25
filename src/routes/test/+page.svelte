<script lang="ts">
    import HistoryItem from "$lib/components/historyList/HistoryItem.svelte";
    import InputField from "$lib/components/inputField.svelte";
    import { onMount } from "svelte";
    import type { History } from "$lib/boardLib";

    onMount(async () => {
        const { test } = await import("$lib/test");
        test();
    });

    const history: History = {
        captures: [
            [2, 2],
            [4, 8],
            [4, 8],
            [4, 8],
            [4, 8],
        ],
        color: 1,
        position: [1, 1],
    };
</script>

<h1>testing page</h1>

<InputField disabled={true} value="abc def"></InputField>

<HistoryItem
{history}
index={11}
on:click={()=>{console.log("clicked")}}
></HistoryItem>
