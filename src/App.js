// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import StudentSearchPage from './pages/StudentSearchPage';
import StudentDetailPage from './pages/StudentDetailPage'; // <--- أضف هذا السطر
import StudentFeesReportsPage from './pages/StudentFeesReportsPage';
import ExpensesReportsPage from './pages/ExpensesReportsPage'; // استيراد المكون الجديد
import ExpenseDashboard from './components/Expenses/ExpenseDashboard';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import ChartOfAccountsPage from './pages/ChartOfAccountsPage';
import JournalEntriesPage from './pages/JournalEntriesPage';
import GeneralLedgerPage from './pages/GeneralLedgerPage';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import PayrollList from './components/PayrollList';
import PayrollForm from './components/PayrollForm';
import LoginForm from './components/LoginForm';
import StudentFeeTable from './components/StudentFeeTable';
import HomePage from './pages/HomePage';
import SchoolPage from './pages/SchoolPage';
import StudentsPage from './pages/StudentsPage';
import AcademicYearsPage from './pages/AcademicYearsPage';
import FeeTypesPage from './pages/FeeTypesPage';
import StudentFeesPage from './pages/StudentFeesPage';
import PaymentsPage from './pages/PaymentsPage';
import ExpensesPage from './pages/ExpensesPage';
import TransactionsPage from './pages/TransactionsPage';
import MoneyTransferPage from './pages/MoneyTransferPage'; // الاستيراد الجديد
import IncomeRevenuesPage from './pages/IncomeRevenuesPage';
import DataMigrationPage from './pages/DataMigrationPage';
import ClosingEntriesPage from './pages/ClosingEntriesPage';
import BackupRestorePage from './pages/BackupRestorePage'; // استيراد المكون الجديد
import TrialBalance from './components/TrialBalance'; // استدعاء المكون الجديد
import TransactionDashboard from './components/Transactions/TransactionDashboard'; // ✅ استيراد المكون الجديد
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
// 1. **تعديل مسار واسم الاستيراد**
import SalaryAdvanceForm from './pages/SalaryAdvance';

// تعريف الثيم الخاص بـ Material-UI (MUI)
const theme = createTheme({
    direction: 'rtl',
    typography: {
        fontFamily: 'Cairo, sans-serif',
    },
    palette: {
        primary: {
            main: '#22c55e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                body {
                    direction: rtl;
                    text-align: right;
                    color: #333;
                }
                .MuiInputBase-root, .MuiSelect-select, .MuiTextField-root {
                    text-align: right;
                }
                .MuiFormLabel-root {
                    right: 0;
                    left: auto;
                    transform-origin: right;
                }
                .MuiFormControl-root {
                    margin-left: unset;
                    margin-right: unset;
                }
                .MuiButton-root {
                    margin-left: 8px;
                    margin-right: unset;
                }
                .MuiStack-root {
                    flex-direction: row-reverse;
                }
                .MuiTable-root th, .MuiTable-root td {
                    text-align: right;
                }
            `,
        },
    },
});

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem('isLoggedIn') === 'true'
    );

    useEffect(() => {
        localStorage.setItem('isLoggedIn', isLoggedIn);
    }, [isLoggedIn]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Box sx={{ minHeight: '100vh', padding: 4, bgcolor: 'background.default' }}>
               
                    <Routes>
                        {/* المسار الأساسي وجذر التطبيق: التوجيه مباشرة لصفحة الدخول إذا لم يتم تسجيل الدخول */}
                        <Route
                            path="/"
                            element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/login"
                            element={isLoggedIn ? <Navigate to="/home" replace /> : <LoginForm onLogin={handleLogin} />}
                        />

                        {/* ... (باقي مسارات التطبيق الخاصة بك تبقى كما هي مع حمايتها بـ isLoggedIn) */}
                        <Route
                            path="/home"
                            element={isLoggedIn ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />}
                        />
                        <Route
    path="/trial-balance"
    element={isLoggedIn ? <TrialBalance /> : <Navigate to="/login" replace />}
/>
                        {/* 2. **تأكد من المسار الصحيح** */}
                        <Route
                                path="/salary-advances"
                                element={isLoggedIn ? <SalaryAdvanceForm /> : <Navigate to="/login" replace />}
                            />

                        <Route
                            path="/student-search"
                            element={isLoggedIn ? <StudentSearchPage /> : <Navigate to="/login" replace />}
                        />
                        <Route path="/payments" element={isLoggedIn ? <PaymentsPage /> : <Navigate to="/login" replace />} />
                        <Route
                            path="/students/:id"
                            element={isLoggedIn ? <StudentDetailPage /> : <Navigate to="/login" replace />}
                        />

                        <Route
                            path="/expenses"
                            element={isLoggedIn ? <ExpenseDashboard /> : <Navigate to="/login" replace />}
                        />
                        
                        <Route
                        path="/money-transfer"
                        element={isLoggedIn ? <MoneyTransferPage /> : <Navigate to="/login" replace />}
                         />

                        <Route
                            path="/backup-restore"
                            element={isLoggedIn ? <BackupRestorePage /> : <Navigate to="/login" replace />}
                        />
                        <Route path="/" element={<HomePage />} />
                        <Route path="/transactions" element={<TransactionDashboard />} />
                        {/* المسارات الجديدة للوحدات المحاسبية */}
                        <Route
                            path="/chart-of-accounts"
                            element={isLoggedIn ? <ChartOfAccountsPage /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/journal-entries"
                            element={isLoggedIn ? <JournalEntriesPage /> : <Navigate to="/login" replace />}
                        />

                        
                        <Route
                            path="/general-ledger"
                            element={isLoggedIn ? <GeneralLedgerPage /> : <Navigate to="/login" replace />}
                        />
                        <Route path="/student-fees-reports" element={<StudentFeesReportsPage />} />

                        {/* مسارات التطبيق الأخرى */}
                        <Route
                            path="/school"
                            element={isLoggedIn ? <SchoolPage /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/students"
                            element={isLoggedIn ? <StudentsPage /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/academic-years"
                            element={isLoggedIn ? <AcademicYearsPage /> : <Navigate to="/login" replace />}
                        />
                        
                        <Route
                            path="/payments"
                            element={isLoggedIn ? <PaymentsPage /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/expenses"
                            element={isLoggedIn ? <ExpensesPage /> : <Navigate to="/login" replace />}
                        />


                        <Route
                            path="/expenses-reports"
                            element={isLoggedIn ? <ExpensesReportsPage /> : <Navigate to="/login" replace />}
                        />




                        <Route
                            path="/fee-types"
                            element={isLoggedIn ? <FeeTypesPage /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/student-fees-table"
                            element={isLoggedIn ? <StudentFeeTable /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/student-fees"
                            element={isLoggedIn ? <StudentFeesPage /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/transactions"
                            element={isLoggedIn ? <TransactionsPage /> : <Navigate to="/login" replace />}
                        />
                        <Route
                        
                            path="/income-revenues"
                            element={isLoggedIn ? <IncomeRevenuesPage /> : <Navigate to="/login" replace />}
                       />

                        <Route
                            path="/data-migration"
                            element={isLoggedIn ? <DataMigrationPage /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/closing-entries"
                            element={isLoggedIn ? <ClosingEntriesPage /> : <Navigate to="/login" replace />}
                        />

                        {/* مسارات الموظفين والرواتب */}
                        <Route
                            path="/employees"
                            element={isLoggedIn ? <EmployeeList /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/employees/add"
                            element={isLoggedIn ? <EmployeeForm /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/employees/edit/:id"
                            element={isLoggedIn ? <EmployeeForm /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/payroll"
                            element={isLoggedIn ? <PayrollList /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/payroll/add"
                            element={isLoggedIn ? <PayrollForm /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/payroll/add/:employeeId"
                            element={isLoggedIn ? <PayrollForm /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/payroll/employee/:employeeId"
                            element={isLoggedIn ? <PayrollList /> : <Navigate to="/login" replace />}
                        />

                        {/* مسار 404 - يعيد التوجيه لصفحة الدخول أو الرئيسية إذا لم تكن موجودة */}
                        <Route path="*" element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
                    </Routes>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;