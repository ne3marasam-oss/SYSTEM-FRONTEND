// src/components/AddExpenseModal.js

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import './AddExpenseModal.css';

const AddExpenseModal = ({ open, onClose, onExpenseAdded }) => {
    const [expenseData, setExpenseData] = useState({
        amount: '',
        expenseDate: new Date().toISOString().slice(0, 10),
        expenseCategory: '',
        description: '',
        invoiceNumber: '',
        vendorName: '',
        academicYearId: '',
        accountId: ''
    });
    const [academicYears, setAcademicYears] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchInitialData();
        }
    }, [open]);

    const fetchInitialData = async () => {
        try {
            const academicYearsRes = await axios.get('http://localhost:8080/api/academic-years');
            setAcademicYears(academicYearsRes.data || []);
            const accountsRes = await axios.get('http://localhost:8080/api/accounts');
            setAccounts(accountsRes.data || []);
        } catch (err) {
            console.error("فشل في جلب البيانات الأولية:", err);
            setError("فشل في تحميل البيانات الأولية (السنوات والحسابات).");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpenseData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveExpense = async () => {
        setLoading(true);
        setError(null);
        if (!expenseData.amount || !expenseData.expenseCategory || !expenseData.academicYearId || !expenseData.accountId) {
            setError('يرجى ملء جميع الحقول الإلزامية.');
            setLoading(false);
            return;
        }
        try {
            const formattedExpenseData = {
                ...expenseData,
                expenseDate: `${expenseData.expenseDate}T00:00:00`
            };
            await axios.post('http://localhost:8080/api/expenses', formattedExpenseData);
            onExpenseAdded();
            handleClose();
        } catch (err) {
            console.error('خطأ في إضافة المصروف:', err.response || err);
            setError('فشل في إضافة المصروف. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setExpenseData({
            amount: '',
            expenseDate: new Date().toISOString().slice(0, 10),
            expenseCategory: '',
            description: '',
            invoiceNumber: '',
            vendorName: '',
            academicYearId: '',
            accountId: ''
        });
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth className="add-expense-modal">
            <DialogTitle>إضافة مصروف جديد</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <div>
                    <div className="form-field">
                        <TextField
                            autoFocus
                            margin="dense"
                            name="amount"
                            label="المبلغ *"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={expenseData.amount}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-field">
                        <TextField
                            margin="dense"
                            name="expenseDate"
                            label="تاريخ المصروف"
                            type="date"
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            value={expenseData.expenseDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-field">
                        <TextField
                            margin="dense"
                            name="invoiceNumber"
                            label="رقم الفاتورة"
                            fullWidth
                            variant="outlined"
                            value={expenseData.invoiceNumber}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-field">
                        <TextField
                            margin="dense"
                            name="vendorName"
                            label="اسم المورد"
                            fullWidth
                            variant="outlined"
                            value={expenseData.vendorName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-field">
                        <FormControl fullWidth margin="dense">
                            <InputLabel>فئة المصروف *</InputLabel>
                            <Select
                                name="expenseCategory"
                                value={expenseData.expenseCategory}
                                label="فئة المصروف *"
                                onChange={handleChange}
                            >
                                <MenuItem value="">اختر فئة</MenuItem>
                                <MenuItem value="Salaries">رواتب</MenuItem>
                                <MenuItem value="Utilities">فواتير وخدمات</MenuItem>
                                <MenuItem value="Supplies">مستلزمات مدرسية</MenuItem>
                                <MenuItem value="Maintenance">صيانة</MenuItem>
                                <MenuItem value="Other">أخرى</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="form-field">
                        <FormControl fullWidth margin="dense">
                            <InputLabel>السنة الأكاديمية *</InputLabel>
                            <Select
                                name="academicYearId"
                                value={expenseData.academicYearId}
                                label="السنة الأكاديمية *"
                                onChange={handleChange}
                            >
                                <MenuItem value="">اختر سنة</MenuItem>
                                {academicYears.map(year => (
                                    <MenuItem key={year.id} value={year.id}>{year.yearName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="form-field">
                        <FormControl fullWidth margin="dense">
                            <InputLabel>الحساب *</InputLabel>
                            <Select
                                name="accountId"
                                value={expenseData.accountId}
                                label="الحساب *"
                                onChange={handleChange}
                            >
                                <MenuItem value="">اختر حساب</MenuItem>
                                {accounts.map(account => (
                                    <MenuItem key={account.id} value={account.id}>{account.accountName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="form-field">
                        <FormControl fullWidth margin="dense">
                            <InputLabel htmlFor="description" shrink>الوصف</InputLabel>
                            <textarea
                                id="description"
                                name="description"
                                value={expenseData.description}
                                onChange={handleChange}
                                rows={3}
                                className="styled-textarea"
                            />
                        </FormControl>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary" variant="outlined">إلغاء</Button>
                <Button onClick={handleSaveExpense} color="primary" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'حفظ المصروف'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddExpenseModal;