<script lang="ts">
    export let data: string[];
</script>

<div class="messageContainer">
    {#each data as msg}
        <p>{msg}</p>
    {/each}
</div>

<style>
    .messageContainer {
        display: flex;
        flex-direction: column-reverse;
        overflow-y: scroll;

        width: 35%;
        min-width: 300px;

        border: solid 2px var(--fg1);
    }
</style>
