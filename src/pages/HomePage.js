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

    // تعريف بيانات بطاقات الميزات مع توحيد طابع الألوان الاحترافي المتناسق مع الأخضر الداكن
    const featureCards = [
        {
            title: 'إدارة المدرسة',
            description: 'تعديل وعرض بيانات المدرسة الأساسية.',
            icon: FaSchool,
            link: '/school',
            color: '#064e3b',
        },
        {
            title: 'الطلاب',
            description: 'إضافة وعرض بيانات الطلاب.',
            icon: FaUserGraduate,
            link: '/students',
            color: '#047857',
        },
        {
            title: 'السنوات الأكاديمية',
            description: 'إضافة وعرض السنوات والفصول الدراسية.',
            icon: FaCalendarAlt,
            link: '/academic-years',
            color: '#059669',
        },
        {
            title: 'إدارة الموظفين',
            description: 'إضافة وتعديل وحذف بيانات الموظفين',
            icon: FaUsers,
            color: '#10b981',
            link: '/employees'
        },
        {
            title: 'إدارة الرواتب',
            description: 'إنشاء ومتابعة سجلات الرواتب للموظفين',
            icon: FaHandHoldingUsd,
            color: '#064e3b',
            link: '/payroll'
        },
        {
            title: 'سلف الموظفين',
            description: 'إدارة السلف الشهرية وخصمها من الرواتب.',
            icon: FaHandHoldingUsd,
            color: '#047857',
            link: '/salary-advances'
        },
        {
            title: 'تحويل الأموال',
            description: 'نقل الأرصدة بين الصناديق والبنوك',
            icon: FaExchangeAlt,
            link: '/money-transfer',
            color: '#059669',
        },
        {
            title: 'إدارة المصروفات والفواتير',
            description: 'تسجيل وتتبع جميع مصروفات وفواتير المدرسة.',
            icon: FaMoneyBillWave,
            link: '/expenses',
            color: '#064e3b',
        },
        {
            title: 'الدخل والإيرادات',
            description: 'عرض وتتبع جميع الدفعات والإيرادات من الطلاب.',
            icon: FaMoneyCheckAlt,
            link: '/income-revenues',
            color: '#047857',
        },
        {
            title: 'تقارير الرسوم',
            description: 'إنشاء وعرض تقارير شاملة عن رسوم الطلاب.',
            icon: FaChartBar,
            link: '/student-fees-reports',
            color: '#059669',
        },
        {
            title: 'إدارة أنواع الرسوم',
            description: 'تحديد أنواع الرسوم الدراسية والأنشطة.',
            icon: FaFileInvoiceDollar,
            link: '/fee-types',
            color: '#10b981',
        },
        {
            title: 'تسديد رسوم الطلاب',
            description: 'عرض جميع رسوم الطلاب في جدول تفاعلي.',
            icon: FaFileInvoiceDollar,
            link: '/student-fees-table',
            color: '#064e3b',
        },
        {
            title: 'دفتر الأستاذ العام',
            description: 'عرض وتتبع جميع الحركات المحاسبية المفصلة.',
            icon: FaBookOpen,
            link: '/general-ledger',
            color: '#047857',
        },
        {
            title: 'ميزان المراجعة',
            description: 'عرض أرصدة الحسابات المدينة والدائنة.',
            icon: FaBalanceScale,
            color: '#059669',
            link: '/trial-balance'
        },
        {
            title: 'شجرة الحسابات',
            description: 'إدارة جميع الحسابات الرئيسية والفرعية.',
            icon: FaBalanceScale,
            color: '#10b981',
            link: '/chart-of-accounts'
        },
        {
            title: 'القيود المحاسبية',
            description: 'عرض جميع القيود اليومية الناتجة عن العمليات المالية.',
            icon: FaBookOpen,
            color: '#064e3b',
            link: '/journal-entries'
        },
        {
            title: 'النسخ الاحتياطي والاستعادة',
            description: 'إنشاء واستعادة النسخ الاحتياطية لقاعدة البيانات.',
            icon: FaDatabase,
            link: '/backup-restore',
            color: '#047857',
        },
    ];

    return (
        <Box sx={{ flexGrow: 1, p: 1, position: 'relative', userSelect: 'none', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
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
                            background: '#991b1b',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'background 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#7f1d1d'}
                        onMouseOut={(e) => e.target.style.background = '#991b1b'}
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
                    <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', color: '#064e3b', fontSize: '20px' }}>
                        نظام إدارة المدرسة SAS
                    </Typography>
                </Box>
            </Box>

            {/* المحتوى الرئيسي للبطاقات */}
            <Stack spacing={1} sx={{ my: 2, marginTop: '100px', pb: 6 }}>
                <Typography variant="subtitle1" component="p" sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#064e3b', mb: 2 }}>
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
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 2,
                                        borderRadius: '12px',
                                        borderTop: `4px solid ${card.color}`,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 10px 20px rgba(6, 78, 59, 0.15)',
                                        },
                                        cursor: 'pointer',
                                        background: '#ffffff'
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: '0 !important' }}>
                                        {React.createElement(card.icon, {
                                            style: { fontSize: '36px', color: card.color, marginBottom: '12px' }
                                        })}
                                        <Typography variant="subtitle2" component="h3" gutterBottom sx={{ color: '#1f2937', mb: 1, fontWeight: 'bold', fontSize: '15px' }}>
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
                    color: '#ffffff',
                    textAlign: 'center',
                    py: 1,
                    overflow: 'hidden',
                    zIndex: 1100,
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '14px' }}>
                    شركة Evosys للانظمة والتدريب للتواصل 775696928
                </Typography>
            </Box>
        </Box>
    );
};

export default HomePage;