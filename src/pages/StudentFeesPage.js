import React, { useState, useEffect } from 'react';
import axios from 'axios';
// استيراد مكونات MUI
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField'; // للبحث
import Stack from '@mui/material/Stack';

import StudentFeeModalForm from '../components/StudentFeeModalForm';
import PaymentModalForm from '../components/PaymentModalForm';
import './StudentFeesPage.css';

const StudentFeesPage = () => {
    const [studentFees, setStudentFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [showStudentFeeForm, setShowStudentFeeForm] = useState(false);
    const [selectedStudentFeeToEdit, setSelectedStudentFeeToEdit] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedStudentFeeForPayment, setSelectedStudentFeeForPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // حقول البحث والتصفية
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            // جلب البيانات الأساسية (الطلاب، السنوات، الأنواع)
            const [studentsRes, feeTypesRes, academicYearsRes, feesRes] = await Promise.all([
                axios.get('http://localhost:8080/api/students'),
                axios.get('http://localhost:8080/api/fee-types'),
                axios.get('http://localhost:8080/api/academic-years'),
                axios.get('http://localhost:8080/api/student-fees')
            ]);

            setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
            setFeeTypes(Array.isArray(feeTypesRes.data) ? feeTypesRes.data : []);
            setAcademicYears(Array.isArray(academicYearsRes.data) ? academicYearsRes.data : []);
            setStudentFees(Array.isArray(feesRes.data) ? feesRes.data : []);

        } catch (err) {
            console.error('Failed to load initial data:', err);
            setError(`فشل في جلب البيانات: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // دالة البحث المعدلة لحل مشكلة التاريخ
  const handleSearch = async () => {
    setLoading(true);
    try {
        // تأكد من أن القيم ليست فارغة قبل إرسالها
        const params = {};
        if (searchQuery) params.query = searchQuery;
        if (startDate) params.startDate = startDate; // startDate ستكون YYYY-MM-DD تلقائياً
        if (endDate) params.endDate = endDate;

        const response = await axios.get('http://localhost:8080/api/student-fees/search', { params });
        setStudentFees(response.data);
    } catch (err) {
        console.error('Search failed:', err);
        // هذه هي الرسالة التي تظهر لك في الصورة
        alert('حدث خطأ: تأكد أن صيغة التاريخ صحيحة وأن السيرفر يعمل.'); 
    } finally {
        setLoading(false);
    }
};

    const handleAddStudentFee = () => {
        setSelectedStudentFeeToEdit(null);
        setShowStudentFeeForm(true);
    };

    const handleDeleteStudentFee = async (id) => {
        if (window.confirm('هل أنت متأكد أنك تريد حذف رسوم الطالب هذه؟')) {
            try {
                await axios.delete(`http://localhost:8080/api/student-fees/${id}`);
                alert('تم الحذف بنجاح');
                loadInitialData();
            } catch (err) {
                alert('فشل الحذف: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleStudentFeeFormClose = () => {
        setShowStudentFeeForm(false);
        setSelectedStudentFeeToEdit(null);
    };

    const handlePaymentFormClose = () => {
        setShowPaymentForm(false);
        setSelectedStudentFeeForPayment(null);
    };

    const handleRecordPayment = (studentFee) => {
        setSelectedStudentFeeForPayment(studentFee);
        setShowPaymentForm(true);
    };

    if (loading && studentFees.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /> جاري التحميل...</Box>;

    return (
       // ... الكود السابق (Imports and States)
    <div className="student-fees-page">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Typography variant="h4" component="h2">إدارة رسوم الطلاب</Typography>

            {/* --- بداية التعديل: شريط البحث وفلاتر التاريخ --- */}
            <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center', 
                backgroundColor: '#f9f9f9', 
                p: 2, 
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <TextField 
                    label="بحث بالاسم..." 
                    variant="outlined" 
                    size="small" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 2 }}
                />
                
                <TextField 
                    label="من تاريخ" 
                    type="date" 
                    size="small" 
                    InputLabelProps={{ shrink: true }}
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    sx={{ flex: 1 }}
                />

                <TextField 
                    label="إلى تاريخ" 
                    type="date" 
                    size="small" 
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    sx={{ flex: 1 }}
                />

                <Button variant="contained" color="primary" onClick={handleSearch}>
                    بحث
                </Button>
                
                <Button variant="outlined" onClick={loadInitialData}>
                    إعادة تعيين
                </Button>

                <Button variant="contained" color="success" onClick={handleAddStudentFee}>
                    إضافة رسوم
                </Button>
            </Box>
            {/* --- نهاية التعديل --- */}
        </Box>

        {/* باقي الكود (Dialogs and Table) ... */}

            {/* الحوارات (Dialogs) كما هي في كودك الأصلي */}
            <Dialog open={showStudentFeeForm} onClose={handleStudentFeeFormClose} fullWidth maxWidth="md">
                <DialogTitle>
                    {selectedStudentFeeToEdit ? 'تعديل رسوم الطالب' : 'إضافة رسوم طالب جديدة'}
                    <IconButton onClick={handleStudentFeeFormClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <StudentFeeModalForm
                        studentFee={selectedStudentFeeToEdit}
                        students={students}
                        feeTypes={feeTypes}
                        academicYears={academicYears}
                        onClose={handleStudentFeeFormClose}
                        onSuccess={loadInitialData}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={showPaymentForm} onClose={handlePaymentFormClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    تسجيل دفعة
                    <IconButton onClick={handlePaymentFormClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedStudentFeeForPayment && (
                        <PaymentModalForm
                            studentFee={selectedStudentFeeForPayment}
                            onClose={handlePaymentFormClose}
                            onSuccess={loadInitialData}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* عرض الجدول */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>الطالب</th>
                            <th>نوع الرسوم</th>
                            <th>السنة</th>
                            <th>المستحق</th>
                            <th>المدفوع</th>
                            <th>المتبقي</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentFees.length === 0 ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center' }}>لا توجد بيانات متاحة.</td></tr>
                        ) : (
                            studentFees.map((sf) => (
                                <tr key={sf.id}>
                                    <td>{sf.studentFullName}</td>
                                    <td>{sf.feeTypeName}</td>
                                    <td>{sf.academicYearName}</td>
                                    <td>{sf.amountDue?.toFixed(2)}</td>
                                    <td>{sf.amountPaid?.toFixed(2)}</td>
                                    <td style={{ color: (sf.amountDue - sf.amountPaid) > 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                                        {(sf.amountDue - sf.amountPaid).toFixed(2)}
                                    </td>
                                    <td>{sf.dueDate}</td>
                                    <td><span className={`status-badge ${sf.status}`}>{sf.status}</span></td>
                                    <td>
                                        <Button size="small" color="error" onClick={() => handleDeleteStudentFee(sf.id)}>حذف</Button>
                                        <Button size="small" variant="contained" color="success" onClick={() => handleRecordPayment(sf)}>دفع</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentFeesPage;