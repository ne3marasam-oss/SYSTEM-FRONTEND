import axios from 'axios';

const API = axios.create({
    baseURL: 'https://system-backend-h8kw.onrender.com/api',
    withCredentials: true
});

export default API;