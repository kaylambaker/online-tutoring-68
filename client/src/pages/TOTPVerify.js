import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import FormInput from '../components/FormInput'

const TOTPVerify = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [code, setCode] = useState('')
  useEffect(() => {
    axios
      .get('/users/session')
      .then((res) => {
        if (res.data.TOTPEnabled == 0) navigate('/TOTPSetup')
        else if (res.data.SessionTOTPVerified) {
          res.data.IsTutor === 1 ? navigate('/tutordashboard') : navigate('/studentdashboard');
        }
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
        res.data.IsTutor === 1 ? navigate('/tutordashboard') : navigate('/studentdashboard');
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
    <div className="flex flex-col bg-gray-100 rounded-lg py-8 px-10 shadow-lg">
      <div className="flex flex-col pb-10 place-items-center">
        <h1 className="text-2xl text-blue-500">Verify TOTP</h1>
      </div>
      <div>
        <form id="totp-verify-form">
          <FormInput 
              id='totp-code'
              name='totp-code'
              labelText='TOTP Code'
              type='text'
              isRequired={true}
              placeholder='enter TOTP code'
              onChange={(e) => setCode(e.target.value)}
          />
          <button
            type="button"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2"
            onClick={validateCode}
          >Validate Code</button>
        </form>
      </div>
    </div>
  )
}

export default TOTPVerify
