<script lang="ts">
    export let value = "";
    export let disabled = false;
    export let placeholder = ">_";
    export let suffix = "";
    export let pattern = "";

    import { fade, fly } from "svelte/transition";
    let showMsg = false;
    function onClick() {
        console.log("on clickk");

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
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="parent" class:clickable={disabled} on:click={onClick}>
    <input
        type="text"
        {placeholder}
        bind:this={inputField}
        {disabled}
        class:disabled
        {pattern}
        on:input={checkInput}
        {value}
    />

    {#if showMsg}
        <div
            class="msg"
            in:fly={{
                x: -10,
                duration:500
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
        width: fit-content  ;
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

    .clickable {
        transition: filter 0.5s ease-out;
        cursor: pointer;
    }

    .clickable:hover {
        filter: brightness(1.2);
    }

    .disabled {
        user-select: none;
        pointer-events: none;
    }

    .msg {
        background-color: var(--bg3);
        border: 2px solid var(--fg1);

        position: absolute;
        left: calc(100% + 0.5rem);
        top: 50%;
        transform: translate(0, -50%);
        padding: 0.5rem;
    }

    .suffix {
        position: absolute;
        right: 0.25rem;

        z-index: 1;
        top: 50%;

        transform: translate(0, -50%);
        color: var(--bg2);
    }
</style>
