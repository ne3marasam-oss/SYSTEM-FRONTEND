import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Alert, Select, MenuItem,
    FormControl, InputLabel, CircularProgress, Stack, Box
} from '@mui/material';
import axios from 'axios';

const AddExpenseModal = ({ open, onClose, onExpenseAdded }) => {

    const initialFormState = {
        amount: '',
        expenseDate: new Date().toISOString().slice(0, 10),
        expenseCategory: '',
        description: '',
        academicYearId: '',
        expenseAccountId: '', // بند المصروف أو الأصل (إلى حساب)
        paidFromAccountId: '', // حساب الدفع / الصندوق (من حساب)
        invoiceNumber: '',     // رقم الفاتورة (اختياري للصرف السريع)
        vendorName: ''         // اسم المورد (اختياري)
    };

    const [expenseData, setExpenseData] = useState(initialFormState);
    const [academicYears, setAcademicYears] = useState([]);
    const [expenseAccounts, setExpenseAccounts] = useState([]); // بنود المصاريف والأصول الثابتة المتاحة
    const [paymentAccounts, setPaymentAccounts] = useState([]); // الصناديق والبنوك المتاحة للدفع
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchInitialData();
        }
    }, [open]);

    const fetchInitialData = async () => {
        try {
            const [yearsRes, accountsRes, cashAccountsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/academic-years'),
                axios.get('http://localhost:8080/api/accounts'),
                axios.get('http://localhost:8080/api/accounts/cash-accounts')
            ]);
            
            setAcademicYears(yearsRes.data || []);
            
            const allAccounts = accountsRes.data || [];

            const flattenAccounts = (accountsList) => {
                let flat = [];
                accountsList.forEach(acc => {
                    flat.push(acc);
                    if (acc.children && Array.isArray(acc.children) && acc.children.length > 0) {
                        flat = flat.concat(flattenAccounts(acc.children));
                    }
                });
                return flat;
            };

            const flatAccounts = flattenAccounts(allAccounts);

            const formattedAccounts = flatAccounts.map(acc => ({
                ...acc,
                label: acc.name,
                value: acc.id
            }));

            // 🌟 تصفية دقيقة: إظهار المصروفات والأصول الثابتة فقط مع استبعاد النقدية والذمم (11) واستبعاد رواتب الموظفين (5101)
            const expenseList = formattedAccounts.filter(acc => {
                const category = String(acc.category || '').toLowerCase();
                const accountType = String(acc.accountType || '').toUpperCase();
                const code = String(acc.accountCode || acc.code || '');
                
                // استبعاد حساب رواتب الموظفين نهائياً بناءً على الكود
                if (code === '5101' || code.startsWith('5101')) return false;

                if (category !== 'sub') return false;

                if (accountType === 'EXPENSE') return true;
                
                // السماح بالأصول التي لا تتبع مجموعة الأصول المتداولة (11) مثل الأجهزة والأثاث (12)
                if (accountType === 'ASSET' && !code.startsWith('11')) {
                    return true;
                }

                return false;
            });

            setExpenseAccounts(expenseList);

            const rawCashList = cashAccountsRes.data || [];
            const paymentList = rawCashList.map(acc => ({
                ...acc,
                accountName: acc.accountName || acc.name
            }));
            
            setPaymentAccounts(paymentList);

        } catch (err) {
            console.error("خطأ في جلب البيانات:", err);
            setError("فشل في جلب البيانات الأولية من السيرفر.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpenseData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setExpenseData(initialFormState);
        setError(null);
        onClose();
    };

    const handleSaveExpense = async () => {
        if (!expenseData.amount || !expenseData.expenseAccountId || !expenseData.academicYearId || !expenseData.paidFromAccountId) {
            setError("يرجى ملء جميع الحقول الإجبارية واختيار صندوق أو حساب الدفع (*)");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                amount: parseFloat(expenseData.amount),
                description: expenseData.description || "",
                expenseDate: expenseData.expenseDate,
                expenseAccountId: parseInt(expenseData.expenseAccountId),
                academicYearId: parseInt(expenseData.academicYearId),
                paidFromAccountId: parseInt(expenseData.paidFromAccountId),
                invoiceNumber: expenseData.invoiceNumber || null,
                vendorName: expenseData.vendorName || null
            };

            const response = await axios.post('http://localhost:8080/api/expenses', payload);

            if (response.status >= 200 && response.status < 300) {
                onClose(); 
                try {
                    if (typeof onExpenseAdded === 'function') {
                        onExpenseAdded(); 
                    }
                } catch (refreshError) {
                    console.log("تم الحفظ ولكن فشل تحديث الجدول تلقائياً", refreshError);
                }
                return;
            }

        } catch (err) {
            if (err.response && (err.response.status === 200 || err.response.status === 201)) {
                onClose();
                onExpenseAdded();
                return;
            }

            console.error(err);
            setError("حدث خطأ أثناء الاتصال بالسيرفر، لكن يرجى التحقق من الجدول فقد تكون العملية نجحت.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', bgcolor: '#f5f5f5', mb: 1 }}>
                تسجيل مصروف أو شراء أصول جديد
            </DialogTitle>
            
            <DialogContent sx={{ direction: 'rtl', p: 3 }}>
                <Stack spacing={3} sx={{ mt: 2, pb: 2 }}>
                    
                    {error && <Alert severity="error">{error}</Alert>}

                    {/* حقل اختيار حساب/صندوق الدفع (من حساب) */}
                    <FormControl fullWidth>
                        <InputLabel id="paid-from-label">الخصم من (الصندوق / البنك) *</InputLabel>
                        <Select
                            labelId="paid-from-label"
                            name="paidFromAccountId"
                            value={expenseData.paidFromAccountId}
                            label="الخصم من (الصندوق / البنك) *"
                            onChange={handleChange}
                        >
                            {paymentAccounts.map(acc => (
                                <MenuItem key={acc.id} value={acc.id}>
                                    {acc.accountCode || acc.code} - {acc.accountName || acc.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* حقل المبلغ */}
                    <TextField
                        label="المبلغ المطلوب *"
                        name="amount"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={expenseData.amount}
                        onChange={handleChange}
                    />

                    {/* حقل بند المصروف أو الأصل */}
                    <FormControl fullWidth>
                        <InputLabel id="account-label">بند المصروف / الأصل (إلى حساب) *</InputLabel>
                        <Select
                            labelId="account-label"
                            name="expenseAccountId"
                            value={expenseData.expenseAccountId}
                            label="بند المصروف / الأصل (إلى حساب) *"
                            onChange={handleChange}
                        >
                            {expenseAccounts.map(acc => (
                                <MenuItem key={acc.id} value={acc.id}>
                                    {acc.accountCode} - {acc.accountName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* حقل السنة الأكاديمية */}
                    <FormControl fullWidth>
                        <InputLabel id="year-label">السنة الأكاديمية *</InputLabel>
                        <Select
                            labelId="year-label"
                            name="academicYearId"
                            value={expenseData.academicYearId}
                            label="السنة الأكاديمية *"
                            onChange={handleChange}
                        >
                            {academicYears.map(year => (
                                <MenuItem key={year.id} value={year.id}>{year.yearName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* صف يضم رقم الفاتورة واسم المورد */}
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="رقم الفاتورة (اختياري)"
                            name="invoiceNumber"
                            fullWidth
                            variant="outlined"
                            placeholder="أدخل رقم الفاتورة إن توفرت"
                            value={expenseData.invoiceNumber}
                            onChange={handleChange}
                        />
                        <TextField
                            label="اسم المورد / الجهة (اختياري)"
                            name="vendorName"
                            fullWidth
                            variant="outlined"
                            placeholder="اسم المستفيد أو المورد"
                            value={expenseData.vendorName}
                            onChange={handleChange}
                        />
                    </Stack>

                    {/* حقل التاريخ */}
                    <TextField
                        label="تاريخ العملية"
                        name="expenseDate"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={expenseData.expenseDate}
                        onChange={handleChange}
                    />

                    {/* حقل الملاحظات */}
                    <TextField
                        label="بيان / ملاحظات"
                        name="description"
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="اكتب تفاصيل العملية هنا..."
                        value={expenseData.description}
                        onChange={handleChange}
                    />

                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #ddd', justifyContent: 'space-between' }}>
                <Button onClick={handleClose} color="inherit" sx={{ px: 3 }}>
                    إلغاء
                </Button>
                <Button
                    object-id="save-expense-btn"
                    onClick={handleSaveExpense}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ px: 4, py: 1, fontWeight: 'bold' }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'إتمام الصرف'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddExpenseModal;