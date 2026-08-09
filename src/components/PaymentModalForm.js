// src/components/PaymentModalForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// استيراد مكونات MUI
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// لا نحتاج لملف CSS خاص بالنموذج
// import './PaymentModalForm.css';

const PaymentModalForm = ({ studentFee, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (studentFee) {
            const remainingDue = studentFee.amountDue - studentFee.amountPaid;
            setAmount(remainingDue > 0 ? remainingDue.toFixed(2) : '0.00');
        }
    }, [studentFee]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!studentFee || !studentFee.id || !studentFee.studentId || !studentFee.academicYearId) {
            setError('خطأ: معلومات رسوم الطالب غير مكتملة. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.');
            setLoading(false);
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('الرجاء إدخال مبلغ دفعة صحيح وموجب.');
            setLoading(false);
            return;
        }

        const currentRemainingDue = studentFee.amountDue - studentFee.amountPaid;
        if (parsedAmount > currentRemainingDue + 0.01) { // إضافة هامش صغير للتجنب مشاكل Floating point
            setError(`مبلغ الدفعة (${parsedAmount.toFixed(2)}) يتجاوز المبلغ المتبقي المستحق (${currentRemainingDue.toFixed(2)}).`);
            setLoading(false);
            return;
        }

        try {
            const paymentData = {
                studentFeeId: studentFee.id,
                studentId: studentFee.studentId,
                academicYearId: studentFee.academicYearId,
                amount: parsedAmount,
                method: method,
                notes: notes
            };

            console.log('Sending payment data from PaymentModalForm:', paymentData);

            const response = await axios.post(
                `http://localhost:8080/api/student-fees/record-payment`,
                paymentData
            );

            setSuccessMessage('تم تسجيل الدفعة بنجاح!');
            onSuccess();
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            console.error('Error recording payment:', err);
            setError(`فشل تسجيل الدفعة: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!studentFee) {
        return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /><Typography>جاري تحميل بيانات الرسوم...</Typography></Box>;
    }

    const remainingDue = (studentFee.amountDue - studentFee.amountPaid).toFixed(2);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 2, width: '100%' }, '& .MuiFormControl-root': { mb: 2, width: '100%' } }}>
            {/* <Typography variant="h6" component="h3" align="center" sx={{ mb: 3 }}>
                تسجيل دفعة لرسوم الطالب: {studentFee.studentFullName}
            </Typography> */}

            <Box sx={{ bgcolor: '#eaf0f3', border: '1px solid #d4e0e8', borderRadius: 2, p: 2, mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 0.5 }}><strong>نوع الرسوم:</strong> {studentFee.feeTypeName}</Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}><strong>المبلغ المستحق الكلي:</strong> {studentFee.amountDue.toFixed(2)}</Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}><strong>المبلغ المدفوع حتى الآن:</strong> {studentFee.amountPaid.toFixed(2)}</Typography>
                <Typography variant="h6" color="error" sx={{ mt: 1 }}><strong>المبلغ المتبقي للاستحقاق:</strong> {remainingDue}</Typography>
            </Box>

            <TextField
                label="مبلغ الدفعة"
                type="number"
                id="amount"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                inputProps={{ step: "0.01", min: "0.01", max: parseFloat(remainingDue) > 0 ? parseFloat(remainingDue) : 0.01 }}
            />

            <FormControl fullWidth>
                <InputLabel id="method-select-label">طريقة الدفع</InputLabel>
                <Select
                    labelId="method-select-label"
                    id="method"
                    name="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    label="طريقة الدفع"
                    required
                >
                    <MenuItem value="CASH">نقداً</MenuItem>
                    <MenuItem value="BANK_TRANSFER">تحويل بنكي</MenuItem>
                    <MenuItem value="CHEQUE">شيك</MenuItem>
                    <MenuItem value="OTHER">أخرى</MenuItem>
                </Select>
            </FormControl>

            <TextField
                label="ملاحظات (اختياري)"
                multiline
                rows={3}
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button type="submit" variant="contained" color="success" disabled={loading} startIcon={loading && <CircularProgress size={20} color="inherit" />}>
                    {loading ? 'جاري التسجيل...' : 'تسجيل الدفعة'}
                </Button>
                <Button type="button" variant="outlined" onClick={onClose} disabled={loading}>
                    إلغاء
                </Button>
            </Box>
        </Box>
    );
};

export default PaymentModalForm;