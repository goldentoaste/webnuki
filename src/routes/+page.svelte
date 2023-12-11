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

    import {
        BLACK,
        WHITE,
        EMPTY,
        WALL,
        coordFStr,
        coord2Str,
    } from "$lib/boardLib";
    import Button from "$lib/components/Button.svelte";
    import MessageList from "$lib/components/MessageList.svelte";
    import ModalDialog from "$lib/components/ModalDialog.svelte";
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

    const commands = new Set([
        "#reset", "#play", "#rewind", "#commit", "#changeSize", "#load"
    ]);

    let onMessage = (msg: string) => {
        const blocks = msg.split(" ");

        switch (blocks[0]) {
            case "#reset":
                const color = parseInt(blocks[1]);
                reset(color);
                break;
            case "#play": {
                const [row, col] = blocks[1]
                    .split(",")
                    .map((item) => parseInt(item));
                play(row, col);
                break;
            }
            case "#rewind": {
                const index = parseInt(blocks[1]);
                board.rewind(index);
                break;
            }
            case "#commit": {
                const index = parseInt(blocks[1]);
                board.deleteFuture(index);
                break;
            }
            case "#changeSize": {
                const newSize = parseInt(blocks[1]);
                if (newSize != board.size) {
                    changeBoardSize(newSize);
                }
                break;
            }
            case "#load": {
                const input = msg.slice(6);
                console.log(input);
                
                loadBoard(input, false);
            }

            default:{
                messages = ["opponent: " + msg, ...messages];
            }
        }
    };

    function tryConnect() {
        if (roomName.length == 0) {
            return alert("Must include a room name to connect or create game!");
        }
        sendMessage = makeCon(onOpen, onMessage, roomName, isHost);
    }

    // board state

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
        if (!currentMessage) return;
        if (commands.has(currentMessage.split(" ")[0]) ){
            currentMessage = currentMessage.slice(1);
        }
        messages.unshift("you: " + currentMessage);
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

    function changeBoardSize(newSize: number, sendMsg = false) {
        board.changeSize(newSize);
        if (board.currentPlayer != WALL) {
            board.currentPlayer = BLACK;
            $currentPlayer = BLACK;
        }
        if (sendMsg) {
            sendMessage(`#changeSize ${newSize}`);
        }
    }

    function loadBoard(input: string, sendMsg = false) {
        const lines = input.split("\n");
        const first = lines[0].split(" ");


        
        if (first[0] == "boardsize") {
            const size = parseInt(first[1]);
            if (size >= 5 && size <= 26) {
                changeBoardSize(size);
            }

            try {
                lines.splice(1).forEach((element) => {
                    if (element.length > 0) {
                        const [row, col] = coordFStr(element, board.size);
                        console.log(row, col);

                        board.playMove(row, col);
                    }
                });
            } catch {
                alert("error while recreating board state, clearing.");
                board.reset(board.playerColor);
            }
        } else {
            alert("no board size provided");
            return;
        }

        if (sendMsg) {
            sendMessage(`#load ${input}`);
        }
    }

    $: {
        if ($lastPlay !== undefined && !board.selfPlay) {
            sendMessage(`#play ${$lastPlay[0]},${$lastPlay[1]}`);
        }
    }

    $: {
        gameStarted = $winningPlayer == EMPTY;
    }

    // modal window related ...

    let showOptions = false;
    let boardSize = "19";

    function confirmGameOptions() {
        // handle if game options changed

        if (parseInt(boardSize) != board.size) {
            changeBoardSize(parseInt(boardSize), true);
        }
    }

    let showLoad = false;
    let loadText = "";

    function confirmLoad() {
        loadBoard(loadText, true);
    }

    let showExport = false;
    let exportText = "";

    function exportBoard() {
        exportText = `boardsize ${board.size}\n`;

        board.historyArr.forEach((hist) => {
            const [row, col] = hist.position;
            exportText += `${coord2Str(row, col, board.size)}\n`;
        });
    }

    let showHelp = false;
</script>

<h1>WebNuki!</h1>
<p>Duel in Ninuki on the web!</p>

<div class="rowGroup">
    <!-- <p>Room Name:</p> -->
    <InputField
        placeholder="Room name here"
        disabled={isHost}
        bind:value={roomName}
        label="Room Name:"
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



    <Button on:click={newGame} disabled={!gameStarted}>New Game</Button>
    <Button
    on:click={()=>{
        showHelp = true;
    }}>
        Help
    </Button>

    <div class="vertDivider"></div>
    <Button
        on:click={() => {
            showOptions = true;
        }}>Game options</Button
    >

    <Button
        on:click={() => {
            showLoad = true;
        }}
    >
        Load
    </Button>

    <Button
        on:click={() => {
            exportBoard();
            showExport = true;
        }}
    >
        Export
    </Button>
</div>

<div class="rowGroup" style="height:740px">
    <div id="canvasHolder">
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
                on:enter={sendTextMessage}
            />
            <Button on:click={sendTextMessage}>Send</Button>
        </div>
    </div>
</div>

<!-- options menu -->
<ModalDialog
    bind:visible={showOptions}
    on:confirm={confirmGameOptions}
    title="Game options"
>
    <div class="rowGroup">
        <InputField
            label="Board size"
            pattern="[1-9]+[1-9]*"
            bind:value={boardSize}
        ></InputField>
    </div>
</ModalDialog>

<ModalDialog
    bind:visible={showLoad}
    on:confirm={confirmLoad}
    title="Load previous game"
>
    <textarea
        placeholder={"boardsize 19\na1\na5\ng2\n...\n(assumed black starts)"}
        bind:value={loadText}
        rows="19"
        cols="30"
    >
    </textarea>
</ModalDialog>

<ModalDialog
    bind:visible={showExport}
    on:confirm={() => {
        showExport = false;
    }}
    title="Exported game"
    cancel={false}
>
    <textarea
        placeholder={"boardsize 19\na1\na5\ng2\n...\n(assumed black starts)"}
        value={exportText}
        rows="19"
        cols="30"
    />
</ModalDialog>


<ModalDialog
title="Help"
cancel={false}
bind:visible={showHelp}
>
Note: if anything unexpected happens, try refreshing the page and start again. <br>
Note2: This page is made to run on desktop browser, so some ui might not behave correctly on a touchscreen(plus the page is too big to fit). 
<h3>Start a game</h3>
<ol>
    <li>
        One of the players can be the "host", by typing a room name of your choice, then click "Make room"
    </li>
    <li>
        Send (somehow) the room name to the other player, they can paste the name into the room name field and click "Connect to room"
    </li>
    <li>
        Connection should happen in 2 seconds or so, a success message will appear in the chat if so. Black player can play the first move now.
    </li>
    <li>
        Either player can click "new game" at any point to reset the board. Player color is chosen randomly.
    </li>
</ol>

<h3>History/rewind</h3>
<p>As moves are played, the section below the scoreboard will show moves played. If you hover mouse over one of the moves, 
    a "Rewind" button should appear, either player can rewind to a previous move to view a previous board state. To start playing
    from a previous state, click on "Commit" on the current move. Note that "Commit" cannot be undone, so make sure both players agree on undoing moves.
</p>


<h3>Game options</h3>
Current the only option is just to change board size.
<ol>
    <li>Boardsize: When a game has started, changing boardsize and confirming will set both player's board to the size and start a new game.</li>
</ol>

<h3>
    Load/Export
</h3>
"Export" button shows a dialog with the current board state as text. You can copy the text to record the current game.
The "Load" button opens a dialog which you can paste in a previously saved game to start a game from the saved state. 
<br>
<br>
Note that export and load assumes black player starts, and player color alternates to ensure board state is valid. 
Also load doesn't do a lot of checking to make sure the pasted text is valid, so it's important the format is same the exported format.

</ModalDialog>

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

    .vertDivider {
        height: auto;
        width: 2px;
        background-color: var(--bg3);

        margin: 0 0.5rem;
    }

    textarea {
        resize: none;

        background-color: var(--bg1);
        border: 2px solid var(--fg1);

        color: var(--fg);
        outline: none;

        font-size: 11pt;
    }

    textarea:focus {
        outline: none;
    }

    textarea::placeholder {
        color: var(--fg1);
    }
</style>
