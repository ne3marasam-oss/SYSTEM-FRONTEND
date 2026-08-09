// src/components/EditExpenseModal.js

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Box, Alert, Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Grid
} from '@mui/material';
import axios from 'axios';

const EditExpenseModal = ({ open, onClose, onExpenseUpdated, expenseData }) => {
    const [editedData, setEditedData] = useState(expenseData);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // تحديث الحالة عند تغيير المصروف المحدد
    useEffect(() => {
        if (expenseData) {
            setEditedData({
                ...expenseData,
                // تنسيق التاريخ ليتناسب مع حقل الإدخال من نوع date
                expenseDate: new Date(expenseData.expenseDate[0], expenseData.expenseDate[1] - 1, expenseData.expenseDate[2]).toISOString().slice(0, 10)
            });
        }
    }, [expenseData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateExpense = async () => {
        setLoading(true);
        setError(null);

        if (!editedData.amount || !editedData.expenseCategory || !editedData.academicYearId || !editedData.accountId) {
            setError('يرجى ملء جميع الحقول الإلزامية.');
            setLoading(false);
            return;
        }

        try {
            // تنسيق التاريخ قبل الإرسال
            const formattedExpenseData = {
                ...editedData,
                expenseDate: `${editedData.expenseDate}T00:00:00`
            };

            await axios.put(`http://localhost:8080/api/expenses/${editedData.id}`, formattedExpenseData);

            onExpenseUpdated();
            handleClose();
        } catch (err) {
            console.error('Error updating expense:', err.response || err);
            setError('فشل في تحديث المصروف. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>تعديل المصروف</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            margin="dense"
                            name="amount"
                            label="المبلغ *"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={editedData.amount}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            margin="dense"
                            name="expenseDate"
                            label="تاريخ المصروف"
                            type="date"
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            value={editedData.expenseDate}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            margin="dense"
                            name="invoiceNumber"
                            label="رقم الفاتورة"
                            fullWidth
                            variant="outlined"
                            value={editedData.invoiceNumber || ''}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            margin="dense"
                            name="vendorName"
                            label="اسم المورد"
                            fullWidth
                            variant="outlined"
                            value={editedData.vendorName || ''}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="dense"
                            name="description"
                            label="الوصف"
                            type="text"
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={3}
                            value={editedData.description || ''}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary" variant="outlined">إلغاء</Button>
                <Button onClick={handleUpdateExpense} color="primary" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'تحديث المصروف'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditExpenseModal;