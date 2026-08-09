// src/components/TransactionForm.js
import React, { useState, useEffect } from 'react';
import './TransactionForm.css'; // تأكد من إنشاء هذا الملف

// تتلقى academicYears, accounts, payments, expenses كـ props
const TransactionForm = ({ initialData, onSubmit, onCancel, academicYears = [], accounts = [], payments = [], expenses = [] }) => {
    const [transaction, setTransaction] = useState({
        amount: '',
        transactionDate: '', // LocalDateTime in Backend
        description: '',
        academicYearId: '',
        debitAccountId: '',
        creditAccountId: '',
        paymentId: '', // اختياري
        expenseId: '' // اختياري
    });
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (initialData) {
            setIsEditMode(true);
            setTransaction({
                amount: initialData.amount || '',
                // تحويل LocalDateTime إلى تنسيق datetime-local (YYYY-MM-DDTHH:MM)
                transactionDate: initialData.transactionDate ? new Date(initialData.transactionDate).toISOString().slice(0, 16) : '',
                description: initialData.description || '',
                academicYearId: initialData.academicYear?.id || '',
                debitAccountId: initialData.debitAccount?.id || '',
                creditAccountId: initialData.creditAccount?.id || '',
                paymentId: initialData.payment?.id || '',
                expenseId: initialData.expense?.id || ''
            });
        } else {
            setIsEditMode(false);
            setTransaction({
                amount: '',
                transactionDate: '',
                description: '',
                academicYearId: '',
                debitAccountId: '',
                creditAccountId: '',
                paymentId: '',
                expenseId: ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTransaction((prevTransaction) => ({
            ...prevTransaction,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const amountAsNumber = parseFloat(transaction.amount);

        // التحقق من المدخلات الأساسية
        if (isNaN(amountAsNumber) || amountAsNumber <= 0) {
            alert('الرجاء إدخال مبلغ صحيح وموجب.');
            return;
        }
        if (!transaction.transactionDate || !transaction.academicYearId || !transaction.debitAccountId || !transaction.creditAccountId) {
            alert('الرجاء ملء جميع الحقول المطلوبة (المبلغ، التاريخ، السنة الأكاديمية، حساب الخصم، حساب الدائن).');
            return;
        }
        if (transaction.debitAccountId === transaction.creditAccountId) {
            alert('حساب الخصم وحساب الدائن لا يمكن أن يكونا متطابقين.');
            return;
        }

        // بناء الكائن ليطابق ما تتوقعه الواجهة الخلفية (IDs مباشرة)
        const submittedTransaction = {
            amount: amountAsNumber,
            transactionDate: transaction.transactionDate, // LocalDateTime in Backend
            description: transaction.description,
            academicYearId: parseInt(transaction.academicYearId),
            debitAccountId: parseInt(transaction.debitAccountId),
            creditAccountId: parseInt(transaction.creditAccountId),
            // تضمين الـ IDs فقط إذا كانت موجودة وغير فارغة
            paymentId: transaction.paymentId ? parseInt(transaction.paymentId) : null,
            expenseId: transaction.expenseId ? parseInt(transaction.expenseId) : null
        };

        console.log("Submitting Transaction data:", submittedTransaction);
        onSubmit(submittedTransaction);
    };

    return (
        <div className="transaction-form-container">
            <h2>{isEditMode ? 'تعديل القيد المحاسبي' : 'إضافة قيد محاسبي جديد'}</h2>
            <form onSubmit={handleSubmit} className="transaction-form">
                <div className="form-group">
                    <label htmlFor="amount">المبلغ:</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={transaction.amount}
                        onChange={handleChange}
                        required
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="transactionDate">تاريخ القيد:</label>
                    <input
                        type="datetime-local" // يستخدم تاريخ ووقت
                        id="transactionDate"
                        name="transactionDate"
                        value={transaction.transactionDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">الوصف:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={transaction.description}
                        onChange={handleChange}
                        rows="3"
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="academicYearId">السنة الأكاديمية:</label>
                    <select
                        id="academicYearId"
                        name="academicYearId"
                        value={transaction.academicYearId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">اختر سنة أكاديمية...</option>
                        {Array.isArray(academicYears) && academicYears.map((year) => (
                            <option key={year.id} value={year.id}>
                                {year.yearName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="debitAccountId">حساب الخصم (المدين):</label>
                    <select
                        id="debitAccountId"
                        name="debitAccountId"
                        value={transaction.debitAccountId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">اختر حساب خصم...</option>
                        {Array.isArray(accounts) && accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.accountName} ({account.accountType})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="creditAccountId">حساب الدائن:</label>
                    <select
                        id="creditAccountId"
                        name="creditAccountId"
                        value={transaction.creditAccountId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">اختر حساب دائن...</option>
                        {Array.isArray(accounts) && accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.accountName} ({account.accountType})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="paymentId">الدفعة المرتبطة (اختياري):</label>
                    <select
                        id="paymentId"
                        name="paymentId"
                        value={transaction.paymentId}
                        onChange={handleChange}
                    >
                        <option value="">لا يوجد دفعة مرتبطة</option>
                        {Array.isArray(payments) && payments.map((payment) => (
                            <option key={payment.id} value={payment.id}>
                                دفعة #{payment.id} - {payment.amount} - {payment.paymentDate}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="expenseId">المصروف المرتبط (اختياري):</label>
                    <select
                        id="expenseId"
                        name="expenseId"
                        value={transaction.expenseId}
                        onChange={handleChange}
                    >
                        <option value="">لا يوجد مصروف مرتبط</option>
                        {Array.isArray(expenses) && expenses.map((expense) => (
                            <option key={expense.id} value={expense.id}>
                                مصروف #{expense.id} - {expense.description} - {expense.amount}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        {isEditMode ? 'حفظ التعديلات' : 'إضافة قيد محاسبي'}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;