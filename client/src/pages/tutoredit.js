import React, { useState, useEffect } from "react";
import "../App.css";
import axios from "../config/axios";

const TutorEditProfile = () => {
  const [tutor, setTutor] = useState({
    bio: "",
    email: "",
    subject: "",
  });
  //const [selectedFile, setSelectedFile] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    axios
      .get("http://localhost:8800/tutors")
      .then((res) => setTutor(res.data))
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
      };

      const response = await axios.put(
        `http://localhost:8800/tutors/34`,
        updatedData
      );

      // Handle the response, e.g., show a success message
      console.log("Data updated successfully:", response.data);

      // Trigger a page refresh to load the updated data
      window.location.reload();
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
      .put("http://localhost:8800/users/profile_picture/34", formData)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };
  // Generate arrays for hours, minutes, and AM/PM options
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const amPmOptions = ["AM", "PM"];

  return (
    <div>
      <aside className="sidemenu">
        <div className="side-menu-button">
          <h1>Home</h1>
          <h1>Calendar</h1>
          <h1>
            {tutor.firstname} {tutor.lastname}
          </h1>
          <div className="profile-container">
            <img
              src={`http://localhost:8800/` + tutor.profilepicture}
              alt="Profile"
              width="50"
              height="50"
            />
            <label htmlFor="profileImage">Profile Picture:</label>
            <input type="file" onChange={handleFile} />
            <button onClick={handleUpload}>upload</button>
          </div>
        </div>
      </aside>

      {/* Bio input */}
      <div className="input-container">
        <label htmlFor="bio">Bio: {tutor.bio}</label>
        <input type="text" placeholder="Bio" name="bio" required />
      </div>

      {/* Email input */}
      <div className="input-container">
        <label htmlFor="email">Email: {tutor.email}</label>
        <input type="text" placeholder="Email" name="email" required />
      </div>

      {/* Courses input */}
      <div className="input-container">
        <label htmlFor="subject">Subject: {tutor.subject}</label>
        <input type="text" placeholder="Subject" name="subject" required />
      </div>
      <label htmlFor="hourstart">Available from: {tutor.hourstart}</label>
      <label htmlFor="hourend" style={{ display: "block" }}>
        Available to: {tutor.hourend}
      </label>

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
      {/* Save Changes button */}
      <button type="submit" onClick={handleSaveChanges}>
        Save Changes
      </button>
    </div>
  );
};

export default TutorEditProfile;
