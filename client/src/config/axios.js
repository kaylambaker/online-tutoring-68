import axios from "axios";

axios.defaults.baseURL = "http://localhost:8800";
axios.defaults.withCredentials = true;

export default axios;
