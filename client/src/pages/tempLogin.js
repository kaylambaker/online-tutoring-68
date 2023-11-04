import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'

const TempLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginStatus, setLoginStatus] = useState('user not logged in')
  const [loggedin, setLoggedin] = useState(false)
  const login = async () => {
    axios
      .get('/users/' + email + '/' + password)
      .then((res) => {
        setLoginStatus(
          'logged in as ' + res.data.FirstName + ' ' + res.data.LastName,
        )
        if (res.data.TOTPEnabled == 0) navigate('/TOTPSetup')
        else navigate('/TOTPVerify')
      })
      .catch((err) => {
        if (err.response.status == 404) alert('user not found')
        else if (err.response.status == 401) alert('invalid password')
        else console.log(err)
      })
  }
  const logout = async () => {
    axios
      .delete('/users/session')
      .then((res) => {
        alert('logged out')
        setLoginStatus('user not logged in')
        setLoggedin(false)
      })
      .catch(console.log)
  }
  useEffect(() => {
    axios
      .get('/users/session')
      .then((res) => {
        setLoginStatus(
          'logged in as ' + res.data.FirstName + ' ' + res.data.LastName,
        )
        setLoggedin(true)
      })
      .catch((err) => {
        if (err.response && err.response.status == 404);
        else console.log(err)
      })
  }, [])
  return (
    <div>
      <h1>{loginStatus}</h1>
      {!loggedin && (
        <div>
          <input
            type="text"
            placeholder="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={login}>login</button>
          <br />
        </div>
      )}
      {loggedin && (
        <div>
          <button onClick={logout}>logout</button>
          <br />
        </div>
      )}
    </div>
  )
}

export default TempLogin
