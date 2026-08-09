import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import CancelIcon from '@mui/icons-material/Cancel';
import PrintIcon from '@mui/icons-material/Print';
import axios from 'axios';
import dayjs from 'dayjs';

const ExpenseTable = ({ expenses, onEdit, onDelete, onCancel, onReimburse }) => {
    // حالات خاصة بنافذة اختيار صندوق إعادة الصرف
    const [openReimburseDialog, setOpenReimburseDialog] = useState(false);
    const [selectedExpenseId, setSelectedExpenseId] = useState(null);
    const [paymentAccounts, setPaymentAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    
    // حالة بيانات المدرسة
    const [schoolInfo, setSchoolInfo] = useState({ name: 'اسم المدرسة', logo: '' });

    // جلب الحسابات النقدية وبيانات المدرسة عند تحميل المكون
    useEffect(() => {
        const fetchData = async () => {
            try {
                // جلب الحسابات
                const accRes = await axios.get('https://system-backend-rwsk.onrender.com/api/accounts/cash-accounts');
                const rawCashList = accRes.data || [];
                setPaymentAccounts(rawCashList.map(acc => ({ ...acc, accountName: acc.accountName || acc.name })));
                if (rawCashList.length > 0) setSelectedAccountId(rawCashList[0].id);

                // جلب بيانات المدرسة
                const schoolRes = await axios.get('https://system-backend-rwsk.onrender.com/api/schools');
                if (schoolRes.data) {
                    const data = schoolRes.data;
                    const name = data.schoolName || data.name || data.arabicName || 'اسم المدرسة';
                    let logo = data.logoUrl || data.logo || data.schoolLogo || '';
                    if (logo && !logo.startsWith('http')) {
                        logo = `https://system-backend-rwsk.onrender.com${logo.startsWith('/') ? '' : '/'}${logo}`;
                    }
                    setSchoolInfo({ name, logo });
                }
            } catch (err) {
                console.error("خطأ في جلب البيانات:", err);
            }
        };
        fetchData();
    }, []);

    const handleOpenReimburse = (id) => {
        setSelectedExpenseId(id);
        setOpenReimburseDialog(true);
    };

    const handleConfirmReimburse = () => {
        if (onReimburse && selectedExpenseId) {
            onReimburse(selectedExpenseId, selectedAccountId);
        }
        setOpenReimburseDialog(false);
        setSelectedExpenseId(null);
    };

    const handlePrintExpense = async (expense) => {
        let currentSchoolName = schoolInfo.name;
        let currentLogo = schoolInfo.logo;

        // جلب بيانات المدرسة مباشرة عند الضغط على الطباعة لضمان عدم ظهور القيم الافتراضية
        try {
            const schoolRes = await axios.get('https://system-backend-rwsk.onrender.com/api/schools');
            if (schoolRes.data) {
                const schoolData = Array.isArray(schoolRes.data) ? schoolRes.data[0] : schoolRes.data;
                if (schoolData) {
                    currentSchoolName = schoolData.name || currentSchoolName;
                    let logoPath = schoolData.logoUrl || '';
                    if (logoPath) {
                        currentLogo = logoPath.startsWith('http') || logoPath.startsWith('data:') 
                            ? logoPath 
                            : `https://system-backend-rwsk.onrender.com${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
                    }
                }
            }
        } catch (e) {
            console.error("تعذر تحديث بيانات المدرسة لحظة الطباعة", e);
        }

        const formattedDate = Array.isArray(expense.expenseDate) 
            ? `${expense.expenseDate[0]}-${String(expense.expenseDate[1]).padStart(2, '0')}-${String(expense.expenseDate[2]).padStart(2, '0')}`
            : (expense.expenseDate ? expense.expenseDate.split('T')[0] : '-');

        const isCancelled = expense.status === 'CANCELLED' || expense.status === 'ملغى';

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html dir="rtl">
                <head>
                    <title>سند صرف رقم ${expense.id}</title>
                    <style>
                        body { font-family: 'Cairo', Tahoma, sans-serif; padding: 30px; color: #333; background-color: #fff; }
                        .print-container { max-width: 800px; margin: auto; border: 1px solid #c8e6c9; padding: 25px; border-radius: 8px; }
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2e7d32; padding-bottom: 15px; margin-bottom: 25px; }
                        .school-name { font-size: 20px; font-weight: bold; color: #2e7d32; }
                        .school-logo { max-height: 70px; max-width: 70px; object-fit: contain; }
                        .title-box { text-align: center; background-color: #e8f5e9; padding: 12px; border-radius: 6px; border: 1px dashed #2e7d32; margin-bottom: 25px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th, td { border: 1px solid #c8e6c9; padding: 12px; font-size: 14px; text-align: right; }
                        td:first-child { background-color: #f1f8e9; font-weight: bold; width: 30%; color: #1b5e20; }
                        .amount { color: #2e7d32; font-weight: bold; font-size: 16px; }
                        .signatures { display: flex; justify-content: space-between; margin-top: 60px; text-align: center; }
                        .sig-box { width: 40%; }
                        .sig-line { border-bottom: 1px dotted #2e7d32; width: 70%; margin: 40px auto 0 auto; }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <div class="header">
                            <div>
                                <div class="school-name">${currentSchoolName}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">النظام المالي والمحاسبي</div>
                            </div>
                            ${currentLogo ? `<img src="${currentLogo}" class="school-logo" alt="شعار المدرسة" onerror="this.style.display='none'" />` : ''}
                        </div>

                        <div class="title-box">
                            <h3 style="margin: 0; color: #2e7d32; font-size: 18px;">سند صرف مصروف</h3>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #555;">رقم السند: #${expense.id} &nbsp;|&nbsp; التاريخ: ${formattedDate}</p>
                        </div>

                        <table>
                            <tr>
                                <td>رقم الفاتورة</td>
                                <td>${expense.invoiceNumber || '---'}</td>
                            </tr>
                            <tr>
                                <td>اسم المورد / الجهة</td>
                                <td>${expense.vendorName || '---'}</td>
                            </tr>
                            <tr>
                                <td>بند المصروف (الحساب)</td>
                                <td>${expense.account?.accountName || expense.account?.name || '---'}</td>
                            </tr>
                            <tr>
                                <td>الوصف / البيان</td>
                                <td>${expense.description || 'لا يوجد وصف'}</td>
                            </tr>
                            <tr>
                                <td>المبلغ الصافي</td>
                                <td class="amount">${Number(expense.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</td>
                            </tr>
                            <tr>
                                <td>الحالة</td>
                                <td style="color: ${isCancelled ? '#d32f2f' : '#2e7d32'}; font-weight: bold;">
                                    ${isCancelled ? 'ملغى' : 'تم الصرف'}
                                </td>
                            </tr>
                        </table>

                        <div class="signatures">
                            <div class="sig-box">
                                <strong style="font-size: 14px; color: #2e7d32;">توقيع المحاسب</strong>
                                <div class="sig-line"></div>
                            </div>
                            <div class="sig-box">
                                <strong style="font-size: 14px; color: #2e7d32;">الاعتماد والإدارة</strong>
                                <div class="sig-line"></div>
                            </div>
                        </div>
                    </div>

                    <script>
                        window.onload = function() { 
                            window.print(); 
                            window.close(); 
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const formatDate = (dateData) => {
        if (!dateData) return '-';
        if (Array.isArray(dateData)) return `${dateData[0]}-${String(dateData[1]).padStart(2, '0')}-${String(dateData[2]).padStart(2, '0')}`;
        return typeof dateData === 'string' ? dateData.split('T')[0] : String(dateData);
    };

    return (
        <>
            <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>رقم الصرف</TableCell>
                            <TableCell>التاريخ</TableCell>
                            <TableCell>رقم الفاتورة</TableCell>
                            <TableCell>اسم المورد</TableCell>
                            <TableCell>الوصف</TableCell>
                            <TableCell align="right">المبلغ</TableCell>
                            <TableCell>الحساب</TableCell>
                            <TableCell>الحالة</TableCell>
                            <TableCell align="center">الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expenses.map((expense) => {
                            const isCancelled = expense.status === 'CANCELLED' || expense.status === 'ملغى';
                            return (
                                <TableRow key={expense.id} hover>
                                    <TableCell>{expense.id}</TableCell>
                                    <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                                    <TableCell>{expense.invoiceNumber || '-'}</TableCell>
                                    <TableCell>{expense.vendorName || '-'}</TableCell>
                                    <TableCell>{expense.description || 'لا يوجد وصف'}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{Number(expense.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>{expense.account?.accountName || expense.account?.name || 'غير محدد'}</TableCell>
                                    <TableCell sx={{ color: isCancelled ? 'error.main' : 'success.main', fontWeight: 'medium' }}>
                                        {isCancelled ? 'ملغى' : 'تم الصرف'}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Button onClick={() => handlePrintExpense(expense)} size="small" color="success" variant="outlined" startIcon={<PrintIcon />}>طباعة</Button>
                                            {!isCancelled ? (
                                                <Button onClick={() => onCancel(expense.id)} size="small" color="error" variant="outlined" startIcon={<CancelIcon />}>إلغاء</Button>
                                            ) : (
                                                <Button onClick={() => handleOpenReimburse(expense.id)} size="small" color="success" variant="outlined" startIcon={<UndoIcon />}>إعادة صرف</Button>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openReimburseDialog} onClose={() => setOpenReimburseDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>اختر حساب الدفع</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>صندوق الصرف</InputLabel>
                        <Select value={selectedAccountId} label="صندوق الصرف" onChange={(e) => setSelectedAccountId(e.target.value)}>
                            {paymentAccounts.map((acc) => (
                                <MenuItem key={acc.id} value={acc.id}>{acc.accountCode} - {acc.accountName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenReimburseDialog(false)}>إلغاء</Button>
                    <Button onClick={handleConfirmReimburse} variant="contained" color="success">تأكيد وإعادة الصرف</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ExpenseTable;