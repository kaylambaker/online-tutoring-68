import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import HomePage from './pages/Home';
import SignupPage from './pages/Signup';
import TutorProfilePage from './pages/TutorProfile';
import CalendarPage from './pages/MyCalendar'
import TutorSearchPage from './pages/TutorSearch'
import TOTPSetup from './pages/TOTPSetup'
import TOTPVerify from './pages/TOTPVerify'
import TutorEditProfile from "./pages/tutoredit";
import StudentEditProfile from "./pages/studentedit";
import Login from './pages/Login'
import Logout from './pages/Logout'
import FavoritesList from './pages/FavoritesList';
import AddToFavorites from './pages/AddToFavorites';
import StudentDashboard from './pages/StudentDashboard'
import TutorDashboard from './pages/TutorDashboard'

function App() {
  return (
      <div className="max-w-md w-full space-y-8">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/signup" element={<SignupPage/>} />
            <Route path="/tutor/:id" element={<TutorProfilePage/>} />
            <Route path="/tutor/search" element={<TutorSearchPage/>} />
            <Route path="/calendar" element={<CalendarPage/>} />
            <Route path="/TOTPSetup" element={<TOTPSetup/>} />
            <Route path="/TOTPVerify" element={<TOTPVerify/>} />
            <Route path="/tutoredit" element={<TutorEditProfile />} />
            <Route path="/studentedit" element={<StudentEditProfile />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/logout" element={<Logout/>} />
            <Route path="/students/favorites_list" element={<FavoritesList/>}/>
            <Route path="/students/favorites_list/:StudentID/:TutorID" element={<AddToFavorites/>}/>
          <Route path="/studentdashboard" element={<StudentDashboard />} />
            <Route path ="/TutorDashboard" element={<TutorDashboard />} />
          </Routes>
        </BrowserRouter>
      </div>
  );
}

export default App;
