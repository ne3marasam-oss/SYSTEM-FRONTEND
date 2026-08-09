import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import payrollService from '../services/payrollService';
import employeeService from '../services/employeeService';
import salaryAdvanceService from '../services/salaryAdvanceService';
import accountService from '../services/AccountService';
import './PayrollForm.css';

const PayrollForm = () => {
    const { id: payrollRecordId, employeeId: paramEmployeeId } = useParams();
    const navigate = useNavigate();

    const [payroll, setPayroll] = useState({
        employeeId: paramEmployeeId || '',
        payrollDate: new Date().toISOString().split('T')[0],
        payrollMonth: new Date().getMonth() + 1,
        payrollYear: new Date().getFullYear(),
        grossSalary: 0,
        deductions: 0,
        netSalary: 0,
        paymentStatus: 'Pending',
        paymentMethod: 'Bank Transfer',
        paidFromAccountId: '',          // حساب الدفع (صندوق / بنك) - إجباري
        salaryExpenseAccountId: '',     // حساب مصروف الرواتب - إجباري
    });

    const [employees, setEmployees] = useState([]);
    const [accounts, setAccounts] = useState([]); 
    const [selectedEmployeeBasicSalary, setSelectedEmployeeBasicSalary] = useState(0);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    const [absenceDays, setAbsenceDays] = useState(0);
    const [absenceDeduction, setAbsenceDeduction] = useState(0);

    // دالة لتسطيح شجرة الحسابات واستخراج الحسابات الفرعية النهائية التي تقبل الحركة
    const flattenAccounts = (accountList) => {
        let flatList = [];
        if (!Array.isArray(accountList)) return flatList;
        
        accountList.forEach(acc => {
            if (acc.children && acc.children.length > 0) {
                flatList = flatList.concat(flattenAccounts(acc.children));
            } else {
                flatList.push(acc);
            }
        });
        return flatList;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [empResponse, accResponse] = await Promise.all([
                    employeeService.getAllEmployees(),
                    accountService.getAllAccounts().catch(() => ({ data: [] }))
                ]);

                setEmployees(empResponse.data || []);

                const rawAccounts = accResponse.data || [];
                const leafAccounts = flattenAccounts(rawAccounts);
                setAccounts(leafAccounts);

                if (empResponse.data && empResponse.data.length > 0 && !paramEmployeeId && !payrollRecordId) {
                    setPayroll(prev => ({
                        ...prev,
                        employeeId: empResponse.data[0].id,
                        grossSalary: empResponse.data[0].basicSalary
                    }));
                    setSelectedEmployeeBasicSalary(empResponse.data[0].basicSalary);
                }

                if (payrollRecordId) {
                    setIsEditMode(true);
                    const response = await payrollService.getPayrollRecordById(payrollRecordId);
                    const recordData = response.data;

                    if (recordData.paymentDate) {
                        recordData.payrollDate = new Date(recordData.paymentDate).toISOString().split('T')[0];
                    }

                    setPayroll(prev => ({
                        ...prev,
                        employeeId: recordData.employeeId,
                        payrollDate: recordData.payrollDate,
                        payrollMonth: recordData.payrollMonth,
                        payrollYear: recordData.payrollYear,
                        grossSalary: recordData.grossSalary,
                        deductions: recordData.deductions,
                        netSalary: recordData.netSalary,
                        paymentStatus: recordData.paymentStatus,
                        paymentMethod: recordData.paymentMethod,
                        paidFromAccountId: recordData.paidFromAccountId || '',
                        salaryExpenseAccountId: recordData.salaryExpenseAccountId || '',
                    }));

                    setAbsenceDays(recordData.absenceDays || 0);
                    setAbsenceDeduction(recordData.absenceDeduction || 0);

                    const empResponseSingle = await employeeService.getEmployeeById(recordData.employeeId);
                    setSelectedEmployeeBasicSalary(empResponseSingle.data.basicSalary);
                }

                setMessage('');
            } catch (error) {
                console.error("خطأ في جلب البيانات الأولية:", error);
                setMessage('فشل في تحميل بيانات الصفحة. يرجى التحقق من الخادم.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [payrollRecordId, paramEmployeeId]);

    useEffect(() => {
        const calculateAbsenceDeduction = () => {
            const currentYear = payroll.payrollYear;
            const currentMonth = payroll.payrollMonth;

            if (selectedEmployeeBasicSalary > 0 && absenceDays > 0 && currentYear && currentMonth) {
                const date = new Date(currentYear, currentMonth, 0);
                const daysInMonth = date.getDate();

                const dailyRate = selectedEmployeeBasicSalary / daysInMonth;
                const deduction = dailyRate * absenceDays;

                setAbsenceDeduction(Math.round(deduction));
            } else {
                setAbsenceDeduction(0);
            }
        };
        calculateAbsenceDeduction();
    }, [selectedEmployeeBasicSalary, absenceDays, payroll.payrollMonth, payroll.payrollYear]);

    useEffect(() => {
        const fetchSalaryAdvances = async () => {
            if (!isEditMode && payroll.employeeId && payroll.payrollMonth && payroll.payrollYear) {
                try {
                    const advances = await salaryAdvanceService.findByEmployeeAndDeductionMonth(
                        payroll.employeeId,
                        payroll.payrollMonth,
                        payroll.payrollYear
                    );
                    const totalAdvances = advances.data.reduce(
                        (sum, advance) => sum + advance.amount,
                        0
                    );
                    setPayroll(prev => ({
                        ...prev,
                        deductions: totalAdvances
                    }));
                } catch (error) {
                    console.error("خطأ في جلب السلف:", error);
                    setPayroll(prev => ({
                        ...prev,
                        deductions: 0
                    }));
                }
            }
        };
        fetchSalaryAdvances();
    }, [payroll.employeeId, payroll.payrollMonth, payroll.payrollYear, isEditMode]);

    useEffect(() => {
        const calculateNetSalary = () => {
            const gross = parseFloat(payroll.grossSalary) || 0;
            const deduc = parseFloat(payroll.deductions) || 0;
            const absenceDeduc = parseFloat(absenceDeduction) || 0;

            setPayroll(prev => ({
                ...prev,
                netSalary: Math.round(gross - deduc - absenceDeduc)
            }));
        };
        calculateNetSalary();
    }, [payroll.grossSalary, payroll.deductions, absenceDeduction]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayroll({ ...payroll, [name]: value });

        if (name === 'employeeId') {
            const selectedEmp = employees.find(emp => emp.id === parseInt(value));
            if (selectedEmp) {
                setSelectedEmployeeBasicSalary(selectedEmp.basicSalary);
                setPayroll(prev => ({
                    ...prev,
                    grossSalary: selectedEmp.basicSalary,
                    employeeId: parseInt(value),
                }));
            } else {
                setSelectedEmployeeBasicSalary(0);
                setPayroll(prev => ({
                    ...prev,
                    grossSalary: 0,
                    employeeId: '',
                }));
            }
        }
    };

    const handleAbsenceDaysChange = (e) => {
        const days = parseInt(e.target.value) || 0;
        setAbsenceDays(days);
    };

 const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // التحقق من الحسابات المحاسبية وإجباريتها
        const paidFrom = parseInt(payroll.paidFromAccountId, 10);
        const expenseAcc = parseInt(payroll.salaryExpenseAccountId, 10);

        if (!payroll.employeeId || !payroll.payrollDate || !payroll.paymentStatus || !payroll.paymentMethod) {
            setMessage('الرجاء ملء جميع الحقول المطلوبة الأساسية.');
            return;
        }

        if (!paidFrom || isNaN(paidFrom) || !expenseAcc || isNaN(expenseAcc)) {
            setMessage('الرجاء اختيار حساب مصروف الرواتب وحساب السداد (الصندوق أو البنك) بشكل صحيح لتكوين القيد المحاسبي.');
            return;
        }

        if (payroll.grossSalary <= 0) {
            setMessage('الراتب الإجمالي يجب أن يكون أكبر من صفر.');
            return;
        }

        const dataToSave = {
            ...payroll,
            employee: { id: parseInt(payroll.employeeId, 10) },
            payrollMonth: parseInt(payroll.payrollMonth, 10),
            payrollYear: parseInt(payroll.payrollYear, 10),
            basicSalary: parseFloat(payroll.grossSalary),
            deductions: parseFloat(payroll.deductions),
            netSalary: parseFloat(payroll.netSalary),
            paymentDate: payroll.payrollDate,
            absenceDays: parseInt(absenceDays, 10),
            absenceDeduction: parseFloat(absenceDeduction),
            paidFromAccountId: paidFrom,
            salaryExpenseAccountId: expenseAcc
        };

        console.log("البيانات النهائية المُرسلة للـ Backend:", dataToSave);
        console.log("حساب المصروف (مدين):", expenseAcc, "حساب السداد (دائن):", paidFrom);

        try {
            if (isEditMode) {
                await payrollService.updatePayrollRecord(payrollRecordId, dataToSave);
                setMessage('تم تحديث سجل الرواتب والقيد المحاسبي بنجاح!');
            } else {
                await payrollService.createPayrollRecord(dataToSave, paidFrom, expenseAcc);
                setMessage('تم إضافة سجل الرواتب وإنشاء القيد المحاسبي المرتبط بنجاح!');
            }
            setTimeout(() => {
                if (paramEmployeeId) {
                    navigate(`/payroll/employee/${paramEmployeeId}`);
                } else {
                    navigate('/payroll');
                }
            }, 2000);
        } catch (error) {
            console.error("خطأ في حفظ سجل الرواتب:", error);
            setMessage(`فشل في حفظ سجل الرواتب: ${error.response?.data || error.message}`);
        }
    };

    if (loading && (isEditMode || !employees.length)) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <p className="mt-2">جاري تحميل البيانات، يرجى الانتظار...</p>
            </div>
        );
    }

    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    const formatNumberToEnglish = (num) => {
        if (num === null || num === undefined) return '';
        return num.toLocaleString('en-US', { useGrouping: false });
    };

    return (
        <div className="container payroll-form-container shadow-sm p-4 mb-5 bg-white rounded mt-4">
            <h1 className="text-center mb-4 text-primary">
                {isEditMode ? 'تعديل سجل الرواتب' : 'إضافة سجل رواتب جديد'}
            </h1>

            {message && (
                <div className={`alert ${message.includes('فشل') || message.includes('خطأ') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`} role="alert">
                    {message}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setMessage('')}></button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="employeeId" className="form-label">الموظف:</label>
                        <select
                            id="employeeId"
                            name="employeeId"
                            className="form-select"
                            value={payroll.employeeId}
                            onChange={handleChange}
                            required
                            disabled={isEditMode}
                        >
                            <option value="">اختر موظف...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.fullName} ({emp.jobTitle})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="payrollDate" className="form-label">تاريخ الدفع:</label>
                        <input
                            type="date"
                            id="payrollDate"
                            name="payrollDate"
                            className="form-control"
                            value={payroll.payrollDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="payrollMonth" className="form-label">شهر الرواتب:</label>
                        <select
                            id="payrollMonth"
                            name="payrollMonth"
                            className="form-select"
                            value={payroll.payrollMonth}
                            onChange={handleChange}
                            required
                            disabled={isEditMode}
                        >
                            {months.map(month => (
                                <option key={month} value={month}>
                                    {new Date(currentYear, month - 1, 1).toLocaleString('ar-us', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="payrollYear" className="form-label">سنة الرواتب:</label>
                        <select
                            id="payrollYear"
                            name="payrollYear"
                            className="form-select"
                            value={payroll.payrollYear}
                            onChange={handleChange}
                            required
                            disabled={isEditMode}
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* الحسابات المحاسبية للقيد المزدوج - أصبحت ثابتة وإجبارية */}
                <div className="row mb-3 p-3 border rounded bg-light">
                    <h5 className="text-secondary mb-3">البيانات المحاسبية للقيد المزدوج (إجباري)</h5>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="salaryExpenseAccountId" className="form-label">حساب مصروف الرواتب (مدين):</label>
                        <select
                            id="salaryExpenseAccountId"
                            name="salaryExpenseAccountId"
                            className="form-select"
                            value={payroll.salaryExpenseAccountId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">اختر حساب المصروف...</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.accountName} ({acc.accountCode})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="paidFromAccountId" className="form-label">حساب السداد / الصندوق أو البنك (دائن):</label>
                        <select
                            id="paidFromAccountId"
                            name="paidFromAccountId"
                            className="form-select"
                            value={payroll.paidFromAccountId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">اختر حساب الصندوق أو البنك...</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.accountName} ({acc.accountCode})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="absenceDays" className="form-label">عدد أيام الغياب:</label>
                        <input
                            type="number"
                            id="absenceDays"
                            name="absenceDays"
                            className="form-control"
                            value={absenceDays}
                            onChange={handleAbsenceDaysChange}
                            required
                            min="0"
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="absenceDeduction" className="form-label">خصم الغياب (تلقائي):</label>
                        <input
                            type="text"
                            id="absenceDeduction"
                            className="form-control"
                            value={formatNumberToEnglish(absenceDeduction)}
                            readOnly
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="grossSalary" className="form-label">إجمالي الراتب:</label>
                        <input
                            type="text"
                            id="grossSalary"
                            name="grossSalary"
                            className="form-control"
                            value={formatNumberToEnglish(payroll.grossSalary)}
                            onChange={(e) => handleChange({ ...e, target: { name: 'grossSalary', value: parseFloat(e.target.value) || 0 } })}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="deductions" className="form-label">الخصومات (السلف):</label>
                        <input
                            type="text"
                            id="deductions"
                            name="deductions"
                            className="form-control"
                            value={formatNumberToEnglish(payroll.deductions)}
                            onChange={(e) => handleChange({ ...e, target: { name: 'deductions', value: parseFloat(e.target.value) || 0 } })}
                            required
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="netSalary" className="form-label">صافي الراتب (يُحسب تلقائياً):</label>
                        <input
                            type="text"
                            id="netSalary"
                            className="form-control"
                            value={formatNumberToEnglish(payroll.netSalary)}
                            readOnly
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="paymentStatus" className="form-label">حالة الدفع:</label>
                        <select
                            id="paymentStatus"
                            name="paymentStatus"
                            className="form-select"
                            value={payroll.paymentStatus}
                            onChange={handleChange}
                            required
                        >
                            <option value="Pending">معلق</option>
                            <option value="Paid">مدفوع</option>
                            <option value="Canceled">ملغى</option>
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="paymentMethod" className="form-label">طريقة الدفع:</label>
                    <select
                        id="paymentMethod"
                        name="paymentMethod"
                        className="form-select"
                        value={payroll.paymentMethod}
                        onChange={handleChange}
                        required
                    >
                        <option value="Cash">نقداً</option>
                    </select>
                </div>

                <div className="d-flex justify-content-end mt-4">
                    <button type="submit" className="btn btn-primary me-2">
                        <i className="bi bi-save"></i> {isEditMode ? 'تحديث السجل والقيد' : 'حفظ السجل وإنشاء القيد'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => {
                        if (paramEmployeeId) {
                            navigate(`/payroll/employee/${paramEmployeeId}`);
                        } else {
                            navigate('/payroll');
                        }
                    }}>
                        <i className="bi bi-x-circle"></i> إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PayrollForm;