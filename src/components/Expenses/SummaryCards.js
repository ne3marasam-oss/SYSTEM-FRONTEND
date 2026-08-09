import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const SummaryCards = ({ expenses = [] }) => {
    // التأكد أن المتغير عبارة عن مصفوفة صالحة لمنع انهيار التطبيق
    const safeExpenses = Array.isArray(expenses) ? expenses : [];

    console.log("Expenses Data Received in Cards:", safeExpenses.map(e => ({ id: e.id, status: e.status })));

    // تصفية المصروفات بناءً على حالتها مع دعم القيم المختلفة
    const activeExpenses = safeExpenses.filter(expense => expense.status !== 'CANCELLED' && expense.status !== 'ملغى');
    const canceledExpenses = safeExpenses.filter(expense => expense.status === 'CANCELLED' || expense.status === 'ملغى');
    const reimbursedExpenses = safeExpenses.filter(expense => expense.status === 'تمت إعادة الصرف' || expense.status === 'REIMBURSED');

    // حساب إجمالي صافي المصروفات (بدون المصروفات الملغاة)
    const totalNetExpenses = activeExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    // حساب إجمالي المصروفات الملغاة
    const totalCanceledExpenses = canceledExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    // حساب إجمالي المصروفات التي تمت إعادة صرفها
    const totalReimbursedExpenses = reimbursedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    // الحصول على السنة والشهر الحاليين
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // حساب صافي مصروفات السنة الحالية
    const yearlyNetExpenses = activeExpenses
        .filter(expense => {
            if (!expense.expenseDate) return false;
            const dateStr = Array.isArray(expense.expenseDate) ? expense.expenseDate.join('-') : expense.expenseDate;
            const expenseDate = new Date(dateStr);
            return expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    // حساب صافي مصروفات الشهر الحالي
    const monthlyNetExpenses = activeExpenses
        .filter(expense => {
            if (!expense.expenseDate) return false;
            const dateStr = Array.isArray(expense.expenseDate) ? expense.expenseDate.join('-') : expense.expenseDate;
            const expenseDate = new Date(dateStr);
            return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth;
        })
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {/* بطاقة صافي المصروفات */}
            <Card sx={{ minWidth: 200, maxWidth: 220 }}>
                <CardContent>
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                        صافي المصروفات
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                        {totalNetExpenses.toFixed(2)}
                    </Typography>
                </CardContent>
            </Card>

            {/* بطاقة مصروفات السنة الحالية (صافي) */}
            <Card sx={{ minWidth: 200, maxWidth: 220 }}>
                <CardContent>
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                        مصروفات السنة الحالية (صافي)
                    </Typography>
                    <Typography variant="h5" color="secondary" sx={{ mt: 1 }}>
                        {yearlyNetExpenses.toFixed(2)}
                    </Typography>
                </CardContent>
            </Card>

            {/* بطاقة مصروفات الشهر الحالي (صافي) */}
            <Card sx={{ minWidth: 200, maxWidth: 220 }}>
                <CardContent>
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                        مصروفات الشهر الحالي (صافي)
                    </Typography>
                    <Typography variant="h5" color="error" sx={{ mt: 1 }}>
                        {monthlyNetExpenses.toFixed(2)}
                    </Typography>
                </CardContent>
            </Card>

            {/* بطاقة المصروفات الملغاة */}
            <Card sx={{ minWidth: 200, maxWidth: 220, bgcolor: '#ffcdd2' }}>
                <CardContent>
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                        إجمالي المصروفات الملغاة
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>
                        {totalCanceledExpenses.toFixed(2)}
                    </Typography>
                </CardContent>
            </Card>

            {/* بطاقة المصروفات التي تمت إعادة صرفها */}
  
        </Box>
    );
};

export default SummaryCards;