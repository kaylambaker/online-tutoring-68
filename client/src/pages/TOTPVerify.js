import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, InputGroup, Button } from 'react-bootstrap'
import axios from '../config/axios'

const TOTPVerify = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [code, setCode] = useState('')
  useEffect(() => {
    axios
      .get('/users/session')
      .then((res) => {
        if (res.data.TOTPEnabled == 0) navigate('/TOTPSetup')
        else if (res.data.SessionTOTPVerified) navigate('/')
        else setUser(res.data)
      })
      .catch((err) => {
        // if no session user, go to login
        if (err.response.status == 404) navigate('/login')
        else console.log(err)
      })
  }, [])
  const validateCode = () => {
    axios
      .get('/verifyTOTP/' + user.ID + '/' + code)
      .then((res) => {
        alert('TOTP verified :)')
        navigate('/')
      })
      .catch((err) => {
        if (err.response.status == 404) {
          alert('error: invalid user ID')
          console.log(err)
        } else if (err.response.status == 401) alert('incorrect TOTP code')
        else console.log(err)
      })
  }
  return (
    <div>
      <Form>
        <InputGroup>
          <Form.Control
            onChange={(e) => setCode(e.target.value)}
            placeholder="enter TOTP code"
          />
        </InputGroup>
      </Form>
      <Button onClick={validateCode} variant="primary" type="submit">
        Submit
      </Button>
    </div>
  )
}

export default TOTPVerify
