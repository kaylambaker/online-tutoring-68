import React, { useState } from 'react';

const CreateEventForm = ({ createAppointment, onClose }) => {
  const [studentID, setStudentID] = useState('');
  const [tutorID, setTutorID] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [appointmentID, setAppointmentID] = useState('');

  const handleSubmit = () => {
    const appointmentData = {
      studentID: parseInt(studentID),
      tutorID: parseInt(tutorID),
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      appointmentID: parseInt(appointmentID),
    };

    createAppointment(appointmentData);
    onClose();
  };

  return (
    <div>
      <h2>Create New Event</h2>
      <div className="form-group">
        <label htmlFor="student-id">Student ID:</label>
        <input
          id="student-id"
          type="number"
          value={studentID}
          onChange={(e) => setStudentID(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="tutor-id">Tutor ID:</label>
        <input
          id="tutor-id"
          type="number"
          value={tutorID}
          onChange={(e) => setTutorID(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="start-time">Start Time:</label>
        <input
          id="start-time"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="end-time">End Time:</label>
        <input
          id="end-time"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="appointment-id">Appointment ID:</label>
        <input
          id="appointment-id"
          type="number"
          value={appointmentID}
          onChange={(e) => setAppointmentID(e.target.value)}
        />
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default CreateEventForm;