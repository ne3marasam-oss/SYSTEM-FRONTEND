// File: src/components/Transactions/InvoiceModal.js
import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    FormLabel
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const InvoiceModal = ({ onClose, onSave }) => {
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [description, setDescription] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(null);

    const handleSave = () => {
        const invoiceData = {
            invoiceNumber,
            description,
            invoiceDate: invoiceDate ? invoiceDate.toISOString() : null,
        };
        onSave(invoiceData);
    };

    return (
        <Modal open={true} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" gutterBottom>
                    بيانات الفاتورة
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="رقم الفاتورة"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <FormControl fullWidth>
                                <FormLabel id="invoice-date-label">تاريخ الفاتورة</FormLabel>
                                <DatePicker
                                    labelId="invoice-date-label"
                                    value={invoiceDate}
                                    onChange={(newValue) => {
                                        setInvoiceDate(newValue);
                                    }}
                                    renderInput={(params) => <TextField {...params} variant="outlined" />}
                                />
                            </FormControl>
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="وصف الفاتورة (اختياري)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            variant="outlined"
                            multiline
                            rows={3}
                        />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleSave}>
                            حفظ
                        </Button>
                        <Button variant="outlined" onClick={onClose}>
                            إلغاء
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};

export default InvoiceModal; // ✅ هذا السطر هو الذي كان مفقوداً