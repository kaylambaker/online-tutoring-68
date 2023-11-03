
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";
import "./Style.css"; // Import the CSS file

const Tutors = () => {
  const [tutor, setTutor] = useState(null);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const res = await axios.get("http://localhost:8800/tutors/2"); // Replace 2 with the ID of the tutor you want to display
        setTutor(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchTutorData();
  }, []);

  if (!tutor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="tutor-profile">
      <h1 className="tutor-heading">TUTOR PROFILE</h1>
      <div className="tutor">
        <div className="info">
          <p className="tutor-info">
            <span className="info-label">Name:</span> {tutor.FirstName} {tutor.LastName}
          </p>
          <p className="tutor-info">
            <span className="info-label">Bio:</span> {tutor.Bio}
          </p>
          <p className="tutor-info">
            <span className="info-label">Email:</span> {tutor.Email}
          </p>
          <p className="tutor-info">
            <span className="info-label">Subject:</span> {tutor.Subject}
          </p>
          <p className="tutor-info">
            <span className="info-label">Available Start Date:</span> {tutor.AvailableHoursStart}
          </p>
          <p className="tutor-info">
            <span className="info-label">Available End Date:</span> {tutor.AvailableHoursEnd}
          </p>
          <div className="action-buttons">
            <button className="update">
              <Link to={`/update/${tutor.ID}`}>Update the tutor profile</Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tutors;
