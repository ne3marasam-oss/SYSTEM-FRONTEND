// src/services/studentService.js
import axios from 'axios';

// عنوان الـ API الخاص بـ Spring Boot
// تأكد من أن هذا يتطابق مع المنفذ الذي يعمل عليه تطبيق Spring Boot (عادةً 8080)
const API_URL = ' https://system-backend-h8kw.onrender.com/api/students';

class StudentService {
    // جلب جميع الطلاب
    getAllStudents() {
        return axios.get(API_URL);
    }

    // جلب طالب بواسطة ID
    getStudentById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    // إنشاء طالب جديد
    // studentData هنا هو StudentDto الذي أعددته في Backend
    createStudent(studentData) {
        return axios.post(API_URL, studentData);
    }

    // تحديث طالب
    updateStudent(id, studentData) {
        return axios.put(`${API_URL}/${id}`, studentData);
    }

    // حذف طالب
    deleteStudent(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

// تصدير كائن واحد من الخدمة للاستخدام في المكونات
export default new StudentService();