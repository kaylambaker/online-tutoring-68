import "./App.css";
import "./pages/Style.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import SignupPage from "./pages/Signup";
import TutorProfilePage from "./pages/TutorProfile";
import CalendarPage from "./pages/MyCalendar";
import TutorSearchPage from "./pages/TutorSearch.js";
import TOTPSetup from "./pages/TOTPSetup.js";
import TOTPVerify from "./pages/TOTPVerify.js";
import TutorEditProfile from "./pages/tutoredit";
import StudentEditProfile from "./pages/studentedit";
import TempLogin from "./pages/tempLogin";

function App() {
  return (
    <div className="max-w-md w-full space-y-8">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/tutor/:id" element={<TutorProfilePage />} />
          <Route path="/tutor/search" element={<TutorSearchPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/TOTPSetup" element={<TOTPSetup />} />
          <Route path="/TOTPVerify" element={<TOTPVerify />} />
          <Route path="/tutoredit" element={<TutorEditProfile />} />
          <Route path="/studentedit" element={<StudentEditProfile />} />
          <Route path="/login" element={<TempLogin />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
