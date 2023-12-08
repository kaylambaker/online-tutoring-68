import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../App.css'
import axios from '../config/axios'
import {Button} from 'react-bootstrap'

export default function TutorProfilePage() {
  const navigate = useNavigate()
  let { id } = useParams()
  const timeOpts = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }
  const [user, setUser] = useState(null)
  const [startStr, setStartStr] = useState('')
  const [endStr, setEndStr] = useState('')
  const [tutor, setTutor] = useState({
    id: id,
    first_name: '',
    last_name: '',
    bio: '',
    profile_picture_url:
      'https://fastly.picsum.photos/id/1/200/200.jpg?hmac=jZB9EZ0Vtzq-BZSmo7JKBBKJLW46nntxq79VMkCiBG8',
    subjects: [],
    available_hours_start: '',
    available_hours_end: '',
  })
  useEffect(() => {
    axios
      .get(`http://localhost:8800/tutors/${id}`)
      .then((response) => {
        let profile_picture_url = tutor.profile_picture_url
        if (response.data.ProfilePictureID) {
          profile_picture_url = `http://localhost:8800/${response.data.ProfilePictureID}`
        }
        setTutor({
          ...tutor,
          id: response.data.ID,
          first_name: response.data.FirstName,
          last_name: response.data.LastName,
          bio: response.data.Bio,
          subjects: [response.data.Subject],
          available_hours_start: response.data.AvailableHoursStart,
          available_hours_end: response.data.AvailableHoursEnd,
          profile_picture_url: profile_picture_url,
        })
        setStartStr(
          new Date(
            'January 01, 2000 ' + response.data.AvailableHoursStart,
          ).toLocaleString('en-US', timeOpts),
        )
        setEndStr(
          new Date(
            'January 01, 2000 ' + response.data.AvailableHoursEnd,
          ).toLocaleString('en-US', timeOpts),
        )
      })
      .catch((error) => {
        alert(error.response.data.sqlMessage || error)
      })
  }, [])
  useEffect(() => {
    // get session user
    axios
      .get('/users/session')
      .then((res) => {
        setUser(res.data)
      })
      .catch((err) => {
        if (err.response.status == 404) {
          alert('no user logged in')
          navigate('/')
        } else console.log(err)
      })
  }, [])
  const addFavorites = () => {
    axios
      .post('/students/favorites_list/' + user.ID + '/' + tutor.id)
      .then((res) => {
        alert('tutor added to favorites list')
      })
      .catch((err) => {
        // if sql primary key error
        if (err.response.data.errno == 1062)
          alert('this tutor is already on your favorites list')
        else {
          console.log(err)
          alert('unable to add tutor to favorites list')
        }
      })
  }
  return (
    <div class="padded-div flex flex-col gap-2 bg-gray-100 rounded-lg py-8 px-10 shadow-lg">
      <img src={tutor.profile_picture_url} className="rounded-xl w-1/2" class="profile-picture"/>
      <h1 className="text-3xl font-bold ">
        {tutor.last_name}, {tutor.first_name}
      </h1>
      <p className="bg-gray-300 p-2 rounded-lg">{tutor.bio}</p>
      <div>
        <h2 className="text-xl font-bold">Subject</h2>
        <ul className="flex gap-2">
          {tutor.subjects.map((subject) => (
            <li
              key={subject}
              className="bg-blue-600 px-2 py-1 rounded-lg"
            >
              {subject}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-bold">General availability</h2>
        <h3>
          Start: {startStr} End: {endStr}
        </h3>
      </div>
      <div>
        <a
          href="#"
          className="flex text-xl text-white justify-center bg-blue-500 hover:bg-blue-600 rounded-md p-2 w-full cursor-pointer"
        >
          Show Bookings
        </a>
      </div>
      {user && user.IsTutor == 0 && (
        <Button onClick={addFavorites} style={{backgroundColor:"navy",border:"navy"}}>Add to favorites list</Button>
      )}
      <br />
      <br />
      <Button onClick={() => navigate(-1)}>Back</Button>
    </div>
  )
}
