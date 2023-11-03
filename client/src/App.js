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
import TutorSearchPage from './pages/TutorSearch'

function App() {
  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/signup" element={<SignupPage/>} />
            <Route path="/tutor/:id" element={<TutorProfilePage/>} />
            <Route path="/tutor/search" element={<TutorSearchPage/>} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;

