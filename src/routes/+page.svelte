<script lang="ts">
    import {
        Board,
        blackScore,
        colorToName,
        currentPlayer,
        lastPlay,
        opponent,
        whiteScore,
        winningPlayer,
        playerColor,
        history,
        historyIndex,
    } from "$lib/board";

    import { BLACK, WHITE, EMPTY, WALL } from "$lib/boardLib";
    import Button from "$lib/components/Button.svelte";
    import MessageList from "$lib/components/MessageList.svelte";
    import HistoryList from "$lib/components/historyList/HistoryList.svelte";
    import InputField from "$lib/components/inputField.svelte";

    import { onMount } from "svelte";

    //  peer connection garbage.
    let makeCon: (
        onOpen: any,
        onMessage: Function,
        roomName: string,
        isHost: boolean,
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
    let sendMessage: (msg: string) => void = (msg: string) => {};

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
        } else if (blocks[0] == "#play") {
            // other just played a move, request us to play the same move to stay in sync
            const [row, col] = blocks[1]
                .split(",")
                .map((item) => parseInt(item));
            play(row, col);
        } else if (blocks[0] == "#rewind") {
            const index = parseInt(blocks[1]);
            board.rewind(index);
        } else if (blocks[0] == "#commit") {
            const index = parseInt(blocks[1]);
            board.deleteFuture(index);
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
        board = new Board(19, canvas);
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

    function sendTextMessage() {
        messages.unshift(currentMessage);
        messages = messages;
        sendMessage(currentMessage);
        currentMessage = "";
    }

    function rewind(index: number) {
        board.rewind(index);
        sendMessage(`#rewind ${index}`);
    }

    function commit(index: number) {
        board.deleteFuture(index);
        sendMessage(`#commit ${index}`);
    }

    $: {
        if ($lastPlay !== undefined && !board.selfPlay) {
            sendMessage(`#play ${$lastPlay[0]},${$lastPlay[1]}`);
        }
    }

    $: {
        gameStarted = $winningPlayer == EMPTY;
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
        on:click={() => {
            board.reset(BLACK);
            board.selfPlay = true;
            gameStarted = true;
        }}
        disabled={gameStarted}
    >
        Self play
    </Button>

    {#if gameStarted}
        <Button on:click={newGame}>New Game</Button>
    {/if}
</div>

<div class="rowGroup" style="height:800px">
    <div id="canvasHolder">
        <h2>Board</h2>
        <canvas
            id="nukiCanvas"
            bind:this={canvas}
            class:noclick={!gameStarted}
            width="700px"
            height="700px"
        />
    </div>
    <div class="colGroup">
        <div id="stats">
            {#if board}
                <span>You are player: {colorToName($playerColor)}</span>
                <span>Current player: {colorToName($currentPlayer)}</span>
                <span>Black score: {$blackScore}</span>
                <span>White score: {$whiteScore}</span>

                {#if $winningPlayer == BLACK || $winningPlayer == WHITE}
                    {colorToName($winningPlayer)} has won the game!
                {/if}
            {/if}
        </div>
        {#if board}
            <HistoryList
                histories={$history}
                on:indexChange={(e) => {
                    rewind(e.detail);
                }}
                currentIndex={$historyIndex}
                on:commit={(e) => {
                    commit(e.detail);
                }}
            ></HistoryList>
        {/if}
    </div>

    <div class="colGroup">
        <MessageList data={messages} />
        <div class="rowGroup">
            <InputField
                placeholder="message to send here"
                bind:value={currentMessage}
                on:submit={sendTextMessage}
            />
            <Button on:click={sendTextMessage}>Send</Button>
        </div>
    </div>
</div>

<style>
    .rowGroup {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        margin: 1rem;
        width: fit-content;
    }

  

    canvas {
        /* padding: 0.5rem; */
        border: none;
        margin: none;
        padding: none;
        border: 20px solid var(--board);
    }

    .noclick {
        pointer-events: none;
    }

    #canvasHolder {
        flex: 0 0 auto;

    }

    .colGroup {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
       
        width: fit-content;
    
        flex: 1 1 auto;

    }

    #stats {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>
