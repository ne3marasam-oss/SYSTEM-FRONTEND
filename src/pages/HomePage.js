import React from 'react';
// استيراد مكونات Material-UI (MUI)
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

// استيراد أيقونات react-icons
import {
    FaUserGraduate,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaExchangeAlt,
    FaFileInvoiceDollar,
    FaBookOpen,
    FaSchool,
    FaChartBar,
    FaUsers,
    FaHandHoldingUsd,
    FaSignOutAlt,
    FaMoneyCheckAlt,
    FaBalanceScale,
    FaDatabase
} from 'react-icons/fa';

// استيراد Link من react-router-dom للتوجيه
import { Link as ReactRouterLink } from 'react-router-dom';

// استيراد ملف الشعار الخاص بك
import logoIcon from '../assets/images/sas_logo_no.png';

const HomePage = ({ onLogout }) => {

    // تعريف بيانات بطاقات الميزات مع توحيد اللون الذهبي الفاخر لجميع الأيقونات لانسجام تام
    const featureCards = [
        {
            title: 'إدارة المدرسة',
            description: 'تعديل وعرض بيانات المدرسة الأساسية.',
            icon: FaSchool,
            link: '/school',
        },
        {
            title: 'الطلاب',
            description: 'إضافة وعرض بيانات الطلاب.',
            icon: FaUserGraduate,
            link: '/students',
        },
        {
            title: 'السنوات الأكاديمية',
            description: 'إضافة وعرض السنوات والفصول الدراسية.',
            icon: FaCalendarAlt,
            link: '/academic-years',
        },
        {
            title: 'إدارة الموظفين',
            description: 'إضافة وتعديل وحذف بيانات الموظفين',
            icon: FaUsers,
            link: '/employees'
        },
        {
            title: 'إدارة الرواتب',
            description: 'إنشاء ومتابعة سجلات الرواتب للموظفين',
            icon: FaHandHoldingUsd,
            link: '/payroll'
        },
        {
            title: 'سلف الموظفين',
            description: 'إدارة السلف الشهرية وخصمها من الرواتب.',
            icon: FaHandHoldingUsd,
            link: '/salary-advances'
        },
        {
            title: 'تحويل الأموال',
            description: 'نقل الأرصدة بين الصناديق والبنوك',
            icon: FaExchangeAlt,
            link: '/money-transfer',
        },
        {
            title: 'إدارة المصروفات والفواتير',
            description: 'تسجيل وتتبع جميع مصروفات وفواتير المدرسة.',
            icon: FaMoneyBillWave,
            link: '/expenses',
        },
        {
            title: 'الدخل والإيرادات',
            description: 'عرض وتتبع جميع الدفعات والإيرادات من الطلاب.',
            icon: FaMoneyCheckAlt,
            link: '/income-revenues',
        },
        {
            title: 'تقارير الرسوم',
            description: 'إنشاء وعرض تقارير شاملة عن رسوم الطلاب.',
            icon: FaChartBar,
            link: '/student-fees-reports',
        },
        {
            title: 'إدارة أنواع الرسوم',
            description: 'تحديد أنواع الرسوم الدراسية والأنشطة.',
            icon: FaFileInvoiceDollar,
            link: '/fee-types',
        },
        {
            title: 'تسديد رسوم الطلاب',
            description: 'عرض جميع رسوم الطلاب في جدول تفاعلي.',
            icon: FaFileInvoiceDollar,
            link: '/student-fees-table',
        },
        {
            title: 'دفتر الأستاذ العام',
            description: 'عرض وتتبع جميع الحركات المحاسبية المفصلة.',
            icon: FaBookOpen,
            link: '/general-ledger',
        },
        {
            title: 'ميزان المراجعة',
            description: 'عرض أرصدة الحسابات المدينة والدائنة.',
            icon: FaBalanceScale,
            link: '/trial-balance'
        },
        {
            title: 'شجرة الحسابات',
            description: 'إدارة جميع الحسابات الرئيسية والفرعية.',
            icon: FaBalanceScale,
            link: '/chart-of-accounts'
        },
        {
            title: 'القيود المحاسبية',
            description: 'عرض جميع القيود اليومية الناتجة عن العمليات المالية.',
            icon: FaBookOpen,
            link: '/journal-entries'
        },
        {
            title: 'النسخ الاحتياطي والاستعادة',
            description: 'إنشاء واستعادة النسخ الاحتياطية لقاعدة البيانات.',
            icon: FaDatabase,
            link: '/backup-restore',
        },
    ];

    return (
        <Box sx={{ flexGrow: 1, p: 1, position: 'relative', userSelect: 'none', background: '#f4f6f5', minHeight: '100vh', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
            {/* زر تسجيل الخروج */}
            {onLogout && (
                <Box sx={{ position: 'absolute', top: 15, left: 15, zIndex: 1000 }}>
                    <button
                        onClick={onLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: '#7f1d1d',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                            transition: 'background 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#991b1b'}
                        onMouseOut={(e) => e.target.style.background = '#7f1d1d'}
                    >
                        <FaSignOutAlt style={{ marginLeft: '8px' }} /> تسجيل الخروج
                    </button>
                </Box>
            )}

            {/* العنوان والشعار */}
            <Box sx={{
                position: 'absolute',
                top: 5,
                right: 15,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                p: 1,
            }}>
                <img src={logoIcon} alt="SAS Logo" style={{ height: '80px', marginRight: '15px' }} />
                <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', color: '#064e3b', fontSize: '20px', letterSpacing: '0.5px' }}>
                        نظام إدارة المدرسة SAS
                    </Typography>
                </Box>
            </Box>

            {/* المحتوى الرئيسي للبطاقات */}
            <Stack spacing={1} sx={{ my: 2, marginTop: '100px', pb: 6 }}>
                <Typography variant="subtitle1" component="p" sx={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', color: '#064e3b', mb: 2 }}>
                    لوحة التحكم الرئيسية
                </Typography>
                <Grid container spacing={2} justifyContent="center" sx={{ px: 3 }}>
                    {featureCards.map((card, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                            <MuiLink
                                component={ReactRouterLink}
                                to={card.link || card.path}
                                underline="none"
                                sx={{ display: 'block', height: '100%' }}
                            >
                                <Card
                                    elevation={3}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 2,
                                        borderRadius: '14px',
                                        borderTop: '5px solid #d97706', // حافة ذهبية ملكية فخمة جداً
                                        borderLeft: '1px solid #e5e7eb',
                                        borderRight: '1px solid #e5e7eb',
                                        borderBottom: '1px solid #e5e7eb',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 12px 24px rgba(217, 119, 6, 0.2)',
                                            borderColor: '#d97706'
                                        },
                                        cursor: 'pointer',
                                        background: '#ffffff'
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: '0 !important' }}>
                                        {React.createElement(card.icon, {
                                            style: { fontSize: '38px', color: '#d97706', marginBottom: '12px' } // أيقونات ذهبية متناسقة وفاخرة
                                        })}
                                        <Typography variant="subtitle2" component="h3" gutterBottom sx={{ color: '#064e3b', mb: 1, fontWeight: 'bold', fontSize: '15px' }}>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.3 }}>
                                            {card.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </MuiLink>
                        </Grid>
                    ))}
                </Grid>
            </Stack>

            {/* الشريط المتحرك السفلي */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#064e3b',
                    color: '#f3f4f6',
                    textAlign: 'center',
                    py: 1,
                    overflow: 'hidden',
                    zIndex: 1100,
                    boxShadow: '0 -4px 15px rgba(0,0,0,0.15)',
                    borderTop: '2px solid #d97706' // إطار ذهبي سفلي فاخر
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: '600', fontSize: '14px', letterSpacing: '0.5px' }}>
                    شركة Evosys للانظمة والتدريب للتواصل 775696928
                </Typography>
            </Box>
        </Box>
    );
};

export default HomePage;