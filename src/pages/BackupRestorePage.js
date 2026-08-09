import React, { useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent, Button, CircularProgress, Alert,
    TextField, LinearProgress, IconButton, Paper, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { styled, darken } from '@mui/material/styles';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

// Custom styles for better visual appeal
const StyledButton = styled(Button)(({ theme, bgcolor }) => ({
    backgroundColor: bgcolor,
    color: theme.palette.common.white,
    '&:hover': {
        backgroundColor: darken(bgcolor, 0.2),
    },
    padding: theme.spacing(1.5),
    fontWeight: 'bold',
    borderRadius: theme.spacing(1),
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
}));

const StyledCard = styled(Card)(({ theme }) => ({
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(2),
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)'
    }
}));

const App = () => {
    // 1. الحالات (State)
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // 2. الدوال (Functions)
    const handleBackup = async () => {
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const url = new URL('http://localhost:8080/api/backup/create');
            if (folderName) {
                url.searchParams.append('folderName', folderName);
            }
            const response = await fetch(url, { method: 'POST' });
            if (!response.ok) {
                throw new Error('فشل في الاتصال بالخادم أو إنشاء النسخة الاحتياطية.');
            }
            const data = await response.text();
            setMessage('تم النسخ الاحتياطي بنجاح: ' + data);
        } catch (err) {
            console.error("Backup failed:", err);
            setError('فشل النسخ الاحتياطي: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleRestore = async () => {
        if (!selectedFile) {
            setError('يرجى اختيار ملف نسخة احتياطية أولاً.');
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const response = await fetch('http://localhost:8080/api/backup/restore', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('فشل في الاتصال بالخادم أو استعادة البيانات.');
            }
            const data = await response.text();
            setMessage('تمت استعادة البيانات بنجاح: ' + data);
        } catch (err) {
            console.error("Restore failed:", err);
            setError('فشل استعادة البيانات: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const testApiConnection = async () => {
        console.log("------------------------------------------");
        console.log("بدء اختبار اتصال API...");
        const testUrl = 'http://localhost:8080/api/backup/create';
        try {
            const response = await fetch(testUrl, { method: 'POST' });
            console.log("تم إرسال طلب POST إلى:", testUrl);
            console.log("حالة الاستجابة:", response.status, response.statusText);
            if (response.ok) {
                console.log("الاتصال ناجح! الخادم استجاب بشكل صحيح.");
            } else {
                console.error("الاتصال فشل. حالة الخطأ:", response.status);
            }
        } catch (err) {
            console.error("خطأ في الاتصال:", err);
        }
        console.log("------------------------------------------");
    };

    const handleClearData = async () => {
        const confirmClear = window.confirm("تحذير: هل أنت متأكد من مسح جميع البيانات؟ هذه العملية لا يمكن التراجع عنها.");
        if (!confirmClear) {
            return;
        }
        setOpenPasswordDialog(true);
    };

    const handlePasswordSubmit = async () => {
        const hardcodedPassword = "admin773383716admin";
        if (password === hardcodedPassword) {
            setPasswordError('');
            setOpenPasswordDialog(false);
            setLoading(true);
            setMessage('');
            setError('');
            try {
                const response = await fetch('http://localhost:8080/api/clear-data', {
                    method: 'POST',
                });
                if (!response.ok) {
                    throw new Error('فشل في الاتصال بالخادم أو مسح البيانات.');
                }
                const data = await response.text();
                setMessage('تم مسح البيانات بنجاح: ' + data);
            } catch (err) {
                console.error("Clear data failed:", err);
                setError('فشل مسح البيانات: ' + err.message);
            } finally {
                setLoading(false);
            }
        } else {
            setPasswordError('كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
        }
    };

    // 3. الواجهة (JSX)
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
            <Box component={Paper} sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', color: '#3f51b5', fontWeight: 'bold' }}>
                    النسخ الاحتياطي واستعادة البيانات
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
                    اختر الإجراء المطلوب. سيتم تنفيذ العملية باستخدام الخادم.
                </Typography>
                {/* Loading and Messages */}
                {loading && (
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <LinearProgress />
                    </Box>
                )}
                {message && (
                    <Alert icon={<CheckCircleOutlineIcon fontSize="inherit" />} severity="success" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}
                {error && (
                    <Alert icon={<ErrorOutlineIcon fontSize="inherit" />} severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Grid container spacing={4} mt={2}>
                    {/* Backup Card */}
                    <Grid item xs={12} md={6}>
                        <StyledCard>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <BackupIcon sx={{ fontSize: 60, color: '#3f51b5', mb: 2 }} />
                                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    إنشاء نسخة احتياطية
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    سيتم حفظ نسخة كاملة من قاعدة البيانات في مجلد محدد.
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="اسم المجلد (اختياري)"
                                    variant="outlined"
                                    value={folderName}
                                    onChange={(e) => setFolderName(e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton sx={{ mr: 1 }} disabled>
                                                <FolderIcon />
                                            </IconButton>
                                        ),
                                    }}
                                />
                                <StyledButton
                                    fullWidth
                                    variant="contained"
                                    onClick={handleBackup}
                                    disabled={loading}
                                    bgcolor="#3f51b5"
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'بدء النسخ الاحتياطي'}
                                </StyledButton>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                    {/* Restore Card */}
                    <Grid item xs={12} md={6}>
                        <StyledCard>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <RestoreIcon sx={{ fontSize: 60, color: '#3f51b5', mb: 2 }} />
                                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    استعادة البيانات
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    استبدال البيانات الحالية بملف النسخة الاحتياطية.
                                </Typography>
                                <Button
                                    variant="contained"
                                    component="label"
                                    fullWidth
                                    sx={{ mb: 2, bgcolor: '#f5f5f5', color: 'black' }}
                                >
                                    {selectedFile ? selectedFile.name : 'اختر ملف النسخة الاحتياطية'}
                                    <input type="file" hidden onChange={handleFileChange} />
                                </Button>
                                <StyledButton
                                    fullWidth
                                    variant="contained"
                                    onClick={handleRestore}
                                    disabled={loading || !selectedFile}
                                    bgcolor="#3f51b5"
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'استعادة البيانات'}
                                </StyledButton>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                </Grid>
                {/* Clear Data Card */}
                <Grid item xs={12}>
                    <StyledCard sx={{ borderColor: 'error.main' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <DeleteForeverIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                مسح جميع البيانات
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                سيتم حذف جميع البيانات من الجداول ما عدا جدول الحسابات.
                            </Typography>
                            <StyledButton
                                fullWidth
                                variant="contained"
                                onClick={handleClearData}
                                disabled={loading}
                                bgcolor="#d32f2f"
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'مسح البيانات'}
                            </StyledButton>
                        </CardContent>
                    </StyledCard>
                </Grid>
                {/* Test Button */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={testApiConnection}
                        sx={{
                            color: '#3f51b5',
                            borderColor: '#3f51b5',
                            '&:hover': { borderColor: '#303f9f', bgcolor: 'rgba(63, 81, 181, 0.04)' }
                        }}
                    >
                        اختبار اتصال الخادم
                    </Button>
                </Box>
                {/* Password Dialog */}
                <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
                    <DialogTitle>تأكيد مسح البيانات</DialogTitle>
                    <DialogContent>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            ⚠️ **تحذير خطير:** قبل المتابعة، يرجى **التأكد من وجود نسخة احتياطية حديثة** من قاعدة البيانات. هذه العملية لا يمكن التراجع عنها.
                        </Alert>
                        <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
                            للمتابعة، يرجى إدخال كلمة المرور.
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="password"
                            label="كلمة المرور"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={!!passwordError}
                            helperText={passwordError}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenPasswordDialog(false)}>إلغاء</Button>
                        <Button onClick={handlePasswordSubmit} color="error" variant="contained" disabled={loading}>
                            مسح البيانات
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default App;