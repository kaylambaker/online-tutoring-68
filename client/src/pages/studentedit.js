import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import "../App.css";

const StudentEditProfile = () => {
  const [student, setStudent] = useState({
    firstname: "",
    lastname: "",
    hourscompleted: 0, // Thêm giá trị HoursCompleted mặc định
  });
  //user session
  const [user, setUser] = useState(null);
  useEffect(() => {
    axios
      .get("http://localhost:8800/tutors")
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
  //const [selectedFile, setSelectedFile] = useState(null);
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await axios.get("http://localhost:8800/students/2");
        //console.log(res);
        const studentData = res.data;
        // Set the fetched data into the state
        setStudent({
          firstname: studentData.FirstName || "",
          lastname: studentData.LastName || "",
          profilepicture: studentData.ProfilePictureID || "",
          hourscompleted: studentData.HoursCompleted || 0,
        });
        console.log("Student Data:", studentData);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStudentData();
  }, []);
  const handleSaveChanges = async () => {
    try {
      // Create an object with the data to be sent to the backend
      const updatedData = {
        FirstName: student.firstname,
        LastName: student.lastname,
        HoursCompleted: student.hourscompleted,
      };

      // Send a PUT request to update the tutor's data in the database
      const response = await axios.put(
        "http://localhost:8800/students/2",
        updatedData
      );
      console.log(updatedData);
      // Handle the response, e.g., show a success message
      console.log("Data updated successfully:", response.data);
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
      .get("http://localhost:8800/")
      .then((res) => {
        setData(res.data[0]);
      })
      .catch((err) => console.log(err));
  }, []);
  const handleUpload = () => {
    const formData = new FormData();
    formData.append("image", file);
    axios
      .put("http://localhost:8800/users/profile_picture/2", formData)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <aside className="sidemenu">
        <div className="side-menu-button">
          <h1>Home</h1>
          <h1>Calendar</h1>
          <h1>
            {student.firstname} {student.lastname}
          </h1>
        </div>
        <div className="profile-container">
          <img
            src={`http://localhost:8800/` + student.profilepicture}
            alt="Profile"
            width="50"
            height="50"
          />
          <label htmlFor="profileImage">Profile Picture:</label>
          <input type="file" onChange={handleFile} />
          <button onClick={handleUpload}>upload</button>
        </div>
      </aside>
      {/* Name input */}
      <div className="input-container">
        <label htmlFor="firstname">First Name: {student.firstname} </label>
        <input type="text" placeholder="First name" name="firstname" required />
        <label htmlFor="lastname">Last Name: {student.lastname} </label>
        <input type="text" placeholder="Last name" name="lastname" required />
        <label htmlFor="hourscompleted">
          Hours Completed: {student.hourscompleted}{" "}
        </label>
        <input
          type="text"
          placeholder="Hours completed"
          name="hourscompleted"
          required
        />
      </div>
      <button onClick={handleSaveChanges}>Save Changes</button>
    </div>
  );
};
export default StudentEditProfile;
