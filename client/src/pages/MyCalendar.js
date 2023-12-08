import React, { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import moment from 'moment'
import { Form, Button } from 'react-bootstrap'
import Modal from 'react-modal'
import axios from '../config/axios'
import CreateEventForm from '../components/CreateEventForm'
import { useNavigate } from 'react-router-dom'

const localizer = momentLocalizer(moment)

const timeOpts = {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
}
const MyCalendar = () => {
  const [otherUsers, setOtherUsers] = useState([]) // users that the user can make an appointment with
  const [userRole, setUserRole] = useState('')
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    Subject: '',
  })
  //const [filterTutorID, setFilterTutorID] = useState('');
  //const [filterStudentID, setFilterStudentID] = useState('');
  const [deleteAppointmentId, setDeleteAppointmentId] = useState('')
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)

  /* useEffect(() => {
    axios
      .get('http://localhost:8800/Appointments')
      .then((res) => {
        const transformedEvents = res.data.map((appointment) => {
          const {
            ID,
            AppointmentDate,
            StartTime,
            EndTime,
            StudentID,
            TutorID,
          } = appointment

          const startDate = new Date(AppointmentDate)
          const startTimeParts = StartTime.split(':')
          startDate.setHours(
            Number(startTimeParts[0]),
            Number(startTimeParts[1]),
          )

          const endDate = new Date(AppointmentDate)
          const endTimeParts = EndTime.split(':')
          endDate.setHours(Number(endTimeParts[0]), Number(endTimeParts[1]))

          return {
            title: String(ID),
            start: startDate,
            end: endDate,
            studentID: StudentID,
            tutorID: TutorID,
          }
        })

        // setEvents(transformedEvents)
        setEvents(res.data)
      })
      .catch((err) => {
        if (err.response) console.log(err.response)
        else console.log(err)
      })
  }, []) */

  const getUser = () => {
    axios
      .get('/users/session')
      .then((res) => {
        setUser(res.data)
        setUserId(res.data.ID)
        setUserRole(res.data.IsTutor === 1 ? 'tutor' : 'student')
        res.data.IsTutor === 1
          ? axios
              .get('/students')
              .then((res) => setOtherUsers(res.data))
              .catch(console.log)
          : axios
              .get('/tutors')
              .then((res) => setOtherUsers(res.data))
              .catch(console.log)

        console.log('Session response:', res.data)
        console.log(userId)
        if (!res.data.SessionTOTPVerified) navigate('/TOTPVerify')
        // if (res.data.IsTutor === 0) navigate("/studentdashboard")
      })
      .catch((err) => {
        if (err.response.status == 404) {
          alert('not logged in')
          navigate('/')
        } else console.log(err)
      })
  }

  useEffect(() => {
    getUser()
  }, [])
  useEffect(() => {
    if (userId) fetchAppointments()
  }, [userId])

  /* useEffect(() => {
    // Only proceed if userId is available
    if (userId) {
      axios
        .get('http://localhost:8800/Appointments')
        .then((res) => {
          const transformedEvents = res.data
            .map((appointment) => {
              const {
                ID,
                AppointmentDate,
                StartTime,
                EndTime,
                StudentID,
                TutorID,
              } = appointment

              const startDate = new Date(AppointmentDate)
              const startTimeParts = StartTime.split(':')
              startDate.setHours(
                Number(startTimeParts[0]),
                Number(startTimeParts[1]),
              )

              const endDate = new Date(AppointmentDate)
              const endTimeParts = EndTime.split(':')
              endDate.setHours(Number(endTimeParts[0]), Number(endTimeParts[1]))

              // Check if the appointment belongs to the user as a student or tutor
              if (StudentID === userId || TutorID === userId) {
                return {
                  title: String(ID),
                  start: startDate,
                  end: endDate,
                  studentID: StudentID,
                  tutorID: TutorID,
                }
              } else {
                return null // Filter out appointments that don't match the user's ID
              }
            })
            .filter((appointment) => appointment !== null)

          // setEvents(transformedEvents)
          // setFilteredEvents(transformedEvents)
          setEvents(res.data)
          setFilteredEvents(res.data)
        })
        .catch((err) => {
          if (err.response) console.log(err.response)
          else console.log(err)
        })
    }
  }, [userId]) */

  const openModal = (event) => {
    console.log('Selected Event:', event)
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedEvent(null)
    setIsModalOpen(false)
  }

  const createEvent = async () => {
    // Check if required fields are empty
    if (userRole === 'student') {
      newEvent.StudentID = userId
      if (
        !newEvent.TutorID ||
        !newEvent.AppointmentDate ||
        !newEvent.StartTime ||
        !newEvent.EndTime
      ) {
        alert('Please fill in all required fields.')
        return
      }
    }
    if (userRole === 'tutor') {
      newEvent.TutorID = userId
      if (
        !newEvent.StudentID ||
        !newEvent.AppointmentDate ||
        !newEvent.StartTime ||
        !newEvent.EndTime
      ) {
        alert('Please fill in all required fields.')
        return
      }
    }
    try {
      const tutorResponse = await axios.get(
        `http://localhost:8800/tutors/${newEvent.TutorID}`,
      )
      const tutor = tutorResponse.data
      //console.log('Tutor data:', tutor);

      // Add console.log statements to debug
      //console.log('tutor.availableHoursStart:', tutor.AvailableHoursStart);
      //console.log('tutor.availableHoursEnd:', tutor.AvailableHoursEnd);

      const appointmentStartTime = moment(
        `${newEvent.AppointmentDate} ${newEvent.StartTime}`,
        'YYYY-MM-DD HH:mm',
        true,
      )
      const appointmentEndTime = moment(
        `${newEvent.AppointmentDate} ${newEvent.EndTime}`,
        'YYYY-MM-DD HH:mm',
        true,
      )

      const tutorAvailableStartTime = moment(
        tutor.AvailableHoursStart,
        'HH:mm:ss',
        true,
      )
      const tutorAvailableEndTime = moment(
        tutor.AvailableHoursEnd,
        'HH:mm:ss',
        true,
      )

      //console.log('appointmentStartTime:', appointmentStartTime.format('HH:mm:ss'));
      //console.log('appointmentEndTime:', appointmentEndTime.format('HH:mm:ss'));
      //console.log('tutorAvailableStartTime:', tutorAvailableStartTime.format('HH:mm:ss'));
      //console.log('tutorAvailableEndTime:', tutorAvailableEndTime.format('HH:mm:ss'));

      tutorAvailableStartTime.set({
        year: appointmentStartTime.year(),
        month: appointmentStartTime.month(),
        date: appointmentStartTime.date(),
      })
      tutorAvailableEndTime.set({
        year: appointmentStartTime.year(),
        month: appointmentStartTime.month(),
        date: appointmentStartTime.date(),
      })

      const isWithinAvailableHours = appointmentStartTime.isBetween(
        tutorAvailableStartTime,
        tutorAvailableEndTime,
        null,
        '[]',
      )
      //console.log('Is appointment within available hours?', isWithinAvailableHours);
      //console.log('Appointment start date/time:', appointmentStartTime.format('YYYY-MM-DD HH:mm:ss'));
      //console.log('Tutor available start date/time:', tutorAvailableStartTime.format('YYYY-MM-DD HH:mm:ss'));
      //console.log('Tutor available end date/time:', tutorAvailableEndTime.format('YYYY-MM-DD HH:mm:ss'));

      if (!isWithinAvailableHours) {
        alert("Appointment is outside the tutor's available hours")
        return
      }

      // Send the new event data to the server

      await axios
        .post('http://localhost:8800/appointments', newEvent)
        .catch(console.log)
      fetchAppointments()
      axios
        .then((res) => {
          console.log('Appointment created successfully')
          // Fetch the updated list of appointments
          fetchAppointments()
        })
        .catch((err) => {
          console.error('Error creating appointment:', err)
        })

      // Reset the new event form
      setNewEvent({
        StudentID: '',
        TutorID: '',
        AppointmentDate: '',
        StartTime: '',
        EndTime: '',
        Subject: '',
      })
    } catch (error) {
      //console.error('error creating appointment:', error);
    }
  }

  const createAppointment = (appointmentData) => {
    axios
      .post('http://localhost:8800/createAppointment', appointmentData)
      .then((res) => {
        fetchAppointments()
        setIsCreatingEvent(false)
      })
      .catch((err) => {
        // Handle errors
        //console.error('Error creating appointment:', err);
      })
  }

  const handleDeleteAppointment = () => {
    // Send a DELETE request to the server
    axios
      .delete(`http://localhost:8800/appointments/${selectedEvent.ID}`)
      .then((res) => {
        console.log('Appointment deleted successfully')
        // Refresh the events by fetching the updated data from the server
        setSelectedEvent(null)
        fetchAppointments()
      })
      .catch((err) => {
        if (err.response.status === 403) alert(err.response.data)
        console.error('Error deleting appointment:', err)
      })
  }

  const fetchAppointments = () => {
    if (userRole === 'student') {
      axios
        .get(`http://localhost:8800/Appointments/student/${userId}`)
        .then((res) => {
          const transformedEvents = res.data.map((appointment) => {
            const {
              ID,
              AppointmentDate,
              StartTime,
              EndTime,
              StudentID,
              TutorID,
            } = appointment
            const startDate = new Date(AppointmentDate)
            const startTimeParts = StartTime.split(':')
            startDate.setHours(
              Number(startTimeParts[0]),
              Number(startTimeParts[1]),
            )

            const endDate = new Date(AppointmentDate)
            const endTimeParts = EndTime.split(':')
            endDate.setHours(Number(endTimeParts[0]), Number(endTimeParts[1]))

            return {
              ID: ID,
              title:
                user.IsTutor === 1
                  ? appointment.StudentFirstName +
                    ' ' +
                    appointment.StudentLastName
                  : appointment.TutorFirstName +
                    ' ' +
                    appointment.TutorLastName,
              start: startDate,
              end: endDate,
              studentID: StudentID,
              tutorID: TutorID,
              TutorFirstName: appointment.TutorFirstName,
              TutorLastName: appointment.TutorLastName,
              StudentFirstName: appointment.StudentFirstName,
              StudentLastName: appointment.StudentLastName,
              AppointmentNotes: appointment.AppointmentNotes,
            }
          })

          setEvents(transformedEvents)
          setFilteredEvents(transformedEvents)
        })
        .catch((err) => {
          if (err.response) console.log(err.response)
          else console.log(err)
        })
    } else {
      axios
        .get(`http://localhost:8800/Appointments/tutor/${userId}`)
        .then((res) => {
          const transformedEvents = res.data.map((appointment) => {
            const {
              ID,
              AppointmentDate,
              StartTime,
              EndTime,
              StudentID,
              TutorID,
            } = appointment
            const startDate = new Date(AppointmentDate)
            const startTimeParts = StartTime.split(':')
            startDate.setHours(
              Number(startTimeParts[0]),
              Number(startTimeParts[1]),
            )

            const endDate = new Date(AppointmentDate)
            const endTimeParts = EndTime.split(':')
            endDate.setHours(Number(endTimeParts[0]), Number(endTimeParts[1]))

            return {
              ID: ID,
              title:
                user.IsTutor === 1
                  ? appointment.StudentFirstName +
                    ' ' +
                    appointment.StudentLastName
                  : appointment.TutorFirstName +
                    ' ' +
                    appointment.TutorLastName,
              start: startDate,
              end: endDate,
              studentID: StudentID,
              tutorID: TutorID,
              TutorFirstName: appointment.TutorFirstName,
              TutorLastName: appointment.TutorLastName,
              StudentFirstName: appointment.StudentFirstName,
              StudentLastName: appointment.StudentLastName,
              AppointmentNotes: appointment.AppointmentNotes,
            }
          })

          setEvents(transformedEvents)
          setFilteredEvents(transformedEvents)
        })
        .catch((err) => {
          if (err.response) console.log(err.response)
          else console.log(err)
        })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Trigger appointment deletion when the Enter key is pressed
      handleDeleteAppointment()
    }
  }

  const handleAppointmentClick = (event) => {
    setSelectedEvent(event)
    console.log(event)
  }

  if (!user) return <div>Loading...</div>

  return (
    <div class="padded-div">
      {isModalOpen ? (
        <div className="modal">
          <div className="modal-content">
            <h2>Event Details</h2>
            {/*<p>Title: {selectedEvent.title}</p>*/}
            <p>
              Start Time:{' '}
              {selectedEvent.start.toLocaleString('en-US', timeOpts)}
            </p>
            <p>
              End Time: {selectedEvent.end.toLocaleString('en-US', timeOpts)}
            </p>
            <p>notes: {selectedEvent.AppointmentNotes}</p>
            {/* Add other appointment details here */}
            <button onClick={handleDeleteAppointment}>
              Delete Appointment
            </button>
            <button onClick={closeModal}>Close Appointment Details</button>
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
            onSelectEvent={handleAppointmentClick}
          />
          <div className="event-form">
            <h2>Create New Appointment</h2>
            <label>
              Select {' ' + user.IsTutor === 1 ? 'student' : 'tutor'}
            </label>
            <Form.Select
              style={{ maxWidth: '300px' }}
              onChange={(e) => {
                user.IsTutor === 1
                  ? setNewEvent({ ...newEvent, StudentID: e.target.value })
                  : setNewEvent({ ...newEvent, TutorID: e.target.value })
              }}
            >
              <option disabled selected value>
                {' '}
                -- select an option --{' '}
              </option>
              {otherUsers
                ? otherUsers.map((otherUser) => {
                    return (
                      <option key={otherUser.ID} value={otherUser.ID}>
                        {user.IsTutor === 1
                          ? otherUser.FirstName + ' ' + otherUser.LastName
                          : otherUser.FirstName +
                            ' ' +
                            otherUser.LastName +
                            ', ' +
                            otherUser.Subject}
                      </option>
                    )
                  })
                : null}
            </Form.Select>
            <br />
            <div className="form-group">
              <label htmlFor="appointment-date">Appointment Date: </label>
              <input
                id="appointment-date"
                type="date"
                value={newEvent.AppointmentDate}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, AppointmentDate: e.target.value })
                }
              />
            </div>
            <br />
            <div className="form-group">
              <label htmlFor="start-time">Start Time: </label>
              <input
                id="start-time"
                type="time"
                value={newEvent.StartTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, StartTime: e.target.value })
                }
              />
            </div>
            <br />
            <div className="form-group">
              <label htmlFor="end-time">End Time: </label>
              <input
                id="end-time"
                type="time"
                value={newEvent.EndTime}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, EndTime: e.target.value })
                }
              />
            </div>
            <label>Notes: </label>
            <div className="form-group">
              <input
                id="end-time"
                type="text"
                value={newEvent.AppointmentNotes}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, AppointmentNotes: e.target.value })
                }
              />
            </div>
            <br />
            <Button
              style={{ backgroundColor: 'green', border: 'none' }}
              className="btn-create-event"
              onClick={createEvent}
            >
              Create Appointment
            </Button>
          </div>
        </div>
      )}
      {selectedEvent && (
        <div>
          <h2>Appointment Details</h2>
          {/*<p>Appointment Number: {selectedEvent.title}</p>*/}
          <p>
            Student:{' '}
            {selectedEvent.StudentFirstName +
              ' ' +
              selectedEvent.StudentLastName}
          </p>
          <p>
            Tutor:{' '}
            {selectedEvent.TutorFirstName + ' ' + selectedEvent.TutorLastName}
          </p>
          <p>
            Start Time: {selectedEvent.start.toLocaleString('en-US', timeOpts)}
          </p>
          <p>End Time: {selectedEvent.end.toLocaleString('en-US', timeOpts)}</p>
          <p>Notes: {selectedEvent.AppointmentNotes}</p>
          <Button
            style={{ backgroundColor: 'red', border: 'none' }}
            onClick={handleDeleteAppointment}
          >
            Delete Appointment
          </Button>
        </div>
      )}
      <div className="event-form">
        <br />
        <br />
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>
    </div>
  )
}

export default MyCalendar
