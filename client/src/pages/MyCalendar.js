import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import Modal from 'react-modal';
import axios from '../config/axios';
import CreateEventForm from '../components/CreateEventForm';
import { useNavigate } from 'react-router-dom'

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
  });
  const [filterTutorID, setFilterTutorID] = useState('');
  const [filterStudentID, setFilterStudentID] = useState('');
  const [deleteAppointmentId, setDeleteAppointmentId] = useState('');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:8800/Appointments')
      .then((res) => {
        const transformedEvents = res.data.map((appointment) => {
          const { ID, AppointmentDate, StartTime, EndTime, StudentID, TutorID } = appointment;

          const startDate = new Date(AppointmentDate);
          const startTimeParts = StartTime.split(':');
          startDate.setHours(Number(startTimeParts[0]), Number(startTimeParts[1]));

          const endDate = new Date(AppointmentDate);
          const endTimeParts = EndTime.split(':');
          endDate.setHours(Number(endTimeParts[0]), Number(endTimeParts[1]));


          return {
            title: String(ID),
            start: startDate,
            end: endDate,
            studentID: StudentID,
            tutorID: TutorID,
          };
        });

        setEvents(transformedEvents);
      })
      .catch((err) => {
        if (err.response) console.log(err.response);
        else console.log(err);
      });
  }, []);

  useEffect(() => {
    if (filterTutorID === '') {
      setFilteredEvents(events); // If no filter, show all events
    } else {
      const filtered = events.filter(
        (event) => event.tutorID === parseInt(filterTutorID)
      );
      setFilteredEvents(filtered);
    }
  }, [filterTutorID, events]);

  useEffect(() => {
    if (filterStudentID === '') {
      setFilteredEvents(events); // If no filter, show all events
    } else {
      const filtered = events.filter(
        (event) => event.studentID === parseInt(filterStudentID)
      );
      setFilteredEvents(filtered);
    }
  }, [filterStudentID, events]);

  const getUser = () => {
    axios.get("/users/session")
      .then(res => {
        setUser(res.data)
        if (!res.data.SessionTOTPVerified) navigate("/TOTPVerify");
        // if (res.data.IsTutor === 0) navigate("/studentdashboard")
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

  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const createEvent = async () => {
    // Check if required fields are empty
    if (!newEvent.studentID || !newEvent.tutorID || !newEvent.appointmentDate || !newEvent.startTime || !newEvent.endTime) {
      alert('Please fill in all required fields.');
      return;
    }

    try {


      const tutorResponse = await axios.get(`http://localhost:8800/tutors/${newEvent.tutorID}`);
      const tutor = tutorResponse.data;
      console.log('Tutor data:', tutor);

      // Add console.log statements to debug
      console.log('tutor.availableHoursStart:', tutor.AvailableHoursStart);
      console.log('tutor.availableHoursEnd:', tutor.AvailableHoursEnd);

      const appointmentStartTime = moment(`${newEvent.appointmentDate} ${newEvent.startTime}`, 'YYYY-MM-DD HH:mm', true);
      const appointmentEndTime = moment(`${newEvent.appointmentDate} ${newEvent.endTime}`, 'YYYY-MM-DD HH:mm', true);

      const tutorAvailableStartTime = moment(tutor.AvailableHoursStart, 'HH:mm:ss', true);
      const tutorAvailableEndTime = moment(tutor.AvailableHoursEnd, 'HH:mm:ss', true);

      console.log('appointmentStartTime:', appointmentStartTime.format('HH:mm:ss'));
      console.log('appointmentEndTime:', appointmentEndTime.format('HH:mm:ss'));
      console.log('tutorAvailableStartTime:', tutorAvailableStartTime.format('HH:mm:ss'));
      console.log('tutorAvailableEndTime:', tutorAvailableEndTime.format('HH:mm:ss'));

      tutorAvailableStartTime.set({ year: appointmentStartTime.year(), month: appointmentStartTime.month(), date: appointmentStartTime.date() });
      tutorAvailableEndTime.set({ year: appointmentStartTime.year(), month: appointmentStartTime.month(), date: appointmentStartTime.date() });

      const isWithinAvailableHours = appointmentStartTime.isBetween(tutorAvailableStartTime, tutorAvailableEndTime, null, '[]');
      console.log('Is appointment within available hours?', isWithinAvailableHours);
      console.log('Appointment start date/time:', appointmentStartTime.format('YYYY-MM-DD HH:mm:ss'));
      console.log('Tutor available start date/time:', tutorAvailableStartTime.format('YYYY-MM-DD HH:mm:ss'));
      console.log('Tutor available end date/time:', tutorAvailableEndTime.format('YYYY-MM-DD HH:mm:ss'));

      if (!isWithinAvailableHours) {
        alert('Appointment is outside the tutor\'s available hours');
        return;
      }


      // Send the new event data to the server
      axios
        .post('http://localhost:8800/createAppointment', newEvent)
        .then((res) => {
          console.log('Appointment created successfully');
          // Fetch the updated list of appointments
          fetchAppointments();
        })
        .catch((err) => {
          console.error('Error creating appointment:', err);
        });

      // Reset the new event form
      setNewEvent({
        studentID: '',
        tutorID: '',
        appointmentDate: '',
        startTime: '',
        endTime: '',
      });
    } catch (error) {
      console.error('error creating appointment:', error);
    }
  };

  const createAppointment = (appointmentData) => {
    axios
      .post('http://localhost:8800/createAppointment', appointmentData)
      .then((res) => {
        fetchAppointments();
        setIsCreatingEvent(false);
      })
      .catch((err) => {
        // Handle errors
        console.error('Error creating appointment:', err);
      });
  };


  const handleDeleteAppointment = () => {
    // Send a DELETE request to the server
    axios
      .delete(`http://localhost:8800/appointments/${deleteAppointmentId}`)
      .then((res) => {
        console.log('Appointment deleted successfully');
        // Refresh the events by fetching the updated data from the server
        fetchAppointments();
      })
      .catch((err) => {
        console.error('Error deleting appointment:', err);
      });
  };

  const fetchAppointments = () => {
    axios
      .get('http://localhost:8800/Appointments')
      .then((res) => {
        const transformedEvents = res.data.map((appointment) => {
          const { ID, AppointmentDate, StartTime, EndTime, StudentID, TutorID } = appointment;

          const startDate = new Date(AppointmentDate);
          const startTimeParts = StartTime.split(':');
          startDate.setHours(Number(startTimeParts[0]), Number(startTimeParts[1]));

          const endDate = new Date(AppointmentDate);
          const endTimeParts = EndTime.split(':');
          endDate.setHours(Number(endTimeParts[0]), Number(endTimeParts[1]));

          return {
            title: String(ID),
            start: startDate,
            end: endDate,
            studentID: StudentID,
            tutorID: TutorID,
          };
        });

        setEvents(transformedEvents);
        setFilteredEvents(transformedEvents); // Initialize filtered events with all events
      })
      .catch((err) => {
        if (err.response) console.log(err.response);
        else console.log(err);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Trigger appointment deletion when the Enter key is pressed
      handleDeleteAppointment();
    }
  };

  return (
    <div>
      {isModalOpen ? (
        <div className="modal">
          <div className="modal-content">
            <h2>Event Details</h2>
            <p>Title: {selectedEvent.title}</p>
            <p>Start Time: {moment(selectedEvent.start).format('HH:mm A')}</p>
            <p>End Time: {moment(selectedEvent.end).format('HH:mm A')}</p>
            <button onClick={closeModal}>Close Event Details</button>
          </div>
        </div>
      ) : (
        <div>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            onSelectEvent={openModal}
          />
          <div className="event-form">
            <h2>Create New Event</h2>
            <div className="form-group">
              <label htmlFor="student-id">Student ID:</label>
              <input
                id="student-id"
                type="text"
                value={newEvent.studentID}
                onChange={(e) => setNewEvent({ ...newEvent, studentID: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="tutor-id">Tutor ID:</label>
              <input
                id="tutor-id"
                type="text"
                value={newEvent.tutorID}
                onChange={(e) => setNewEvent({ ...newEvent, tutorID: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="appointment-date">Appointment Date:</label>
              <input
                id="appointment-date"
                type="date"
                value={newEvent.appointmentDate}
                onChange={(e) => setNewEvent({ ...newEvent, appointmentDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="start-time">Start Time:</label>
              <input
                id="start-time"
                type="time"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-time">End Time:</label>
              <input
                id="end-time"
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
              />
            </div>
            <button className="btn-create-event" onClick={createEvent}>
              Create Appointment
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="tutor-id">Filter by Tutor ID:</label>
            <input
              id="tutor-id"
              type="number"
              value={filterTutorID}
              onChange={(e) => setFilterTutorID(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="student-id">Filter by Student ID:</label>
            <input
              id="student-id"
              type="number"
              value={filterStudentID}
              onChange={(e) => setFilterStudentID(e.target.value)}
            />
          </div>
        </div>
      )}
      <div className="event-form">
        <div className="form-group">
          <label htmlFor="delete-appointment-id">Appointment ID:</label>
          <input
            id="delete-appointment-id"
            type="text"
            value={deleteAppointmentId}
            onChange={(e) => setDeleteAppointmentId(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <button className="btn-delete-appointment" onClick={handleDeleteAppointment}>
          Delete Appointment
        </button>
        <br/>
        <br/>
        <button onClick={() => user.IsTutor === 1 ? navigate('/TutorDashboard') : navigate('/studentdashboard')}>Back to dashboard</button>
      </div>
    </div>
  );
};

export default MyCalendar;
