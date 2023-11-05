import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'

const Logout = () => {
  const navigate = useNavigate()
  
  const logout = async () => {
    axios
      .delete('/users/session')
      .then((res) => {
        alert('logged out')
        navigate('/login');
      })
      .catch(console.log)
  }
  useEffect(() => {
    logout();
  }, [])
  return ('')
}

export default Logout
