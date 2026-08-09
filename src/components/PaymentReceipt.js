import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, Grid } from '@mui/material';

const PaymentReceipt = React.forwardRef(({ paymentData, studentFee }, ref) => {
    const [schoolInfo, setSchoolInfo] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8080/api/schools')
            .then(res => res.json())
            .then(data => {
                if (data) {
                    const school = Array.isArray(data) ? data[0] : data;
                    setSchoolInfo(school);
                }
            })
            .catch(err => console.error("خطأ في جلب بيانات المدرسة:", err));
    }, []);

    if (!studentFee || !paymentData) {
        return <div ref={ref} style={{ padding: '20px' }}>جاري تجهيز البيانات...</div>;
    }

    const rawReceiptId = paymentData.receiptNumber || paymentData.id || studentFee.receiptNumber || studentFee.id || "0";
    const receiptId = String(rawReceiptId).replace(/[^0-9]/g, '') || "0";

    const studentName = studentFee.studentFullName || "غير مسجل";
    const feeType = studentFee.feeTypeName || "رسوم عامة";
    const year = studentFee.academicYearName || "---";
    const amount = paymentData.amount || 0;
    const notes = paymentData.notes || "لا يوجد ملاحظات";
    
    const displayDate = paymentData.createdAt 
        ? new Date(paymentData.createdAt).toLocaleDateString('ar-SA') 
        : new Date().toLocaleDateString('ar-SA');

    const formattedReceiptId = String(receiptId).padStart(5, '0');

    const logoFileName = schoolInfo?.logo || schoolInfo?.schoolLogo || 'logo.jpg';
    const schoolLogoUrl = logoFileName.startsWith('http') 
        ? logoFileName 
        : `http://localhost:8080/uploads/${logoFileName}`;

    const schoolName = schoolInfo?.name || schoolInfo?.schoolName || "مدرسة التميز";

    return (
        <Box 
            ref={ref} 
            sx={{ 
                p: "10mm", 
                direction: 'rtl', 
                width: '210mm', 
                minHeight: '148mm', 
                bgcolor: 'white !important',
                position: 'relative',
                border: '6px double #1b5e20 !important',
                margin: 'auto',
                boxSizing: 'border-box',
                fontFamily: 'Cairo, sans-serif',
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.96), rgba(255,255,255,0.96)), url("https://www.transparenttextures.com/patterns/pinstripe.png")',
                '@media print': {
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                    backgroundColor: 'white !important',
                    boxShadow: 'none !important',
                }
            }}
        >
            {/* الهيدر العلوي مع الشعار */}
            <Grid container alignItems="center" sx={{ mb: 4, borderBottom: '2px solid #81c784 !important', pb: 2 }}>
                <Grid item xs={7} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box 
                        component="img"
                        src={schoolLogoUrl} 
                        alt="شعار المدرسة" 
                        onError={(e) => {
                            if (e.target.src !== `http://localhost:8080/${logoFileName}`) {
                                e.target.src = `http://localhost:8080/${logoFileName}`;
                            } else {
                                e.target.style.display = 'none';
                            }
                        }}
                        sx={{ width: '70px', height: '70px', objectFit: 'contain' }} 
                    />
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: '900', color: '#1b5e20 !important', textShadow: '1px 1px 2px #dcedc8', fontSize: '2rem' }}>
                            {schoolName}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#2e7d32 !important', fontWeight: 'bold', mt: -0.5 }}>
                            للخدمات التعليمية والتربوية
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={5} textAlign="left">
                    <Box sx={{ 
                        border: '2px solid #1b5e20 !important', 
                        p: 1.5, 
                        display: 'inline-block', 
                        borderRadius: 2, 
                        bgcolor: '#f1f8e9 !important',
                        boxShadow: 'none'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1b5e20 !important', textAlign: 'center' }}>
                            رقم السند: {formattedReceiptId}
                        </Typography>
                        <Divider sx={{ my: 0.5, borderColor: '#c8e6c9 !important' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center', color: '#333 !important' }}>
                            التاريخ: {displayDate}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* عنوان السند */}
            <Box sx={{ 
                width: '250px', 
                margin: '0 auto 30px', 
                textAlign: 'center', 
                border: '2px solid #1b5e20 !important',
                borderRadius: '50px',
                bgcolor: '#1b5e20 !important',
                color: '#fff !important',
                py: 1,
                boxShadow: 'none',
                '@media print': {
                    bgcolor: '#1b5e20 !important',
                    color: '#fff !important'
                }
            }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 2, color: '#fff !important' }}>سـنـد قـبـض</Typography>
            </Box>

            {/* محتوى البيانات */}
            <Box sx={{ px: 2 }}>
                <Typography variant="h6" sx={{ mb: 4, lineHeight: 2, color: '#000 !important' }}>
                    استلمنا من الطالب/ة: 
                    <span style={{ 
                        color: '#1b5e20', 
                        fontWeight: 'bold', 
                        borderBottom: '2px solid #1b5e20', 
                        padding: '0 15px', 
                        fontSize: '1.4rem',
                        marginRight: '10px'
                    }}>
                        {studentName}
                    </span>
                </Typography>

                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={7}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ color: '#000 !important' }}>مبلغاً وقدره: </Typography>
                            <Box sx={{ 
                                bgcolor: '#f1f8e9 !important', 
                                px: 2, 
                                py: 1, 
                                borderRadius: '8px', 
                                border: '2px solid #81c784 !important', 
                                fontWeight: 'bold', 
                                color: '#1b5e20 !important', 
                                fontSize: '1.3rem',
                                ml: 2,
                                boxShadow: 'none',
                                '@media print': {
                                    bgcolor: '#f1f8e9 !important',
                                    color: '#1b5e20 !important'
                                }
                            }}>
                                {Number(amount).toLocaleString()} ريال يمني
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={5}>
                        <Typography variant="h6" sx={{ color: '#000 !important' }}>
                            العام الدراسي: 
                            <span style={{ fontWeight: 'bold', color: '#1b5e20', marginRight: '10px' }}>{year}</span>
                        </Typography>
                    </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mb: 4, color: '#000 !important' }}>
                    وذلك عن: 
                    <span style={{ borderBottom: '1px dashed #1b5e20', padding: '0 10px', width: '75%', display: 'inline-block', color: '#444' }}>
                        {feeType}
                    </span>
                </Typography>

                <Typography variant="h6" sx={{ mb: 4, color: '#000 !important' }}>
                    ملاحظات: 
                    <span style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#555', borderBottom: '1px solid #eee', width: '75%', display: 'inline-block' }}> 
                        {notes}
                    </span>
                </Typography>
            </Box>

            {/* مساحة التوقيعات */}
            <Grid container spacing={8} sx={{ mt: 6, px: 4 }}>
                <Grid item xs={6} textAlign="center">
                    <Box sx={{ p: 2, border: '1px solid #dcedc8 !important', borderRadius: 3, bgcolor: '#f9fbe7 !important' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 6, color: '#1b5e20 !important' }}>
                            توقيع المستلم
                        </Typography>
                        <Divider sx={{ borderBottomWidth: 2, borderColor: '#1b5e20 !important', width: '80%', mx: 'auto' }} />
                    </Box>
                </Grid>
                <Grid item xs={6} textAlign="center">
                    <Box sx={{ p: 2, border: '1px solid #dcedc8 !important', borderRadius: 3, bgcolor: '#f9fbe7 !important' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 6, color: '#1b5e20 !important' }}>
                            الختم الرسمي للمؤسسة
                        </Typography>
                        <Divider sx={{ borderBottomWidth: 2, borderColor: '#1b5e20 !important', width: '80%', mx: 'auto' }} />
                    </Box>
                </Grid>
            </Grid>

            {/* تذييل الصفحة */}
            <Box sx={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                textAlign: 'center',
                bgcolor: '#1b5e20 !important',
                color: 'white !important',
                py: 1,
                borderBottomLeftRadius: '2px',
                borderBottomRightRadius: '2px',
                '@media print': {
                    bgcolor: '#1b5e20 !important',
                    color: 'white !important'
                }
            }}>
                <Typography variant="caption" sx={{ letterSpacing: 2, fontWeight: 'bold', color: '#fff !important' }}>
                    {schoolName} للخدمات التعليمية - نظام المحاسبة الإلكتروني الموحد
                </Typography>
            </Box>
        </Box>
    );
});

export default PaymentReceipt;