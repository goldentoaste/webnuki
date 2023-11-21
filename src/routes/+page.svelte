<script lang="ts">
    import {
        Board,
        BLACK,
        EMPTY,
        WALL,
        WHITE,
        blackScore,
        colorToName,
        currentPlayer,
        lastPlay,
        opponent,
        whiteScore,
        winningPlayer,
        playerColor,
    } from "$lib/board";
    import Button from "$lib/components/Button.svelte";
    import MessageList from "$lib/components/MessageList.svelte";
    import InputField from "$lib/components/inputField.svelte";
   
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
    let messages: string[] = [
        "welcome to webnuki",
        "messages and plays will be here",
    ];
    let currentMessage = "";
    let sendMessage: (msg: string) => void;

    let onOpen = () => {
        gameStarted = true;
        sendMessage(`hello from ${isHost ? "host" : "client"}`);
        if (isHost) {
            newGame();
        }
    };

    let onMessage = (msg: string) => {
        messages = [msg, ...messages];

        const blocks = msg.split(" ");
        if (blocks[0] === "#reset") {
            // other player just did reset, requesting us to reset
            const color = parseInt(blocks[1]);
            reset(color);
        }

        if (blocks[0] == "#play") {
            // other just played a move, request us to play the same move to stay in sync
            const [row, col] = blocks[1]
                .split(",")
                .map((item) => parseInt(item));
            play(row, col);
        }
    };

    function tryConnect() {
        if (roomName.length == 0) {
            return alert("Must include a room name to connect or create game!");
        }
        sendMessage = makeCon(onOpen, onMessage, roomName, isHost);
    }

    let board: Board;
    let canvas: HTMLCanvasElement;
    onMount(() => {
        // ninuki board state
        board = new Board(15, canvas);
    });

    /*
    Messages to handle
    #play row,col - plays for the current player
    #reset color - calls for reset, also set the player color to color. (always start with black player)
    */

    function newGame() {
        const myColor = Math.random() > 0.5 ? 1 : 2;
        const opColor = opponent(myColor);

        reset(myColor);
        sendMessage(`#reset ${opColor}`);
    }

    function reset(color: number) {
        gameStarted = true;
        board.reset(color);
    }
    function play(row: number, col: number) {
        board.playMove(row, col);
    }

    $: {
        if ($lastPlay !== undefined) {
            sendMessage(`#play ${$lastPlay[0]},${$lastPlay[1]}`);
        }
    }

    $: {
        if ($winningPlayer != EMPTY) {
            gameStarted = false;
        }
    }
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

    <Button 
    on:click={()=>{
        gameStarted = true;
        board.selfPlay = true;
    }}
    disabled={gameStarted}>
        Self play
    </Button>
</div>

<h2>Board</h2>
<div class="rowGroup">
    <div>
        <canvas
            id="nukiCanvas"
            bind:this={canvas}
            class:noclick={!gameStarted}
            width="700px"
            height="700px"
        />
        {#if board}
            <p>You are player: {colorToName($playerColor)}</p>
            <p>Current player: {colorToName($currentPlayer)}</p>
            <p>Black score: {$blackScore}</p>
            <p>White score: {$whiteScore}</p>

            {#if $winningPlayer != EMPTY}
                {colorToName($winningPlayer)} has won the game!
            {/if}
            <!-- <p>
                Board should be here:
                {board.board}
            </p> -->
            <!-- <p>board's current player: {board.curPlayer}</p> -->

            {#if isHost}
                <Button on:click={newGame}>New Game</Button>
            {/if}
        {/if}
    </div>

    <div>
        <MessageList data={messages} />
        <div class="rowGroup">
            <InputField
                placeholder="message to send here"
                bind:value={currentMessage}
            />
            <Button
                on:click={() => {
                    messages.unshift(currentMessage);
                    messages = messages;
                    sendMessage(currentMessage);
                    currentMessage = "";
                }}>Send</Button
            >
        </div>
    </div>
</div>

<style>
    .rowGroup {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        margin: 1rem;
    }

    canvas {
        border: 2px solid var(--fg1);
        /* padding: 0.5rem; */
    }

    .noclick {
        pointer-events: none;
    }
</style>
