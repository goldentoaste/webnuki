<script lang="ts">
    import { BLACK, WHITE } from "$lib/boardLib";
    import type { ChatItem } from "$lib/peerTypes";

    // TODO fix this
    export let data: ChatItem[];
</script>

<div class="messageContainer">
    {#each data as msg}
        <span class="msgItem">
            {#if msg.name !== undefined}
                {#if msg.color !== -1}
                    <div
                        class="circle"
                        class:black={msg.color === BLACK}
                        class:white={msg.color === WHITE}
                    ></div>{/if}<span class:specName={msg.color === -1}>{msg.name}: </span>{/if} {msg.content}
        </span>
    {/each}
</div>

<style>
    .circle {
        display: inline-block;
        width: 0.75rem;
        height: 0.75rem;

        border: 2px solid var(--fg1);

        border-radius: 50%;
        
       vertical-align: sub;
       margin-right:0.25rem ;
    }

    .black {
        background-color: var(--bg1);
    }

    .white {
        background-color: var(--fg);
    }

    .messageContainer {
        display: flex;
        flex-direction: column-reverse;
        overflow-y: scroll;

        width: 35%;
        min-width: 300px;

        border: solid 2px var(--fg1);

        flex: 1 1 auto;
    }

    .msgItem {
        padding: 0.75rem;
        border-top: 2px solid var(--bg3);

    }

    .blackName {
        color: var(--bg1);
        text-shadow:
            -1px -1px 0 var(--fg),
            1px -1px 0 var(--fg),
            -1px 1px 0 var(--fg),
            1px 1px 0 var(--fg);
    }

    .whiteName {
        color: var(--fg1);
    }

    .specName {
        color: var(--blue);
    }
</style>
