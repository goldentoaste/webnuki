
## Webnuki
This is an web, peer to peer implementation of a game called [Pente](https://en.wikipedia.org/wiki/Pente), however in my games Ai course my professor called it Ninuki(which is a different game), and hence this website's name.

### Features
* Peer to peer multiplayer, no accounts needed! (For competitive play, see [pente.org](https://pente.org/index.jsp))
* Spectate games and banter in chat room
* History/record of all previous moves, and rewind to play from a previous game state
* Import and export saved games

### To Use
To start playing with another player:
* Host:
    * Enter an user name
    * Choose an lobby name and click "Make a room"
    * Send the room name to the other player somehow
* Client:
    * Enter an user name
    * Enter the lobby name provided by the host
    * Hit connect.
* Spectators can join the same way as the players.
* When connection succeeds for each player, a chat message is sent.


### How to build
The project is built with Sveltekit with no other dependency, to build, simply run `npm install` and then `npm run dev` to start the dev server for preview.

