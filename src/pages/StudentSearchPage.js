// src/pages/StudentSearchPage.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    TextField,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Link as MuiLink,
    CircularProgress,
    Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';

const StudentSearchPage = () => {
    const [query, setQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('https://system-backend-rwsk.onrender.com/api/students', {
                params: {
                    query,
                    grade: gradeFilter,
                    paymentStatus: paymentStatusFilter,
                },
            });
            setStudents(response.data);
        } catch (err) {
            setError('فشل جلب بيانات الطلاب. يرجى التأكد من تشغيل الخادم.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents(); // جلب البيانات عند تحميل الصفحة لأول مرة
    }, []);

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                استعلام الطلاب
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="البحث بالاسم أو رقم التسجيل"
                            variant="outlined"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>المرحلة الدراسية</InputLabel>
                            <Select
                                value={gradeFilter}
                                onChange={(e) => setGradeFilter(e.target.value)}
                                label="المرحلة الدراسية"
                            >
                                <MenuItem value="">الكل</MenuItem>
                                <MenuItem value="الابتدائية">الابتدائية</MenuItem>
                                <MenuItem value="الإعدادية">الإعدادية</MenuItem>
                                <MenuItem value="الثانوية">الثانوية</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>حالة الرسوم</InputLabel>
                            <Select
                                value={paymentStatusFilter}
                                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                label="حالة الرسوم"
                            >
                                <MenuItem value="">الكل</MenuItem>
                                <MenuItem value="مدفوع">مدفوع</MenuItem>
                                <MenuItem value="متبقي">متبقي</MenuItem>
                                <MenuItem value="لم يتم السداد">لم يتم السداد</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={fetchStudents}
                            startIcon={<FaSearch />}
                        >
                            بحث
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>الاسم</TableCell>
                                <TableCell>رقم التسجيل</TableCell>
                                <TableCell>المرحلة</TableCell>
                                <TableCell>الفصل</TableCell>
                                <TableCell>حالة الرسوم</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <MuiLink component={RouterLink} to={`/students/${student.id}`}>
                                                {student.firstName} {student.lastName}
                                            </MuiLink>
                                        </TableCell>
                                        <TableCell>{student.registrationNumber}</TableCell>
                                        <TableCell>{student.grade}</TableCell>
                                        <TableCell>{student.class}</TableCell>
                                        <TableCell>{student.paymentStatus}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        لا توجد نتائج مطابقة
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default StudentSearchPage;