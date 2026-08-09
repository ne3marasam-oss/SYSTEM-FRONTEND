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

    // تعريف بيانات بطاقات الميزات بتنسيق الألوان الفاخر
    const featureCards = [
        {
            title: 'إدارة المدرسة',
            description: 'تعديل وعرض بيانات المدرسة الأساسية.',
            icon: FaSchool,
            link: '/school',
            color: '#2563eb', // أزرق ملكي
            bg: '#eff6ff'
        },
        {
            title: 'الطلاب',
            description: 'إضافة وعرض بيانات الطلاب.',
            icon: FaUserGraduate,
            link: '/students',
            color: '#059669', // أخضر زمردي
            bg: '#ecfdf5'
        },
        {
            title: 'السنوات الأكاديمية',
            description: 'إضافة وعرض السنوات والفصول الدراسية.',
            icon: FaCalendarAlt,
            link: '/academic-years',
            color: '#d97706', // ذهبي
            bg: '#fffbeb'
        },
        {
            title: 'إدارة الموظفين',
            description: 'إضافة وتعديل وحذف بيانات الموظفين',
            icon: FaUsers,
            link: '/employees',
            color: '#7c3aed', // بنفسجي فاخر
            bg: '#f5f3ff'
        },
        {
            title: 'إدارة الرواتب',
            description: 'إنشاء ومتابعة سجلات الرواتب للموظفين',
            icon: FaHandHoldingUsd,
            link: '/payroll',
            color: '#db2777', // وردي دافئ
            bg: '#fdf2f8'
        },
        {
            title: 'سلف الموظفين',
            description: 'إدارة السلف الشهرية وخصمها من الرواتب.',
            icon: FaHandHoldingUsd,
            link: '/salary-advances',
            color: '#ea580c', // برتقالي محروق
            bg: '#fff7ed'
        },
        {
            title: 'تحويل الأموال',
            description: 'نقل الأرصدة بين الصناديق والبنوك',
            icon: FaExchangeAlt,
            link: '/money-transfer',
            color: '#0d9488', // تركواز
            bg: '#f0fdfa'
        },
        {
            title: 'إدارة المصروفات والفواتير',
            description: 'تسجيل وتتبع جميع مصروفات وفواتير المدرسة.',
            icon: FaMoneyBillWave,
            link: '/expenses',
            color: '#e11d48', // أحمر داكن أنيق
            bg: '#fff1f2'
        },
        {
            title: 'الدخل والإيرادات',
            description: 'عرض وتتبع جميع الدفعات والإيرادات من الطلاب.',
            icon: FaMoneyCheckAlt,
            link: '/income-revenues',
            color: '#16a34a', // أخضر عشبي
            bg: '#f0fdf4'
        },
        {
            title: 'تقارير الرسوم',
            description: 'إنشاء وعرض تقارير شاملة عن رسوم الطلاب.',
            icon: FaChartBar,
            link: '/student-fees-reports',
            color: '#4f46e5', // أزرق نيلي
            bg: '#eef2ff'
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
            color: '#2563eb',
            bg: '#eff6ff'
        },
        {
            title: 'دفتر الأستاذ العام',
            description: 'عرض وتتبع جميع الحركات المحاسبية المفصلة.',
            icon: FaBookOpen,
            link: '/general-ledger',
            color: '#9333ea',
            bg: '#faf5ff'
        },
        {
            title: 'ميزان المراجعة',
            description: 'عرض أرصدة الحسابات المدينة والدائنة.',
            icon: FaBalanceScale,
            link: '/trial-balance',
            color: '#059669',
            bg: '#ecfdf5'
        },
        {
            title: 'شجرة الحسابات',
            description: 'إدارة جميع الحسابات الرئيسية والفرعية.',
            icon: FaBalanceScale,
            link: '/chart-of-accounts',
            color: '#d97706',
            bg: '#fffbeb'
        },
        {
            title: 'القيود المحاسبية',
            description: 'عرض جميع القيود اليومية الناتجة عن العمليات المالية.',
            icon: FaBookOpen,
            link: '/journal-entries',
            color: '#7c3aed',
            bg: '#f5f3ff'
        },
        {
            title: 'النسخ الاحتياطي والاستعادة',
            description: 'إنشاء واستعادة النسخ الاحتياطية لقاعدة البيانات.',
            icon: FaDatabase,
            link: '/backup-restore',
            color: '#2563eb',
            bg: '#eff6ff'
        },
    ];

    return (
        <Box sx={{ 
            flexGrow: 1, 
            p: 0, 
            position: 'relative', 
            userSelect: 'none', 
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', 
            minHeight: '100vh', 
            fontFamily: 'Cairo, sans-serif', 
            direction: 'rtl' 
        }}>
            {/* الشريط العلوي باللون الكحلي المزرق */}
            <Box sx={{
                width: '100%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                py: 1.5,
                px: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderBottom: '3px solid #d97706',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                {/* الجهة اليمنى: الشعار واسم النظام */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img src={logoIcon} alt="SAS Logo" style={{ height: '45px', marginLeft: '12px', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }} />
                    <Typography variant="h6" sx={{ fontWeight: '800', color: '#ffffff', fontSize: '18px', letterSpacing: '0.5px' }}>
                        نظام إدارة المدرسة SAS
                    </Typography>
                </Box>

                {/* الجهة اليسرى: زر تسجيل الخروج واسم المستخدم */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(255,255,255,0.08)', px: 2, py: 0.6, borderRadius: '8px' }}>
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '12px' }}>مدير النظام</Typography>
                        <Typography variant="body1" sx={{ color: '#facc15', fontWeight: 'bold', fontSize: '14px' }}>Admin</Typography>
                    </Box>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '6px 16px',
                                borderRadius: '8px',
                                background: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '13px',
                                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                            onMouseOut={(e) => e.target.style.background = '#dc2626'}
                        >
                            <FaSignOutAlt style={{ marginLeft: '6px' }} /> تسجيل الخروج
                        </button>
                    )}
                </Box>
            </Box>

            {/* محتوى الصفحة */}
            <Box sx={{ p: 3, pb: 10 }}>
                {/* العنوان الرئيسي في منتصف الصفحة تماماً */}
               {/* العنوان الرئيسي في منتصف الصفحة تماماً */}
                <Box sx={{ textAlign: 'center', my: 4, width: '100%' }}>
                    <Typography variant="h4" component="h2" align="center" sx={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', mb: 1, letterSpacing: '0.5px' }}>
                        لوحة التحكم الرئيسية
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>
                        مرحباً بك في نظام إدارة المدرسة — اختر الوحدة التي تريد العمل عليها
                    </Typography>
                </Box>

                {/* شبكة البطاقات بتنسيق الأيقونة في اليمين */}
                <Grid container spacing={2.5} justifyContent="center" sx={{ px: 1 }}>
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
                                        p: 2.2,
                                        borderRadius: '16px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 12px 20px -3px rgba(30, 41, 59, 0.12)',
                                            borderColor: '#d97706'
                                        },
                                        cursor: 'pointer'
                                    }}
                                >
                                    <CardContent sx={{ p: '0 !important', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        {/* الأيقونة في اليمين وبجانبها العنوان */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Box 
                                                sx={{ 
                                                    width: '50px', 
                                                    height: '50px', 
                                                    borderRadius: '12px', 
                                                    background: card.bg, 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
                                                }}
                                            >
                                                {React.createElement(card.icon, {
                                                    style: { fontSize: '24px', color: card.color }
                                                })}
                                            </Box>
                                            <Typography variant="subtitle1" component="h3" sx={{ color: '#0f172a', fontWeight: '700', fontSize: '15px', lineHeight: 1.3 }}>
                                                {card.title}
                                            </Typography>
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
            </Box>

            {/* الشريط السفلي باللون الكحلي المزرق */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    textAlign: 'center',
                    py: 1.2,
                    zIndex: 1100,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
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