import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./Welcome";
import Register from "./Register";
import Login from "./Login";
import VerifyOtp from "./VerifyOtp";
import Dashboard from "./Dashboard";
import CreateGroup from "./CreateGroup";
import AddMembers from "./AddMembers";
import AcceptInvite from "./AcceptInvite";
import GroupDetails from "./GroupDetails";
import MyGroups from "./MyGroups";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* After login */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/add-members/:groupId" element={<AddMembers />} />
        <Route path="/group/:groupId" element={<GroupDetails />} />
        <Route path="/my-groups" element={<MyGroups />} />

        {/* Invite */}
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
