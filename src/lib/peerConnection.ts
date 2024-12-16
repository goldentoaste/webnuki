import { Peer, type DataConnection } from "peerjs"
import type {Message} from "$lib/peerTypes"

const gameId = "7388b9d62fba";


export function hostGame(roomName: string, onOpen: () => void, onMessage: (msg: Message) => void) {
    const roomId = gameId.concat(roomName)
    const self = new Peer(roomId);

    const peers = new Map<string, DataConnection>();
    
    /**
    * send a message to all the client, used as host
    * since host is responsible for relaying all the client message.    
    * @param {Message} msg - a message object to send to clients 
    * @return {void} 
    */
    function sendMessageToAllPeers(msg: Message, forwardId: string = "") {
        for (const [id, con] of peers) {
            if (id !== forwardId) {
                con.send(JSON.stringify(msg));
            }
        }
    }

    self.on("connection", (con) => {
        console.log("host: connection made with:", con.peer);

        peers.set(con.peer, con);

        con.on("data", (data) => {
            const msg: Message = JSON.parse(data as string);

            // forward the message to all the other peers (such as spectators)
            // skip the origin of data
            sendMessageToAllPeers(msg, con.peer);
            onMessage(msg);
        });

        con.on("open", () => {
            onOpen();
        });

        con.on("error", () => {
            console.log("encountered errors with peer: ", con.peer);
        })

    });

    self.on("error", () => {
        console.log("host: error occured somewhere, perhaps not with a particular client?");
    })

    return sendMessageToAllPeers;
}



export function connectAsClient(roomName: string, onOpen: () => void, onMessage: (msg: Message) => void) {
    const roomId = gameId.concat(roomName)
    const self = new Peer();

    let host: DataConnection;
    function sendMessage(msg: Message) {
        host.send(JSON.stringify(msg));
    }

    const interval = setInterval(() => {
        host = self.connect(roomId);


        host.on("open", () => {
            console.log("con to host opened: ", host);
            onOpen();
            clearInterval(interval);
        });
        host.on("error", () => {
            console.log("connection attempt to host error");
            clearInterval(interval);
        })
        host.on("close", () => {
            console.log("connection to host closed");
            clearInterval(interval);
        });


        host.on("data", (data)=>{
            onMessage(JSON.parse(data as string))
        })
    }, 500);

    self.on("close", () => {
        console.log("connection closed");
        clearInterval(interval);
    });

    self.on("error", () => {
        console.log("error in self connection");
        clearInterval(interval);
    });


    return sendMessage;
}