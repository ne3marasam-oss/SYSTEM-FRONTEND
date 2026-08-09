// src/components/PrintReceiptModal.js
import React, { useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableRow
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PrintReceiptModal = ({ open, onClose, studentFee }) => {
    const componentRef = useRef();

    const handlePrint = () => {
        const printContent = componentRef.current;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent.innerHTML;

        window.print();

        document.body.innerHTML = originalContents;

        window.location.reload();
    };

    if (!studentFee) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent ref={componentRef} sx={{ p: 4, direction: 'rtl' }}>
                {/* رأس الإيصال - Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <SchoolIcon sx={{ fontSize: 60, color: '#1976d2' }} />
                    <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                        إيصال دفع رسوم مدرسية
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        مدرسة المتميز النموذجية
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                </Box>

                {/* تفاصيل الطالب */}
                <Box mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#424242' }}>
                        بيانات الطالب
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={6}><Typography><strong>الاسم:</strong></Typography></Grid>
                        <Grid item xs={6}><Typography>{studentFee.studentFullName}</Typography></Grid>

                        <Grid item xs={6}><Typography><strong>السنة الأكاديمية:</strong></Typography></Grid>
                        <Grid item xs={6}><Typography>{studentFee.academicYearName}</Typography></Grid>
                    </Grid>
                </Box>

                {/* تفاصيل الدفع في جدول */}
                <Box mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#424242' }}>
                        تفاصيل الدفعة
                    </Typography>
                    <Table size="small">
                        <TableBody>

                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>رقم التوريد</TableCell>
                                <TableCell align="left">{studentFee.id}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>نوع الرسوم</TableCell>
                                <TableCell align="left">{studentFee.feeTypeName}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>المبلغ المستحق</TableCell>
                                <TableCell align="left">{studentFee.amountDue}ريال يمني</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>المبلغ المدفوع</TableCell>
                                <TableCell align="left">{studentFee.amountPaid}ريال يمني</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>المبلغ المتبقي</TableCell>
                                <TableCell align="left">{studentFee.remainingAmount}ريال يمني</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>تاريخ الاستحقاق</TableCell>
                                <TableCell align="left">{studentFee.dueDate}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                                <TableCell align="left">{studentFee.status}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>

                {/* تذييل الإيصال - Footer */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 40 }} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        تم دفع المبلغ بنجاح. شكرًا لك.
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                        تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={onClose} color="secondary" variant="outlined">إغلاق</Button>
                <Button
                    onClick={handlePrint}
                    color="primary"
                    variant="contained"
                    startIcon={<PrintIcon />}
                >
                    طباعة
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PrintReceiptModal;