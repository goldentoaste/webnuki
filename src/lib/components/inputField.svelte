<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let value = "";
    export let disabled = false;
    export let placeholder = ">_";
    export let suffix = "";
    export let pattern = "[\\s\\S]*";
    export let label = "";
    export let style = "";
    export let clickCopy = true;
    import { fade, fly } from "svelte/transition";

    let showMsg = false;
    let dispatch = createEventDispatcher();
    function onClick() {
        if (disabled && value.length > 0) {
            navigator.clipboard.writeText(value).then((e) => {
                showMsg = true;
                setTimeout(() => {
                    showMsg = false;
                }, 500);
            });
        }
    }

    let inputField: HTMLInputElement;
    function checkInput(event: any) {
        if (!pattern || inputField.checkValidity()) {
            value = inputField.value;
        } else {
            inputField.value = value;
        }
    }

    function enter(e: KeyboardEvent) {
        if (e.key === "Enter") {
            dispatch("enter");
        }
    }

    function focusOut() {
        dispatch("focusOut");
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="parent" {style}>
    {#if label}
        <span class="label">
            {label}
        </span>
    {/if}
    <div class:clickable={disabled && clickCopy} on:click={onClick}>
        <input
            type="text"
            {placeholder}
            bind:this={inputField}
            {disabled}
            class:disabled
            {pattern}
            on:input={checkInput}
            {value}
            on:keypress={enter}
            on:blur={() => {
                focusOut();
            }}
        />
    </div>
    {#if showMsg}
        <div
            class="msg"
            in:fly={{
                x: -10,
                duration: 500,
            }}
            out:fade={{ duration: 300 }}
        >
            Copied!
        </div>
    {/if}
    <div class="suffix">{suffix}</div>
</div>

<style>
    .parent {
        align-self: stretch;
        position: relative;
        display: flex;
        width: fit-content;
        align-items: center;
    }
    input {
        all: unset;
        border: 2px var(--bg2) solid;
        background-color: var(--bg1);
        color: var(--fg);
        height: auto;
        padding: 0.5rem;
    }

    input::placeholder {
        color: var(--bg3);
    }

    input[disabled]{
        pointer-events: none;
    }

    .clickable {
        transition: filter 0.5s ease-out;
        cursor: pointer !important;
    }

    .clickable :hover {
        filter: brightness(1.2);
    }

    .msg {
        background-color: var(--bg3);
        border: 2px solid var(--fg1);

        position: absolute;
        left: calc(100% + 0.5rem);
        top: 50%;
        transform: translate(0, -50%);
        padding: 0.5rem;
        z-index: 100;
    }

    .suffix {
        position: absolute;
        right: 0.25rem;

        z-index: 1;
        top: 50%;

        transform: translate(0, -50%);
        color: var(--bg2);
    }

    .label {
        margin: 0 0.5rem;
    }
</style>
