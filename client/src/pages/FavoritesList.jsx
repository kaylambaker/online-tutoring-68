import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function FavoritesList() {
  let { StudentID } = useParams();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8800/students/favorites_list/${StudentID}`)
      .then((response) => {
        console.log('API Response:', response.data);

        if (response.data && response.data.length > 0) {
          // Map the response data to a format suitable for your state
          const formattedFavorites = response.data.map((favorite) => ({
            StudentID: favorite.StudentID,
            id: favorite.TutorID,
            bio: favorite.Bio,
            subject: favorite.Subject,
            availableHoursStart: favorite.AvailableHoursStart,
            availableHoursEnd: favorite.AvailableHoursEnd,
          }));

          // Set the state with the array of favorites
          setFavorites(formattedFavorites);
        }
      })
      .catch((error) => {
        console.error('Error fetching favorites list:', error.message);
        alert(error.response?.data?.sqlMessage || error.message);
      });
  }, [StudentID]);

  return (
    <div>
      <h1>FavoritesList</h1>
      {favorites.map((favorite) => (
        <div key={favorite.id}>
          <p>Student ID: {favorite.StudentID}</p>
          <p>Tutor ID: {favorite.id}</p>
          <p>Bio: {favorite.bio}</p>
          <p>Subject: {favorite.subject}</p>
          <p>Available Hours: {favorite.availableHoursStart} - {favorite.availableHoursEnd}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}
