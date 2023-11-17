


import { Peer } from "peerjs";

export function makeConnection(onOpen: (con : any) => void, onMessage: (data: string) => void, roomName: string = "", isHost = false,) {

    let peer: Peer;
    const roomId = roomName.concat("bdef613a-3672-4588-b467-7388b9d62fba");
    let connection : any;
    if (isHost) {
        peer = new Peer({
            host:undefined,
            key:undefined
        });
        console.log(peer, peer.id);
        
    }
    else {
        peer = new Peer();
        connection = peer.connect(roomName);
        console.log(connection);

        connection.on("data", (data : any) => {
            onMessage(data as string);
        })

        connection.on("open", () => {
            onOpen(connection);
        })
        
    }
    console.log("trying to make connection");
    
    peer.on("connection", (con) => {
        console.log("connection is made!", con.peer);
        
        connection = con;
        con.on("data", (data) => {
            onMessage(data as string);
        })

        con.on("open", () => {
            onOpen(con);
        })
    })

    const sendMessage = (message: string) =>{
        if (connection === undefined) {
            return console.log("connection not open yet, can't send message")
        }
        console.log("sending message!", message);
        
        connection.send(message);
    }

    return sendMessage;

}
