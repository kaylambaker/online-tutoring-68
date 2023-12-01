import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
//import "../styles/StudentDashboard.module.css";
import '../App.css'
//import "../StudentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate()
  const [student, setStudent] = useState({
    name: '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  //get hours completed from end point
  const [hour, setHoursCompleted] = useState(0)
  const [user, setUser] = useState(null)
  const getHoursComplete = (id) => {
    axios
      .get('/hoursCompleted/' + id)
      .then((res) => {
        setHoursCompleted(res.data.HoursCompleted)
      })
      .catch((err) => {
        console.log(err)
      })
  }
  const getUser = () => {
    axios
      .get('/users/session')
      .then((res) => {
        setUser(res.data)
        if (!res.data.SessionTOTPVerified) navigate('/TOTPVerify')
        if (res.data.IsTutor === 0) navigate('/studentdashboard')
        getHoursComplete(res.data.ID)
      })
      .catch((err) => {
        if (err.response.status == 404) {
          alert('not logged in')
          navigate('/login')
        } else console.log(err)
      })
  }

  useEffect(() => {
    getUser()
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  // Ensure that tutor is not null before accessing its properties
  const profilePictureID = user ? user.ProfilePictureID : null
  return (
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>
      {profilePictureID && (
        <div className="info">
          <img
            src={`http://localhost:8800/` + profilePictureID}
            alt="Profile"
            className="profile-picture"
          />
        </div>
      )}
      <div>
        <p>Hours Completed: {hour}</p>
      </div>
      <div>
        <Link to="/calendar">View Calendar</Link>
      </div>
      <div>
        <Link to="/studentedit">Edit Profile</Link>
      </div>
      <button onClick={() => navigate('/tutor/search')}>search tutor</button>
      <button onClick={() => navigate('/students/favorites_list')}>
        favorites list
      </button>
      <button onClick={() => navigate('/logout')}>logout</button>
      <button onClick={() => navigate('/')}>home page</button>
    </div>
  )
}

export default StudentDashboard
