// File: src/components/ExpenseReportToPrint.js

import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import dayjs from 'dayjs';

const ExpenseReportToPrint = React.forwardRef(({ expenses, startDate, endDate }, ref) => {
    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    return (
        <Box ref={ref} sx={{ p: 4, direction: 'rtl', minWidth: '800px', fontFamily: 'Arial, sans-serif' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
                تقرير المصروفات
            </Typography>
            <Typography variant="h6" gutterBottom align="center">
                الفترة من **{startDate}** إلى **{endDate}**
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 3, border: '1px solid #ddd' }}>
                <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>التاريخ</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>الوصف</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>الفئة</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>المبلغ</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>السنة الأكاديمية</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>الحساب</TableCell>
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
            <Typography variant="body2" sx={{ mt: 4 }} align="center">
                شكراً لك.
            </Typography>
        </Box>
    );
});

export default ExpenseReportToPrint;