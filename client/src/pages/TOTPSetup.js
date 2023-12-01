import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, InputGroup, Button } from 'react-bootstrap'
import axios from '../config/axios'
import FormInput from '../components/FormInput'
import "../App.css";

const TOTPSetup = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  useEffect(() => {
    axios
      .get('/users/session')
      .then((res) => {
        console.log(res.data)
        setUser(res.data)
        if (!res.data.SessionTOTPVerified && res.data.TOTPEnabled == 1)
          navigate('/TOTPVerify')
        if (res.data.TOTPEnabled == 1)
          alert(
            'You have already enabled TOTP 2FA. If you scan the QR code with another authenticator app, your previous TOTP codes will not work',
          )
        axios
          .get('/TOTPQRCode/' + res.data.ID)
          .then((res) => setImage(res.data.image))
          .catch(console.log)
      })
      .catch((err) => {
        // no user logged in
        if (err.response.status == 404) {
          alert('no user logged in')
          navigate('/login')
        }
      })
  }, [])
  const [image, setImage] = useState(null)
  const [code, setCode] = useState('')
  const validateCode = () => {
    axios
      .get('/setTOTP/' + user.ID + '/' + code)
      .then((res) => {
        alert('2FA enabled :)')
        navigate('/TOTPVerify')
      })
      .catch((err) => {
        alert('Unable to setup 2FA. Make sure TOTP code was inputed correctly')
        console.log(err)
      })
  }
  return (
    <div className="flex flex-col bg-gray-100 rounded-lg py-8 px-10 shadow-lg">
      <div className="flex flex-col pb-10 place-items-center">
        <h1 className="text-2xl text-blue-500">Setup TOTP</h1>
        <p>Use an authenticator app to scan the QR code</p>
      </div>
      <img src={image} />
      <div>
        <form id="login-form">
          <FormInput
            id="totp-code"
            name="totp-code"
            labelText="TOTP Code"
            type="text"
            isRequired={true}
            placeholder="enter TOTP code"
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            type="button"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2"
            onClick={validateCode}
          >
            Validate Code
          </button>
        </form>
      </div>
    </div>
  )
}

export default TOTPSetup
