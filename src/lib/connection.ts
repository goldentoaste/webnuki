


import { Peer } from "peerjs";
let peer: Peer;
export function makeConnection(onOpen: (con: any) => void, onMessage: (data: string) => void, roomName: string = "", isHost = false,) {


    const roomId = roomName.concat("bdef613a-3672-4588-b467-7388b9d62fba");
    let connection: any;
    if (isHost) {
        peer = new Peer(roomId, {
            host: "localhost",
            port: 9000,
            path: "/",

        });

        peer.on("connection", (con) => {
            console.log("connection is made!", con.peer);

            connection = con;
            con.on("data", (data) => {
                onMessage(data as string);
            })

            con.on("open", () => {
                console.log('server open');

                onOpen(con);
            })
        })

        peer.on("error", (err) => {
            console.log('error', err);
        })
    }
    else {
        peer = new Peer({
            host: "localhost",
            port: 9000,
            path: "/"
        });

        const interval = setInterval(()=>{
            connection = peer.connect(roomId);
            console.log(connection);
            connection.on("error", (stuff : any) => {
                console.log('error', stuff);

                clearInterval(interval);
            })
    
            connection.on("data", (data: any) => {
                onMessage(data as string);
            })
    
            connection.on("open", () => {
                console.log("open!!!!!!");
                onOpen(connection);
                clearInterval(interval);
            })
        }, 500);

        peer.on("close", ()=>{  clearInterval(interval);})
        peer.on("error", ()=>{  clearInterval(interval);})
       

    }
    console.log("trying to make connection");



    const sendMessage = (message: string) => {
        if (connection === undefined) {
            return console.log("connection not open yet, can't send message")
        }
        console.log("sending message!", message, connection);

        connection.send(message);
    }

    return sendMessage;

}
