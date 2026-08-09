// src/components/AccountList.js
import React from 'react';
const AccountList = ({ accounts, onEdit, onDelete }) => {
    if (!accounts || accounts.length === 0) {
        return <p>لا توجد حسابات لعرضها.</p>;
    }
    return (
        <div className="account-list-container">
            <h2>قائمة الحسابات</h2>
            <table className="account-table">
                <thead>
                <tr>
                    <th>اسم الحساب</th>
                    <th>الرصيد الافتتاحي</th>
                    <th>الإجراءات</th>
                </tr>
                </thead>
                <tbody>
                {accounts.map(account => (
                    <tr key={account.id}>
                        <td>{account.accountName}</td>
                        <td>{(account.openingBalance || 0).toFixed(2)}</td><td>
                            <button onClick={() => onEdit(account.id)} className="edit-button">تعديل</button>
                            <button onClick={() => onDelete(account.id)} className="delete-button">حذف</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};
export default AccountList;