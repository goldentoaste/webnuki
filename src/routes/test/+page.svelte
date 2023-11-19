<script>
    import InputField from "$lib/components/inputField.svelte";
import { onMount } from "svelte";

    onMount(async () => {
        const {test} =  await import("$lib/test");
        test();
    });
</script>

<h1>testing page</h1>



<InputField disabled={true} value="abc def"></InputField>