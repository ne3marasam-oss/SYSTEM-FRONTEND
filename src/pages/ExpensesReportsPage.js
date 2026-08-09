// File: src/pages/ExpensesReportsPage.js

import React, { useState, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import PrintIcon from '@mui/icons-material/Print';
import ReactToPrint from 'react-to-print';
import ExpenseReportToPrint from '../components/ExpenseReportToPrint';

const ExpensesReportsPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const componentRef = useRef();

    const fetchExpensesReport = async () => {
        if (!startDate || !endDate || !dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
            setError('الرجاء تحديد تاريخ بداية ونهاية صحيحين.');
            setExpenses([]);
            return;
        }

        setError(null);
        setLoading(true);
        try {
            const formattedStartDate = dayjs(startDate).format('YYYY-MM-DD');
            const formattedEndDate = dayjs(endDate).format('YYYY-MM-DD');

            const response = await axios.get('https://system-backend-rwsk.onrender.com/api/expenses/report', {
                params: {
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                }
            });
            setExpenses(response.data);
        } catch (error) {
            console.error('Error fetching expenses report:', error);
            setError('حدث خطأ أثناء جلب التقرير. تأكد من أن التواريخ صحيحة وأن الخادم يعمل.');
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    return (
        <Box sx={{ p: 4, direction: 'rtl' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                تقارير المصروفات
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="تاريخ البداية"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="تاريخ النهاية"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={fetchExpensesReport}
                            disabled={loading || !startDate || !endDate}
                            fullWidth
                            sx={{ height: '56px' }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'عرض التقرير'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            )}

            {expenses.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                        <ReactToPrint
                            trigger={() => (
                                <Button variant="outlined" startIcon={<PrintIcon />}>
                                    طباعة التقرير
                                </Button>
                            )}
                            content={() => componentRef.current}
                            documentTitle={`تقرير المصروفات من ${dayjs(startDate).format('YYYY-MM-DD')} إلى ${dayjs(endDate).format('YYYY-MM-DD')}`}
                        />
                    </Box>
                    <div style={{ display: 'none' }}>
                        <ExpenseReportToPrint ref={componentRef} expenses={expenses} startDate={dayjs(startDate).format('YYYY-MM-DD')} endDate={dayjs(endDate).format('YYYY-MM-DD')} />
                    </div>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>التاريخ</TableCell>
                                    <TableCell>الوصف</TableCell>
                                    <TableCell>الفئة</TableCell>
                                    <TableCell align="right">المبلغ</TableCell>
                                    <TableCell>السنة الأكاديمية</TableCell>
                                    <TableCell>الحساب</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{dayjs(expense.expenseDate).format('YYYY-MM-DD HH:mm')}</TableCell>
                                        <TableCell>{expense.description}</TableCell>
                                        <TableCell>{expense.expenseCategory}</TableCell>
                                        <TableCell align="right">{parseFloat(expense.amount).toFixed(2)}</TableCell>
                                        <TableCell>{expense.academicYearName}</TableCell>
                                        <TableCell>{expense.accountName}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                                    <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>الإجمالي</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totalAmount.toFixed(2)}</TableCell>
                                    <TableCell colSpan={2}></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
};

export default ExpensesReportsPage;