import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogContent, DialogActions, Button, Box, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Grid
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';

const StudentStatementModal = ({ open, onClose, studentFee, payments = [] }) => {
    const componentRef = useRef(null);
    const [schoolInfo, setSchoolInfo] = useState(null);

    // جلب بيانات المدرسة عند فتح النافذة
    useEffect(() => {
        if (open) {
            fetch('http://localhost:8080/api/schools')
                .then(res => res.json())
                .then(data => {
                    console.log("School API Response:", data);
                    if (data) {
                        const school = Array.isArray(data) ? data[0] : data;
                        setSchoolInfo(school);
                    }
                })
                .catch(err => console.error("خطأ في جلب بيانات المدرسة:", err));
        }
    }, [open]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `كشف_حساب_${studentFee?.student?.firstName || 'طالب'}`,
    });

    if (!studentFee) return null;

    const studentName = studentFee.student ? `${studentFee.student.firstName} ${studentFee.student.lastName}` : '---';
    const totalAllocated = studentFee.amountDue || studentFee.totalAllocatedAmount || 0;
    const paid = studentFee.paidAmount || 0;
    const remaining = totalAllocated - paid;

    const originalTuition = studentFee.tuitionFee || studentFee.originalTuitionFee || studentFee.amount || 0;
    const discountPercentage = studentFee.discountPercentage || 0;
    const discountAmount = studentFee.discountAmount || (originalTuition * (discountPercentage / 100));
    const netTuition = originalTuition - discountAmount;
    
    const busFee = studentFee.transportFee || studentFee.busFee || 0;
    const booksFee = studentFee.booksFee || 0;
    const registrationFee = studentFee.registrationFee || 0;
    const activitiesFee = studentFee.activitiesFee || 0;
    const uniformFee = studentFee.uniformFee || 0;

    // تحديد رابط الشعار (في حال كان مسار كاملاً أو اسم ملف فقط مثل logo.jpg)
    const logoFileName = schoolInfo?.logo || schoolInfo?.schoolLogo || 'logo.jpg';
    const schoolLogoUrl = logoFileName.startsWith('http') 
        ? logoFileName 
        : `http://localhost:8080/uploads/${logoFileName}`; // قم بتعديل مجلد uploads إذا كان مسار الصور في الباك إند مختلفاً

    return (
        <Dialog open={open} onClose={open ? onClose : undefined} maxWidth="md" fullWidth>
            <DialogContent>
                {/* الجزء القابل للطباعة */}
                <Box ref={componentRef} sx={{ p: 3, bgcolor: 'white', direction: 'rtl' }}>
                    
                    {/* رأس المدرسة أو المؤسسة */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box 
                            component="img"
                            src={schoolLogoUrl} 
                            alt="شعار المدرسة" 
                            onError={(e) => {
                                // إذا فشل تحميل الصورة من المسار الأول، جرب مسار الجذر المباشر
                                if (e.target.src !== `http://localhost:8080/${logoFileName}`) {
                                    e.target.src = `http://localhost:8080/${logoFileName}`;
                                } else {
                                    e.target.style.display = 'none'; // إخفاء الصورة نهائياً إذا لم تتوجد لتفادي الأخطاء
                                }
                            }}
                            sx={{ width: '80px', height: '80px', objectFit: 'contain', mx: 'auto', mb: 1 }} 
                        />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                            {schoolInfo?.name || schoolInfo?.schoolName || "مدرسة الشهيدة نعمة أحمد رسام"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            النظام المالي والمحاسبي - كشف حساب تفصيلي للطالب
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                    </Box>

                    {/* بيانات الطالب الأساسية */}
                    <Grid container spacing={2} sx={{ mb: 3, bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                        <Grid item xs={6}>
                            <Typography variant="body2"><strong>اسم الطالب:</strong> {studentName}</Typography>
                            <Typography variant="body2"><strong>العام الدراسي:</strong> {studentFee.academicYear?.academicYearName || '---'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2"><strong>الحالة العامة:</strong> {studentFee.status}</Typography>
                            <Typography variant="body2"><strong>تاريخ الإصدار:</strong> {dayjs().format('YYYY/MM/DD')}</Typography>
                        </Grid>
                    </Grid>

                    {/* الملخص المالي السريع */}
                    <Grid container spacing={2} sx={{ mb: 3, textAlign: 'center' }}>
                        <Grid item xs={4}>
                            <Box sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#e3f2fd' }}>
                                <Typography variant="caption" color="textSecondary">إجمالي المستحق</Typography>
                                <Typography variant="subtitle1" fontWeight="bold">{totalAllocated.toLocaleString()} ر.ي</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#e8f5e9' }}>
                                <Typography variant="caption" color="textSecondary">إجمالي المدفوع</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="success.main">{paid.toLocaleString()} ر.ي</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#ffebee' }}>
                                <Typography variant="caption" color="textSecondary">المتبقي للصندوق</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="error.main">{remaining.toLocaleString()} ر.ي</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* جدول تفاصيل الرسوم والخصومات */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                        تفاصيل بنود الرسوم والخصومات:
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f0f0f0' }}>
                                <TableRow>
                                    <TableCell>البيان / البند</TableCell>
                                    <TableCell>المبلغ الأصلي</TableCell>
                                    <TableCell>الخصم</TableCell>
                                    <TableCell>الصافي</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>الرسوم الدراسية</TableCell>
                                    <TableCell>{originalTuition.toLocaleString()} ر.ي</TableCell>
                                    <TableCell sx={{ color: 'error.main' }}>{discountPercentage}% ({discountAmount.toLocaleString()} ر.ي)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{netTuition.toLocaleString()} ر.ي</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>رسوم الباص (المواصلات)</TableCell>
                                    <TableCell colSpan={2}>---</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{busFee.toLocaleString()} ر.ي</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>رسوم الكتب</TableCell>
                                    <TableCell colSpan={2}>---</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{booksFee.toLocaleString()} ر.ي</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>رسوم التسجيل</TableCell>
                                    <TableCell colSpan={2}>---</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{registrationFee.toLocaleString()} ر.ي</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>رسوم الأنشطة</TableCell>
                                    <TableCell colSpan={2}>---</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{activitiesFee.toLocaleString()} ر.ي</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>رسوم الزي المدرسي</TableCell>
                                    <TableCell colSpan={2}>---</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{uniformFee.toLocaleString()} ر.ي</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* جدول الأقساط */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                        تفاصيل الأقساط:
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f0f0f0' }}>
                                <TableRow>
                                    <TableCell>رقم القسط</TableCell>
                                    <TableCell>المبلغ</TableCell>
                                    <TableCell>المسدد</TableCell>
                                    <TableCell>المتبقي</TableCell>
                                    <TableCell>تاريخ الاستحقاق</TableCell>
                                    <TableCell>الحالة</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentFee.installments && studentFee.installments.length > 0 ? (
                                    studentFee.installments.map((inst) => (
                                        <TableRow key={inst.id}>
                                            <TableCell>القسط #{inst.installmentNumber}</TableCell>
                                            <TableCell>{inst.amount?.toLocaleString()} ر.ي</TableCell>
                                            <TableCell sx={{ color: 'success.main' }}>{inst.paidAmount?.toLocaleString() || 0} ر.ي</TableCell>
                                            <TableCell sx={{ color: 'error.main' }}>{inst.remainingAmount?.toLocaleString() || inst.amount} ر.ي</TableCell>
                                            <TableCell>{inst.dueDate ? dayjs(inst.dueDate).format('YYYY/MM/DD') : '---'}</TableCell>
                                            <TableCell>{inst.status}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">لا توجد أقساط مخصصة</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* سجل السندات والدفعات السابقة */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                        سجل سندات القبض المدفوعة:
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f0f0f0' }}>
                                <TableRow>
                                    <TableCell>رقم السند</TableCell>
                                    <TableCell>تاريخ الدفع</TableCell>
                                    <TableCell>المبلغ المدفوع</TableCell>
                                    <TableCell>طريقة الدفع</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payments && payments.length > 0 ? (
                                    payments.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>#{p.receiptNumber || p.id}</TableCell>
                                            <TableCell>{dayjs(p.paymentDate).format('YYYY/MM/DD')}</TableCell>
                                            <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>{p.amount?.toLocaleString()} ر.ي</TableCell>
                                            <TableCell>{p.paymentMethod || 'نقدي'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">لا توجد سندات قبض مسجلة حتى الآن</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* التوقيعات */}
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', px: 4 }}>
                        <Typography variant="body2">توقيع المحاسب: ........................</Typography>
                        <Typography variant="body2">ختم الإدارة: ........................</Typography>
                    </Box>

                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint}>
                    طباعة كشف الحساب
                </Button>
                <Button variant="outlined" color="inherit" startIcon={<CloseIcon />} onClick={onClose}>
                    إغلاق
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StudentStatementModal;