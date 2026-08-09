import axios from 'axios';

// التأكد من أن المسار يبدأ بـ /api ليطابق الـ RequestMapping في الجافا
const API_URL = 'https://system-backend-h8kw.onrender.com/api/payroll';

const payrollService = {

    /**
     * جلب جميع سجلات الرواتب.
     * يطابق @GetMapping في PayrollController
     */
    getAllPayrollRecords: () => {
        return axios.get(API_URL);
    },

    /**
     * إنشاء سجل راتب جديد مع تمرير حسابات القيود المحاسبية كـ Request Parameters.
     * يطابق @PostMapping في PayrollController
     */
    createPayrollRecord: (payrollRequestData, paidFromAccountId, salaryExpenseAccountId) => {
        return axios.post(API_URL, payrollRequestData, {
            params: {
                paidFromAccountId,
                salaryExpenseAccountId
            }
        });
    },

    /**
     * تحديث سجل راتب موجود.
     * يطابق @PutMapping("/{id}") في الـ Backend
     */
    updatePayrollRecord: (id, payrollRequestData) => {
        return axios.put(`${API_URL}/${id}`, payrollRequestData);
    },

    /**
     * جلب سجلات رواتب موظف معين.
     * يطابق @GetMapping("/employee/{employeeId}")
     */
    getPayrollRecordsByEmployeeId: (employeeId) => {
        return axios.get(`${API_URL}/employee/${employeeId}`);
    },

    /**
     * جلب سجلات الرواتب لشهر وسنة محددين باستخدام Filter.
     * يطابق @GetMapping("/filter") في الجافا
     */
    getPayrollRecordsForMonthAndYear: (month, year) => {
        return axios.get(`${API_URL}/filter`, {
            params: { month, year }
        });
    },

    /**
     * إلغاء وأرشفة سجل راتب (بدلاً من الحذف النهائي لمنع التلاعب المحاسبي).
     * يطابق @PutMapping("/cancel/{id}") في الـ Backend
     */
    cancelPayrollRecord: (id) => {
        return axios.put(`${API_URL}/cancel/${id}`);
    },

    /**
     * توليد رواتب الشهر تلقائياً مع تمرير حسابات القيود المحاسبية.
     * يطابق @PostMapping("/generate")
     */
    generateMonthlyPayroll: (month, year, paidFromAccountId, salaryExpenseAccountId) => {
        return axios.post(`${API_URL}/generate`, null, {
            params: { 
                month, 
                year, 
                paidFromAccountId, 
                salaryExpenseAccountId 
            }
        });
    }
};

export default payrollService;