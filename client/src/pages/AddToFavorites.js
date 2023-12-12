import { useEffect } from 'react';
import axios from 'axios';

export default function AddToFavorites() {
  // Extract studentID and tutorID from the URL
  const pathParts = window.location.pathname.split('/');
  const studentID = pathParts[3] || ''; 
  const tutorID = pathParts[4] || '';  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      
      const response = await axios.post(`/students/favorites_list/${studentID}/${tutorID}`);

      console.log('API Response:', response.data);
    } catch (error) {
      // Log any errors
      console.error('Error adding to favorites list:', error.message);
     
    }
  };

  useEffect(() => {
    handleSubmit({ preventDefault: () => {} });
  }, []); 

  return (
    <div>
      <h2>Added to Favorites List</h2>
      
      <p>Student ID: {studentID}</p>
      <p>Tutor ID: {tutorID}</p>
    </div>
  );
}
