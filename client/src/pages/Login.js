import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import FormInput from "../components/FormInput";
import "../App.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("user not logged in");
  const [loggedin, setLoggedin] = useState(false);
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
    <div className="side-menu-button">
      <div>
        <h1>Welcome to</h1>
        <h1>Online Tutoring</h1>
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
          <button
            type="button"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2"
            onClick={login}
          >
            Login
          </button>
          <br/>
          <br/>
          <button onClick={() => navigate('/')}>Back to home page</button>
        </form>
    </div>
  )
}

export default Login;
