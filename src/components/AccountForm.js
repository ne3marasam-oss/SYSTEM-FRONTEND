// src/components/AccountForm.js
import React, { useState, useEffect } from 'react';
import './AccountForm.css';

const AccountForm = ({ initialData, onSubmit, onCancel }) => {
    const [account, setAccount] = useState({
        accountName: '',
        accountCode: '',
        accountType: 'Expense', // قيمة افتراضية
        openingBalance: 0,
    });
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (initialData) {
            setAccount({
                accountName: initialData.accountName || '',
                accountCode: initialData.accountCode || '',
                accountType: initialData.accountType || 'Expense',
                openingBalance: initialData.openingBalance != null ? initialData.openingBalance : 0,
            });
            setIsEditMode(true);
        } else {
            setAccount({
                accountName: '',
                accountCode: '',
                accountType: 'Expense',
                openingBalance: 0,
            });
            setIsEditMode(false);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccount(prevAccount => ({
            ...prevAccount,
            [name]: name === 'openingBalance' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(account);
    };

    return (
        <div className="account-form-container">
            <h3>{isEditMode ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}</h3>
            <form onSubmit={handleSubmit} className="account-form">
                <div className="form-group">
                    <label htmlFor="accountName">اسم الحساب:</label>
                    <input
                        type="text"
                        id="accountName"
                        name="accountName"
                        value={account.accountName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="accountCode">كود الحساب:</label>
                    <input
                        type="text"
                        id="accountCode"
                        name="accountCode"
                        value={account.accountCode}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="accountType">نوع الحساب:</label>
                    <select
                        id="accountType"
                        name="accountType"
                        value={account.accountType}
                        onChange={handleChange}
                        required
                    >
                        <option value="Asset">أصل (Asset)</option>
                        <option value="Liability">خصم (Liability)</option>
                        <option value="Equity">حقوق ملكية (Equity)</option>
                        <option value="Revenue">إيراد (Revenue)</option>
                        <option value="Expense">مصروف (Expense)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="openingBalance">الرصيد الافتتاحي:</label>
                    <input
                        type="number"
                        id="openingBalance"
                        name="openingBalance"
                        value={account.openingBalance}
                        onChange={handleChange}
                        step="0.01"
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        {isEditMode ? 'تحديث الحساب' : 'إضافة الحساب'}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountForm;