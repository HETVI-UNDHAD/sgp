import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./Register";
import VerifyOtp from "./VerifyOtp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
