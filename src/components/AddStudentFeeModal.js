import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, FormControl, InputLabel, MenuItem, Select,
    TextField, Typography, Grid, Alert, Box, Divider,
    LinearProgress
} from '@mui/material';
import axios from 'axios';

const AddStudentFeeModal = ({ open, onClose, onSuccess }) => {
    const [students, setStudents] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    
    const [studentId, setStudentId] = useState('');
    const [feeTypeId, setFeeTypeId] = useState('');
    const [academicYearId, setAcademicYearId] = useState('');
    
    const [classBaseAmount, setClassBaseAmount] = useState(0); 
    
    const [tuitionFee, setTuitionFee] = useState(0);    
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [registrationFee, setRegistrationFee] = useState(0);
    const [booksFee, setBooksFee] = useState(0);        
    const [transportFee, setTransportFee] = useState(0);
    const [uniformFee, setUniformFee] = useState(0); 
    const [activitiesFee, setActivitiesFee] = useState(0); // 🌟 حقل رسوم الأنشطة
    
    const [dueDate, setDueDate] = useState('');
    const [installmentCount, setInstallmentCount] = useState(1); // 🌟 عدد الأقساط
    const [installments, setInstallments] = useState([]); // 🌟 مصفوفة الأقساط
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // الحسابات التلقائية للعرض (Net Tuition = Tuition - Discount)
    const netTuition = parseFloat(tuitionFee || 0) - (parseFloat(tuitionFee || 0) * (parseFloat(discountPercentage || 0) / 100));

    // إجمالي التوزيع المحتسب متضمناً رسوم الأنشطة
    const currentDistributionTotal = 
        parseFloat(registrationFee || 0) + 
        netTuition + 
        parseFloat(booksFee || 0) + 
        parseFloat(transportFee || 0) +
        parseFloat(uniformFee || 0) +
        parseFloat(activitiesFee || 0);

    const isOverLimit = currentDistributionTotal > (classBaseAmount + 0.1); 
    
    const canSave = studentId !== '' && 
                    academicYearId !== '' && 
                    feeTypeId !== '' &&
                    classBaseAmount > 0 && 
                    !isOverLimit && 
                    currentDistributionTotal > 0 &&
                    !loading;

    useEffect(() => {
        if (open) {
            setLoading(true);
            Promise.all([
                axios.get('https://system-backend-rwsk.onrender.com/api/students'),
                axios.get('https://system-backend-rwsk.onrender.com/api/fee-types'),
                axios.get('https://system-backend-rwsk.onrender.com/api/academic-years')
            ]).then(([stdRes, feeRes, yearRes]) => {
                setStudents(stdRes.data);
                setFeeTypes(feeRes.data);
                setAcademicYears(yearRes.data);
                setError(null);
            }).catch(err => setError("فشل في تحميل البيانات الأساسية"))
              .finally(() => setLoading(false));
        }
    }, [open]);

    useEffect(() => {
        if (feeTypeId) {
            const selected = feeTypes.find(ft => ft.id === feeTypeId);
            if (selected) {
                const base = parseFloat(selected.amount || 0);
                setClassBaseAmount(base); 
                setTuitionFee(base); 
                setRegistrationFee(0); 
                setBooksFee(0); 
                setTransportFee(0); 
                setUniformFee(0); 
                setActivitiesFee(0); 
                setDiscountPercentage(0);
            }
        }
    }, [feeTypeId, feeTypes]);

    // 🌟 توليد الأقساط تلقائياً بناءً على المبلغ الإجمالي وعدد الأقساط المختار
    useEffect(() => {
        if (currentDistributionTotal > 0 && installmentCount > 0) {
            const baseAmountPerInstallment = currentDistributionTotal / installmentCount;
            const generated = [];
            for (let i = 1; i <= installmentCount; i++) {
                generated.push({
                    installmentNumber: i,
                    amount: parseFloat(baseAmountPerInstallment.toFixed(2)),
                    dueDate: dueDate || ''
                });
            }
            setInstallments(generated);
        }
    }, [currentDistributionTotal, installmentCount, dueDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSave) return;

        setError(null);
        setLoading(true);

        const payload = {
            studentId: parseInt(studentId),
            feeTypeId: parseInt(feeTypeId),
            academicYearId: parseInt(academicYearId),
            
            tuitionFee: parseFloat(tuitionFee || 0), 
            registrationFee: parseFloat(registrationFee || 0),
            booksFee: parseFloat(booksFee || 0),
            transportFee: parseFloat(transportFee || 0),
            uniformFee: parseFloat(uniformFee || 0), 
            activitiesFee: parseFloat(activitiesFee || 0),
            discountPercentage: parseFloat(discountPercentage || 0),
            
            totalAllocatedAmount: parseFloat(currentDistributionTotal.toFixed(2)), 
            amountDue: parseFloat(currentDistributionTotal.toFixed(2)), 
            
            dueDate: dueDate,
            installments: installments // 🌟 إرسال الأقساط للباك إند
        };

        try {
            await axios.post('https://system-backend-rwsk.onrender.com/api/student-fees', payload);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "خطأ في الاتصال بالسيرفر");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', bgcolor: '#1565c0', color: 'white' }}>
                توزيع واعتماد رسوم الطالب
            </DialogTitle>
            
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 4 }}>
                    {loading && <LinearProgress sx={{ mb: 2 }} />}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth required size="small">
                                <InputLabel>الصف الدراسي</InputLabel>
                                <Select value={feeTypeId} label="الصف الدراسي" onChange={(e) => setFeeTypeId(e.target.value)}>
                                    {feeTypes.map(ft => <MenuItem key={ft.id} value={ft.id}>{ft.feeName} ({ft.amount} ريال)</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth required size="small">
                                <InputLabel>اسم الطالب</InputLabel>
                                <Select value={studentId} label="اسم الطالب" onChange={(e) => setStudentId(e.target.value)}>
                                    {students.map(s => <MenuItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth required size="small">
                                <InputLabel>السنة الدراسية</InputLabel>
                                <Select value={academicYearId} label="السنة الدراسية" onChange={(e) => setAcademicYearId(e.target.value)}>
                                    {academicYears.map(y => <MenuItem key={y.id} value={y.id}>{y.academicYearName || y.yearName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider>
                                <Typography variant="button" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                                    تفاصيل توزيع الرسوم (الحد الأقصى: {classBaseAmount} ريال)
                                </Typography>
                            </Divider>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="الرسوم الدراسية الأساسية" type="number" value={tuitionFee} onChange={(e) => setTuitionFee(e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="خصم على الدراسية (%)" type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} size="small" />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField fullWidth label="رسوم التسجيل" type="number" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField fullWidth label="رسوم الكتب" type="number" value={booksFee} onChange={(e) => setBooksFee(e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField fullWidth label="رسوم الباص" type="number" value={transportFee} onChange={(e) => setTransportFee(e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField fullWidth label="رسوم الزي المدرسي" type="number" value={uniformFee} onChange={(e) => setUniformFee(e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField fullWidth label="رسوم الأنشطة" type="number" value={activitiesFee} onChange={(e) => setActivitiesFee(e.target.value)} size="small" />
                        </Grid>

                        {/* 🌟 حقل عدد الأقساط */}
                        <Grid item xs={12} sm={9}>
                            <FormControl fullWidth size="small">
                                <InputLabel>عدد الأقساط</InputLabel>
                                <Select 
                                    value={installmentCount} 
                                    label="عدد الأقساط" 
                                    onChange={(e) => setInstallmentCount(parseInt(e.target.value))}
                                >
                                    <MenuItem value={1}>قسط واحد (كامل المبلغ)</MenuItem>
                                    <MenuItem value={2}>قسطان (نصف / نصف)</MenuItem>
                                    <MenuItem value={3}>3 أقساط (ثلث / ثلث / ثلث)</MenuItem>
                                    <MenuItem value={4}>4 أقساط (فصلية / ربع سنوية)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: isOverLimit ? '#fff5f5' : '#f8fff8', borderRadius: 2, border: '1px solid', borderColor: isOverLimit ? 'error.main' : 'success.main' }}>
                                <Grid container justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight="bold">إجمالي المبلغ المستحق النهائي:</Typography>
                                    <Typography variant="h6" fontWeight="bold" color={isOverLimit ? 'error' : 'success.main'}>
                                        {currentDistributionTotal.toLocaleString()} / {classBaseAmount.toLocaleString()} ريال
                                    </Typography>
                                </Grid>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={classBaseAmount > 0 ? Math.min((currentDistributionTotal / classBaseAmount) * 100, 100) : 0} 
                                    color={isOverLimit ? "error" : "success"}
                                    sx={{ mt: 1, height: 10, borderRadius: 5 }}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth label="تاريخ استحقاق الرسوم" type="date" InputLabelProps={{ shrink: true }} value={dueDate} onChange={(e) => setDueDate(e.target.value)} required size="small" />
                        </Grid>
                    </Grid>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                    <Button onClick={onClose} variant="outlined" color="inherit" disabled={loading}>إلغاء</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={!canSave} 
                        color="primary"
                        sx={{ px: 4, fontWeight: 'bold' }}
                    >
                        {loading ? 'جاري الحفظ...' : `اعتماد وحفظ ( ${currentDistributionTotal.toLocaleString()} ريال )`}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddStudentFeeModal;