import './App.css';
import "./Style.css";
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
import Login from './pages/Login'
import Logout from './pages/Logout'
import AddToFavorites from './pages/AddToFavorites';
import RemoveFromFavorites from './pages/RemoveFromFavorites';
import FavoritesList from './pages/FavoritesList';

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
            <Route path="/login" element={<Login/>} />
            <Route path="/logout" element={<Logout/>} />
            <Route path="/students/favorites_list/:StudentID" element={<FavoritesList/>}/>
            <Route path="/students/favorites_list/:StudentID/:TutorID" element={<AddToFavorites/>}/>
            <Route path="/students/favorites_list/RemoveFromFavorites/:StudentID/:TutorID" element={<RemoveFromFavorites/>}/>
          </Routes>
        </BrowserRouter>
      </div>
  );
}

export default App;

