import axios from 'axios';

// الرابط الأساسي لواجهة API
const API_URL = ' https://system-backend-rwsk.onrender.com/api/employees';

const employeeService = {

    getAllEmployees: () => {
        return axios.get(API_URL);
    },

    getEmployeeById: (id) => {
        return axios.get(` https://system-backend-rwsk.onrender.com/api/employees/${id}`);
    },

    saveEmployee: (employee) => { // قمت بتسميتها save لتناسب كود الـ Controller لديك
        return axios.post(API_URL, employee);
    },

    updateEmployee: (id, employee) => {
        return axios.put(`${API_URL}/${id}`, employee);
    },

    deleteEmployee: (id) => {
        return axios.delete(`${API_URL}/${id}`);
    },

    // --- التعديل الجوهري هنا ---
    searchEmployees: (searchTerm) => {
        // قمنا بتغيير 'term' إلى 'name' ليتطابق مع @RequestParam String name في الـ Java Controller
        return axios.get(`${API_URL}/search`, {
            params: { name: searchTerm }
        });
    }
};

export default employeeService;