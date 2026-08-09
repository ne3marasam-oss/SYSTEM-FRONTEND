// src/services/AcademicYearService.js
import axios from 'axios';

const API_URL = ' https://system-backend-h8kw.onrender.com/api/academic-years'; // تأكد من هذا المسار

class AcademicYearService {
    getAllAcademicYears() {
        return axios.get(API_URL);
    }

    getAcademicYearById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    createAcademicYear(academicYearData) {
        return axios.post(API_URL, academicYearData);
    }

    updateAcademicYear(id, academicYearData) {
        return axios.put(`${API_URL}/${id}`, academicYearData);
    }

    deleteAcademicYear(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new AcademicYearService();