import "./App.css";
import * as React from "react";
import CalendarPage from "./pages/MyCalendar";
import TutorEditProfile from "./pages/TutorEditProfile";
import StudentEditProfile from "./pages/StudentEditProfile";
import StudentDashboard from "./pages/StudentDashboard";

import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
  BrowserRouter,
  Routes,
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/tutoredit" element={<TutorEditProfile />} />
          <Route path="/studentedit" element={<StudentEditProfile />} />
          <Route path="/studentdashboard" element={<StudentDashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
