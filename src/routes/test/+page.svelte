<script>
    import { onMount } from "svelte";

    onMount(async () => {
        const {test} =  await import("$lib/test");
        test();
    });
</script>

<h1>testing page</h1>
