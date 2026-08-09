import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Box, Alert,
  IconButton, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Tooltip
} from '@mui/material';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

// ترجمة أنواع الحسابات للعربية
const getAccountTypeLabel = (type) => {
  switch (type) {
    case 'ASSET': return 'أصول';
    case 'LIABILITY': return 'الالتزامات';
    case 'EQUITY': return 'حقوق الملكية';
    case 'REVENUE': return 'إيرادات';
    case 'EXPENSE': return 'مصروفات';
    default: return type || 'حساب';
  }
};

// مكون السطر الشجري (يبدأ مغلقاً ولا تظهر تففرعاته إلا عند النقر)
const AccountRow = ({ account, level = 0, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = account.children && account.children.length > 0;
  
  const isMain = account.category === 'main' || account.category === 'رئيسي';
  const code = account.accountCode || account.code || account.id;
  const name = account.accountName || account.name;

  return (
    <>
      <TableRow sx={{ backgroundColor: isMain ? 'rgba(0, 0, 0, 0.03)' : '#fff' }}>
        <TableCell sx={{ paddingRight: `${level * 28 + 16}px`, paddingLeft: 0 }}>
          {hasChildren ? (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
          ) : (
            <Box component="span" sx={{ display: 'inline-block', width: 28 }} />
          )}
          <strong style={{ color: '#1976d2', marginRight: 5 }}>[{code}]</strong>
        </TableCell>
        <TableCell sx={{ fontWeight: isMain ? 'bold' : 'normal' }}>
          {name}
        </TableCell>
        <TableCell>
          <Chip 
            label={getAccountTypeLabel(account.accountType || account.type)} 
            size="small" 
            color={isMain ? "primary" : "default"}
            variant={isMain ? "filled" : "outlined"}
          />
        </TableCell>
        <TableCell>
          <Chip 
            label={isMain ? "رئيسي" : "فرعي"} 
            size="small" 
            color={isMain ? "secondary" : "success"}
          />
        </TableCell>
        <TableCell align="center">
          {!isMain ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Tooltip title="تعديل الحساب">
                <IconButton size="small" color="primary" onClick={() => onEdit(account)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="حذف الحساب">
                <IconButton size="small" color="error" onClick={() => onDelete(account)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">—</Typography>
          )}
        </TableCell>
      </TableRow>

      {/* عرض الأبناء تحت الأب مباشرة عند فتح السهم */}
      {hasChildren && open && account.children.map((child) => (
        <AccountRow 
          key={child.id || child.accountCode || child.code} 
          account={child} 
          level={level + 1} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
};

// تحويل الشجرة لقائمة مسطحة لاختيار الحساب الأب
const flattenAccounts = (nodes, list = []) => {
  nodes.forEach(node => {
    const code = node.accountCode || node.code || String(node.id);
    const name = node.accountName || node.name;
    const type = node.accountType || node.type;

    list.push({ id: node.id, accountCode: code, accountName: name, accountType: type });
    if (node.children) flattenAccounts(node.children, list);
  });
  return list;
};

// دالة تحويل القائمة المسطحة إلى شجرة حقيقية متداخلة بناءً على تسلسل الأكواد والـ parent
// دالة فرز وبناء الشجرة مع الترتيب التصاعدي الرقمي الدقيق
const buildTreeFromDatabase = (flatAccounts) => {
  if (!flatAccounts || flatAccounts.length === 0) return [];

  // 1. ترتيب الحسابات تصاعدياً برقم الكود حصراً وبشكل رقمي صحيح
  const sorted = [...flatAccounts].sort((a, b) => {
    const codeA = String(a.accountCode || a.code || '');
    const codeB = String(b.accountCode || b.code || '');
    return codeA.localeCompare(codeB, undefined, { numeric: true });
  });

  const map = {};
  const roots = [];

  sorted.forEach(acc => {
    map[acc.id] = { ...acc, children: [] };
  });

  sorted.forEach(acc => {
    const code = String(acc.accountCode || acc.code || '');
    let parentFound = false;

    for (let i = code.length - 1; i > 0; i--) {
      const parentCodeCandidate = code.substring(0, i);
      const parentAcc = sorted.find(a => String(a.accountCode || a.code) === parentCodeCandidate);
      
      if (parentAcc && parentAcc.id !== acc.id) {
        // إضافة الأبناء وترتيبهم داخل الأب أيضاً
        if (!map[parentAcc.id].children.some(child => child.id === acc.id)) {
          map[parentAcc.id].children.push(map[acc.id]);
          // إعادة فرز أبناء هذا الأب تصاعدياً لضمان ظهور 1104 بعد 1103 مباشرة
          map[parentAcc.id].children.sort((x, y) => {
            return String(x.accountCode || x.code || '').localeCompare(String(y.accountCode || y.code || ''), undefined, { numeric: true });
          });
        }
        parentFound = true;
        break;
      }
    }

    if (!parentFound) {
      if (!roots.some(root => root.id === acc.id)) {
        roots.push(map[acc.id]);
      }
    }
  });

  return roots.sort((a, b) => {
    return String(a.accountCode || a.code || '').localeCompare(String(b.accountCode || b.code || ''), undefined, { numeric: true });
  });
};

const ChartOfAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const [newAccount, setNewAccount] = useState({
    accountName: '',
    parentCode: '',
    parentId: '',
    accountCode: '',
    accountType: 'ASSET',
    category: 'sub'
  });

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8080/api/accounts');
      if (response.data && response.data.length > 0) {
        // تحويل القائمة المسطحة القادمة من الباك إند إلى شجرة متداخلة ومنظمة
        const hierarchicalTree = buildTreeFromDatabase(response.data);
        setAccounts(hierarchicalTree);
      } else {
        setAccounts([]);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      setError('تعذر جلب البيانات من السيرفر. يرجى التأكد من تشغيل Spring Boot على البورت 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedAccountId(null);
    setNewAccount({ accountName: '', parentCode: '', parentId: '', accountCode: '', accountType: 'ASSET', category: 'sub' });
    setOpenModal(true);
  };

  const handleOpenEditModal = (account) => {
    setIsEditMode(true);
    setSelectedAccountId(account.id);
    setNewAccount({
      accountName: account.accountName || account.name || '',
      parentCode: account.parent?.accountCode || account.parentCode || '',
      parentId: account.parent_id || account.parentId || '',
      accountCode: account.accountCode || account.code || String(account.id),
      accountType: account.accountType || account.type || 'ASSET',
      category: account.category || 'sub'
    });
    setOpenModal(true);
  };

  const handleDeleteAccount = async (account) => {
    const accName = account.accountName || account.name;
    const accId = account.id;

    if (!accId) return;

    if (!window.confirm(`هل أنت تأكد من رغبتك في حذف الحساب: "${accName}"؟`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/accounts/${accId}`);
      alert('تم حذف الحساب بنجاح! ✅');
      fetchAccounts();
    } catch (err) {
      console.error('Delete error:', err);
      const errorMsg = err.response?.data?.message || 'تعذر حذف الحساب لوجود حركات مالية مرتبطة به.';
      alert(`⚠️ تنبيه محاسبي: ${errorMsg}`);
    }
  };

  const handleParentChange = (e) => {
    const pCode = e.target.value;
    const flat = flattenAccounts(accounts);
    const selectedParent = flat.find(a => a.accountCode === pCode || String(a.id) === String(pCode));
    
    // استخراج جميع الأبناء المباشرين التابعين لهذا الأب
    const childrenOfThisParent = flat.filter(a => {
      const code = String(a.accountCode || '');
      return code.startsWith(pCode) && code.length > pCode.length;
    });

    let generatedCode = '';
    if (pCode === '1') {
      generatedCode = `1101`;
    } else {
      // البحث عن الرقم التسلسلي الأكبر حالياً وزيادته بواقع 1
      let maxSubNum = 0;
      childrenOfThisParent.forEach(child => {
        const codeStr = String(child.accountCode || '');
        // استخراج الجزء الإضافي بعد كود الأب
        const suffix = codeStr.substring(pCode.length);
        const num = parseInt(suffix, 10);
        if (!isNaN(num) && num > maxSubNum) {
          maxSubNum = num;
        }
      });

      const nextNum = maxSubNum + 1;
      // توليد الكود مع الحفاظ على خانات الصفر (مثل 1105)
      generatedCode = `${pCode}${String(nextNum).padStart(2, '0')}`;
    }

    setNewAccount({
      ...newAccount,
      parentCode: pCode,
      parentId: selectedParent ? selectedParent.id : '',
      accountCode: generatedCode,
      accountType: selectedParent ? selectedParent.accountType : newAccount.accountType
    });
  };

  const handleSaveAccount = async () => {
    if (!newAccount.accountName) {
      alert('يرجى كتابة اسم الحساب');
      return;
    }

    const payload = {
      name: newAccount.accountName,
      accountName: newAccount.accountName,
      accountCode: newAccount.accountCode,
      code: newAccount.accountCode,
      type: newAccount.accountType,
      accountType: newAccount.accountType,
      category: newAccount.category,
      parent: newAccount.parentId ? { id: newAccount.parentId } : (newAccount.parentCode ? { accountCode: newAccount.parentCode } : null)
    };

    try {
      if (isEditMode && selectedAccountId) {
        await axios.put(`http://localhost:8080/api/accounts/${selectedAccountId}`, payload);
        alert('تم تعديل الحساب بنجاح! ✏️');
      } else {
        await axios.post('http://localhost:8080/api/accounts', payload);
        alert('تم حفظ الحساب بنجاح! ✅');
      }

      setOpenModal(false);
      fetchAccounts();
    } catch (err) {
      console.error('Save failed:', err);
      const errorMsg = err.response?.data?.message || err.message;
      alert('حدث خطأ أثناء العملية: ' + errorMsg);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  const flatList = flattenAccounts(accounts);

  return (
    <Container maxWidth="lg" dir="rtl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          شجرة الحسابات المدرسية
        </Typography>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
        >
          إضافة حساب جديد
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>كود / ID الحساب</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>اسم الحساب</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>نوع الحساب</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>طبيعة الحساب</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <AccountRow 
                  key={account.id} 
                  account={account} 
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteAccount}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">لا توجد حسابات مسجلة في قاعدة البيانات</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* نافذة إضافة / تعديل حساب */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm" dir="rtl">
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          {isEditMode ? '✏️ تعديل بيانات الحساب' : '➕ إضافة حساب جديد لشجرة الحسابات'}
        </DialogTitle>
        <DialogContent dividers>
          {!isEditMode && (
            <TextField
              select
              fullWidth
              margin="normal"
              label="ينتمي إلى (الحساب الأب)"
              value={newAccount.parentCode}
              onChange={handleParentChange}
            >
              {flatList.map((acc) => (
                <MenuItem key={acc.id} value={acc.accountCode || acc.id}>
                  [{acc.accountCode || acc.id}] - {acc.accountName}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              disabled={!isEditMode}
              label={isEditMode ? "كود الحساب" : "كود الحساب المولد آلياً"}
              value={newAccount.accountCode}
              onChange={(e) => setNewAccount({ ...newAccount, accountCode: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="نوع الحساب"
              value={newAccount.accountType}
              onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value })}
            >
              <MenuItem value="ASSET">أصول</MenuItem>
              <MenuItem value="LIABILITY">الالتزامات</MenuItem>
              <MenuItem value="EQUITY">حقوق الملكية</MenuItem>
              <MenuItem value="REVENUE">إيرادات</MenuItem>
              <MenuItem value="EXPENSE">مصروفات</MenuItem>
            </TextField>
          </Box>

          <TextField
            fullWidth
            margin="normal"
            label="اسم الحساب"
            value={newAccount.accountName}
            onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
          />

          <TextField
            select
            fullWidth
            margin="normal"
            label="طبيعة الحساب"
            value={newAccount.category}
            onChange={(e) => setNewAccount({ ...newAccount, category: e.target.value })}
          >
            <MenuItem value="sub">حساب فرعي (تسجل عليه الحركات المباشرة)</MenuItem>
            <MenuItem value="main">حساب رئيسي (تجميعي)</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit" variant="outlined">
            إلغاء
          </Button>
          <Button onClick={handleSaveAccount} variant="contained" color="success">
            {isEditMode ? 'حفظ التعديلات' : 'حفظ الحساب'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChartOfAccountsPage;