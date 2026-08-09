// File: src/components/Transactions/TransactionDashboard.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import TransactionTable from './TransactionTable';
import InvoiceModal from './InvoiceModal';
import {
    getAllTransactions,
    invoiceTransaction,
    voidTransaction,
    reEnterTransaction
} from '../../services/transactionService';

const TransactionDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        setPageError(null);
        try {
            const response = await getAllTransactions();
            setTransactions(response.data);
        } catch (err) {
            console.error('فشل في جلب الحركات:', err);
            setPageError('فشل في جلب الحركات: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleInvoice = async (invoiceData) => {
        // ✅ إضافة هذا الشرط للتأكد من وجود ID قبل الإرسال
        if (!selectedTransaction || !selectedTransaction.id) {
            setSnackbar({ open: true, message: 'خطأ: لم يتم تحديد حركة للفوترة.', severity: 'error' });
            return;
        }

        try {
            await invoiceTransaction(selectedTransaction.id, invoiceData);
            setSnackbar({ open: true, message: 'تمت فوترة الحركة بنجاح.', severity: 'success' });
            fetchTransactions();
        } catch (err) {
            console.error('فشل في فوترة الحركة:', err);
            setSnackbar({ open: true, message: 'فشل فوترة الحركة: ' + (err.response?.data?.message || err.message), severity: 'error' });
        } finally {
            setIsInvoiceModalOpen(false);
            setSelectedTransaction(null);
        }
    };

    const handleVoid = async (id) => {
        if (window.confirm('هل أنت متأكد أنك تريد إلغاء هذه الحركة؟')) {
            try {
                await voidTransaction(id);
                setSnackbar({ open: true, message: 'تم إلغاء الحركة بنجاح.', severity: 'success' });
                fetchTransactions();
            } catch (err) {
                console.error('فشل في إلغاء الحركة:', err);
                setSnackbar({ open: true, message: 'فشل في إلغاء الحركة: ' + (err.response?.data?.message || err.message), severity: 'error' });
            }
        }
    };

    const handleReEnter = async (id) => {
        if (window.confirm('هل أنت متأكد أنك تريد إعادة صرف هذه الحركة؟')) {
            try {
                await reEnterTransaction(id);
                setSnackbar({ open: true, message: 'تمت إعادة إدخال الحركة بنجاح.', severity: 'success' });
                fetchTransactions();
            } catch (err) {
                console.error('فشل في إعادة إدخال الحركة:', err);
                setSnackbar({ open: true, message: 'فشل في إعادة إدخال الحركة: ' + (err.response?.data?.message || err.message), severity: 'error' });
            }
        }
    };

    // ✅ هذه الدالة تقوم بحفظ كائن الحركة كاملاً
    const handleOpenInvoiceModal = (transaction) => {
        setSelectedTransaction(transaction);
        setIsInvoiceModalOpen(true);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return <Typography>جاري تحميل البيانات...</Typography>;
    }

    if (pageError) {
        return <Alert severity="error">{pageError}</Alert>;
    }

    return (
        <Box sx={{ p: 3, direction: 'rtl' }}>
            <Typography variant="h4" gutterBottom>
                لوحة تحكم الحركات المحاسبية
            </Typography>
            <TransactionTable
                transactions={transactions}
                onInvoice={handleOpenInvoiceModal}
                onVoid={handleVoid}
                onReEnter={handleReEnter}
            />
            {isInvoiceModalOpen && (
                <InvoiceModal
                    onClose={() => {
                        setIsInvoiceModalOpen(false);
                        setSelectedTransaction(null); // ✅ مهم: إعادة تعيين الحالة عند الإغلاق
                    }}
                    onSave={handleInvoice}
                />
            )}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TransactionDashboard;