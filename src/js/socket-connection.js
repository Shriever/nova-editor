
import { io } from "socket.io-client";


const socket = io(`${process.env.SERVER_DOMAIN}:${process.env.SERVER_PORT}`, {transports: ['websocket'], upgrade: false});

socket.on("connect_failed", (err) => {
    if(process.env.DEBUG){
        console.error("Unable to establish socket connection to server.")
        console.error(err)
    }
})

socket.on("connecting", () => {
    if(process.env.DEBUG){
        console.warn("Attempting to establish socket connection to server.")
    }
})

socket.on("disconnect", () => {
    if(process.env.DEBUG){
        console.warn("Disconnected socket from server.")
    }
})

socket.on("connect", () => {
    if(process.env.DEBUG){
        console.warn("Successfully connected socket to server.")
    }
})

socket.on("error", (err) => {
    if(process.env.DEBUG){
        console.error("An error occurred on the server.")
        console.error(err)
    }
})

socket.on("reconnect", () => {
    if(process.env.DEBUG){
        console.warn("Successfully reconnected socket.")
    }
})

socket.on("reconnecting", () => {
    if(process.env.DEBUG){
        console.warn("Attempting to reconnect socket.")
    }
})

socket.on("reconnect_failed", () => {
    if(process.env.DEBUG){
        console.warn("Could not reconnect socket.")
    }
})


socket.on("message", (data) => {
    console.warn("Server message:")
    console.warn(data)
})

export { socket as clientSocket };

