import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, InputGroup, Button } from 'react-bootstrap'
import axios from '../config/axios'

const TOTPSetup = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  useEffect(() => {
    axios
      .get('/users/session')
      .then((res) => {
        setUser(res.data)
        axios
          .get('/TOTPQRCode/' + res.data.ID)
          .then((res) => setImage(res.data.image))
          .catch(console.log)
      })
      .catch(err => {
        // no user logged in
        if (err.response.status == 404) alert('no user logged in')
      })
  }, [])
  const [image, setImage] = useState(null)
  const [code, setCode] = useState('')
  const validateCode = () => {
    axios
      .get('http://localhost:8800/setTOTP/' + user.ID + '/' + code)
      .then((res) => {
        alert('2FA enabled :)')
      })
      .catch((err) => {
        alert('Unable to setup 2FA. Make sure TOTP code was inputed correctly')
      })
  }
  return (
    <div>
      <p>Use an authenticator app to scan the QR code</p>
      <img src={image} />
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

export default TOTPSetup
