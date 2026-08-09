// src/pages/AccountsPage.js
import React, { useEffect, useState } from 'react';
import accountService from '../services/AccountService'; // استيراد خدمة الحسابات
import AccountList from '../components/AccountList';     // استيراد مكون القائمة
import AccountForm from '../components/AccountForm';     // استيراد مكون النموذج
import './AccountsPage.css';                             // استيراد التنسيقات

function AccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [currentAccount, setCurrentAccount] = useState(null);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await accountService.getAllAccounts();
            setAccounts(response.data);
            setError(null);
        } catch (err) {
            setError('فشل في جلب بيانات الحسابات. يرجى التأكد من تشغيل الخادم الخلفي.');
            console.error('Error fetching accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleAddAccount = () => {
        setCurrentAccount(null);
        setShowForm(true);
    };

    const handleEditAccount = async (id) => {
        try {
            const response = await accountService.getAccountById(id);
            setCurrentAccount(response.data);
            setShowForm(true);
        } catch (err) {
            setError('فشل في جلب بيانات الحساب للتعديل.');
            console.error('Error fetching account for edit:', err);
        }
    };

    const handleDeleteAccount = async (id) => {
        if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الحساب؟')) {
            try {
                await accountService.deleteAccount(id);
                fetchAccounts(); // إعادة جلب القائمة بعد الحذف
                console.log('Account deleted successfully!');
            } catch (err) {
                console.error('Error deleting account:', err);
                setError('فشل في حذف الحساب.');
            }
        }
    };

    const handleSubmitForm = async (accountData) => {
        try {
            if (currentAccount) {
                await accountService.updateAccount(currentAccount.id, accountData);
                setError(null); // مسح الخطأ بعد النجاح
                console.log('Account updated successfully!');
            } else {
                await accountService.createAccount(accountData);
                setError(null); // مسح الخطأ بعد النجاح
                console.log('Account added successfully!');
            }
            setShowForm(false);
            fetchAccounts(); // إعادة جلب القائمة بعد الإرسال
        } catch (err) {
            // التحقق من نوع الخطأ القادم من الخادم
            if (err.response && err.response.status === 409) {
                setError('فشل في حفظ الحساب: كود الحساب موجود بالفعل. يرجى اختيار كود آخر.');
            } else {
                setError('فشل في حفظ بيانات الحساب. يرجى التحقق من البيانات.');
                console.error('Error saving account:', err.response ? err.response.data : err.message);
            }
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setCurrentAccount(null);
        setError(null); // مسح رسالة الخطأ عند الإلغاء
    };

    if (loading) {
        return <p>جاري تحميل بيانات الحسابات...</p>;
    }

    return (
        <div className="accounts-page">
            <h1>إدارة الحسابات</h1>

            {!showForm && (
                <button className="add-button" onClick={handleAddAccount}>
                    إضافة حساب جديد
                </button>
            )}

            {error && <p className="error-message">{error}</p>}

            {showForm ? (
                <AccountForm
                    initialData={currentAccount}
                    onSubmit={handleSubmitForm}
                    onCancel={handleCancelForm}
                />
            ) : (
                <AccountList
                    accounts={accounts}
                    onEdit={handleEditAccount}
                    onDelete={handleDeleteAccount}
                />
            )}
        </div>
    );
}

export default AccountsPage;