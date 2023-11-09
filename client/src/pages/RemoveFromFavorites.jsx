import { useEffect } from 'react';
import axios from 'axios';

export default function AddToFavorites() {
  // Extract studentID and tutorID from the URL
  const pathParts = window.location.pathname.split('/');
  const studentID = pathParts[4] || ''; // Assuming the position of studentID in the path
  const tutorID = pathParts[5] || '';   // Assuming the position of tutorID in the path

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a POST request to the server endpoint
      const response = await axios.delete(`http://localhost:8800/students/favorites_list/RemoveFromFavorites/${studentID}/${tutorID}`);

      // Log the server response
      console.log('API Response:', response.data);
    } catch (error) {
      // Log any errors
      console.error('Error adding to favorites list:', error.message);
      alert(error.response?.data?.sqlMessage || error.message);
    }
  };

  // useEffect to perform the submission when the component mounts
  useEffect(() => {
    handleSubmit({ preventDefault: () => {} });
  }, []); // Empty dependency array means this effect runs once when the component mounts

  return (
    <div>
      <h2>Removed from Favorites List</h2>
      {/* Omitted the form tag since the submission is done in useEffect */}
      <p>Student ID: {studentID}</p>
      <p>Tutor ID: {tutorID}</p>
    </div>
  );
}