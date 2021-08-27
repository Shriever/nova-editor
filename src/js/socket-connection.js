
import { io } from "socket.io-client";


var socket = io(`${process.env.SERVER_DOMAIN}:${process.env.SERVER_PORT}`, {transports: ['websocket'], upgrade: false});


export { socket as socketioConnection };

