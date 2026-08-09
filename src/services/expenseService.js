import axios from 'axios';

const API_URL = 'https://system-backend-rwsk.onrender.com/api/expenses';

const expenseService = {
    // جلب جميع المصروفات
    getExpenses: () => {
        return axios.get(API_URL);
    },

    // جلب الإحصائيات للمربعات العلوية
    getStats: () => {
        return axios.get(`${API_URL}/stats`);
    },

    // دالة البحث بالتاريخ
    searchExpenses: (startDate, endDate) => {
        return axios.get(`${API_URL}/search`, {
            params: { startDate, endDate }
        });
    },

    // دالة حفظ مصروف جديد
    createExpense: (expenseData) => {
        return axios.post(API_URL, expenseData);
    },

    // دالة إلغاء المصروف
    cancelExpense: (id) => {
        return axios.put(`${API_URL}/${id}/cancel`);
    },

    // دالة إعادة صرف المصروف
// دالة إعادة صرف المصروف
   // دالة إعادة صرف المصروف
   // دالة إعادة صرف المصروف
    reimburseExpense: (id, paidFromAccountId) => {
        return axios.put(`${API_URL}/${id}/reimburse`, {
            paidFromAccountId: paidFromAccountId
        });
    },
};

export default expenseService;