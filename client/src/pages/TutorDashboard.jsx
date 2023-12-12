import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import "../Style.css"; // Import the CSS file
import { Button } from 'react-bootstrap'

const TutorDashboard = () => {
  const [user, setUser] = useState(null);
  const [hours, setHours] = useState(0);
  const navigate = useNavigate()

  const getHoursComplete = (id) => {
    axios.get('/hoursCompleted/' + id)
      .then(res => { setHours(res.data.HoursCompleted) })
      .catch(err => { console.log(err); })
  }
  const getUser = () => {
    axios.get("/users/session")
      .then(res => {
        setUser(res.data)
        if (!res.data.SessionTOTPVerified) navigate("/TOTPVerify");
        if (res.data.IsTutor === 0) navigate("/studentdashboard")
        getHoursComplete(res.data.ID)
      })
      .catch(err => {
        if (err.response.status == 404) {
          alert("not logged in")
          navigate("/")
        }
        else console.log(err);
      })
  }

  useEffect(() => {
    getUser()
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Ensure that tutor is not null before accessing its properties
  const profilePictureID = user ? user.ProfilePictureID : null;

  return (
    <div className="tutor-profile">
      <h1 className="tutor-heading">Tutor Dashboard</h1>
      <div className="tutor">
        <div className="info">
          {profilePictureID && (
            <img
              src={process.env.API_HOST+`/` + profilePictureID}
              alt="Profile"
              className="profile-picture"
            />
          )}

          <p className="tutor-info">
            <span className="info-label">HoursCompleted:</span> {hours}
          </p>

          <Button onClick={() => navigate('/calendar')}>calendar </Button>
          <Button onClick={() => navigate('/tutoredit')}>edit profile </Button>
          <Button onClick={() => navigate('/')}>home page</Button>
          <Button onClick={() => navigate('/TOTPSetup')}>reset 2FA</Button>
          <Button onClick={() => navigate('/logout')}>logout</Button>
        </div>
      </div>
    </div>
  );
}

export default TutorDashboard;
