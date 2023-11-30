import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";
import "../Style.css"; // Import the CSS file

const TutorDashboard = () => {
  const [tutor, setTutor] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {


        // Fetch user session information
        //This has been commented to simnulate a logged in user
        /*************************************************************
        const userResponse = await axios.get("http://localhost:8800/users/session");
        const authenticatedUser = userResponse.data;
        ***********************************************************/


        // Simulate a logged-in user
        const authenticatedUser = {
          userId: 2, // Replace with the ID of the user you want to simulate
        };

        if (!authenticatedUser || !authenticatedUser.userId) {
          console.log("No user logged in");
          return;
        }

        setUser(authenticatedUser);

        // Fetch tutor data based on the user ID
        const tutorResponse = await axios.get(`http://localhost:8800/tutors/${authenticatedUser.userId}`);
        setTutor(tutorResponse.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  if (!tutor || !user) {
    return <div>Loading...</div>;
  }

  // Ensure that tutor is not null before accessing its properties
  const profilePictureID = tutor ? tutor.ProfilePictureID : null;
  const hoursCompleted = tutor ? tutor.HoursCompleted : null;

  return (
    <div className="tutor-profile">
      <h1 className="tutor-heading">TUTOR DASHBOARD</h1>
      <div className="tutor">
        <div className="info">
          <img
            src={`http://localhost:8800` + profilePictureID}
            alt="Profile"
            className="profile-picture"
          />

          <p className="tutor-info">
            <span className="info-label">HoursCompleted:</span> {hoursCompleted}
          </p>

          <div className="action-buttons">
            <button className="update">
              <Link to={`/tutoredit/${tutor.ID}`}>Update the tutor profile</Link>
            </button>
          </div>

          <div className="action-buttons">
            <button className="update">
              <Link to={`/calendar/${tutor.ID}`}>View The Calendar</Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorDashboard;
