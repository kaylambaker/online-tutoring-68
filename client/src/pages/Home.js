import axios from '../config/axios'
import '../App.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
export default function HomePage() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const getUser = () => {
    axios
      .get('/users/session')
      .then((res) => {
        setUser(res.data)
        if (!res.data.SessionTOTPVerified) navigate('/TOTPVerify')
      })
      .catch((err) => {
        if (err.response.status == 404);
        else console.log(err)
      })
  }
  useEffect(() => {
    getUser()
  }, [])

  return (
    <div className="home">
      <h1>Online Tutoring</h1>
      {user && (
        <div>
          <button
            onClick={
              user.IsTutor == 1
                ? () => navigate('/TutorDashboard')
                : () => navigate('studentdashboard')
            }
          >
            dashboard
          </button>
          <button onClick={() => navigate('/logout')}>logout</button>
        </div>
      )}
      {!user && (
        <div>
          <button onClick={() => navigate('/login')}>login</button>
        </div>
      )}
    </div>
  )
}
