<script lang="ts">
    import { Board } from "$lib/board";
    import Button from "$lib/components/Button.svelte";
    import MessageList from "$lib/components/MessageList.svelte";
    import InputField from "$lib/components/inputField.svelte";
    import "./global.css";
    import { onMount } from "svelte";

    //  peer connection garbage.
    let makeCon: (
        onOpen: any,
        onMessage: Function,
        roomName: string,
        isHost: boolean
    ) => (msg: string) => void;
    onMount(async () => {
        const { makeConnection } = await import("$lib/connection");
        // @ts-ignore
        makeCon = makeConnection;
    });

    let roomName = "";
    let isHost = false;
    let gameStarted = false;
    let messages: string[] = [];
    let currentMessage = "";
    let sendMessage: (msg: string) => void;

    let onOpen = () => {
        console.log("connection opened!");

        sendMessage("opened!");
        gameStarted = true;
    };

    let onMessage = (msg: string) => {
        console.log(msg);
        messages.push(msg);
        messages = messages;
    };

    function tryConnect() {
        if (roomName.length == 0) {
            return alert("Must include a room name to connect or create game!");
        }
        sendMessage = makeCon(onOpen, onMessage, roomName, isHost);
    }

    let board: Board;
   onMount(() => {
        // ninuki board state
        board = new Board(7);
    });

    
</script>

<h1>WebNuki!</h1>
<p>Duel in Ninuki on the web!</p>

<div class="rowGroup">
    <p>Room Name:</p>
    <InputField
        placeholder="Room name here"
        disabled={isHost}
        bind:value={roomName}
    />
</div>

<div class="rowGroup">
    <Button
        on:click={(e) => {
            isHost = true;
            tryConnect();
        }}
        disabled={gameStarted}>Make a room</Button
    >
    <Button
        on:click={(e) => {
            isHost = false;
            tryConnect();
        }}
        disabled={gameStarted || isHost}>Connect to room</Button
    >
</div>

<MessageList data={messages} />
<div class="rowGroup">
    <InputField
        placeholder="message to send here"
        bind:value={currentMessage}
    />
    <Button on:click={() => sendMessage(currentMessage)}>Send</Button>
</div>

<h2>Testing board</h2>
{#if board}
    <p>
        Board should be here:
        {board.board}
    </p>
    <p>board's current player: {board.curPlayer}</p>

    <Button
        on:click={() => {
            board.test();
        }}
    />
{/if}

<style>
    .rowGroup {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;

        margin: 1rem;
    }
</style>
