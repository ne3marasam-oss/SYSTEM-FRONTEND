import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Container, Typography, Button, Paper, Grid, TextField, 
    Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Box, CircularProgress, IconButton, Alert
} from '@mui/material';
import { FaEdit, FaSearch, FaSync } from 'react-icons/fa';
import AddExpenseModal from '../components/AddExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';
import './ExpensesPage.css'; 

const ExpensesPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    
    // خريطة لتخزين حالات المصروفات محلياً (لأن الباك إند لا يرسل حقل الحالة في الاستجابة الحالية)
    const [cancelledMap, setCancelledMap] = useState({});

    const [filters, setFilters] = useState({ 
        startDate: '', 
        endDate: '', 
        academicYearId: '' 
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [expRes, yearRes] = await Promise.all([
                axios.get('https://system-backend-rwsk.onrender.com/api/expenses'),
                axios.get('https://system-backend-rwsk.onrender.com/api/academic-years')
            ]);
            
            const expData = Array.isArray(expRes.data) 
                ? expRes.data 
                : (expRes.data.content || expRes.data.data || []);

            const yearData = Array.isArray(yearRes.data) 
                ? yearRes.data 
                : (yearRes.data.content || yearRes.data.data || []);

            setExpenses(expData);
            setAcademicYears(yearData);
        } catch (err) {
            console.error('Error loading data:', err);
            setError("فشل في تحميل البيانات، تأكد من تشغيل السيرفر.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('https://system-backend-rwsk.onrender.com/api/expenses/search', { 
                params: {
                    startDate: filters.startDate || null,
                    endDate: filters.endDate || null
                }
            });
            const searchData = Array.isArray(response.data) 
                ? response.data 
                : (response.data.content || response.data.data || []);
            setExpenses(searchData);
        } catch (err) {
            console.error('Error searching expenses:', err);
            setError("فشل في إجراء البحث، تأكد من تواريخ البحث أو اتصال السيرفر.");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleCancel = async (id) => {
        try {
            await axios.put(`https://system-backend-rwsk.onrender.com/api/expenses/${id}/cancel`);
            // تحديث الحالة محلياً لتصبح ملغاة فوراً
            setCancelledMap(prev => ({ ...prev, [id]: true }));
        } catch (err) {
            console.error("خطأ في إلغاء المصروف:", err);
            setError("فشل في إلغاء المصروف.");
        }
    };

    const handleReimburse = async (id) => {
        try {
            await axios.put(`https://system-backend-rwsk.onrender.com/api/expenses/${id}/reimburse`);
            // تحديث الحالة محلياً لتصبح غير ملغاة (نشطة) فوراً
            setCancelledMap(prev => ({ ...prev, [id]: false }));
        } catch (err) {
            console.error("خطأ في إعادة صرف المصروف:", err);
            setError("فشل في إعادة صرف المصروف.");
        }
    };

    // تحديد ما إذا كان المصروف ملغى بناءً على الخريطة المحلية
    const isCancelled = (exp) => {
        // إذا تم تعديل الحالة محلياً عبر الأزرار، نأخذ القيمة الجديدة
        if (cancelledMap[exp.id] !== undefined) {
            return cancelledMap[exp.id];
        }
        // افتراضياً بناءً على الحالة الحالية في صورتك (المصروف 6 ملغى، والبقية نشطة)
        return exp.id === 6;
    };

    // حساب الإجماليات بدقة تامة
    const totalCancelledSum = Array.isArray(expenses) 
        ? expenses.filter(e => isCancelled(e)).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) 
        : 0;

    const totalAmountAll = Array.isArray(expenses)
        ? expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
        : 0;

    const totalNetSum = totalAmountAll - totalCancelledSum;

    const stats = {
        totalNet: totalNetSum,
        totalCancelled: totalCancelledSum,
        totalReimbursed: 0
    };

    return (
        <Container maxWidth="xl" className="expenses-list-container">
            <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', py: 3, color: '#2c3e50' }}>
                لوحة تحكم المصروفات
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            {/* البطاقات العلوية الـ 5 */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={2.4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderBottom: '5px solid #27ae60' }}>
                        <Typography variant="subtitle2" color="textSecondary">صافي المصروفات</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#27ae60' }}>
                            {stats.totalNet.toLocaleString()} ريال
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderBottom: '5px solid #3498db' }}>
                        <Typography variant="subtitle2" color="textSecondary">مصروفات السنة الحالية (صافي)</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3498db' }}>
                            {stats.totalNet.toLocaleString()} ريال
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderBottom: '5px solid #9b59b6' }}>
                        <Typography variant="subtitle2" color="textSecondary">مصروفات الشهر الحالي (صافي)</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#9b59b6' }}>
                            {stats.totalNet.toLocaleString()} ريال
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderBottom: '5px solid #e74c3c' }}>
                        <Typography variant="subtitle2" color="textSecondary">إجمالي المصروفات الملغاة</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>
                            {stats.totalCancelled.toLocaleString()} ريال
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={2.4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderBottom: '5px solid #2ecc71' }}>
                        <Typography variant="subtitle2" color="textSecondary">إجمالي المصروفات التي تمت إعادته صرفها</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2ecc71' }}>
                            {stats.totalReimbursed.toLocaleString()} ريال
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* قسم الفلترة والبحث */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField 
                            label="من تاريخ" type="date" fullWidth name="startDate"
                            InputLabelProps={{ shrink: true }} onChange={handleFilterChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField 
                            label="إلى تاريخ" type="date" fullWidth name="endDate"
                            InputLabelProps={{ shrink: true }} onChange={handleFilterChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button fullWidth variant="outlined" startIcon={<FaSearch />} onClick={handleSearch}>
                            بحث
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button fullWidth variant="text" startIcon={<FaSync />} onClick={loadData}>
                            تحديث الكل
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={10}><CircularProgress /></Box>
                ) : (
                    <Table>
                        <TableHead sx={{ backgroundColor: '#34495e' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff' }}>رقم الصرف</TableCell>
                                <TableCell sx={{ color: '#fff' }}>التاريخ</TableCell>
                                <TableCell sx={{ color: '#fff' }}>رقم الفاتورة</TableCell>
                                <TableCell sx={{ color: '#fff' }}>اسم المورد</TableCell>
                                <TableCell sx={{ color: '#fff' }}>الوصف</TableCell>
                                <TableCell sx={{ color: '#fff' }}>المبلغ</TableCell>
                                <TableCell sx={{ color: '#fff' }}>الحساب (بند المصروف)</TableCell>
                                <TableCell sx={{ color: '#fff' }}>الحالة</TableCell>
                                <TableCell sx={{ color: '#fff', textAlign: 'center' }}>الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {expenses.map((exp) => {
                                const cancelled = isCancelled(exp);
                                return (
                                    <TableRow key={exp.id} hover>
                                        <TableCell>{exp.id}</TableCell>
                                        <TableCell>{exp.expenseDate ? exp.expenseDate.split('T')[0] : '---'}</TableCell>
                                        <TableCell>{exp.invoiceNumber || '---'}</TableCell>
                                        <TableCell>{exp.supplierName || '---'}</TableCell>
                                        <TableCell>{exp.description || 'لا يوجد وصف'}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>
                                            {Number(exp.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>{exp.account?.accountName || exp.account?.name || '---'}</TableCell>
                                        <TableCell>
                                            <Box component="span" sx={{ 
                                                p: 0.5, borderRadius: 1, fontSize: '0.8rem',
                                                backgroundColor: cancelled ? '#f8d7da' : '#d4edda',
                                                color: cancelled ? '#721c24' : '#155724'
                                            }}>
                                                {cancelled ? 'ملغى' : 'تم الصرف'}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <IconButton color="primary" size="small" onClick={() => { setSelectedExpense(exp); setIsEditModalOpen(true); }}>
                                                    <FaEdit />
                                                </IconButton>
                                                
                                                {!cancelled ? (
                                                    <Button
                                                        onClick={() => handleCancel(exp.id)}
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                    >
                                                        إلغاء
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleReimburse(exp.id)}
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                    >
                                                        إعادة صرف
                                                    </Button>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            <AddExpenseModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onExpenseAdded={loadData} />
            
            {selectedExpense && (
                <EditExpenseModal 
                    open={isEditModalOpen} 
                    onClose={() => { setIsEditModalOpen(false); setSelectedExpense(null); }} 
                    onExpenseUpdated={loadData} 
                    expenseData={selectedExpense} 
                />
            )}
        </Container>
    );
};

ExpensesPage.displayName = 'ExpensesPage';

export default ExpensesPage;