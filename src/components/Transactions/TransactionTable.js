// File: src/components/Transactions/TransactionTable.js
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    ButtonGroup
} from '@mui/material';

const TransactionTable = ({ transactions, onInvoice, onVoid, onReEnter }) => {
    return (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>المبلغ</TableCell>
                        <TableCell>التاريخ</TableCell>
                        <TableCell>الوصف</TableCell>
                        <TableCell>الحالة</TableCell>
                        <TableCell>رقم الفاتورة</TableCell>
                        <TableCell>السنة الأكاديمية</TableCell>
                        <TableCell>الحساب المدين</TableCell>
                        <TableCell>الحساب الدائن</TableCell>
                        <TableCell align="right">الإجراءات</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>{transaction.id}</TableCell>
                            <TableCell>{transaction.amount}</TableCell>
                            <TableCell>{new Date(transaction.transactionDate).toLocaleDateString()}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.status}</TableCell>
                            <TableCell>{transaction.invoiceNumber || '-'}</TableCell>
                            <TableCell>{transaction.academicYearName || '-'}</TableCell>
                            <TableCell>{transaction.debitAccountName || '-'}</TableCell>
                            <TableCell>{transaction.creditAccountName || '-'}</TableCell>
                            <TableCell align="right">
                                <ButtonGroup variant="contained" aria-label="transaction actions button group">
                                    {transaction.status === 'تحت الفوترة' && (
                                        <Button
                                            color="primary"
                                            onClick={() => onInvoice(transaction)} // ✅ هنا يتم تمرير الكائن بالكامل
                                        >
                                            فوترة
                                        </Button>
                                    )}
                                    {transaction.status === 'تمت الفوترة' && (
                                        <Button
                                            color="error"
                                            onClick={() => onVoid(transaction.id)}
                                        >
                                            إلغاء
                                        </Button>
                                    )}
                                    {transaction.status === 'ملغى' && (
                                        <Button
                                            color="success"
                                            onClick={() => onReEnter(transaction.id)}
                                        >
                                            إعادة صرف
                                        </Button>
                                    )}
                                </ButtonGroup>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TransactionTable;