import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GeneralLedgerPage.css';

import {
    Container, Typography, Box, Grid, Card, CardContent, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

// استيراد أيقونات Material Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HandshakeIcon from '@mui/icons-material/Handshake';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import EquityIcon from '@mui/icons-material/AccountBalance';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const getAccountIcon = (accountType) => {
    switch (accountType) {
        case 'الأصول': return <AccountBalanceWalletIcon />;
        case 'الخصوم': return <HandshakeIcon />;
        case 'الإيرادات': return <MonetizationOnIcon />;
        case 'المصروفات': return <PaymentIcon />;
        case 'حقوق الملكية': return <EquityIcon />;
        default: return <MoreHorizIcon />;
    }
};

const GeneralLedgerPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [selectedAccountName, setSelectedAccountName] = useState('');
    const [ledgerEntries, setLedgerEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialBalance, setInitialBalance] = useState(0);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await axios.get('https://system-backend-rwsk.onrender.com/api/accounts');
                setAccounts(response.data);
            } catch (err) {
                console.error("Failed to fetch accounts:", err);
                setError("فشل في تحميل الحسابات.");
            }
        };
        fetchAccounts();
    }, []);

   const fetchGeneralLedger = async (accountId, accountName) => {
    setLoading(true);
    setError(null);
    setSelectedAccountId(accountId);
    setSelectedAccountName(accountName);
    setLedgerEntries([]);
    setInitialBalance(0);

    try {
        const response = await axios.get(`https://system-backend-rwsk.onrender.com/api/journal-entries/account/${accountId}`);
        
        // التحقق من أن البيانات مصفوفة وليست فارغة
        const data = Array.isArray(response.data) ? response.data : [];
        setLedgerEntries(data);

        if (data.length > 0) {
            const firstEntry = data[0];
            // تأكد من تحويل القيم إلى أرقام لتجنب أخطاء الحساب
            const balance = Number(firstEntry.balance || 0);
            const debit = Number(firstEntry.debit || 0);
            const credit = Number(firstEntry.credit || 0);
            
            setInitialBalance(balance - debit + credit);
        }
    } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
        // عرض تفاصيل الخطأ القادمة من السيرفر إن وجدت
        const errorMessage = err.response?.data?.message || "فشل في تحميل دفتر الأستاذ لهذا الحساب.";
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
};

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, color: '#3f51b5' }}>
                دفتر الأستاذ العام
            </Typography>

            <Box sx={{ flexGrow: 1, mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                    اختر حسابًا لعرض تفاصيله
                </Typography>
                <Grid container spacing={2}>
                    {accounts.map((account) => (
                        <Grid item xs={12} sm={6} md={3} key={account.id}>
                            <Card
                                onClick={() => fetchGeneralLedger(account.id, account.accountName)}
                                sx={{
                                    cursor: 'pointer',
                                    border: selectedAccountId === account.id ? '2px solid #3f51b5' : '1px solid #e0e0e0',
                                    boxShadow: selectedAccountId === account.id ? '0 4px 8px rgba(63, 81, 181, 0.2)' : 'none',
                                    transition: '0.3s',
                                    '&:hover': { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Box sx={{ color: '#3f51b5', mb: 1 }}>
                                        {getAccountIcon(account.accountType)}
                                    </Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {account.accountName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {account.accountCode} - {account.accountType}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {selectedAccountId && (
                <Box sx={{ mt: 5 }}>
                    <Typography variant="h5" gutterBottom>
                        دفتر الأستاذ: {selectedAccountName}
                    </Typography>

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
                    )}

                    {!loading && ledgerEntries.length > 0 && (
                        <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell>التاريخ</TableCell>
                                        <TableCell>البيان</TableCell>
                                        <TableCell>الحساب المقابل</TableCell>
                                        <TableCell align="right">مدين</TableCell>
                                        <TableCell align="right">دائن</TableCell>
                                        <TableCell align="right">الرصيد</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/* الرصيد الافتتاحي */}
                                    <TableRow sx={{ '& td': { fontWeight: 'bold', color: 'primary.main' } }}>
                                        <TableCell>...</TableCell>
                                        <TableCell>الرصيد الافتتاحي</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell align="right">-</TableCell>
                                        <TableCell align="right">-</TableCell>
                                        <TableCell align="right">{initialBalance.toLocaleString('ar-EG')}</TableCell>
                                    </TableRow>

                                    {/* قيود دفتر الأستاذ */}
                                    {ledgerEntries.map((entry, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>
                                                {/* ✅ استخدام entryDate من الـ DTO الجديد */}
                                                {entry.entryDate ? new Date(entry.entryDate).toLocaleDateString('ar-EG') : '---'}
                                            </TableCell>
                                            <TableCell>{entry.description}</TableCell>
                                            {/* ✅ عرض الحساب المقابل */}
                                            <TableCell>{entry.oppositeAccountName || '---'}</TableCell>
                                            <TableCell align="right" sx={{ color: entry.debit > 0 ? 'green' : 'inherit' }}>
                                                {entry.debit > 0 ? entry.debit.toLocaleString('ar-EG') : '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: entry.credit > 0 ? 'red' : 'inherit' }}>
                                                {entry.credit > 0 ? entry.credit.toLocaleString('ar-EG') : '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {entry.balance.toLocaleString('ar-EG')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {!loading && !error && ledgerEntries.length === 0 && (
                        <Alert severity="info" sx={{ mt: 3 }}>لا توجد قيود لهذا الحساب.</Alert>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default GeneralLedgerPage;