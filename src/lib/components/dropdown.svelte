<script lang="ts">
    export let show = false;
    export let title = "";

    let content: HTMLElement;
</script>

<div class="parent">
    <div>
        <div class="title" on:click={() => (show = !show)}>
            <div class="arrow">
                <div class="arrowBorder" class:show>
                    <div class="arrowCenter"></div>
                </div>
            </div>
            <p>{title}</p>
        </div>
    </div>

    <div
        class="content"
        class:show
        style="--contentHeight:{content ? content.clientHeight : 0}px;"
    >
        <div class="innerContent" bind:this={content}>
            <slot />
        </div>
    </div>
</div>

<style>
    .parent {
        width: fit-content;
    }

    .title {
        display: flex;
        gap: 1rem;
        flex-direction: row;
        background-color: var(--bg2);
        color: var(--fg);
        transition: filter 300ms ease-out;
        padding: 0.75rem;

        align-items: center;

        user-select: none;
    }

    p {
        margin: 0;
        font-size: large;
        color: var(--fg);
    }

    .title:hover {
        filter: brightness(0.9);
    }
    .title:active {
        filter: brightness(0.8);
    }

    .arrow {
        rotate: -45deg;

        background-color: var(--fg1);
        width: 1rem;
        height: 1rem;

        position: relative;
    }

    .arrowBorder {
        position: absolute;
        background-color: var(--bg2);
        width: 0.85rem;
        height: 0.85rem;

        top: -0.1rem;
        left: -0.1rem;

        /* transition: all 300ms ease-out; */

        transition-property: left;
        transition-duration: 300ms;
        transition-timing-function: ease-out;
    }
    .arrowCenter {
        width: 0.3rem;
        height: 0.3rem;

        background-color: var(--fg1);
        position: absolute;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
    }

    .arrowBorder.show {
        left: 0.25rem;
    }

    .content {
        max-height: 0;
        height: fit-content;
        overflow-y: hidden;
        display: flex;
        flex-direction: column;

        transition: max-height 300ms ease-out;
        margin: 2px;

        border: none;
    }

    .content.show {
        max-height: var(--contentHeight);
        border: 2px solid var(--fg1);
        margin: 0;
    }
    .innerContent {
        padding: 0.5rem;
    }
</style>
