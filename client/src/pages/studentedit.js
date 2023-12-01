import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import '../App.css'

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Nav,
  Container,
  Row,
  Col,
} from "react-bootstrap";
const StudentEditProfile = () => {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [user, setUser] = useState(null)
  const [file, setFile] = useState()
  const [data, setData] = useState([])
  useEffect(() => {
    axios
      .get('http://localhost:8800/users/session')
      .then((res) => {
        if (!res.data.SessionTOTPVerified) navigate('/TOTPVerify')
        if (res.data.IsTutor === 1) navigate('/tutordashboard')
        setUser(res.data)
        setStudent(res.data)
      })
      .catch((err) => {
        if (err.response.status == 404) {
          navigate('/login')
        } else console.log(err)
      })
  }, [])
  const handleSaveChanges = async () => {
    await axios
      .put('students/' + user.ID, student)
      .then((_) => window.location.reload(false))
      .catch(console.log)
  }
  const handleFile = (e) => {
    setFile(e.target.files[0])
  }
  const handleInputChange = (e) =>
    setStudent((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleUpload = () => {
    const formData = new FormData()
    formData.append('image', file)
    axios
      .put('http://localhost:8800/users/profile_picture/' + user.ID, formData)
      .then((_) => window.location.reload(false))
      .catch(console.log)
  }

  if (!student || !user) return <div>Loading...</div>

  return (
    <div>
      <aside className="sidemenu">
        <div className="side-menu-button">
          <h1>
            {user.FirstName} {user.LastName}
          </h1>
        </div>
        <div className="profile-container">
          {student.ProfilePictureID && (
            <img
              src={`http://localhost:8800/` + student.ProfilePictureID}
              alt="Profile"
              width="50"
              height="50"
            />
          )}
          <label htmlFor="profileImage">Profile Picture:</label>
          <input type="file" onChange={handleFile} />
          <button onClick={handleUpload}>upload</button>
        </div>
      </aside>
      {/* Box accept input */}
      <div className="input-container">
        <label htmlFor="firstname">First Name: {student.firstname} </label>
        <input
          type="text"
          value={student.FirstName}
          placeholder="First name"
          name="FirstName"
          onChange={handleInputChange}
          required
        />
        <label htmlFor="lastname">Last Name: {student.lastname} </label>

        <input
          type="text"
          placeholder="Last name"
          onChange={handleInputChange}
          value={student.LastName}
          name="LastName"
          required
        />
        <div className="input-container">
          <label>Email: </label>
          <input
            type="text"
            placeholder="Email"
            value={student.Email}
            onChange={handleInputChange}
            name="Email"
            required
          />
        </div>
      </div>
      <button onClick={handleSaveChanges}>Save Changes</button>
      <br/>
      <br/>
      <button onClick={()=>{navigate('/studentdashboard')}}>Back to dashboard</button>
    </div>
  )
}
export default StudentEditProfile
