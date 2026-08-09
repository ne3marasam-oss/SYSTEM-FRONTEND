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

    // تعريف بيانات بطاقات الميزات مع ألوان مربعات الأيقونات الفخمة والمنسجمة
    const featureCards = [
        {
            title: 'إدارة المدرسة',
            description: 'تعديل وعرض بيانات المدرسة الأساسية.',
            icon: FaSchool,
            link: '/school',
            color: '#0284c7', // أزرق ملكي
            bg: '#e0f2fe'
        },
        {
            title: 'الطلاب',
            description: 'إضافة وعرض بيانات الطلاب.',
            icon: FaUserGraduate,
            link: '/students',
            color: '#059669', // أخضر زمردي
            bg: '#d1fae5'
        },
        {
            title: 'السنوات الأكاديمية',
            description: 'إضافة وعرض السنوات والفصول الدراسية.',
            icon: FaCalendarAlt,
            link: '/academic-years',
            color: '#d97706', // ذهبي
            bg: '#fef3c7'
        },
        {
            title: 'إدارة الموظفين',
            description: 'إضافة وتعديل وحذف بيانات الموظفين',
            icon: FaUsers,
            link: '/employees',
            color: '#7c3aed', // بنفسجي فاخر
            bg: '#ede9fe'
        },
        {
            title: 'إدارة الرواتب',
            description: 'إنشاء ومتابعة سجلات الرواتب للموظفين',
            icon: FaHandHoldingUsd,
            link: '/payroll',
            color: '#db2777', // وردي دافئ
            bg: '#fce7f3'
        },
        {
            title: 'سلف الموظفين',
            description: 'إدارة السلف الشهرية وخصمها من الرواتب.',
            icon: FaHandHoldingUsd,
            link: '/salary-advances',
            color: '#ea580c', // برتقالي محروق
            bg: '#ffedd5'
        },
        {
            title: 'تحويل الأموال',
            description: 'نقل الأرصدة بين الصناديق والبنوك',
            icon: FaExchangeAlt,
            link: '/money-transfer',
            color: '#0d9488', // تركواز
            bg: '#ccfbf1'
        },
        {
            title: 'إدارة المصروفات والفواتير',
            description: 'تسجيل وتتبع جميع مصروفات وفواتير المدرسة.',
            icon: FaMoneyBillWave,
            link: '/expenses',
            color: '#e11d48', // أحمر داكن أنيق
            bg: '#ffe4e6'
        },
        {
            title: 'الدخل والإيرادات',
            description: 'عرض وتتبع جميع الدفعات والإيرادات من الطلاب.',
            icon: FaMoneyCheckAlt,
            link: '/income-revenues',
            color: '#16a34a', // أخضر عشبي
            bg: '#dcfce7'
        },
        {
            title: 'تقارير الرسوم',
            description: 'إنشاء وعرض تقارير شاملة عن رسوم الطلاب.',
            icon: FaChartBar,
            link: '/student-fees-reports',
            color: '#4f46e5', // أزرق نيلي
            bg: '#e0e7ff'
        },
        {
            title: 'إدارة أنواع الرسوم',
            description: 'تحديد أنواع الرسوم الدراسية والأنشطة.',
            icon: FaFileInvoiceDollar,
            link: '/fee-types',
            color: '#ca8a04', // ذهبي غامق
            bg: '#fefce8'
        },
        {
            title: 'تسديد رسوم الطلاب',
            description: 'عرض جميع رسوم الطلاب في جدول تفاعلي.',
            icon: FaFileInvoiceDollar,
            link: '/student-fees-table',
            color: '#0284c7',
            bg: '#e0f2fe'
        },
        {
            title: 'دفتر الأستاذ العام',
            description: 'عرض وتتبع جميع الحركات المحاسبية المفصلة.',
            icon: FaBookOpen,
            link: '/general-ledger',
            color: '#9333ea',
            bg: '#f3e8ff'
        },
        {
            title: 'ميزان المراجعة',
            description: 'عرض أرصدة الحسابات المدينة والدائنة.',
            icon: FaBalanceScale,
            link: '/trial-balance',
            color: '#059669',
            bg: '#d1fae5'
        },
        {
            title: 'شجرة الحسابات',
            description: 'إدارة جميع الحسابات الرئيسية والفرعية.',
            icon: FaBalanceScale,
            link: '/chart-of-accounts',
            color: '#d97706',
            bg: '#fef3c7'
        },
        {
            title: 'القيود المحاسبية',
            description: 'عرض جميع القيود اليومية الناتجة عن العمليات المالية.',
            icon: FaBookOpen,
            link: '/journal-entries',
            color: '#7c3aed',
            bg: '#ede9fe'
        },
        {
            title: 'النسخ الاحتياطي والاستعادة',
            description: 'إنشاء واستعادة النسخ الاحتياطية لقاعدة البيانات.',
            icon: FaDatabase,
            link: '/backup-restore',
            color: '#0284c7',
            bg: '#e0f2fe'
        },
    ];

    return (
        <Box sx={{ 
            flexGrow: 1, 
            p: 2, 
            position: 'relative', 
            userSelect: 'none', 
            background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)', 
            minHeight: '100vh', 
            fontFamily: 'Cairo, sans-serif', 
            direction: 'rtl' 
        }}>
            {/* زر تسجيل الخروج */}
            {onLogout && (
                <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
                    <button
                        onClick={onLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 18px',
                            borderRadius: '10px',
                            background: '#7f1d1d',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 6px rgba(127, 29, 29, 0.2)',
                            transition: 'all 0.3s ease'
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
                top: 10,
                right: 20,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                p: 1,
            }}>
                <img src={logoIcon} alt="SAS Logo" style={{ height: '75px', marginRight: '15px', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }} />
                <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" component="h1" sx={{ fontWeight: '800', color: '#064e3b', fontSize: '22px', letterSpacing: '0.5px' }}>
                        نظام إدارة المدرسة SAS
                    </Typography>
                </Box>
            </Box>

            {/* المحتوى الرئيسي للبطاقات */}
            <Stack spacing={1} sx={{ my: 2, marginTop: '110px', pb: 8 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h2" sx={{ fontSize: '1.8rem', fontWeight: '800', color: '#064e3b', mb: 1, letterSpacing: '0.5px' }}>
                        لوحة التحكم الرئيسية
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                        مرحباً بك في نظام إدارة المدرسة — اختر الوحدة التي تريد العمل عليها
                    </Typography>
                </Box>

                <Grid container spacing={2.5} justifyContent="center" sx={{ px: 2 }}>
                    {featureCards.map((card, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                            <MuiLink
                                component={ReactRouterLink}
                                to={card.link || card.path}
                                underline="none"
                                sx={{ display: 'block', height: '100%' }}
                            >
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        p: 2.5,
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        borderTop: '4px solid #d97706', // حافة ذهبية فخمة بالأعلى
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 20px 25px -5px rgba(217, 119, 6, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                            borderColor: '#d97706'
                                        },
                                        cursor: 'pointer',
                                        background: '#ffffff'
                                    }}
                                >
                                    <CardContent sx={{ p: '0 !important', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        {/* صف الأيقونة والعنوان بجانب بعضهما بنفس تصميم الصورة */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle1" component="h3" sx={{ color: '#0f172a', fontWeight: '700', fontSize: '15px', lineHeight: 1.4 }}>
                                                {card.title}
                                            </Typography>
                                            <Box 
                                                sx={{ 
                                                    width: '46px', 
                                                    height: '46px', 
                                                    borderRadius: '12px', 
                                                    background: card.bg, 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                                }}
                                            >
                                                {React.createElement(card.icon, {
                                                    style: { fontSize: '22px', color: card.color }
                                                })}
                                            </Box>
                                        </Box>
                                        
                                        {/* الوصف بالأسفل */}
                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '12px', lineHeight: 1.5, mt: 'auto' }}>
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
                    color: '#f8fafc',
                    textAlign: 'center',
                    py: 1.2,
                    zIndex: 1100,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                    borderTop: '2px solid #d97706'
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