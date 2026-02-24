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
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword"; 
import Profile from "./Profile";
import GroupChat from "./GroupChat";
import Chat from "./Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password/:token" element={<ResetPassword />} />         

        {/* After login */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/add-members/:groupId" element={<AddMembers />} />
        <Route path="/group/:groupId" element={<GroupDetails />} />
        <Route path="/chat/:groupId" element={<GroupChat />} />
        <Route path="/messages/:groupId" element={<Chat />} />
        <Route path="/my-groups" element={<MyGroups />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/group/:groupId/add-members" element={<AddMembers />} />

        {/* Invite */}
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
