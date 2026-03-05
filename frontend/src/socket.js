import io from "socket.io-client";
import { API_URL } from "./config";

const SOCKET_URL = API_URL;
const socket = io(SOCKET_URL);

export default socket;
