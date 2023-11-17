
import { Peer } from "peerjs";


export function test() {
    const p1 = new Peer({
        host: "localhost",
        port: 9000,
        path: "/",

    })

    p1.on("connection", (con) => {
        console.log("p1 connection made");

        con.on("open", () => {
            console.log("p1 opened");

        })
    })

    console.log(p1);
    setTimeout(() => {
        const p2 = new Peer({
            host: "localhost",
            port: 9000,
            path: "/",

        })

        setTimeout(()=>{
            const p2Con = p2.connect(p1.id,)
            p2Con.on("open", () => {
                console.log("p2 opened");
    
            })
        }, 1000)
        
     

    }, 1000);





}