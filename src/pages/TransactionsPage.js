// src/pages/TransactionsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionForm from '../components/TransactionForm';
import './TransactionsPage.css'; // تأكد من إنشاء هذا الملف

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [accounts, setAccounts] = useState([]); // لجلب بيانات الحسابات
    const [payments, setPayments] = useState([]); // لجلب بيانات المدفوعات
    const [expenses, setExpenses] = useState([]); // لجلب بيانات المصروفات

    const [showForm, setShowForm] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            // جلب القيود المحاسبية
            const transactionsRes = await axios.get('http://localhost:8080/api/transactions');
            setTransactions(Array.isArray(transactionsRes.data) ? transactionsRes.data : []);

            // جلب السنوات الأكاديمية
            const academicYearsRes = await axios.get('http://localhost:8080/api/academic-years');
            setAcademicYears(Array.isArray(academicYearsRes.data) ? academicYearsRes.data : []);

            // جلب الحسابات (جديد)
            const accountsRes = await axios.get('http://localhost:8080/api/accounts');
            setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);

            // جلب المدفوعات (جديد)
            const paymentsRes = await axios.get('http://localhost:8080/api/payments');
            setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);

            // جلب المصروفات
            const expensesRes = await axios.get('http://localhost:8080/api/expenses');
            setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);

        } catch (err) {
            console.error('Failed to load initial data for Transactions Page:', err);
            if (err.response) {
                setError(`خطأ من الخادم: ${err.response.status} - ${err.response.data.message || 'مشكلة غير معروفة'}`);
            } else if (err.request) {
                setError('لا يمكن الاتصال بالخادم. يرجى التأكد من تشغيل الواجهة الخلفية (Backend).');
            } else {
                setError('حدث خطأ غير متوقع أثناء إعداد طلب البيانات.');
            }
            // مسح جميع البيانات في حالة الخطأ
            setTransactions([]);
            setAcademicYears([]);
            setAccounts([]);
            setPayments([]);
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/transactions');
            setTransactions(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error re-fetching transactions after an operation:', err);
            alert('فشل في تحديث قائمة القيود المحاسبية. يرجى إعادة تحميل الصفحة يدوياً.');
        }
    };

    const handleAddTransaction = () => {
        setSelectedTransaction(null);
        setShowForm(true);
    };

    const handleEditTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setShowForm(true);
    };

    const handleDeleteTransaction = async (id) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا القيد المحاسبي؟')) {
            try {
                await axios.delete(`http://localhost:8080/api/transactions/${id}`);
                fetchTransactions();
                alert('تم حذف القيد المحاسبي بنجاح.');
            } catch (err) {
                console.error('Error deleting transaction:', err);
                let userMessage = 'فشل في حذف القيد المحاسبي. قد يكون مرتبطًا ببيانات أخرى.';
                if (err.response) {
                    userMessage += ` رسالة الخادم: ${err.response.status} - ${err.response.data.message || 'مشكلة غير معروفة'}`;
                } else if (err.message) {
                    userMessage += ` (${err.message})`;
                }
                alert(userMessage);
            }
        }
    };

    const handleFormSubmit = async (transactionData) => {
        try {
            if (selectedTransaction) {
                // تعديل قيد محاسبي موجود
                await axios.put(`http://localhost:8080/api/transactions/${selectedTransaction.id}`, transactionData);
                alert('تم تحديث القيد المحاسبي بنجاح!');
            } else {
                // إضافة قيد محاسبي جديد
                await axios.post('http://localhost:8080/api/transactions', transactionData);
                alert('تم إضافة قيد محاسبي بنجاح!');
            }
            setShowForm(false);
            setSelectedTransaction(null);
            fetchTransactions(); // إعادة جلب البيانات لتحديث الجدول
        } catch (err) {
            console.error('Error saving transaction:', err);
            let userMessage = 'فشل في حفظ القيد المحاسبي. يرجى التحقق من البيانات المدخلة.';
            if (err.response) {
                userMessage += ` رسالة الخادم: ${err.response.status} - ${err.response.data.message || 'مشكلة غير معروفة'}`;
            } else if (err.message) {
                userMessage += ` (${err.message})`;
            }
            alert(userMessage);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setSelectedTransaction(null);
    };

    if (loading) {
        return <div className="loading">جاري تحميل القيود المحاسبية...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="transactions-page-container">
            <h1>إدارة القيود المحاسبية</h1>

            <button onClick={handleAddTransaction} className="add-button">
                إضافة قيد محاسبي جديد
            </button>

            {showForm && (
                <TransactionForm
                    initialData={selectedTransaction}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    academicYears={academicYears}
                    accounts={accounts}
                    payments={payments}
                    expenses={expenses}
                />
            )}

            {!showForm && transactions.length === 0 && (
                <p className="no-data-message">لا توجد قيود محاسبية لعرضها.</p>
            )}

            {!showForm && transactions.length > 0 && (
                <div className="transactions-list">
                    <table>
                        <thead>
                        <tr>
                            <th>المبلغ</th>
                            <th>تاريخ القيد</th>
                            <th>الوصف</th>
                            <th>السنة الأكاديمية</th>
                            <th>حساب الخصم (مدين)</th>
                            <th>حساب الدائن</th>
                            <th>دفعة مرتبطة</th>
                            <th>مصروف مرتبط</th>
                            <th>تاريخ الإنشاء</th>
                            <th>الإجراءات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map((t) => (
                            <tr key={t.id}>
                                <td>{t.amount}</td>
                                <td>{t.transactionDate ? new Date(t.transactionDate).toLocaleString('ar-EG') : 'N/A'}</td>
                                <td>{t.description || 'لا يوجد'}</td>
                                <td>{t.academicYear?.yearName || 'غير محدد'}</td>
                                <td>{t.debitAccount?.accountName || 'غير محدد'}</td>
                                <td>{t.creditAccount?.accountName || 'غير محدد'}</td>
                                <td>{t.payment ? `دفعة #${t.payment.id}` : 'لا يوجد'}</td>
                                <td>{t.expense ? `مصروف #${t.expense.id}` : 'لا يوجد'}</td>
                                <td>{t.createdAt ? new Date(t.createdAt).toLocaleString('ar-EG') : 'N/A'}</td>
                                <td>
                                    <button onClick={() => handleEditTransaction(t)} className="edit-button">
                                        تعديل
                                    </button>
                                    <button onClick={() => handleDeleteTransaction(t.id)} className="delete-button">
                                        حذف
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;