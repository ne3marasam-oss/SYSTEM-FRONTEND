import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button, CircularProgress, Box, Typography, Paper, Grid } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SchoolIcon from '@mui/icons-material/School';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import './StudentFeesReportsPage.css';

const StudentFeesReportsPage = () => {
    const [studentFees, setStudentFees] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState({ name: '', logo: '' });
    const [logoError, setLogoError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'التقرير_التفصيلي_لبنود_الرسوم_المدرسية',
    });

    const fetchData = async (query = '') => {
        setLoading(true);
        setError(null);
        setLogoError(false);

        try {
            let url = 'https://system-backend-rwsk.onrender.com/api/student-fees';
            let params = {};

            if (query.trim() !== '') {
                url += '/search';
                params.query = query.trim();
            }

            const [feesResponse, schoolResponse] = await Promise.all([
                axios.get(url, { params }),
                axios.get('https://system-backend-rwsk.onrender.com/api/schools').catch(() => ({ data: [] }))
            ]);

            setStudentFees(feesResponse.data);

            if (schoolResponse && schoolResponse.data) {
                const schoolsList = Array.isArray(schoolResponse.data) ? schoolResponse.data : [schoolResponse.data];
                if (schoolsList.length > 0) {
                    const school = schoolsList[0];
                    
                    const schoolName = school.name || school.schoolName ||'';
                    let rawLogo = school.logoUrl || school.logo || school.schoolLogo || school.image || school.icon || '';
                    let logoUrl = '';

                    if (rawLogo) {
                        if (rawLogo.startsWith('http') || rawLogo.startsWith('data:')) {
                            logoUrl = rawLogo;
                        } else {
                            const formattedPath = rawLogo.startsWith('/') ? rawLogo : `/${rawLogo}`;
                            logoUrl = `https://system-backend-rwsk.onrender.com${formattedPath}`;
                        }
                    }

                    setSchoolInfo({
                        name: schoolName,
                        logo: logoUrl
                    });
                }
            }
        } catch (err) {
            console.error(err);
            setError('خطأ في الاتصال بالخادم لجلب تفاصيل الرسوم وبيانات المدرسة.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSearch = () => fetchData(searchQuery);

    const handleReset = () => {
        setSearchQuery('');
        fetchData('');
    };

    // --- المجاميع العامة للمدرسة ---
    const totalDueSum = studentFees.reduce((acc, curr) => acc + (Number(curr.total_allocated_amount || curr.amountDue || curr.amount) || 0), 0);
    const totalPaidSum = studentFees.reduce((acc, curr) => acc + (Number(curr.paid_amount || curr.paidAmount) || 0), 0);
    const totalRemainingSum = studentFees.reduce((acc, curr) => acc + (Number(curr.remaining_amount) || ((Number(curr.total_allocated_amount || curr.amountDue || curr.amount) || 0) - (Number(curr.paid_amount || curr.paidAmount) || 0))), 0);

    // --- مجاميع البنود ---
    const totalTuition = studentFees.reduce((acc, curr) => {
        const rawTuition = Number(curr.tuition_fee || curr.tuitionFee || curr.tuition) || 0;
        const discountPercentage = Number(curr.discount_percentage || curr.discountPercentage) || 0;
        const discountVal = Number(curr.discount || curr.discount_amount) || (discountPercentage > 0 ? (rawTuition * discountPercentage) / 100 : 0);
        const netTuition = rawTuition - discountVal;
        return acc + (netTuition > 0 ? netTuition : rawTuition);
    }, 0);

    const totalTransport = studentFees.reduce((acc, curr) => acc + (Number(curr.transport_fee || curr.transportFee || curr.bus_fee) || 0), 0);
    const totalBooks = studentFees.reduce((acc, curr) => acc + (Number(curr.books_fee || curr.booksFee) || 0), 0);
    const totalUniform = studentFees.reduce((acc, curr) => acc + (Number(curr.uniform_fee || curr.uniformFee) || 0), 0);
    const totalRegistration = studentFees.reduce((acc, curr) => acc + (Number(curr.registration_fee || curr.registrationFee) || 0), 0);
    const totalActivities = studentFees.reduce((acc, curr) => acc + (Number(curr.activities_fee || curr.activitiesFee) || 0), 0);

    const countStudents = () => studentFees.length;
    const countTransactions = () => studentFees.length;

    return (
        <Box sx={{ p: 4, bgcolor: '#f4f6f8', minHeight: '100vh', direction: 'rtl' }}>
            
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', justifyContent: 'flex-end' }} elevation={1} className="no-print">
                <Button variant="contained" sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }} onClick={handlePrint} startIcon={<PrintIcon />}>
                    طباعة التقرير التفصيلي
                </Button>
            </Paper>

            {error && (
                <Box sx={{ p: 2, mb: 2, bgcolor: '#ffebee', border: '1px solid red', borderRadius: 1 }}>
                    <Typography color="error" align="center">{error}</Typography>
                </Box>
            )}

            <Paper ref={componentRef} sx={{ p: 4, bgcolor: 'white', borderRadius: 2 }} elevation={2} className="student-fees-page report-view notranslate" translate="no">
                
                {/* ترويسة التقرير */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: '2px solid #1b5e20' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {schoolInfo.logo && !logoError ? (
                            <img 
                                src={schoolInfo.logo} 
                                alt="شعار المدرسة" 
                                style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '2px' }} 
                                onError={() => setLogoError(true)} 
                            />
                        ) : (
                            <Box sx={{ width: '70px', height: '70px', borderRadius: '8px', bgcolor: '#e8f5e9', border: '1px solid #c8e6c9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1b5e20' }}>
                                <SchoolIcon fontSize="large" />
                            </Box>
                        )}
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1b5e20' }}>
                                {schoolInfo.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                إدارة الشؤون المالية والحسابات المدرسية
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="caption" display="block" color="textSecondary">
                            تاريخ الإصدار: {dayjs().format('YYYY/MM/DD HH:mm')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                            حالة التقرير: معتمد للإدارة
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                        التقرير المالي التفصيلي حسب بنود الرسوم (الباص، الكتب، الزي، التسجيل، الأنشطة)
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3, textAlign: 'center' }}>
                    <Grid item xs={4}>
                        <Box sx={{ p: 2, border: '1px solid #c8e6c9', borderRadius: 2, bgcolor: '#e8f5e9' }}>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold">إجمالي المستحقات العامة</Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1b5e20' }}>{totalDueSum.toLocaleString()} ر.ي</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ p: 2, border: '1px solid #c8e6c9', borderRadius: 2, bgcolor: '#e8f5e9' }}>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold">إجمالي المحصل الفعلي</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">{totalPaidSum.toLocaleString()} ر.ي</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ p: 2, border: '1px solid #ffcdd2', borderRadius: 2, bgcolor: '#ffebee' }}>
                            <Typography variant="caption" color="textSecondary" fontWeight="bold">إجمالي المتأخرات والمتبقي</Typography>
                            <Typography variant="h6" fontWeight="bold" color="error.main">{totalRemainingSum.toLocaleString()} ر.ي</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 4, textAlign: 'center' }}>
                    <Grid item xs={12} sm={4} md={2}>
                        <Box sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="caption" color="textSecondary" display="block">رسوم التسجيل</Typography>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1b5e20' }}>{totalRegistration.toLocaleString()} ر.ي</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <Box sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="caption" color="textSecondary" display="block">رسوم الكتب</Typography>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1b5e20' }}>{totalBooks.toLocaleString()} ر.ي</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <Box sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="caption" color="textSecondary" display="block">رسوم الباص</Typography>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1b5e20' }}>{totalTransport.toLocaleString()} ر.ي</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <Box sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="caption" color="textSecondary" display="block">رسوم الأنشطة</Typography>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1b5e20' }}>{totalActivities.toLocaleString()} ر.ي</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <Box sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="caption" color="textSecondary" display="block">رسوم الزي</Typography>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1b5e20' }}>{totalUniform.toLocaleString()} ر.ي</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <Box sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="caption" color="textSecondary" display="block">الرسوم الدراسية (صافي)</Typography>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1b5e20' }}>{totalTuition.toLocaleString()} ر.ي</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1b5e20', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalAtmIcon fontSize="small" /> تفصيل حسابات وإيرادات البنود (الباص، الكتب، الزي، التسجيل، الأنشطة):
                    </Typography>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1b5e20', color: 'white' }}>
                                <th style={{ padding: '9px 12px' }}>بند الرسوم الأساسي</th>
                                <th style={{ padding: '9px 12px' }}>عدد المستفيدين / الطلاب</th>
                                <th style={{ padding: '9px 12px' }}>عدد الحركات</th>
                                <th style={{ padding: '9px 12px' }}>إجمالي المستحق</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold', color: '#1b5e20' }}>رسوم التسجيل والاشتراك</td>
                                <td style={{ padding: '9px 12px' }}>{countStudents()} طالب</td>
                                <td style={{ padding: '9px 12px' }}>{countTransactions()}</td>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold' }}>{totalRegistration.toLocaleString()} ر.ي</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold', color: '#1b5e20' }}>رسوم الكتب المدرسية</td>
                                <td style={{ padding: '9px 12px' }}>{countStudents()} طالب</td>
                                <td style={{ padding: '9px 12px' }}>{countTransactions()}</td>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold' }}>{totalBooks.toLocaleString()} ر.ي</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold', color: '#1b5e20' }}>رسوم الباص (النقل المدرسي)</td>
                                <td style={{ padding: '9px 12px' }}>{countStudents()} طالب</td>
                                <td style={{ padding: '9px 12px' }}>{countTransactions()}</td>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold' }}>{totalTransport.toLocaleString()} ر.ي</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold', color: '#1b5e20' }}>رسوم الأنشطة المدرسية</td>
                                <td style={{ padding: '9px 12px' }}>{countStudents()} طالب</td>
                                <td style={{ padding: '9px 12px' }}>{countTransactions()}</td>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold' }}>{totalActivities.toLocaleString()} ر.ي</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold', color: '#1b5e20' }}>رسوم الزي المدرسي</td>
                                <td style={{ padding: '9px 12px' }}>{countStudents()} طالب</td>
                                <td style={{ padding: '9px 12px' }}>{countTransactions()}</td>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold' }}>{totalUniform.toLocaleString()} ر.ي</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold', color: '#1b5e20' }}>الرسوم الدراسية الأساسية (بعد الخصم)</td>
                                <td style={{ padding: '9px 12px' }}>{countStudents()} طالب</td>
                                <td style={{ padding: '9px 12px' }}>{countTransactions()}</td>
                                <td style={{ padding: '9px 12px', fontWeight: 'bold' }}>{totalTuition.toLocaleString()} ر.ي</td>
                            </tr>
                        </tbody>
                    </table>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }} className="no-print">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1b5e20' }}>
                            السجل التفصيلي لعمليات وحسابات الطلاب:
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, width: '350px' }}>
                            <input
                                type="text"
                                placeholder="بحث باسم الطالب..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                            />
                            <Button variant="contained" size="small" sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#2e7d32' } }} startIcon={<SearchIcon />} onClick={handleSearch}>
                                بحث
                            </Button>
                            <Button variant="outlined" size="small" color="success" startIcon={<RefreshIcon />} onClick={handleReset}>
                                إعادة
                            </Button>
                        </Box>
                    </Box>

                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1b5e20', mb: 1.5, display: 'none', '@media print': { display: 'block' } }}>
                        السجل التفصيلي لعمليات وحسابات الطلاب:
                    </Typography>

                    <div className="table-container">
                        {/* تم توحيد لون الترويسة هنا إلى اللون الأخضر #1b5e20 بدلاً من الأزرق */}
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '11px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1b5e20', color: 'white' }}>
                                    <th style={{ padding: '6px' }}>#</th>
                                    <th style={{ padding: '6px' }}>اسم الطالب</th>
                                    <th style={{ padding: '6px' }}>الرسوم الأساسية</th>
                                    <th style={{ padding: '6px' }}>الخصم (%)</th>
                                    <th style={{ padding: '6px' }}>الرسوم الدراسية (صافي)</th>
                                    <th style={{ padding: '6px' }}>الباص</th>
                                    <th style={{ padding: '6px' }}>الكتب</th>
                                    <th style={{ padding: '6px' }}>الزي</th>
                                    <th style={{ padding: '6px' }}>التسجيل</th>
                                    <th style={{ padding: '6px' }}>الأنشطة</th>
                                    <th style={{ padding: '6px' }}>الإجمالي</th>
                                    <th style={{ padding: '6px' }}>المدفوع</th>
                                    <th style={{ padding: '6px' }}>المتبقي</th>
                                    <th style={{ padding: '6px' }}>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="14" align="center" style={{ padding: '20px' }}><CircularProgress size={24} sx={{ color: '#1b5e20' }} /></td></tr>
                                ) : studentFees.length === 0 ? (
                                    <tr><td colSpan="14" align="center" style={{ padding: '20px' }}>لا توجد بيانات متاحة.</td></tr>
                                ) : (
                                    studentFees.map((sf, index) => {
                                        const studentName = sf.studentFullName || sf.student?.fullName || '-';
                                        
                                        const rawTuition = Number(sf.tuition_fee || sf.tuitionFee) || 0;
                                        const discountPercentage = Number(sf.discount_percentage || sf.discountPercentage) || 0;
                                        const discountVal = Number(sf.discount || sf.discount_amount) || (discountPercentage > 0 ? (rawTuition * discountPercentage) / 100 : 0);
                                        const discountStr = discountPercentage > 0 ? `${discountPercentage}%` : (discountVal > 0 ? discountVal.toLocaleString() : '-');
                                        const netTuition = rawTuition - discountVal;

                                        const transport = Number(sf.transport_fee || sf.transportFee || sf.bus_fee) || 0;
                                        const books = Number(sf.books_fee || sf.booksFee) || 0;
                                        const uniform = Number(sf.uniform_fee || sf.uniformFee) || 0;
                                        const registration = Number(sf.registration_fee || sf.registrationFee) || 0;
                                        const activities = Number(sf.activities_fee || sf.activitiesFee) || 0;
                                        
                                        const due = Number(sf.total_allocated_amount || sf.amountDue || sf.amount) || (netTuition + transport + books + uniform + registration + activities);
                                        const paid = Number(sf.paid_amount || sf.paidAmount) || 0;
                                        const remaining = Number(sf.remaining_amount) || (due - paid);

                                        return (
                                            <tr key={sf.id || index} style={{ borderBottom: '1px solid #ddd' }}>
                                                <td style={{ padding: '6px' }}>{index + 1}</td>
                                                <td style={{ padding: '6px', fontWeight: 'bold' }}>{studentName}</td>
                                                <td style={{ padding: '6px' }}>{rawTuition.toLocaleString()}</td>
                                                <td style={{ padding: '6px', color: '#d32f2f' }}>{discountStr}</td>
                                                <td style={{ padding: '6px', fontWeight: 'bold' }}>{netTuition.toLocaleString()}</td>
                                                <td style={{ padding: '6px' }}>{transport.toLocaleString()}</td>
                                                <td style={{ padding: '6px' }}>{books.toLocaleString()}</td>
                                                <td style={{ padding: '6px' }}>{uniform.toLocaleString()}</td>
                                                <td style={{ padding: '6px' }}>{registration.toLocaleString()}</td>
                                                <td style={{ padding: '6px' }}>{activities.toLocaleString()}</td>
                                                <td style={{ padding: '6px', fontWeight: 'bold' }}>{due.toLocaleString()}</td>
                                                <td style={{ padding: '6px', color: 'green', fontWeight: 'bold' }}>{paid.toLocaleString()}</td>
                                                <td style={{ padding: '6px', fontWeight: 'bold', color: remaining > 0 ? 'red' : 'green' }}>
                                                    {remaining.toLocaleString()}
                                                </td>
                                                <td style={{ padding: '6px' }}>
                                                    <span style={{ padding: '2px 5px', borderRadius: '4px', fontSize: '9px', background: '#e8f5e9', color: '#1b5e20', fontWeight: 'bold' }}>
                                                        {sf.status || 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Box>

                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between', px: 4, pageBreakInside: 'avoid' }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>المسؤول المالي / المحاسب</Typography>
                        <Typography variant="body2" sx={{ mt: 3 }}>الاسم: ....................................</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>التوقيع: ....................................</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>اعتماد إدارة المدرسة</Typography>
                        <Typography variant="body2" sx={{ mt: 3 }}>المدير العام: ....................................</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>الختم الرسمي: </Typography>
                    </Box>
                </Box>

            </Paper>
        </Box>
    );
};

export default StudentFeesReportsPage;