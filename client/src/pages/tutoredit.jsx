import React, { useState, useEffect } from 'react';
import profileImage from '../profile.jpg';
import "../App.css";
import axios from 'axios';

const TutorEditProfile = () => {
  const [tutor, setTutor] = useState([])
  useEffect(() => {
    const fetchAllTutorEditProfile = async ()=>{
      try{
        const res = await axios.get("http://localhost:3000/tutoredit")
        console.log(res)
      }catch(err){
        console.log(err)
      }
    }
    fetchAllTutorEditProfile()
  },[])

  // Generate arrays for hours, minutes, and AM/PM options
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  const amPmOptions = ['AM', 'PM'];

  return (
    <div>
      <aside className="sidemenu">
        <div className="side-menu-button">
          <h1>Home</h1>
          <h1>Calendar</h1>
          <h1>Jonathan Nguyen</h1>
          <div className="profile-container">
            <img src={profileImage} alt="Profile" width="50" height="50" />
          </div>
        </div>
      </aside>

      {/* Bio input */}
      <div className="input-container">
        <label htmlFor="bio">Bio:</label>
        <input type="text" placeholder="Bio" name="bio" required />
      </div>

      {/* Email input */}
      <div className="input-container">
        <label htmlFor="email">Email:</label>
        <input type="text" placeholder="Email" name="email" required />
      </div>

      {/* Password input */}
      <div className="input-container">
        <label htmlFor="password">Password:</label>
        <input type="text" placeholder="Password" name="password" required />
      </div>

      {/* Courses input */}
      <div className="input-container">
        <label htmlFor="courses">Courses:</label>
        <input type="text" placeholder="Courses" name="courses" required />
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
      </div>
    </div>
  );
};

export default TutorEditProfile;
