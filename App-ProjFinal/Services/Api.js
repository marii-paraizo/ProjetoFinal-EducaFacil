import axios from "axios";

const Api = axios.create({
   //baseURL: "http://10.0.2.2:5153/api"
   baseURL: "http://localhost:5153/api"
})

export default Api