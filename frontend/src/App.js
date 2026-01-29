import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import VerifyOtp from "./VerifyOtp";
import Dashboard from "./Dashboard";
import CreateGroup from "./CreateGroup";   // ✅ ADD THIS
import AddMembers from "./AddMembers";     // ✅ ADD THIS
import AcceptInvite from "./AcceptInvite"; // ✅ ADD THIS
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/add-members" element={<AddMembers />} />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
