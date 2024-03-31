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
    import HelpText from "$lib/components/helpText.svelte";
    import HistoryList from "$lib/components/historyList/HistoryList.svelte";
    import InputField from "$lib/components/inputField.svelte";

    import { onMount } from "svelte";

    import {
        MsgType,
        type Message,
        type ChatItem,
        UserRole,
        type PlayersInfo,
    } from "$lib/peerTypes";
    import Dropdown from "$lib/components/dropdown.svelte";

    import Scoreboard from "$lib/components/scoreboard.svelte";
    //  peer connection garbage.
    let conToHost: (
        roomName: string,
        onOpen: () => void,
        onMessage: (msg: Message) => void,
    ) => (msg: Message) => void;
    let startAsHost: (
        roomName: string,
        onOpen: () => void,
        onMessage: (msg: Message) => void,
    ) => (msg: Message, forwardId?: string) => void;

    onMount(async () => {
        const { connectAsClient, hostGame } = await import(
            "$lib/peerConnection"
        );
        // @ts-ignore
        conToHost = connectAsClient;
        startAsHost = hostGame;
    });

    let roomName = "";
    let isHost = false;
    let isSpectator = false;
    let localName = "";
    let hostName = "host name";
    let clientName = "client name";
    let hostColor = EMPTY;
    let clientColor = EMPTY;
    let localRole = UserRole.Player;

    $: if (isHost) {
        localRole = UserRole.Host;
    } else if (isSpectator) {
        localRole = UserRole.Spectator;
    }

    let connected = false;
    let gameStarted = false;
    let messages: ChatItem[] = [
        {
            content: "welcome to webnuki",
        },
        {
            content: "messages and plays will be here",
        },
    ];

    function addChatItem(name: string, content: string) {
        let role = UserRole.Spectator;
        let color = -1;

        if (name === clientName) {
            role = UserRole.Player;
            color = clientColor;
        } else if (name === hostName) {
            role = UserRole.Host;
            color = hostColor;
        }

        messages = [
            {
                role,
                color,
                name,
                content,
            },
            ...messages,
        ];
    }

    let currentMessage = "";
    let sendMessage: (msg: Message) => void = (msg: Message) => {};

    let onOpen = () => {
        connected = true;
        if (!isHost) {
            // not host and spec -> client player
            sendMessage({
                msgType: MsgType.Connect,
                originName: localName,
                content: isSpectator ? "" : "client",
            });
            addChatItem(localName, "connect to host");
        }
    };

    let onMessage = (msg: Message) => {
        console.log(msg);

        switch (msg.msgType) {
            case MsgType.Reset:
                const color = parseInt(msg.content);
                reset(color);
                break;
            case MsgType.Play: {
                const [row, col] = msg.content
                    .split(",")
                    .map((item) => parseInt(item));
                play(row, col);
                break;
            }
            case MsgType.Rewind: {
                const index = parseInt(msg.content);
                board.rewind(index);
                break;
            }
            case MsgType.Commit: {
                const index = parseInt(msg.content);
                board.deleteFuture(index);
                break;
            }
            case MsgType.ChangeSize: {
                const newSize = parseInt(msg.content);
                if (newSize != board.size) {
                    changeBoardSize(newSize);
                }
                break;
            }
            case MsgType.Load: {
                const input = msg.content;
                console.log(input);
                loadBoard(input, false);
                break;
            }
            case MsgType.Connect: {
                // received by host only when player connects
                if (isHost) {
                    if (msg.content === "client") {
                        clientName = msg.originName;
                    }

                    sendMessage({
                        msgType: MsgType.PlayerInfo,
                        originName: localName,
                        content: JSON.stringify({
                            hostName,
                            clientName,
                        }),
                    });
                }
                addChatItem(msg.originName, "connected");
                break;
            }
            case MsgType.PlayerInfo: {
                const infos: PlayersInfo = JSON.parse(msg.content);
                hostName = infos.hostName;
                clientName = infos.clientName;
                break;
            }
            case MsgType.Text: {
                addChatItem(msg.originName, msg.content);
                break;
            }
            default:
                alert(`MsgType not implemented: ${msg}`);
        }
    };

    function tryConnect() {
        if (roomName.length == 0) {
            return alert("Must include a room name to connect or create game!");
        }
        if (localName.length == 0) {
            return alert("please choose a user name");
        }

        localStorage.setItem("playerName", localName);
        if (isHost) {
            hostName = localName;
        }

        if (isHost) {
            sendMessage = startAsHost(roomName, onOpen, onMessage);
        } else {
            sendMessage = conToHost(roomName, onOpen, onMessage);
        }
    }

    // board state

    let board: Board;
    let canvas: HTMLCanvasElement;

    onMount(() => {
        // ninuki board state
        board = new Board(19, canvas);
        let name = localStorage.getItem("playerName");
        if (name == null) {
            name = "";
        }
        localName = name;
    });

    function newGame() {
        hostColor = Math.random() > 0.5 ? BLACK : WHITE;
        reset(hostColor);

        const msg: Message = {
            msgType: MsgType.Reset,
            originName: localName,
            content: `${hostColor}`,
        };
        sendMessage(msg);
    }

    function reset(color: number) {
        console.log("resetting");
        gameStarted = true;
        connected = true;
        hostColor = color;
        clientColor = opponent(color);

        if (isHost) {
            board.reset(hostColor);
        } else {
            board.reset(clientColor);
        }
    }
    function play(row: number, col: number) {
        board.playMove(row, col);
    }

    function sendTextMessage() {
        if (!currentMessage) return;
        const msg: ChatItem = {
            role: localRole,
            content: currentMessage,
            color: isSpectator || !connected ? -1 : board.playerColor,
            name: localName,
        };
        messages.unshift(msg);
        messages = messages;

        sendMessage({
            content: currentMessage,
            msgType: MsgType.Text,
            originName: localName,
        });
        currentMessage = "";
    }

    function rewind(index: number) {
        board.rewind(index);
        sendMessage({
            content: `${index}`,
            msgType: MsgType.Rewind,
            originName: localName,
        });
    }

    function commit(index: number) {
        board.deleteFuture(index);
        sendMessage({
            content: `${index}`,
            msgType: MsgType.Commit,
            originName: localName,
        });
    }

    function changeBoardSize(newSize: number, sendMsg = false) {
        if (!connected && !board.selfPlay) {
            return;
        }
        board.changeSize(newSize);

        if (sendMsg) {
            sendMessage({
                content: `${newSize}`,
                msgType: MsgType.ChangeSize,
                originName: localName,
            });
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
            sendMessage({
                content: input,
                msgType: MsgType.Load,
                originName: localName,
            });
        }
    }

    $: {
        if ($lastPlay !== undefined && !board.selfPlay) {
            sendMessage({
                content: `${$lastPlay[0]},${$lastPlay[1]}`,
                msgType: MsgType.Play,
                originName: localName,
            });
        }
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

<svelte:window
    on:keydown={(e) => {
        if (e.key === "ArrowUp") {
            if ($historyIndex === -1) {
                return;
            }
            $historyIndex -= 1;
            rewind($historyIndex);
        } else if (e.key === "ArrowDown") {
            if ($historyIndex === $history.length - 1) {
                return;
            }
            $historyIndex += 1;
            rewind($historyIndex);
        }
    }}
/>

<h1>WebNuki!</h1>
<p>Duel in Ninuki on the web!</p>
<Dropdown title="Start game" show>
    <div class="rowGroup">
        <!-- <p>Room Name:</p> -->
        <InputField
            placeholder="Room code here"
            disabled={isHost}
            bind:value={roomName}
            label="Room Code:"
        />

        <InputField
            placeholder="name..."
            disabled={connected}
            clickCopy={false}
            bind:value={localName}
            label="Player Name"
        />
    </div>

    <div class="rowGroup">
        <Button
            on:click={(e) => {
                isHost = true;
                tryConnect();
            }}
            disabled={connected}>Make a room</Button
        >
        <Button
            on:click={(e) => {
                isHost = false;
                tryConnect();
            }}
            disabled={connected || isHost}>Connect to room</Button
        >

        <Button
            on:click={() => {
                isHost = false;
                isSpectator = true;
                tryConnect();
            }}
            disabled={connected}
        >
            Spectate
        </Button>

        <Button
            on:click={() => {
                board.reset(BLACK);
                board.selfPlay = true;
                connected = true;
                gameStarted = true;

                hostName = "Black";
                clientName = "White";

                hostColor = BLACK;
                clientColor = WHITE;
            }}
            disabled={connected}
        >
            Self play
        </Button>
        <Button
            on:click={() => {
                showHelp = true;
            }}
        >
            Help
        </Button>
    </div>

    <div class="horiDivider"></div>

    <div class="rowGroup">
        <Button on:click={newGame} disabled={!connected || isSpectator}
            >New Game</Button
        >

        <div class="vertDivider"></div>
        <Button
            disabled={isSpectator}
            on:click={() => {
                showOptions = true;
            }}>Game options</Button
        >

        <Button
            disabled={isSpectator}
            on:click={() => {
                showLoad = true;
            }}
        >
            Load
        </Button>

        <Button
            disabled={isSpectator}
            on:click={() => {
                exportBoard();
                showExport = true;
            }}
        >
            Export
        </Button>
    </div>
</Dropdown>

<div class="rowGroup"></div>

<div class="rowGroup" style="height:740px">
    <div id="canvasHolder">
        <canvas
            id="nukiCanvas"
            bind:this={canvas}
            class:noclick={!connected || !gameStarted || isSpectator}
            width="700px"
            height="700px"
        />
    </div>
    <div class="colGroup">
        <div id="stats">
            <Scoreboard {hostColor} {clientName} {hostName}></Scoreboard>
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

<ModalDialog title="Help" cancel={false} bind:visible={showHelp}>
    <HelpText />
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
        min-width: 320px;
    }

    .vertDivider {
        height: auto;
        width: 2px;
        background-color: var(--bg3);

        margin: 0 0.5rem;
    }

    .horiDivider {
        height: 2px;
        width: auto;

        background-color: var(--bg3);

        margin: 0.25rem 0.5rem;
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
