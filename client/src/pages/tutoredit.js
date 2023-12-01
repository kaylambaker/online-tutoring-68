import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import axios from '../config/axios'

const TutorEditProfile = () => {
  const [tutor, setTutor] = useState({
    bio: "",
    email: "",
    subject: "",
    hourscompleted: 0, // Thêm giá trị HoursCompleted mặc định
  });
  //const [selectedFile, setSelectedFile] = useState(null);
  const [user, setUser] = useState(null);
  //get user login session
  useEffect(() => {
    axios
      .get("http://localhost:8800/tutors")
      .then((res) => setTutor(res.data))
      .catch(console.log);
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
          navigate('/login')
        } else console.log(err)
      })
  }
  //fetch tutor infor from database
  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const res = await axios.get("http://localhost:8800/tutors/34");
        console.log(res);
        const tutorData = res.data;
        // Set the fetched data into the state
        setTutor({
          bio: tutorData.Bio || "",
          email: tutorData.Email || "",
          subject: tutorData.Subject || "",
          firstname: tutorData.FirstName || "",
          lastname: tutorData.LastName || "",
          hourstart: tutorData.AvailableHoursStart || "",
          hourend: tutorData.AvailableHoursEnd || "",
          profilepicture: tutorData.ProfilePictureID || "",
          hourscompleted: tutorData.HoursCompleted || 0,
        });
      } catch (err) {
        console.log(err);
      }
    };
    fetchTutorData();
  }, []);

  const handleSaveChanges = async () => {
    try {
      // Create an object with the data to be sent to the backend
      const updatedData = {
        Bio: tutor.bio,
        Email: tutor.email,
        Subject: tutor.subject,
        FirstName: tutor.firstname,
        LastName: tutor.lastname,
        AvailableHoursStart: tutor.hourstart,
        AvailableHoursEnd: tutor.hourend,
        HoursCompleted: tutor.hourscompleted,
      };

      const response = await axios.put(
        `http://localhost:8800/tutors/34`,
        updatedData
      );

      // Handle the response, e.g., show a success message
      console.log("Data updated successfully:", response.data);

      // Trigger a page refresh to load the updated data
      //window.location.reload();
    } catch (error) {
      // Handle any errors, e.g., show an error message
      console.error("Error updating data:", error);
    }
  };

  const [file, setFile] = useState();
  const [data, setData] = useState([]);
  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };
  useEffect(() => {

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
    <div>
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
            <button onClick={handleUpload}>upload</button>
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
        <label htmlFor="subject">Subject: {tutor.subject}</label>
        <input type="text" placeholder="Subject" name="subject" required />
      </div>
      <div className="availability-container">
        <label htmlFor="hourstart">Available from: {tutor.hourstart}</label>
        <label htmlFor="hourend" style={{ display: "block" }}>
          Available to: {tutor.hourend}
        </label>
      </div>

      {/* Availability input */}
      <div className="availability-container">
        <label htmlFor="availability">Availability:</label>
        <div className="availability-inputs">
          <label htmlFor="from-time">From: </label>
          <select name="from-time-hour">
            {hours.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
          <span>:</span>
          <select name="from-time-minute">
            {minutes.map((minute) => (
              <option key={minute} value={minute}>
                {minute}
              </option>
            ))}
          </select>
          <select name="from-time-am-pm">
            {amPmOptions.map((amPm) => (
              <option key={amPm} value={amPm}>
                {amPm}
              </option>
            ))}
          </select>
        </div>
        <div className="availability-inputs">
          <label htmlFor="to-time">To: </label>
          <select name="to-time-hour">
            {hours.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
          <span>:</span>
          <select name="to-time-minute">
            {minutes.map((minute) => (
              <option key={minute} value={minute}>
                {minute}
              </option>
            ))}
          </select>
          <select name="to-time-am-pm">
            {amPmOptions.map((amPm) => (
              <option key={amPm} value={amPm}>
                {amPm}
              </option>
            ))}
          </select>
        </div>
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
      <button type="submit" onClick={handleSaveChanges}>
        Save Changes
      </button>
      <br/>
      <br/>
      <button onClick={()=>{navigate('/TutorDashboard')}}>Back to dashboard</button>
    </div>
  )
}

export default TutorEditProfile
