import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from '../config/axios'
import { Button } from 'react-bootstrap'

export default function FavoritesList() {
  const timeOpts = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }
  const [StudentID, setStudentID] = useState(-1)
  const [favorites, setFavorites] = useState([])
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Fetch session user
  useEffect(() => {
    axios
      .get('/users/session')
      .then((res) => {
        setUser(res.data)
        setStudentID(res.data.ID)
      })
      .catch((err) => {
        if (err.response.status === 404) {
          alert('No user logged in')
          navigate('/')
        } else {
          console.log(err)
        }
      })
  }, [])

  useEffect(() => {
    // Fetch favorites
    axios
      .get(`/students/favorites_list/${StudentID}`)
      .then(async (response) => {
        if (response.data && response.data.length > 0) {
          const formattedFavorites = []

          // Fetch user details for each tutor ID
          for (const favorite of response.data) {
            const userResponse = await axios.get(`/students/${StudentID}`)
            const tutorDetails = {
              StudentID: favorite.StudentID,
              id: favorite.TutorID,
              bio: favorite.Bio,
              subject: favorite.Subject,
              availableHoursStart: favorite.AvailableHoursStart,
              availableHoursEnd: favorite.AvailableHoursEnd,
              // name: userResponse.data.FirstName + ' ' + userResponse.data.LastName,
              name: favorite.FirstName + ' ' + favorite.LastName,
            }

            formattedFavorites.push(tutorDetails)
          }

          setFavorites(formattedFavorites)
        }
      })
      .catch((error) => {
        console.error('Error fetching favorites list:', error.message)
        alert(error.response?.data?.sqlMessage || error.message)
      })
  }, [StudentID, navigate])

  const handleDelete = (tutorID) => {
    // Send delete request to remove the favorite
    axios
      .delete(`/students/favorites_list/${StudentID}/${tutorID}`)
      .then((response) => {
        // Refresh the list after successful deletion
        const updatedFavorites = favorites.filter(
          (favorite) => favorite.id !== tutorID,
        )
        setFavorites(updatedFavorites)
      })
      .catch((error) => {
        console.error('Error deleting favorite:', error.message)
        alert(error.response?.data?.sqlMessage || error.message)
      })
  }

  if (!user || StudentID == -1) return <div>Loading...</div>

  return (
    <div class="container padded-div">
      <h1>FavoritesList</h1>
      {favorites.map((favorite) => (
        <div key={favorite.id} class="div-div">
          <p>Name: {favorite.name}</p>

          <p>Bio: {favorite.bio}</p>
          <p>Subject: {favorite.subject}</p>
          <p>
            Available Hours:{' '}
            {new Date(
              'January 01, 2000 ' + favorite.availableHoursStart,
            ).toLocaleString('en-US', timeOpts)}{' '}
            -{' '}
            {new Date(
              'January 01, 2000 ' + favorite.availableHoursEnd,
            ).toLocaleString('en-US', timeOpts)}
          </p>
          {/* Button to redirect to the tutor's page */}
          <Link to={`/tutor/${favorite.id}`}>
            <button style={{ marginRight: '10px' }}>View Tutor</button>
          </Link>

          <button
            onClick={() => handleDelete(favorite.id)}
            style={{
              marginRight: '10px',
              backgroundColor: 'red',
              color: 'white',
            }}
          >
            {' '}
            Delete{' '}
          </button>

          <hr />
        </div>
      ))}
      <Button onClick={() => navigate(-1)}>Back</Button>
    </div>
  )
}
