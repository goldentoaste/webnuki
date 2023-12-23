Note: if anything unexpected happens, try refreshing the page and start
    again. <br />
    Note2: This page is made to run on desktop browser, so some ui might not behave
    correctly on a touchscreen(plus the page is too big to fit).

    <h3>Pente/Ninuki Rules</h3>
    <ol>
        <li>
            Black player starts, player alternates to play 1 piece of their
            color on the board at a time
        </li>
        <li>
            Players can win in 2 ways, by placing five piece in a line (a pente)
            or by capturing
        </li>
        <li>
            A pente lets the player win instantly, regardless of captures. For
            example the following is a pente for black
            <pre>
    <code>
    B . . . .
    . B . . .
    . . B . .
    . . . B .
    . . . . B
    </code>
</pre>
        </li>
        <li>
            A player can capture opponent pieces by "sandwiching" 2 of them with
            their own color. Only 2 peice can be captured at a time, and only
            placing the end piece causes the capture.

            <pre>
    <code>
    White captures by playing at ? 
    W . . .                        
    . B . .                        
    . . B .                        
    . . . ?                                                             

    Not a capture at ? (no more than 2 piece) 
    . . . . .                              
    W B B B ?                              
    . . . . .                              

    Not a capture for white if black play at ?
    (no suicide)
    . . . . 
    W B ? W
    . . . . 
    </code>
</pre>
        </li>
        <li>
            The first player to get 10 captures also wins instantly.
        </li>

        <li>(optional) Tournament rules: 19x19 board size. Black always play first move at K10 (center). White plays anywhere for second move.
            Black then plays 3 points away from center as third move. Then game procedes as normally. This to reduce first move advantage, although
            black is still advantageous if played perfectly.
        </li>
    </ol>

    <h3>Start a game</h3>
    <ol>
        <li>
            One of the players can be the "host", by typing a room name of your
            choice, then click "Make room"
        </li>
        <li>
            Send (somehow) the room name to the other player, they can paste the
            name into the room name field and click "Connect to room"
        </li>
        <li>
            Connection should happen in 2 seconds or so, a success message will
            appear in the chat if so. Black player can play the first move now.
        </li>
        <li>
            Either player can click "new game" at any point to reset the board.
            Player color is chosen randomly.
        </li>
    </ol>

    <h3>History/rewind</h3>
    <p>
        As moves are played, the section below the scoreboard will show moves
        played. If you hover mouse over one of the moves, a "Rewind" button
        should appear, either player can rewind to a previous move to view a
        previous board state. To start playing from a previous state, click on
        "Commit" on the current move. Note that "Commit" cannot be undone, so
        make sure both players agree on undoing moves.
    </p>

    <h3>Game options</h3>
    Current the only option is just to change board size.
    <ol>
        <li>
            Boardsize: When a game has started, changing boardsize and
            confirming will set both player's board to the size and start a new
            game.
        </li>
    </ol>

    <h3>Load/Export</h3>
    "Export" button shows a dialog with the current board state as text. You can
    copy the text to record the current game. The "Load" button opens a dialog which
    you can paste in a previously saved game to start a game from the saved state.
    <br />
    <br />
    Note that export and load assumes black player starts, and player color alternates
    to ensure board state is valid. Also load doesn't do a lot of checking to make
    sure the pasted text is valid, so it's important the format is same the exported
    format.