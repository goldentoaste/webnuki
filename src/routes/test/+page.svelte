<script lang="ts">
    import HistoryItem from "$lib/components/historyList/HistoryItem.svelte";
    import InputField from "$lib/components/inputField.svelte";
    import { onMount } from "svelte";
    import type { History } from "$lib/boardLib";
    import HistoryList from "$lib/components/historyList/HistoryList.svelte";

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
            position: [1, 1],
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
            position: [1, 1],
        },
    ];
</script>

<h1>testing page</h1>

<InputField disabled={true} value="abc def"></InputField>

<HistoryList
    on:indexChange={(change) => {
        console.log(change);
    }}
    histories={history}
/>
