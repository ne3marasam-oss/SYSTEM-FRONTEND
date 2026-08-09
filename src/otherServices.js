// src/services/otherServices.js
import axios from 'axios';

const ACADEMIC_YEARS_API_URL = 'http://localhost:8080/api/academic-years';
const ACCOUNTS_API_URL = 'http://localhost:8080/api/accounts';

export const getAcademicYears = () => {
    return axios.get(ACADEMIC_YEARS_API_URL);
};

export const getAccounts = () => {
    return axios.get(ACCOUNTS_API_URL);
};