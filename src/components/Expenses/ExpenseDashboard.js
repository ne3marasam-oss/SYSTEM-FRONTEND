import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import SummaryCards from './SummaryCards';
import axios from 'axios';
import ExpenseTable from './ExpenseTable';
import AddExpenseModal from './AddExpenseModal';
import ReportActions from './ReportActions';
import AdvancedSearch from './AdvancedSearch';
import expenseService from '../../services/expenseService';

const ExpenseDashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchFilters, setSearchFilters] = useState({ startDate: '', endDate: '' });

    // أضف State للحسابات في ExpenseDashboard
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        fetchExpenses();
        fetchAccounts(); // جلب الحسابات عند التحميل
    }, []);

   const fetchAccounts = async () => {
        try {
            const response = await axios.get('https://system-backend-rwsk.onrender.com/api/accounts'); // تم تصحيح المنفذ إلى 8080
            const data = response.data;
            const accountsList = Array.isArray(data) ? data : (data.content || data.data || []);
            setAccounts(accountsList);
        } catch (err) {
            console.error("فشل جلب الحسابات:", err);
        }
    };

    const fetchExpenses = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching expenses from API...");
            const response = await expenseService.getExpenses();
            console.log("Expenses fetched successfully:", response.data);
            
            const fetchedData = Array.isArray(response.data) 
                ? response.data 
                : (response.data.content || response.data.data || []);
            
            setExpenses(fetchedData);
        } catch (err) {
            console.error("Failed to fetch expenses:", err);
            setError("فشل في تحميل قائمة المصروفات. تأكد من تشغيل السيرفر.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (expense = null) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const handleSaveExpense = async (expenseData) => {
        try {
            if (editingExpense) {
                await expenseService.updateExpense(editingExpense.id, expenseData);
            } else {
                await expenseService.createExpense(expenseData);
            }
            fetchExpenses();
            handleCloseModal();
        } catch (err) {
            console.error("Error saving expense:", err);
            setError("فشل في حفظ المصروف.");
        }
    };

    const handleDeleteExpense = async (id) => {
        if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المصروف؟')) {
            try {
                await expenseService.deleteExpense(id);
                fetchExpenses();
            } catch (err) {
                console.error("Error deleting expense:", err);
                setError("فشل في حذف المصروف.");
            }
        }
    };

    const handleCancelExpense = async (id) => {
        if (window.confirm('هل أنت متأكد أنك تريد إلغاء هذا المصروف؟')) {
            try {
                await expenseService.cancelExpense(id);
                fetchExpenses();
            } catch (err) {
                console.error("Error canceling expense:", err);
                setError("فشل في إلغاء المصروف.");
            }
        }
    };

const handleReimburseExpense = async (id, paidFromAccountId) => {
    try {
        // تم تغيير axios.post إلى axios.put لتتطابق مع الـ Backend (PutMapping)
        await axios.put(`https://system-backend-rwsk.onrender.com/api/expenses/${id}/reimburse`, {
            paidFromAccountId: paidFromAccountId
        });
        
        // جلب المصروفات مرة أخرى لتحديث الجدول والشاشات
        fetchExpenses();
        setError(null);
    } catch (err) {
        console.error("Error reimbursing expense:", err);
        const errorMsg = err.response?.data?.message || err.response?.data || "فشل في إعادة صرف المصروف.";
        setError(typeof errorMsg === 'string' ? errorMsg : "فشل في إعادة صرف المصروف.");
    }
};

    const handleSearch = (filters) => {
        setSearchFilters(filters);
    };

    // دالة طباعة أمر الصرف الفردي
    const handlePrintExpense = (expense) => {
        let formattedDate = '-';
        if (expense.expenseDate) {
            if (Array.isArray(expense.expenseDate)) {
                formattedDate = expense.expenseDate.join('-');
            } else if (typeof expense.expenseDate === 'string') {
                formattedDate = expense.expenseDate.split('T')[0];
            }
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html dir="rtl">
                <head>
                    <title>سند صرف رقم ${expense.id}</title>
                    <style>
                        body { font-family: 'Tahoma', Arial, sans-serif; padding: 30px; color: #333; background: #fff; }
                        .voucher-box { max-width: 700px; margin: 0 auto; border: 2px solid #2c3e50; padding: 25px; border-radius: 8px; }
                        .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
                        .header h2 { margin: 0; color: #2c3e50; font-size: 24px; }
                        .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; font-weight: bold; color: #555; }
                        table.details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        table.details-table th, table.details-table td { border: 1px solid #ddd; padding: 12px 15px; text-align: right; font-size: 15px; }
                        table.details-table th { background-color: #f8f9fa; color: #2c3e50; width: 30%; }
                        table.details-table td { color: #333; }
                        .amount-row { font-weight: bold; background-color: #fdfefe; }
                        .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; }
                        .signature-box { text-align: center; width: 200px; }
                        .signature-line { margin-top: 40px; border-top: 1px dashed #7f8c8d; }
                    </style>
                </head>
                <body>
                    <div class="voucher-box">
                        <div class="header">
                            <h2>سند صرف مصروف</h2>
                        </div>
                        <div class="meta-info">
                            <div>رقم السند: #${expense.id}</div>
                            <div>التاريخ: ${formattedDate}</div>
                        </div>
                        <table class="details-table">
                            <tr>
                                <th>رقم الفاتورة</th>
                                <td>${expense.invoiceNumber || '-'}</td>
                            </tr>
                            <tr>
                                <th>اسم المورد</th>
                                <td>${expense.vendorName || '-'}</td>
                            </tr>
                            <tr>
                                <th>بند المصروف (الحساب)</th>
                                <td>${expense.account?.accountName || 'غير محدد'}</td>
                            </tr>
                            <tr>
                                <th>الوصف / البيان</th>
                                <td>${expense.description || 'لا يوجد وصف'}</td>
                            </tr>
                            <tr class="amount-row">
                                <th>المبلغ الصافي</th>
                                <td style="color: #27ae60; font-size: 18px;">
                                    ${Number(expense.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
                                </td>
                            </tr>
                            <tr>
                                <th>الحالة</th>
                                <td>${expense.status === 'CANCELLED' ? 'ملغى' : 'تم الصرف'}</td>
                            </tr>
                        </table>
                        <div class="footer">
                            <div class="signature-box">
                                <div>توقيع المحاسب</div>
                                <div class="signature-line"></div>
                            </div>
                            <div class="signature-box">
                                <div>الاعتماد والإدارة</div>
                                <div class="signature-line"></div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const expensesToShow = searchFilters.startDate && searchFilters.endDate
        ? expenses.filter(exp => {
            if (!exp.expenseDate) return false;
            const dateStr = Array.isArray(exp.expenseDate) ? exp.expenseDate.join('-') : exp.expenseDate;
            const expenseDate = new Date(dateStr);
            const start = new Date(searchFilters.startDate);
            const end = new Date(searchFilters.endDate);
            return expenseDate >= start && expenseDate <= end;
        })
        : expenses;

    // تصفية المصروفات النشطة فقط لكي لا تحتسب المصروفات الملغاة في البطاقات العلوية
    const activeExpensesForCards = expensesToShow.filter(exp => exp.status !== 'CANCELLED');

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>جاري تحميل المصروفات...</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 3 }} dir="rtl">
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    لوحة تحكم المصروفات
                </Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpenModal()} startIcon={<i className="bi bi-plus-lg"></i>}>
                    إضافة مصروف جديد
                </Button>
            </Box>

            <SummaryCards expenses={expensesToShow} />
            <AdvancedSearch onSearch={handleSearch} initialFilters={searchFilters} />
            <ReportActions expenses={expensesToShow} />
            
            <ExpenseTable
        expenses={expensesToShow}
        accounts={accounts} // تمرير الحسابات للجدول
        onDelete={handleDeleteExpense}
        onCancel={handleCancelExpense}
        onReimburse={handleReimburseExpense}
        onEdit={handleOpenModal} 
        onPrint={handlePrintExpense}
    />

            <AddExpenseModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveExpense}
                editingExpense={editingExpense}
            />
        </Box>
    );
};

export default ExpenseDashboard;