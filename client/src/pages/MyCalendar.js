import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import Modal from "react-modal";

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = useState([
    {
      title: "Appointment 1",
      start: new Date(2023, 9, 29, 10, 0),
      end: new Date(2023, 9, 29, 11, 30),
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const createEvent = () => {
    // Check if the start date is after or equal to the current date
    if (newEvent.start >= new Date()) {
      // Check if the new event overlaps with existing events
      if (!eventsOverlap(newEvent, events)) {
        setEvents([...events, newEvent]);
        setNewEvent({ title: "", start: new Date(), end: new Date() });
        saveEventtoDatabase(newEvent);
      } else {
        alert("Overlapping Time");
      }
    } else {
      alert("You can't create events in the past.");
    }
  };

  const getTimeOfDay = (time) => {
    const hour = moment(time).format("HH");
    return hour < 12 ? "AM" : "PM";
  };

  // Function to check if two events overlap in time
  const eventsOverlap = (newEvent, existingEvents) => {
    for (const event of existingEvents) {
      if (newEvent.start < event.end && newEvent.end > event.start) {
        return true; // Overlapping events
      }
    }
    return false; // No overlap
  };

  const saveEventtoDatabase = (event) => {
    fetch("/AddAppointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Event saved to the database:", data);
      })
      .catch((error) => {
        console.error("Error saving event to the database:", error);
      });
  };

  // Function to fetch appointments from the server
  const fetchAppointments = () => {
    // Fetch appointments from your server's API endpoint.
    fetch("/Appointments")
      .then((response) => response.json())
      .then((data) => {
        // Update the events state with the fetched appointments.
        setEvents(data);
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error);
      });
  };

  return (
    <div>
      {isModalOpen ? (
        <div className="modal">
          <div className="modal-content">
            <h2>Event Details</h2>
            <p>Title: {selectedEvent.title}</p>
            <p>Start Time: {moment(selectedEvent.start).format("HH:mm A")}</p>
            <p>End Time: {moment(selectedEvent.end).format("HH:mm A")}</p>
            <button onClick={closeModal}>Close Event Details</button>
          </div>
        </div>
      ) : (
        <div>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            onSelectEvent={openModal}
          />
          <div className="event-form">
            <h2>Create New Event</h2>
            <div className="form-group">
              <label htmlFor="event-title">Event Title:</label>
              <input
                id="event-title"
                type="text"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="start-time">Start Time:</label>
              <input
                id="start-time"
                type="datetime-local"
                value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: new Date(e.target.value) })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-time">End Time:</label>
              <input
                id="end-time"
                type="datetime-local"
                value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end: new Date(e.target.value) })
                }
              />
            </div>
            <button className="btn-create-event" onClick={createEvent}>
              Add Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
