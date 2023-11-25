


<script lang="ts">

    export let data : string[];

</script>


<div class="messageContainer">

{#each data as msg}
    <span class="msgItem">{msg}</span>
{/each}
</div>




<style>


    .messageContainer {

        display: flex;
        flex-direction: column-reverse;
        overflow-y: scroll;

        width:35%;
        min-width: 300px;

        border:  solid 2px var(--fg1);

        flex: 1 1 auto;
    }


    .msgItem {
        padding: 0.75rem;
        border-top: 2px solid var(--bg3);
    }
</style>