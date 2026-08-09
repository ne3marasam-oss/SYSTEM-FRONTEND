import axios from 'axios';

const API = axios.create({
    baseURL: 'https://system-backend-rwsk.onrender.com/api',
    withCredentials: true
});

export default API;