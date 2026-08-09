// src/services/salaryAdvanceService.js
import axios from 'axios';

const API_URL = 'https://system-backend-rwsk.onrender.com/api/salary-advances';

const salaryAdvanceService = {
    // دالة لجلب كل السلف (قد تحتاجها في مكان آخر)
    getAllSalaryAdvances: () => {
        return axios.get(API_URL);
    },

    // دالة جلب السلف بناءً على معرف الموظف والشهر والسنة
    findByEmployeeAndDeductionMonth: (employeeId, month, year) => {
        // تأكد من أن endpoint يطابق ما هو في الواجهة الخلفية
        return axios.get(`${API_URL}/employee/${employeeId}/month/${month}/year/${year}`);
    }

    // يمكنك إضافة دوال أخرى هنا مثل إضافة سلفة أو تحديثها
    // createSalaryAdvance: (advanceData) => {
    //     return axios.post(API_URL, advanceData);
    // },
    // deleteSalaryAdvance: (id) => {
    //     return axios.delete(`${API_URL}/${id}`);
    // }
};

export default salaryAdvanceService;