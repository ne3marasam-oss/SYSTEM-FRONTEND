// src/components/StudentFeeModalForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// استيراد مكونات MUI
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const StudentFeeModalForm = ({ studentFee, students, feeTypes, academicYears, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        id: studentFee ? studentFee.id : null,
        studentId: studentFee ? studentFee.studentId : '',
        feeTypeId: studentFee ? studentFee.feeTypeId : '',
        academicYearId: studentFee ? studentFee.academicYearId : '',
        amountDue: studentFee ? studentFee.amountDue : '',
        dueDate: studentFee ? studentFee.dueDate : '',
        status: studentFee ? studentFee.status : 'PENDING',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false); // حالة جديدة للنافذة المنبثقة

    useEffect(() => {
        if (studentFee) {
            setFormData({
                id: studentFee.id,
                studentId: studentFee.studentId,
                feeTypeId: studentFee.feeTypeId,
                academicYearId: studentFee.academicYearId,
                amountDue: studentFee.amountDue,
                dueDate: studentFee.dueDate,
                status: studentFee.status,
            });
        } else {
            setFormData({
                id: null,
                studentId: '',
                feeTypeId: '',
                academicYearId: '',
                amountDue: '',
                dueDate: '',
                status: 'PENDING',
            });
        }
    }, [studentFee]);

    // جلب المبلغ المستحق تلقائياً عند اختيار نوع الرسوم
    useEffect(() => {
        if (formData.feeTypeId) {
            const selectedFeeType = feeTypes.find(ft => ft.id === formData.feeTypeId);
            if (selectedFeeType) {
                setFormData(prev => ({
                    ...prev,
                    amountDue: selectedFeeType.amount
                }));
            }
        }
    }, [formData.feeTypeId, feeTypes]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmation(true); // عرض نافذة التأكيد
    };

    const handleConfirmSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        setShowConfirmation(false);

        try {
            let response;
            const dataToSend = {
                ...formData,
                amountDue: parseFloat(formData.amountDue)
            };

            if (formData.id) {
                response = await axios.put(`http://localhost:8080/api/student-fees/${formData.id}`, dataToSend);
                setSuccessMessage('تم تحديث رسوم الطالب بنجاح!');
            } else {
                response = await axios.post('http://localhost:8080/api/student-fees', dataToSend);
                setSuccessMessage('تمت إضافة رسوم الطالب بنجاح!');
            }
            console.log('StudentFee saved/updated:', response.data);
            onSuccess();
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            console.error('Error saving student fee:', err);
            setError(`فشل الحفظ: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
    };

    const getStudentName = (id) => {
        const student = students.find(s => s.id === id);
        return student ? `${student.firstName} ${student.lastName}` : 'غير محدد';
    };

    // تم تصحيح الدالة
    const getFeeTypeName = (id) => {
        const feeType = feeTypes.find(ft => ft.id === id);
        return feeType ? feeType.feeName : 'غير محدد';
    };

    // تم تصحيح الدالة
    const getAcademicYearName = (id) => {
        const year = academicYears.find(ay => ay.id === id);
        return year ? year.yearName : 'غير محدد';
    };


    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 2, width: '100%' }, '& .MuiFormControl-root': { mb: 2, width: '100%' } }}>

            <FormControl fullWidth>
                <InputLabel id="student-select-label">الطالب</InputLabel>
                <Select
                    labelId="student-select-label"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    label="الطالب"
                    required
                >
                    <MenuItem value="">اختر طالب</MenuItem>
                    {Array.isArray(students) && students.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.firstName} {s.lastName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel id="fee-type-select-label">نوع الرسوم</InputLabel>
                <Select
                    labelId="fee-type-select-label"
                    id="feeTypeId"
                    name="feeTypeId"
                    value={formData.feeTypeId}
                    onChange={handleChange}
                    label="نوع الرسوم"
                    required
                >
                    <MenuItem value="">اختر نوع رسوم</MenuItem>
                    {Array.isArray(feeTypes) && feeTypes.map((ft) => (
                        <MenuItem key={ft.id} value={ft.id}>
                            {ft.feeName} ({ft.amount} {ft.academicYearName ? ` - ${ft.academicYearName}` : ''})
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel id="academic-year-select-label">السنة الأكاديمية</InputLabel>
                <Select
                    labelId="academic-year-select-label"
                    id="academicYearId"
                    name="academicYearId"
                    value={formData.academicYearId}
                    onChange={handleChange}
                    label="السنة الأكاديمية"
                    required
                >
                    <MenuItem value="">اختر سنة أكاديمية</MenuItem>
                    {Array.isArray(academicYears) && academicYears.map((ay) => (
                        <MenuItem key={ay.id} value={ay.id}>
                            {ay.yearName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="المبلغ المستحق"
                type="number"
                id="amountDue"
                name="amountDue"
                value={formData.amountDue}
                onChange={handleChange}
                required
                inputProps={{ step: "0.01", min: "0" }}
            />

            <TextField
                label="تاريخ الاستحقاق"
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate || ''}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
                <InputLabel id="status-select-label">الحالة</InputLabel>
                <Select
                    labelId="status-select-label"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="الحالة"
                    required
                >
                    <MenuItem value="PENDING">معلقة</MenuItem>
                    <MenuItem value="PAID">مدفوعة</MenuItem>
                    <MenuItem value="PARTIALLY_PAID">مدفوعة جزئياً</MenuItem>
                    <MenuItem value="OVERDUE">متأخرة</MenuItem>
                </Select>
            </FormControl>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button type="submit" variant="contained" disabled={loading} startIcon={loading && <CircularProgress size={20} color="inherit" />}>
                    {loading ? 'جاري الحفظ...' : (studentFee ? 'تحديث' : 'إضافة')}
                </Button>
                <Button type="button" variant="outlined" onClick={onClose} disabled={loading}>
                    إلغاء
                </Button>
            </Box>

            {/* نافذة التأكيد المنبثقة */}
            <Dialog open={showConfirmation} onClose={handleCancelConfirmation} fullWidth maxWidth="sm">
                <DialogTitle>
                    تأكيد بيانات رسوم الطالب
                    <IconButton
                        aria-label="close"
                        onClick={handleCancelConfirmation}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        هل أنت متأكد من حفظ البيانات التالية؟
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>الطالب:</strong> {getStudentName(formData.studentId)}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>نوع الرسوم:</strong> {getFeeTypeName(formData.feeTypeId)}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>السنة الأكاديمية:</strong> {getAcademicYearName(formData.academicYearId)}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>المبلغ المستحق:</strong> {formData.amountDue}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>تاريخ الاستحقاق:</strong> {formData.dueDate}</Typography>
                        <Typography variant="body2"><strong>الحالة:</strong> {formData.status}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelConfirmation} color="secondary" variant="outlined">
                        إلغاء
                    </Button>
                    <Button onClick={handleConfirmSubmit} color="primary" variant="contained" disabled={loading}>
                        تأكيد الحفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentFeeModalForm;