import axios from '../config/axios'
import '../App.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function HomePage() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const getUser = () => {
    axios
      .get('/users/session')
      .then((res) => {
        setUser(res.data)
        if (!res.data.SessionTOTPVerified) navigate('/TOTPVerify')
      })
      .catch((err) => {
        if (err.response.status == 404);
        else console.log(err)
      })
  }
  useEffect(() => {
    getUser()
  }, [])

  return (
    <div class="home padded-div" style={{backgroundColor:"white"}}>
      <h1 style={{padding:"20%"}}>Online Tutoring</h1>
      {user && (
        <div>
          <Button
            onClick={
              user.IsTutor === 1
                ? () => navigate('/TutorDashboard')
                : () => navigate('/studentdashboard')
            }
          >
            dashboard
          </Button>
          <br/>
          <br/>
          <Button onClick={() => navigate('/logout')}>logout</Button>
        </div>
      )}
      {!user && (
        <div>
          <Button onClick={() => navigate('/login')}>login</Button>
          <br/>
          <br/>
          <Button onClick={() => navigate('/signup')}>register</Button>
        </div>
      )}
    </div>
  )
}
