import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Box, Typography, Paper, Autocomplete,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Grid, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import { AttachMoney, Search, Paid, MoneyOff, Delete } from '@mui/icons-material';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import './SalaryAdvanceForm.css';

const SalaryAdvance = () => {
  const [employee, setEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [advanceDate, setAdvanceDate] = useState(dayjs());
  const [deductionMonth, setDeductionMonth] = useState(dayjs());
  const [salaryAdvances, setSalaryAdvances] = useState([]);

  const [currentDeductions, setCurrentDeductions] = useState(0);
  const [netSalary, setNetSalary] = useState(0);

  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState(null);

  const fetchInitialData = async () => {
    try {
      const [empRes, advRes] = await Promise.all([
        axios.get('http://localhost:8080/api/employees'),
        axios.get('http://localhost:8080/api/salary-advances')
      ]);
      setEmployees(empRes.data);
      setSalaryAdvances(advRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (employee) {
      const month = deductionMonth.month() + 1;
      const year = deductionMonth.year();
      const filtered = salaryAdvances.filter(adv => 
        adv.employeeId === employee.id && 
        adv.deductionMonth === month && 
        adv.deductionYear === year
      );
      const total = filtered.reduce((sum, item) => sum + item.amount, 0);
      setCurrentDeductions(total);
      const inputAmount = parseFloat(amount) || 0;
      setNetSalary((employee.basicSalary || 0) - total - inputAmount);
    }
  }, [employee, deductionMonth, salaryAdvances, amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee) return;

    const payload = {
      employeeId: employee.id,
      amount: parseFloat(amount),
      description: description,
      advanceDate: advanceDate.format('YYYY-MM-DD'),
      deductionMonth: parseInt(deductionMonth.month() + 1),
      deductionYear: parseInt(deductionMonth.year())
    };

    try {
      const response = await axios.post('http://localhost:8080/api/salary-advances', payload);
      
      if (response.status === 201 || response.status === 200) {
        setMessage('تم تسجيل السلفة بنجاح!');
        setAmount('');
        setDescription('');
        fetchInitialData(); 
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message || 'فشل تسجيل السلفة. تأكد من البيانات.';
      setMessage(serverMessage);
      console.error("Server Error Details:", error.response?.data);
    }
  };

  // دالة الحذف المُحدثة لتتوافق مع بيانات السيرفر الحالية
  const handleDeleteAdvance = async (fullAdvObj) => {
    // البحث عن أي حقل معرف محتمل أو استخدام التاريخ ووقت الإنشاء كمعرف مؤقت إذا لم يوجد id
    const targetId = fullAdvObj.id || fullAdvObj.advanceId || fullAdvObj.createdAt;

    if (!targetId) {
      alert('خطأ: لا يمكن تحديد السلفة المراد حذفها.');
      return;
    }

    if (window.confirm('هل أنت متأكد من إلغاء هذه السلفة وعمل قيد عكسي لتسويتها محاسبياً؟')) {
      try {
        // إذا كان الباك إند يتطلب ID حقيقي، يجب إضافته في الـ Backend Entity
        // هنا نقوم بإرسال الـ id أو الـ createdAt كبديل مؤقت إذا قبله السيرفر، أو تعديل الـ API endpoint
        await axios.delete(`http://localhost:8080/api/salary-advances/${targetId}`);
        
        setSalaryAdvances(prev => prev.filter(adv => (adv.id || adv.advanceId || adv.createdAt) !== targetId));
        setMessage('تم إلغاء السلفة وعمل القيد العكسي بنجاح!');
      } catch (error) {
        console.error('Error deleting advance:', error);
        const serverMessage = error.response?.data?.message || error.message || 'خطأ غير معروف من الخادم';
        alert(`فشل في إلغاء السلفة: تأكد من أن الـ Backend يدعم استقبال معرف الحذف. التفاصيل: ${serverMessage}`);
      }
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.fullName : '...';
  };

  const filteredAdvances = salaryAdvances.filter(adv => {
    const nameMatch = getEmployeeName(adv.employeeId).toLowerCase().includes(searchName.toLowerCase());
    const dateMatch = searchDate ? dayjs(adv.advanceDate).isSame(searchDate, 'day') : true;
    return nameMatch && dateMatch;
  });

  return (
    <Box className="advance-container" sx={{ p: 4 }}>
      <Typography variant="h3" align="center" sx={{ color: '#1a237e', mb: 4, fontFamily: 'Cairo', fontWeight: 'bold' }}>
        نظام إدارة السلف
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }} className="advance-paper">
            <Typography variant="h5" sx={{ color: '#1a237e', mb: 3, fontWeight: 'bold' }}>تسجيل سلفة للموظف</Typography>
            <form onSubmit={handleSubmit}>
              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.fullName || ""}
                value={employee}
                onChange={(e, val) => setEmployee(val)}
                renderInput={(params) => <TextField {...params} label="بحث عن موظف بالاسم *" required fullWidth margin="normal" />}
              />

              {employee && (
                <Grid container spacing={2} sx={{ my: 2 }}>
                  <Grid item xs={4}>
                    <TextField label="الراتب الأساسي" value={employee.basicSalary} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">ر.س</InputAdornment> }} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField label="إجمالي الخصومات" value={currentDeductions} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">ر.س</InputAdornment> }} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField label="صافي الراتب" value={netSalary} fullWidth InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">ر.س</InputAdornment> }} />
                  </Grid>
                </Grid>
              )}

              <TextField 
                label="مبلغ السلفة *" 
                type="number" 
                fullWidth 
                margin="normal" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
              />

              <TextField 
                label="وصف السلفة" 
                fullWidth 
                margin="normal" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                InputLabelProps={{ shrink: true }}
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <DatePicker label="تاريخ السلفة" value={advanceDate} onChange={setAdvanceDate} slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <DatePicker label="شهر الخصم" views={['year', 'month']} value={deductionMonth} onChange={setDeductionMonth} slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                </Grid>
              </LocalizationProvider>

              <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, py: 1.5, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}>
                تسجيل السلفة
              </Button>
              {message && <Typography sx={{ mt: 2, textAlign: 'center', color: message.includes('بنجاح') ? 'green' : 'red' }}>{message}</Typography>}
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" sx={{ color: '#1a237e', mb: 3, fontWeight: 'bold' }}>سجلات السلف</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField label="بحث بالاسم" fullWidth size="small" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                 <DatePicker label="تاريخ السلفة" value={searchDate} onChange={searchDate => setSearchDate(searchDate)} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#1a237e', color: 'white' }}>الاسم</TableCell>
                    <TableCell sx={{ bgcolor: '#1a237e', color: 'white' }}>المبلغ</TableCell>
                    <TableCell sx={{ bgcolor: '#1a237e', color: 'white' }}>التاريخ</TableCell>
                    <TableCell sx={{ bgcolor: '#1a237e', color: 'white' }}>الشهر</TableCell>
                    <TableCell sx={{ bgcolor: '#1a237e', color: 'white', textAlign: 'center' }}>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAdvances.map((adv, index) => {
                    const rowKey = adv.id || adv.advanceId || adv.createdAt || index;
                    
                    return (
                      <TableRow key={rowKey} hover>
                        <TableCell>{getEmployeeName(adv.employeeId)}</TableCell>
                        <TableCell>{adv.amount} ر.س</TableCell>
                        <TableCell>{adv.advanceDate ? dayjs(adv.advanceDate).format('YYYY-MM-DD') : '-'}</TableCell>
                        <TableCell>{adv.deductionMonth}/{adv.deductionYear}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="إلغاء وحذف السلفة">
                            <IconButton 
                              color="error" 
                              size="small" 
                              onClick={() => handleDeleteAdvance(adv)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalaryAdvance;