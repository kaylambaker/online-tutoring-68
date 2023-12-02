import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import axios from '../config/axios'
import {Button } from 'react-bootstrap'

const TutorEditProfile = () => {
  const [tutor, setTutor] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const getUser = () => {
    axios
      .get('/users/session')
      .then((res) => {
        if (!res.data.SessionTOTPVerified) navigate('/TOTPVerify')
        if (res.data.IsTutor === 0) navigate('/studentdashboard')
        setUser(res.data)
        setTutor(res.data)
      })
      .catch((err) => {
        if (err.response.status == 404) {
          alert('not logged in')
          navigate('/')
        } else console.log(err)
      })
  }
  //fetch tutor infor from database
  useEffect(() => {
    getUser()
  }, [])
  /* useEffect(() => {
    axios
      .get('http://localhost:8800/')
      .then((res) => {
        setData(res.data[0])
      })
      .catch((err) => console.log(err))
  }, []) */
  const handleUpload = () => {
    const formData = new FormData()
    formData.append('image', file)
    axios
      .put('http://localhost:8800/users/profile_picture/' + user.ID, formData)
      .then((res) => console.log(res))
      .catch((err) => console.log(err))
    window.location.reload(false)
  }

  const handleSaveChanges = async () => {
    await axios
      .put('/tutors/' + user.ID, tutor)
      .then((res) => {
        window.location.reload(false)
      })
      .catch(console.log)
  }

  const [file, setFile] = useState()
  const [data, setData] = useState([])
  const handleFile = (e) => {
    setFile(e.target.files[0])
  }

  const handleInputChange = (e) =>
    setTutor((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  if (!user || !tutor) return <div>Loading...</div>

  return (
    <div class="padded-div">
      <aside className="sidemenu">
        <div className="side-menu-button">
          <h1>
            {user.FirstName} {user.LastName}
          </h1>
          <div className="profile-container">
            {user.ProfilePictureID && (
              <img
                src={'http://localhost:8800/' + user.ProfilePictureID}
                alt="Profile"
                width="50"
                height="50"
              />
            )}
            <label htmlFor="profileImage">Profile Picture:</label>
            <input type="file" onChange={handleFile} />
            <Button onClick={handleUpload}>upload</Button>
          </div>
        </div>
      </aside>

      {/* Bio input */}
      <div className="input-container">
        <label>First Name: </label>
        <input
          type="text"
          value={tutor.FirstName}
          name="FirstName"
          onChange={handleInputChange}
          required
        />
      </div>
      {/* Bio input */}
      <div className="input-container">
        <label>Last Name: </label>
        <input
          type="text"
          value={tutor.LastName}
          name="LastName"
          onChange={handleInputChange}
          required
        />
      </div>
      {/* Bio input */}
      <div className="input-container">
        <label>Bio: </label>
        <input
          type="text"
          value={tutor.Bio}
          name="Bio"
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Email input */}
      <div className="input-container">
        <label>Email: </label>
        <input
          type="text"
          placeholder="Email"
          value={tutor.Email}
          onChange={handleInputChange}
          name="Email"
          required
        />
      </div>

      {/* Courses input */}
      <div className="input-container">
        <label htmlFor="subject">Subject: </label>
        <input
          type="text"
          placeholder="Subject"
          name="Subject"
          value={tutor.Subject}
          onChange={handleInputChange}
          required
        />
      </div>
      <label>available hours</label>
      <br />
      <label>start time</label>
      <br />
      <input
        type="time"
        value={tutor.AvailableHoursStart}
        name="AvailableHoursStart"
        onChange={handleInputChange}
      />
      <br />
      <label>end time</label>
      <br />
      <input
        type="time"
        value={tutor.AvailableHoursEnd}
        name="AvailableHoursEnd"
        onChange={handleInputChange}
      />
      <br />
      {/* Save Changes button */}
      <br />
      <Button type="submit" onClick={handleSaveChanges} style={{backgroundColor:"green",border:"green"}}>
        Save Changes
      </Button>
      <br/>
      <br/>
      <Button onClick={()=>{navigate(-1)}}>Back</Button>
    </div>
  )
}

export default TutorEditProfile
