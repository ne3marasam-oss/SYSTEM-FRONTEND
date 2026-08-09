// src/pages/StudentDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import { FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';

const StudentDetailPage = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // جلب بيانات الطالب
                const studentResponse = await axios.get(`http://localhost:8080/api/students/${id}`);
                setStudent(studentResponse.data);

                // جلب بيانات الرسوم للطالب
                const feesResponse = await axios.get(`http://localhost:8080/api/student-fees/student/${id}`);
                setFees(feesResponse.data);

            } catch (err) {
                setError('فشل جلب بيانات الطالب أو الرسوم.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAddPayment = () => {
        // سيتم إضافة منطق لإضافة دفعة جديدة هنا
        // يمكنك فتح نافذة منبثقة (Modal) لإدخال بيانات الدفعة
        alert('سوف يتم فتح نافذة لإضافة دفعة جديدة');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 10 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!student) {
        return <Alert severity="info">لا يوجد بيانات لهذا الطالب.</Alert>;
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                بيانات الطالب: {student.firstName} {student.lastName}
            </Typography>

            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="div" gutterBottom>
                                المعلومات الأساسية
                            </Typography>
                            <Typography variant="body1">
                                **رقم التسجيل:** {student.registrationNumber}
                            </Typography>
                            <Typography variant="body1">
                                **المرحلة:** {student.grade}
                            </Typography>
                            <Typography variant="body1">
                                **الفصل:** {student.class}
                            </Typography>
                            <Typography variant="body1">
                                **حالة الرسوم:** {student.paymentStatus}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="div" gutterBottom>
                                الرسوم المتبقية
                            </Typography>
                            <Typography variant="h3" color="error" sx={{ textAlign: 'center' }}>
                                {student.balance}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handleAddPayment}
                                startIcon={<FaMoneyBillWave />}
                                sx={{ mt: 2 }}
                            >
                                سداد الرسوم
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom>
                سجل الدفعات
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>تاريخ الدفعة</TableCell>
                            <TableCell>المبلغ</TableCell>
                            <TableCell>طريقة الدفع</TableCell>
                            <TableCell>ملاحظات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fees.length > 0 ? (
                            fees.map((fee) => (
                                <TableRow key={fee.id}>
                                    <TableCell>{fee.paymentDate}</TableCell>
                                    <TableCell>{fee.amount}</TableCell>
                                    <TableCell>{fee.paymentMethod}</TableCell>
                                    <TableCell>{fee.notes}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    لا يوجد سجل دفعات لهذا الطالب.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StudentDetailPage;