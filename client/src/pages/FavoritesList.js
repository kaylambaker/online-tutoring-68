import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../config/axios'; 

export default function FavoritesList() {
  const { StudentID } = useParams();
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch session user
  useEffect(() => {
    axios.get('/users/session')
      .then(res => {
        setUser(res.data);
      })
      .catch(err => {
        if (err.response.status === 404) {
          alert("No user logged in");
        } else {
          console.log(err);
        }
      });
  }, []);

  useEffect(() => {
 
    // Fetch favorites
    axios
      .get(`http://localhost:8800/students/favorites_list/${StudentID}`)
      .then((response) => {
        if (response.data && response.data.length > 0) {
          const formattedFavorites = response.data.map((favorite) => ({
            StudentID: favorite.StudentID,
            id: favorite.TutorID,
            bio: favorite.Bio,
            subject: favorite.Subject,
            availableHoursStart: favorite.AvailableHoursStart,
            availableHoursEnd: favorite.AvailableHoursEnd,
          }));

          setFavorites(formattedFavorites);
        }
      })
      .catch((error) => {
        console.error('Error fetching favorites list:', error.message);
        alert(error.response?.data?.sqlMessage || error.message);
      });
  }, [StudentID, navigate]);

  const handleDelete = (tutorID) => {
    // Send delete request to remove the favorite
    axios
      .delete(`/students/favorites_list/${StudentID}/${tutorID}`)
      .then((response) => {
        // Refresh the list after successful deletion
        const updatedFavorites = favorites.filter(
          (favorite) => favorite.id !== tutorID
        );
        setFavorites(updatedFavorites);
      })
      .catch((error) => {
        console.error('Error deleting favorite:', error.message);
        alert(error.response?.data?.sqlMessage || error.message);
      });
  };

  return (
    <div className="container">
    <h1>FavoritesList</h1>
    {favorites.map((favorite) => (
      <div key={favorite.id}>
        <p>Student ID: {favorite.StudentID}</p>
        <p>Tutor ID: {favorite.id}</p>
        <p>Bio: {favorite.bio}</p>
        <p>Subject: {favorite.subject}</p>
        <p>
          Available Hours: {favorite.availableHoursStart} - {favorite.availableHoursEnd}
        </p>
        {/* Button to redirect to the tutor's page */}
        <Link to={`/tutor/${favorite.id}`}>
          <button style={{ marginRight: '10px' }}>View Tutor</button>
        </Link>
        <button onClick={() => handleDelete(favorite.id)}
        style={{ marginRight: '10px', backgroundColor: 'red', color: 'white' }}> Delete </button>
        <hr />
      </div>
    ))}
  </div>
);
}