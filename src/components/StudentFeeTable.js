import React, { useState, useEffect, useRef } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, Chip, Typography, Button, Box, Grid, Alert, CircularProgress,
    Collapse, IconButton, Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description'; // أيقونة كشف الحساب
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import StudentStatementModal from './StudentStatementModal';

// استيراد المكونات الخاصة بك
import FeePaymentModal from './FeePaymentModal';
import AddStudentFeeModal from './AddStudentFeeModal';
import PaymentReceipt from './PaymentReceipt';

// 1. مكون السطر المنفصل لكل طالب (Row Component)
const Row = (props) => {
    const { row, onPaymentClick, onStatementClick, onPrintClick, getStatusColor } = props;
    const [open, setOpen] = useState(false);
    const [payments, setPayments] = useState([]);

    const totalAllocated = row.amountDue || row.totalAllocatedAmount || 0;
    const paid = row.paidAmount || 0;
    const remaining = totalAllocated - paid;

    const fetchPayments = async () => {
        if (!open) {
            try {
                const response = await axios.get(`http://localhost:8080/api/payments/student-fee/${row.id}`);
                setPayments(response.data);
            } catch (err) {
                console.error("خطأ في جلب المدفوعات:", err);
            }
        }
        setOpen(!open);
    };

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
                <TableCell>
                    <IconButton size="small" onClick={fetchPayments}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{row.student ? `${row.student.firstName} ${row.student.lastName}` : '---'}</TableCell>
                <TableCell>{row.academicYear?.academicYearName || "---"}</TableCell>
                <TableCell>{(row.amount || 0).toLocaleString()}</TableCell>
                <TableCell sx={{ bgcolor: '#f1f8ff', fontWeight: 'bold' }}>{totalAllocated.toLocaleString()}</TableCell>
                <TableCell><Chip size="small" label={`${row.discountPercentage || 0}%`} color="primary" variant="outlined" /></TableCell>
                <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>{paid.toLocaleString()}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#d32f2f' }}>{remaining.toLocaleString()}</TableCell>
                <TableCell><Chip label={row.status} color={getStatusColor(row.status)} size="small" /></TableCell>
                <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button 
                            variant="contained" color="primary" size="small" startIcon={<ReceiptIcon />}
                            onClick={() => onPaymentClick(row)}
                            disabled={remaining <= 0}
                        > دفع </Button>
                        
                        <Button 
                            variant="outlined" color="secondary" size="small" startIcon={<DescriptionIcon />}
                            onClick={() => onStatementClick(row)}
                        > كشف حساب </Button>
                    </Box>
                </TableCell>
            </TableRow>
            
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, bgcolor: '#fafafa', p: 3, borderRadius: 2, boxShadow: 1 }}>
                            
                            {/* تفاصيل بنود الرسوم الموزعة */}
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1565c0', mb: 1.5 }}>
                                تفاصيل بنود الرسوم المعتمدة:
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6} sm={2}>
                                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                                        <Typography variant="caption" color="textSecondary">الدراسية (الصافي)</Typography>
                                        <Typography variant="body2" fontWeight="bold">{row.tuitionFee || 0} ر.ي</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                                        <Typography variant="caption" color="textSecondary">التسجيل</Typography>
                                        <Typography variant="body2" fontWeight="bold">{row.registrationFee || 0}ر.ي </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                                        <Typography variant="caption" color="textSecondary">الكتب</Typography>
                                        <Typography variant="body2" fontWeight="bold">{row.booksFee || 0} ر.ي</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                                        <Typography variant="caption" color="textSecondary">الباص</Typography>
                                        <Typography variant="body2" fontWeight="bold">{row.transportFee || 0} ر.ي</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                                        <Typography variant="caption" color="textSecondary">الأنشطة</Typography>
                                        <Typography variant="body2" fontWeight="bold">{row.activitiesFee || 0} ر.ي</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                                        <Typography variant="caption" color="textSecondary">الزي المدرسي</Typography>
                                        <Typography variant="body2" fontWeight="bold">{row.uniformFee || 0} ر.ي</Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            {/* جدول الأقساط المستحقة */}
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: '#e65100' }}>
                                جدول الأقساط المستحقة:
                            </Typography>
                            <Table size="small" sx={{ mb: 3 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#fff3e0' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>رقم القسط</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>المبلغ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>المسدد</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>المتبقي</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>تاريخ الاستحقاق</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.installments && row.installments.length > 0 ? (
                                        row.installments.map((inst) => (
                                            <TableRow key={inst.id}>
                                                <TableCell>القسط #{inst.installmentNumber}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{inst.amount?.toLocaleString()} ر.ي</TableCell>
                                                <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>{inst.paidAmount?.toLocaleString() || 0} ر.ي</TableCell>
                                                <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>{inst.remainingAmount?.toLocaleString() || inst.amount} ر.ي</TableCell>
                                                <TableCell>{inst.dueDate ? dayjs(inst.dueDate).format('YYYY/MM/DD') : '---'}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        size="small" 
                                                        label={inst.status} 
                                                        color={inst.status === 'PAID' ? 'success' : inst.status === 'PARTIALLY_PAID' ? 'info' : 'warning'} 
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                <Typography variant="body2" color="textSecondary" sx={{ py: 1 }}>لا توجد أقساط مخصصة (قسط افتراضي شامل)</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <Divider sx={{ my: 2 }} />

                            {/* سجل حركات السداد */}
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                سجل حركات السداد والدفعات:
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>رقم السند</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>التاريخ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>المبلغ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>الإجراء</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {payments.length > 0 ? payments.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>#{p.receiptNumber || p.id}</TableCell>
                                            <TableCell>{dayjs(p.paymentDate).format('YYYY/MM/DD')}</TableCell>
                                            <TableCell sx={{ color: 'green', fontWeight: 'bold' }}>{p.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <IconButton color="secondary" size="small" onClick={() => onPrintClick(row, p)}>
                                                    <PrintIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <Typography variant="body2" color="textSecondary" sx={{ py: 1 }}>لا توجد دفعات مسجلة حتى الآن</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

// 2. المكون الرئيسي (Main Component)
const StudentFeeTable = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [openAddFeeModal, setOpenAddFeeModal] = useState(false);
    
    // حالات خاصة بمودال كشف الحساب
    const [openStatementModal, setOpenStatementModal] = useState(false);
    const [studentPayments, setStudentPayments] = useState([]);

    const [selectedFee, setSelectedFee] = useState(null);
    const [printData, setPrintData] = useState(null);
    const componentRef = useRef(null);

    const fetchStudentFees = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/student-fees');
            setFees(response.data);
            setError(null);
        } catch (err) {
            setError('فشل في جلب البيانات من السيرفر.');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchStudentFees(); }, []);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'سند_قبض_رسوم',
    });

    const handlePreparePrint = (feeRow, paymentData) => {
        setPrintData({
            fee: {
                studentFullName: `${feeRow.student.firstName} ${feeRow.student.lastName}`,
                feeTypeName: feeRow.feeType?.feeName || "رسوم دراسية",
                academicYearName: feeRow.academicYear?.academicYearName
            },
            payment: {
                amount: paymentData.amount,
                createdAt: paymentData.paymentDate,
                receiptNumber: paymentData.receiptNumber || paymentData.id,
                notes: `طريقة الدفع: ${paymentData.paymentMethod || 'نقدي'}`
            }
        });

        setTimeout(() => {
            if (handlePrint) handlePrint();
        }, 400);
    };

    // دالة التعامل مع الضغط على زر كشف الحساب
    const handleStatementClick = async (fee) => {
        setSelectedFee(fee);
        try {
            const response = await axios.get(`http://localhost:8080/api/payments/student-fee/${fee.id}`);
            setStudentPayments(response.data);
        } catch (err) {
            console.error("خطأ في جلب مدفوعات كشف الحساب:", err);
            setStudentPayments([]);
        }
        setOpenStatementModal(true);
    };

    const getStatusColor = (status) => {
        if (status === 'PAID') return 'success';
        if (status === 'PARTIALLY_PAID') return 'info';
        return 'warning';
    };

    if (loading) return <Box sx={{ textAlign: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 2 }}>
            <Grid container justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1565c0' }}>سجل الرسوم والتوريدات</Typography>
                <Button variant="contained" color="success" onClick={() => setOpenAddFeeModal(true)}>إضافة رسوم جديدة</Button>
            </Grid>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell sx={{ fontWeight: 'bold' }}>اسم الطالب</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>السنة</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>الرسوم</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>المستحق</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>خصم</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>المدفوع</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>المتبقي</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">إجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fees.map((fee) => (
                            <Row 
                                key={fee.id} 
                                row={fee} 
                                onPaymentClick={(f) => { setSelectedFee(f); setOpenPaymentModal(true); }}
                                onStatementClick={handleStatementClick}
                                onPrintClick={handlePreparePrint}
                                getStatusColor={getStatusColor}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <div style={{ display: 'none' }}>
                {printData && (
                    <PaymentReceipt 
                        ref={componentRef} 
                        studentFee={printData.fee} 
                        paymentData={printData.payment} 
                    />
                )}
            </div>

            <AddStudentFeeModal open={openAddFeeModal} onClose={() => setOpenAddFeeModal(false)} onSuccess={fetchStudentFees} />
            
            {selectedFee && (
                <>
                    <FeePaymentModal 
                        open={openPaymentModal} 
                        onClose={() => setOpenPaymentModal(false)} 
                        studentFee={selectedFee} 
                        onPaymentAdded={fetchStudentFees} 
                    />

                    <StudentStatementModal 
                        open={openStatementModal}
                        onClose={() => setOpenStatementModal(false)}
                        studentFee={selectedFee}
                        payments={studentPayments}
                    />
                </>
            )}
        </Box>
    );
};

export default StudentFeeTable;