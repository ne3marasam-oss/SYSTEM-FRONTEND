import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, MenuItem, Button, Alert, Grid } from '@mui/material';
import axios from 'axios';

const MoneyTransferPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });
    
    // إضافة academicYearId إلى الحالة الابتدائية
    const [transferData, setTransferData] = useState({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: '',
        academicYearId: '' // هذا الحقل مهم جداً الآن
    });

    useEffect(() => {
        fetchAccounts();
        // جلب السنة الأكاديمية النشطة عند تحميل الصفحة
        fetchActiveAcademicYear();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get('https://system-backend-rwsk.onrender.com/api/accounts');
            setAccounts(response.data);
        } catch (err) {
            setStatus({ type: 'error', msg: 'فشل في جلب الحسابات' });
        }
    };

    // دالة لجلب السنة الأكاديمية الحالية (تأكد من وجود هذا المسار في السيرفر لديك)
    const fetchActiveAcademicYear = async () => {
        try {
            const response = await axios.get('https://system-backend-rwsk.onrender.com/api/academic-years/active');
            if (response.data) {
                setTransferData(prev => ({ ...prev, academicYearId: response.data.id }));
            }
        } catch (err) {
            console.error("لم يتم العثور على سنة أكاديمية نشطة");
            // إذا لم يكن لديك API للسنة النشطة، يمكنك جلبها من localStorage إذا كانت مخزنة هناك
            const savedYear = localStorage.getItem('activeYearId');
            if (savedYear) setTransferData(prev => ({ ...prev, academicYearId: savedYear }));
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        
        // تحقق إضافي قبل الإرسال
        if (!transferData.academicYearId) {
            setStatus({ type: 'error', msg: 'خطأ: لا توجد سنة أكاديمية محددة للنظام' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            // إرسال البيانات بما فيها academicYearId الجديد
            const response = await axios.post('https://system-backend-rwsk.onrender.com/api/transfers', transferData);
            setStatus({ type: 'success', msg: response.data });
            
            // إعادة تعيين النموذج مع الحفاظ على السنة الأكاديمية
            setTransferData({ 
                fromAccountId: '', 
                toAccountId: '', 
                amount: '', 
                description: '',
                academicYearId: transferData.academicYearId 
            });
            
            fetchAccounts(); // تحديث الأرصدة في القائمة بعد التحويل
        } catch (err) {
            // عرض رسالة الخطأ التفصيلية القادمة من السيرفر
            setStatus({ type: 'error', msg: err.response?.data || 'حدث خطأ أثناء التحويل' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, mb: 4 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    تحويل الأموال بين الحسابات
                </Typography>
                <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
                    نقل الرصيد من الصناديق أو الحسابات البنكية
                </Typography>
                
                {status.msg && <Alert severity={status.type} sx={{ mb: 3 }}>{status.msg}</Alert>}
                
                <form onSubmit={handleTransfer}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select fullWidth label="من حساب (المصدر)"
                                value={transferData.fromAccountId}
                                onChange={(e) => setTransferData({...transferData, fromAccountId: e.target.value})}
                                required
                                InputLabelProps={{ shrink: true }} // منع تداخل النصوص
                            >
                                {accounts.map((acc) => (
                                    <MenuItem key={acc.id} value={acc.id}>
                                        {acc.accountName} (رصيد: {acc.currentBalance})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select fullWidth label="إلى حساب (المستلم)"
                                value={transferData.toAccountId}
                                onChange={(e) => setTransferData({...transferData, toAccountId: e.target.value})}
                                required
                                InputLabelProps={{ shrink: true }}
                            >
                                {accounts.map((acc) => (
                                    <MenuItem key={acc.id} value={acc.id}>
                                        {acc.accountName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="المبلغ المراد تحويله" type="number"
                                value={transferData.amount}
                                onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                                required
                                InputProps={{ inputProps: { min: 1 } }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth label="ملاحظات التحويل" multiline rows={2}
                                value={transferData.description}
                                onChange={(e) => setTransferData({...transferData, description: e.target.value})}
                                placeholder="اكتب سبب التحويل هنا..."
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button 
                                type="submit" variant="contained" fullWidth size="large"
                                disabled={loading}
                                sx={{ 
                                    py: 1.5, 
                                    fontSize: '1.1rem', 
                                    backgroundColor: '#2e7d32',
                                    '&:hover': { backgroundColor: '#1b5e20' }
                                }}
                            >
                                {loading ? 'جاري تنفيذ العملية...' : 'تأكيد عملية التحويل'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default MoneyTransferPage;