import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import FormInput from '../components/FormInput'
import '../App.css'
import { Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = async () => {
    axios
      .get('/users/' + email + '/' + password)
      .then((res) => {
        if (res.data.TOTPEnabled == 0) navigate('/TOTPSetup')
        else navigate('/TOTPVerify')
      })
      .catch((err) => {
        if (err.response.status == 404) alert('user not found')
        else if (err.response.status == 401) alert('invalid password')
        else console.log(err)
      })
  }
  useEffect(() => {
    axios
      .get('/users/session')
      .then((res) => {
        res.data.IsTutor === 1
          ? navigate('/tutordashboard')
          : navigate('/studentdashboard')
      })
      .catch((err) => {
        if (err.response && err.response.status == 404);
        else console.log(err)
      })
  }, [])
  return (
    <div class="padded-div flex flex-col bg-gray-100 rounded-lg py-8 px-10 shadow-lg">
      <div className="flex flex-col pb-10 place-items-center">
        <h1 className="text-2xl text-blue-500">Welcome to</h1>
        <h1 className="text-2xl text-blue-500">Online Tutoring</h1>
      </div>
      <div>
        <form id="login-form">
          <FormInput
            id="email"
            name="email"
            labelText="Email Address: "
            type="email"
            isRequired={true}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormInput
            id="password"
            name="password"
            labelText="Password: "
            type="password"
            isRequired={true}
            placeholder="****"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            style={{ backgroundColor: 'green', border: 'green' }}
            type="button"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2"
            onClick={login}
          >
            Login
          </Button>
          <br />
          <br />
          <Button onClick={() => navigate('/')}>Back to home page</Button>
        </form>
      </div>
    </div>
  )
}

export default Login
