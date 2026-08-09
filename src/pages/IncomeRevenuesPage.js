// src/pages/IncomeRevenuesPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Button,
    Modal,
    Divider,
    IconButton,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import dayjs from 'dayjs';

const IncomeRevenuesPage = () => {
    // دالة مساعدة لتحويل تنسيق التاريخ من الواجهة الخلفية
    const formatDate = (paymentDate) => {
        if (!paymentDate) return 'غير محدد';

        if (Array.isArray(paymentDate)) {
            const [year, month, day] = paymentDate;
            return new Date(year, month - 1, day).toLocaleDateString('ar-EG');
        }

        const date = new Date(paymentDate);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('ar-EG');
        }

        return 'تاريخ غير صالح';
    };

    const [payments, setPayments] = useState([]);
    const [vouchers, setVouchers] = useState([]); // حالة لتخزين سندات القبض العامة
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // حالات الفلاتر
    const [filters, setFilters] = useState({
        studentName: '',
        academicYearId: '',
        startDate: '',
        endDate: ''
    });

    const [academicYears, setAcademicYears] = useState([]);

    // حالات نافذة سند القبض العام (Modal)
    const [openModal, setOpenModal] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [modalError, setModalError] = useState('');

    const [voucherData, setVoucherData] = useState({
        voucherNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        date: dayjs().format('YYYY-MM-DD'),
        accountId: '',
        amount: '',
        paymentMethod: 'CASH',
        payerName: '',
        notes: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const paymentsRes = await axios.get('https://system-backend-rwsk.onrender.com/api/payments');
            setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);

            // جلب سندات القبض العامة والتشغيلية من الخادم
            const vouchersRes = await axios.get('https://system-backend-rwsk.onrender.com/api/revenues/vouchers');
            setVouchers(Array.isArray(vouchersRes.data) ? vouchersRes.data : []);

            const academicYearsRes = await axios.get('https://system-backend-rwsk.onrender.com/api/academic-years');
            setAcademicYears(Array.isArray(academicYearsRes.data) ? academicYearsRes.data : []);

        } catch (err) {
            console.error('Failed to load initial data for Income/Revenues Page:', err);
            if (err.response) {
                setError(`خطأ من الخادم: ${err.response.status} - ${err.response.data.message || 'مشكلة غير معروفة'}`);
            } else if (err.request) {
                setError('لا يمكن الاتصال بالخادم. يرجى التأكد من تشغيل الواجهة الخلفية (Backend).');
            } else {
                setError('حدث خطأ غير متوقع أثناء إعداد طلب البيانات.');
            }
            setPayments([]);
            setVouchers([]);
            setAcademicYears([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    // جلب الحسابات الإيرادية عند فتح نافذة السند
    const handleOpenModal = async () => {
        setOpenModal(true);
        setSuccessMsg('');
        setModalError('');
        setLoadingAccounts(true);
        try {
            const response = await axios.get('https://system-backend-rwsk.onrender.com/api/accounts/revenue-subaccounts');
            setAccounts(response.data);
        } catch (err) {
            console.error(err);
            setAccounts([
                { id: 1, name: 'إيرادات المقصف المدرسي' },
                { id: 2, name: 'تبرعات وهبات متنوعة' },
                { id: 3, name: 'إيرادات إيجارات وقاعات' }
            ]);
        } finally {
            setLoadingAccounts(false);
        }
    };

    const handleCloseModal = () => setOpenModal(false);

    const handleVoucherChange = (e) => {
        const { name, value } = e.target;
        setVoucherData({ ...voucherData, [name]: value });
    };

    const handleSaveVoucher = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError('');
        setSuccessMsg('');

        try {
            await axios.post('https://system-backend-rwsk.onrender.com/api/revenues/vouchers', voucherData);
            setSuccessMsg('تم حفظ وترحيل سند القبض العام بنجاح!');
            setVoucherData({
                voucherNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
                date: dayjs().format('YYYY-MM-DD'),
                accountId: '',
                amount: '',
                paymentMethod: 'CASH',
                payerName: '',
                notes: ''
            });
            loadInitialData(); // تحديث البيانات تلقائياً
        } catch (err) {
            console.error(err);
            setModalError('حدث خطأ أثناء حفظ السند. تأكد من اتصال الخادم.');
        } finally {
            setSubmitting(false);
        }
    };

    const getFilteredPayments = () => {
        let filtered = payments;

        if (filters.studentName) {
            const searchName = filters.studentName.toLowerCase();
            filtered = filtered.filter(payment =>
                payment.studentFullName && payment.studentFullName.toLowerCase().includes(searchName)
            );
        }

        if (filters.academicYearId) {
            filtered = filtered.filter(payment => payment.academicYearId === parseInt(filters.academicYearId));
        }

        if (filters.startDate) {
            const start = new Date(filters.startDate);
            filtered = filtered.filter(payment => payment.paymentDate && new Date(payment.paymentDate) >= start);
        }

        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setDate(end.getDate() + 1);
            filtered = filtered.filter(payment => payment.paymentDate && new Date(payment.paymentDate) < end);
        }

        return filtered;
    };

    const filteredPayments = getFilteredPayments();
    const totalPaymentsRevenue = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalVouchersRevenue = vouchers.reduce((sum, voucher) => sum + (voucher.amount || 0), 0);
    const grandTotalRevenue = totalPaymentsRevenue + totalVouchersRevenue;

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;
    }

    return (
        <Container sx={{ direction: 'rtl', py: 3 }}>
            
            {/* رأس الصفحة وزر إضافة سند القبض العام */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                    الدخل والإيرادات
                </Typography>
                
                <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<AddIcon />} 
                    onClick={handleOpenModal}
                    sx={{ fontWeight: 'bold' }}
                >
                    سند قبض إيراد عام / تشغيلي
                </Button>
            </Box>

            {/* قسم الفلاتر */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>تصفية الدخل والإيرادات</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="اسم الطالب"
                            name="studentName"
                            value={filters.studentName}
                            onChange={handleFilterChange}
                            placeholder="ابحث باسم الطالب..."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="academic-year-label">السنة الأكاديمية</InputLabel>
                            <Select
                                labelId="academic-year-label"
                                label="السنة الأكاديمية"
                                name="academicYearId"
                                value={filters.academicYearId}
                                onChange={handleFilterChange}
                            >
                                <MenuItem value="">كل السنوات</MenuItem>
                                {academicYears.map(year => (
                                    <MenuItem key={year.id} value={year.id}>
                                        {year.yearName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="من تاريخ"
                            name="startDate"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={filters.startDate}
                            onChange={handleFilterChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="إلى تاريخ"
                            name="endDate"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={filters.endDate}
                            onChange={handleFilterChange}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* إجمالي الإيرادات */}
            <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: '#ffebee', border: '1px solid #ffcdd2' }}>
                <Typography variant="h6" color="error.main" fontWeight="bold" align="center">
                    إجمالي الإيرادات العام: {grandTotalRevenue.toFixed(2)} ر.س
                </Typography>
            </Paper>

            {/* جدول سندات القبض العامة والتشغيلية */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1565c0' }}>
                سندات القبض العامة والإيرادات التشغيلية
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table aria-label="vouchers table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#2e7d32' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>رقم السند</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>التاريخ</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>الحساب / بند الإيراد</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>المبلغ</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>طريقة الدفع</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>الدافع / الجهة</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ملاحظات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vouchers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">لا توجد سندات قبض عامة مسجلة.</TableCell>
                            </TableRow>
                        ) : (
                            vouchers.map(voucher => (
                                <TableRow key={voucher.id}>
                                    <TableCell>{voucher.voucherNumber || voucher.id}</TableCell>
                                    <TableCell>{formatDate(voucher.date)}</TableCell>
                                    <TableCell>{voucher.account ? voucher.account.name : 'غير محدد'}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'green' }}>{voucher.amount}</TableCell>
                                    <TableCell>{voucher.paymentMethod}</TableCell>
                                    <TableCell>{voucher.payerName || 'غير متوفر'}</TableCell>
                                    <TableCell>{voucher.notes || 'لا يوجد'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* جدول إيرادات رسوم الطلاب */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1565c0' }}>
                إيرادات رسوم الطلاب (الدفعات)
            </Typography>
            <TableContainer component={Paper}>
                <Table aria-label="payments table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1565c0' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>رقم السند</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>المبلغ</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>تاريخ الدفعة</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>الطالب</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>السنة الأكاديمية</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>نوع الرسوم</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>الوصف</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPayments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">لا توجد بيانات دخل أو إيرادات مطابقة للفلاتر.</TableCell>
                            </TableRow>
                        ) : (
                            filteredPayments.map(payment => (
                                <TableRow key={payment.id}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{`PAY-${payment.id}`}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'green' }}>{payment.amount}</TableCell>
                                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                    <TableCell>{payment.studentFullName || 'غير معروف'}</TableCell>
                                    <TableCell>{payment.academicYearName || 'غير معروف'}</TableCell>
                                    <TableCell>{payment.feeTypeName || 'غير معروف'}</TableCell>
                                    <TableCell>{payment.notes || 'لا يوجد'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* نافذة منسدلة (Modal) لسند القبض العام */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: '600px' }, bgcolor: 'background.paper', borderRadius: 2,
                    boxShadow: 24, p: 4, outline: 'none'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1565c0' }}>
                            <ReceiptLongIcon />
                            <Typography variant="h6" fontWeight="bold">سند قبض إيراد عام / تشغيلي</Typography>
                        </Box>
                        <IconButton onClick={handleCloseModal} size="small"><CloseIcon /></IconButton>
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                    {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
                    {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}

                    <form onSubmit={handleSaveVoucher}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="رقم السند" name="voucherNumber" value={voucherData.voucherNumber} disabled size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth type="date" label="تاريخ السند" name="date" InputLabelProps={{ shrink: true }} value={voucherData.date} onChange={handleVoucherChange} required size="small" />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                {loadingAccounts ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        <CircularProgress size={20} />
                                        <Typography variant="caption">جاري تحميل الحسابات...</Typography>
                                    </Box>
                                ) : (
                                    <TextField select fullWidth label="بند الإيراد / الحساب المستهدف" name="accountId" value={voucherData.accountId} onChange={handleVoucherChange} required size="small">
                                        {accounts.map((acc) => (
                                            <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth type="number" label="المبلغ (ر.س)" name="amount" value={voucherData.amount} onChange={handleVoucherChange} required inputProps={{ min: 0, step: '0.01' }} size="small" />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField select fullWidth label="طريقة الدفع" name="paymentMethod" value={voucherData.paymentMethod} onChange={handleVoucherChange} required size="small">
                                    <MenuItem value="CASH">نقداً (صندوق المدرسة)</MenuItem>
                                    <MenuItem value="BANK_TRANSFER">تحويل بنكي</MenuItem>
                                    <MenuItem value="CARD">شبكة / بطاقة إلكترونية</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="اسم الجهة / الدافع" name="payerName" value={voucherData.payerName} onChange={handleVoucherChange} placeholder="مثلاً: متعهد المقصف" size="small" />
                            </Grid>

                            <Grid item  xs={12} sm={6}>
                                <TextField fullWidth multiline rows={2} label="ملاحظات / بيان" name="notes" value={voucherData.notes} onChange={handleVoucherChange} size="small" />
                            </Grid>

                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button type="submit" variant="contained" color="primary" disabled={submitting} sx={{ fontWeight: 'bold' }}>
                                    {submitting ? 'جاري الحفظ...' : 'حفظ وترحيل السند'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Modal>

        </Container>
    );
};

export default IncomeRevenuesPage;