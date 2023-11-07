import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../config/axios";
import "../App.css";

const StudentDashboard = () => {
  const [student, setStudent] = useState({
    name: "",
  });
  const [user, setUser] = useState(null);
  useEffect(() => {
    axios
      .get("http://localhost:8800/students")
      .then((res) => setStudent(res.data))
      .catch(console.log);
    axios
      .get("http://localhost:8800/users/session")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        if (err.response.status == 404) alert("no user logged in");
        else console.log(err);
      });
  }, []);
  const [selectedFile, setSelectedFile] = useState(null);
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await axios.get("http://localhost:8800/students/2");
        console.log(res);
        const studentData = res.data;
        // Set the fetched data into the state
        setStudent({
          firstname: studentData.FirstName || "",
          lastname: studentData.LastName || "",
          hourscompleted: studentData.HoursCompleted || 0,
          profilepicture: studentData.ProfilePictureID || "",
        });
        console.log("Student Data:", studentData);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStudentData();
  }, []);
  return (
    <div>
      <h1>Student Dashboard</h1>
      <div className="profile-container">
        <img
          src={`http://localhost:8800/` + student.profilepicture}
          alt="Profile"
          width="50"
          height="50"
        />
      </div>
      <div>
        <p>Hours Completed: {student.hourscompleted}</p>
      </div>
      <div>
        <Link to="/calendar">View Calendar</Link>
      </div>
      <div>
        <Link to="/studentedit">Edit Profile</Link>
      </div>
    </div>
  );
};

const handleViewFavoritesClick = () => {
  // Xử lý khi nhấn nút "View Favorites List"
  console.log("View Favorites List clicked");
};

const handleViewCalendarClick = () => {
  // Xử lý khi nhấn nút "View Calendar"
  console.log("View Calendar clicked");
};

const handleEditProfileClick = () => {
  // Xử lý khi nhấn nút "Edit Profile"
  console.log("Edit Profile clicked");
};

export default StudentDashboard;
