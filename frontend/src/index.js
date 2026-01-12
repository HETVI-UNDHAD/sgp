import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";


const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
