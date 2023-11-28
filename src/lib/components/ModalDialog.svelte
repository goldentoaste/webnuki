<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import Button from "./Button.svelte";
    import { createEventDispatcher } from "svelte";

    export let visible = false;
    export let title = "";

    const dispatch = createEventDispatcher();

    function confirm() {
        visible = false;
        dispatch("confirm");
    }
</script>

{#if visible}
    <div
        class="background"
        on:click={() => {
            visible = false;
        }}
        transition:fade={{ duration: 300 }}
    />

    <div class="modal" transition:fly={{ y: -25, duration: 200 }}>
        {#if title}
            <h3>
                {title}
            </h3>
            <div class="horiDivider"></div>
        {/if}

        <slot />
        <div class="horiDivider"></div>

        <div class="botBar">
            <Button on:click={confirm}>Confirm</Button>
            <Button on:click={() => (visible = false)}>Cancel</Button>
        </div>
    </div>
{/if}

<style>
    .titleBar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-content: end;
    }

    .botBar {
        display: flex;
        flex-direction: row;
        gap: 0.75rem;
    }

    .background {
        position: fixed;
        width: 100%;
        height: 100%;

        background-color: black;
        opacity: 0.5;

        top: 0;
        left: 0;

        z-index: 1;
    }

    .modal {
        position: fixed;

        top: 50%;
        left: 50%;

        transform: translate(-50%, -50%);

        width: fit-content;
        max-width: 1000px;
        min-width: 200px;

        height: fit-content;

        padding: 1.5rem;

        z-index: 2;

        background-color: var(--bg);
        border: 2px solid var(--bg3);
    }

    .horiDivider {
        height: 2px;
        width: auto;
        background-color: var(--bg3);

        margin: 0.5rem 0rem;
    }
</style>
