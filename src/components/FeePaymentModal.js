import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Typography, FormControl,
    InputLabel, Select, MenuItem, Box, Alert, CircularProgress
} from '@mui/material';
import axios from 'axios';

const FeePaymentModal = ({ open, onClose, studentFee, onPaymentAdded }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Cash');
    const [selectedInstNum, setSelectedInstNum] = useState('GENERAL');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingInstallments, setLoadingInstallments] = useState(false);
    const [error, setError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    
    const [latestInstallments, setLatestInstallments] = useState([]);
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);

    useEffect(() => {
        if (open && studentFee) {
            processFeeData();
        }
    }, [open, studentFee]);

    const processFeeData = async () => {
        try {
            setLoadingInstallments(true);
            const feeId = studentFee.id || studentFee.studentFeeId;
            
            // الاعتماد الكامل على مصفوفة الأقساط القادمة من الباك إند وقاعدة البيانات
            let insts = studentFee?.installments ? JSON.parse(JSON.stringify(studentFee.installments)) : [];
            let totalPaid = studentFee?.paidAmount || 0;

            try {
                const response = await axios.get(`https://system-backend-rwsk.onrender.com/api/payments/student-fee/${feeId}`);
                if (response.data && Array.isArray(response.data)) {
                    totalPaid = response.data.reduce((sum, p) => sum + Number(p.amount || 0), 0);
                }
            } catch (e) {
                console.log("Using local installments fallback");
            }

            setTotalPaidAmount(totalPaid);

            // ترتيب الأقساط حسب رقم القسط تصاعدياً فقط
            if (insts.length > 0) {
                insts.sort((a, b) => {
                    const numA = Number(a.installment_number ?? a.installmentNumber ?? 0);
                    const numB = Number(b.installment_number ?? b.installmentNumber ?? 0);
                    return numA - numB;
                });
            }

            setLatestInstallments(insts);

            const totalReq = studentFee?.amountDue || studentFee?.totalAmount || 19000;
            const displayRem = Math.max(0, totalReq - totalPaid);

            if (insts.length > 0) {
                // اختيار أول قسط غير مسدد بالكامل بناءً على الحقول المخزنة في قاعدة البيانات
                const firstUnpaid = insts.find(inst => {
                    const rem = getExactRemaining(inst);
                    const status = inst.status;
                    return status !== 'PAID' && rem > 0;
                }) || insts[0];

                const rem = getExactRemaining(firstUnpaid);
                const num = firstUnpaid.installment_number ?? firstUnpaid.installmentNumber ?? 1;
                
                setSelectedInstNum(num);
                setAmount(rem.toString());
            } else {
                setSelectedInstNum('GENERAL');
                setAmount(displayRem.toString());
            }
        } catch (err) {
            console.error("Error processing data:", err);
        } finally {
            setLoadingInstallments(false);
        }
    };

    const totalRequired = studentFee?.amountDue || studentFee?.totalAmount || 19000;
    const displayRemaining = Math.max(0, totalRequired - totalPaidAmount);

    // دالة لجلب القيمة المتبقية حصرياً من حقول قاعدة البيانات دون أي معالجة رياضية خارجية
    const getExactRemaining = (inst) => {
        if (!inst) return 0;
        if (inst.remaining_amount !== undefined && inst.remaining_amount !== null) return Number(inst.remaining_amount);
        if (inst.remainingAmount !== undefined && inst.remainingAmount !== null) return Number(inst.remainingAmount);
        
        // حساب احتياطي مطابق للـ DB في حال عدم توفر حقل المتبقي صراحة
        const total = Number(inst.amount || 0);
        const paid = Number(inst.paid_amount || inst.paidAmount || 0);
        return Math.max(0, total - paid);
    };

    const currentSelectedInstallment = latestInstallments.find(i => 
        Number(i.installment_number ?? i.installmentNumber) === Number(selectedInstNum)
    );
    
    const installmentRemaining = currentSelectedInstallment 
        ? getExactRemaining(currentSelectedInstallment)
        : displayRemaining;

    const handleInstallmentChange = (e) => {
        const val = e.target.value;
        setSelectedInstNum(val);
        
        if (val === 'GENERAL') {
            setAmount(displayRemaining.toString());
        } else {
            const inst = latestInstallments.find(i => Number(i.installment_number ?? i.installmentNumber) === Number(val));
            if (inst) {
                setAmount(getExactRemaining(inst).toString());
            }
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            if (!amount || parseFloat(amount) <= 0) {
                throw new Error("يرجى إدخال مبلغ دفع صحيح");
            }
            
            const maxAllowed = selectedInstNum !== 'GENERAL' ? installmentRemaining : displayRemaining;

            if (parseFloat(amount) > maxAllowed) {
                throw new Error(`المبلغ المدفوع (${parseFloat(amount)}) يتجاوز المتبقي المسموح (${maxAllowed.toLocaleString()} ريال)`);
            }

            const paymentData = {
                studentFeeId: studentFee.id || studentFee.studentFeeId,
                amount: parseFloat(amount),
                paymentMethod: method,
                referenceNumber: "PAY-" + Date.now(),
                bankAccountId: method === 'BankTransfer' ? 10 : null,
                ...(selectedInstNum !== 'GENERAL' ? { 
                    installmentNumber: Number(selectedInstNum) 
                } : {})
            };

            await axios.post('https://system-backend-rwsk.onrender.com/api/payments', paymentData);
            
            setPaymentSuccess(true);
            if (onPaymentAdded) {
                onPaymentAdded();
            }
        } catch (err) {
            const serverError = err.response?.data?.message || err.response?.data || err.message;
            setError(typeof serverError === 'string' ? serverError : "حدث خطأ أثناء حفظ السند");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setPaymentSuccess(false);
        setAmount('');
        setSelectedInstNum('GENERAL');
        setError(null);
        setLatestInstallments([]);
        onClose();
    };

    const studentName = studentFee?.student?.fullName || studentFee?.studentName || "Ahmed Abdulalem";

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            {!paymentSuccess ? (
                <>
                    <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>
                        تسجيل دفع رسوم - {studentName}
                    </DialogTitle>
                    <DialogContent dividers sx={{ direction: 'rtl', pt: 3 }}>
                        {error && <Alert severity="error" sx={{ mb: 2, fontWeight: 'bold' }}>{error}</Alert>}
                        
                        {loadingInstallments ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress />
                                <Typography sx={{ mt: 2 }}>جاري تحميل البيانات...</Typography>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ mb: 3, p: 2, bgcolor: '#fff4e5', borderRadius: 2, borderRight: '5px solid #ff9800' }}>
                                    <Typography><strong>اسم الطالب:</strong> {studentName}</Typography>
                                    
                                    <Typography color="error" variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                                        المبلغ المتبقي الإجمالي: {displayRemaining.toLocaleString()} ريال
                                    </Typography>
                                    
                                    <Typography variant="caption" color="text.secondary">
                                        (إجمالي المستحق: {totalRequired.toLocaleString()} ريال | المسدد سابقاً: {totalPaidAmount.toLocaleString()} ريال)
                                    </Typography>
                                </Box>

                                {latestInstallments.length > 0 && (
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel>تخصيص السداد للقسط</InputLabel>
                                        <Select 
                                            value={selectedInstNum} 
                                            label="تخصيص السداد للقسط" 
                                            onChange={handleInstallmentChange}
                                        >
                                            <MenuItem value="GENERAL">
                                                <em>بدون تحديد قسط (سداد عام على الرسوم)</em>
                                            </MenuItem>
                                            {latestInstallments.map((inst) => {
                                                const rem = getExactRemaining(inst);
                                                const num = inst.installment_number ?? inst.installmentNumber;
                                                const isPaid = inst.status === 'PAID' || rem <= 0;
                                                return (
                                                    <MenuItem key={num} value={num} disabled={isPaid}>
                                                        القسط #{num} - القيمة: {inst.amount} ر.س (المتبقي: {rem} ر.س) {isPaid ? ' - (تم تسديده بالكامل 🔒)' : ''}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                )}

                                <TextField
                                    label="المبلغ المدفوع الآن"
                                    type="number"
                                    fullWidth
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    sx={{ mb: 3 }}
                                    autoFocus
                                    placeholder="أدخل المبلغ هنا..."
                                    helperText={selectedInstNum !== 'GENERAL' ? `المتبقي لهذا القسط: ${installmentRemaining} ر.س` : ''}
                                />

                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel>طريقة الدفع</InputLabel>
                                    <Select value={method} label="طريقة الدفع" onChange={(e) => setMethod(e.target.value)}>
                                        <MenuItem value="Cash">نقدي (الصندوق)</MenuItem>
                                        <MenuItem value="BankTransfer">تحويل بنكي</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleClose}>إلغاء</Button>
                        <Button 
                            onClick={handleSubmit} 
                            variant="contained" 
                            color="success" 
                            disabled={isSubmitting || loadingInstallments || !amount || parseFloat(amount) <= 0 || installmentRemaining <= 0}
                        >
                            {isSubmitting ? 'جاري المعالجة...' : 'تأكيد وحفظ السند'}
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main" sx={{ mb: 2, fontWeight: 'bold' }}>تمت العملية بنجاح</Typography>
                    <Typography>تم تسجيل الدفعة وتحديث السجلات بنجاح في الصندوق.</Typography>
                    <Button onClick={handleClose} variant="contained" sx={{ mt: 3, minWidth: 120 }}>إغلاق</Button>
                </Box>
            )}
        </Dialog>
    );
};

export default FeePaymentModal;