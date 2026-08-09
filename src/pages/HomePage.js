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

    FaExchangeAlt, // استخدام هذه الأيقونة بدلاً من SwapHoriz لتجنب أخطاء MUI

    FaFileInvoiceDollar,

    FaBookOpen,

    FaSchool,

    FaChartBar,

    FaUsers,

    FaHandHoldingUsd,

    FaSignOutAlt,

    FaMoneyCheckAlt,

    FaBalanceScale,

    FaChartLine,

    FaDatabase

} from 'react-icons/fa';



// استيراد Link من react-router-dom للتوجيه

import { Link as ReactRouterLink } from 'react-router-dom';



// استيراد ملف الشعار الخاص بك

import logoIcon from '../assets/images/sas_logo_no.png';



const HomePage = ({ onLogout }) => {



    // تعريف بيانات بطاقات الميزات

    const featureCards = [

        {

            title: 'إدارة المدرسة',

            description: 'تعديل وعرض بيانات المدرسة الأساسية.',

            icon: FaSchool,

            link: '/school',

            color: '#2196F3',

        },

        {

            title: 'الطلاب',

            description: 'إضافة وعرض بيانات الطلاب.',

            icon: FaUserGraduate,

            link: '/students',

            color: '#795548',

        },

        {

            title: 'السنوات الأكاديمية',

            description: 'إضافة وعرض السنوات والفصول الدراسية.',

            icon: FaCalendarAlt,

            link: '/academic-years',

            color: '#607D8B',

        },

        {

            title: 'إدارة الموظفين',

            description: 'إضافة وتعديل وحذف بيانات الموظفين',

            icon: FaUsers,

            color: '#ff9800',

            link: '/employees'

        },

        {

            title: 'إدارة الرواتب',

            description: 'إنشاء ومتابعة سجلات الرواتب للموظفين',

            icon: FaHandHoldingUsd,

            color: '#9c27b0',

            link: '/payroll'

        },

        {

            title: 'سلف الموظفين',

            description: 'إدارة السلف الشهرية وخصمها من الرواتب.',

            icon: FaHandHoldingUsd,

            color: '#007bff',

            link: '/salary-advances'

        },

        {

            title: 'تحويل الأموال',

            description: 'نقل الأرصدة بين الصناديق والبنوك',

            icon: FaExchangeAlt, // تم التغيير هنا

            link: '/money-transfer', // تأكد أن هذا هو نفس المسار في App.js

            color: '#0288d1',

        },

        {

            title: 'إدارة المصروفات والفواتير',

            description: 'تسجيل وتتبع جميع مصروفات وفواتير المدرسة.',

            icon: FaMoneyBillWave,

            link: '/expenses',

            color: '#F44336',

        },

        {

            title: 'الدخل والإيرادات',

            description: 'عرض وتتبع جميع الدفعات والإيرادات من الطلاب.',

            icon: FaMoneyCheckAlt,

            link: '/income-revenues',

            color: '#4CAF50',

        },

        {

            title: 'تقارير الرسوم',

            description: 'إنشاء وعرض تقارير شاملة عن رسوم الطلاب.',

            icon: FaChartBar,

            link: '/student-fees-reports',

            color: '#FFD54F',

        },

        {

            title: 'إدارة أنواع الرسوم',

            description: 'تحديد أنواع الرسوم الدراسية والأنشطة.',

            icon: FaFileInvoiceDollar,

            link: '/fee-types',

            color: '#4CAF50',

        },

        {

            title: 'تسديد رسوم الطلاب',

            description: 'عرض جميع رسوم الطلاب في جدول تفاعلي.',

            icon: FaFileInvoiceDollar,

            link: '/student-fees-table',

            color: '#2196F3',

        },

        {

            title: 'دفتر الأستاذ العام',

            description: 'عرض وتتبع جميع الحركات المحاسبية المفصلة.',

            icon: FaBookOpen,

            link: '/general-ledger',

            color: '#7B1FA2',

        },

        {

            title: 'ميزان المراجعة',

            description: 'عرض أرصدة الحسابات المدينة والدائنة.',

            icon: FaBalanceScale,

            color: '#4CAF50',

            link: '/trial-balance'

        },

        {

            title: 'شجرة الحسابات',

            description: 'إدارة جميع الحسابات الرئيسية والفرعية.',

            icon: FaBalanceScale,

            color: '#ff9800',

            link: '/chart-of-accounts'

        },

        {

            title: 'القيود المحاسبية',

            description: 'عرض جميع القيود اليومية الناتجة عن العمليات المالية.',

            icon: FaBookOpen,

            color: '#9c27b0',

            link: '/journal-entries'

        },

        {

            title: 'النسخ الاحتياطي والاستعادة',

            description: 'إنشاء واستعادة النسخ الاحتياطية لقاعدة البيانات.',

            icon: FaDatabase,

            link: '/backup-restore',

            color: '#1976d2',

        },

       

    ];



    return (

        <Box sx={{ flexGrow: 1, p: 1, position: 'relative', userSelect: 'none' }}>

            {/* زر تسجيل الخروج */}

            {onLogout && (

                <Box sx={{ position: 'absolute', top: 1, left: 1, zIndex: 1000 }}>

                    <button

                        className="btn btn-danger"

                        onClick={onLogout}

                        style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: '4px' }}

                    >

                        <FaSignOutAlt style={{ marginLeft: '8px' }} /> تسجيل الخروج

                    </button>

                </Box>

            )}



            {/* العنوان والشعار */}

            <Box sx={{

                position: 'absolute',

                top: -90,

                right: 1,

                zIndex: 1000,

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'flex-start',

                p: 1,

            }}>

                <img src={logoIcon} alt="SAS Logo" style={{ height: '200px', marginRight: '20px' }} />

                <Box sx={{ ml: 2 }}>

                    <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', color: '#1a237e' }}>

                        نظام إدارة المدرسة SAS

                    </Typography>

                </Box>

            </Box>



            {/* المحتوى الرئيسي للبطاقات */}

            <Stack spacing={1} sx={{ my: 2, marginTop: '100px' }}>

                <Typography variant="subtitle1" component="p" color="#1a237e" sx={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}>

                    لوحة التحكم الرئيسية

                </Typography>

                <Grid container spacing={1} justifyContent="center">

                    {featureCards.map((card, index) => (

                        <Grid item xs={3} sm={3} md={3} lg={2} key={index}>

                            <MuiLink

                                component={ReactRouterLink}

                                to={card.link || card.path}

                                underline="none"

                                sx={{ display: 'block', height: '100%' }}

                            >

                                <Card

                                    elevation={1}

                                    sx={{

                                        height: '100%',

                                        display: 'flex',

                                        flexDirection: 'column',

                                        alignItems: 'center',

                                        justifyContent: 'center',

                                        p: 1,

                                        transition: 'transform 0.2s, box-shadow 0.2s',

                                        '&:hover': {

                                            transform: 'translateY(-5px)',

                                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',

                                        },

                                        cursor: 'pointer'

                                    }}

                                >

                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                                        {/* استخدام React.createElement لرسم الأيقونة بشكل صحيح */}

                                        {React.createElement(card.icon, {

                                            style: { fontSize: '40px', color: card.color, marginBottom: '8px' }

                                        })}

                                        <Typography variant="subtitle2" component="h3" gutterBottom sx={{ color: 'text.primary', mb: 0.5, textAlign: 'center', lineHeight: 1.2, fontWeight: 'bold' }}>

                                            {card.title}

                                        </Typography>

                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.1 }}>

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

                    backgroundColor: '#1a237e',

                    color: '#ffffff',

                    textAlign: 'center',

                    py: 0.5,

                    overflow: 'hidden',

                    zIndex: 1100,

                }}

            >

                <Typography variant="body2" className="marquee-text">

                    شركة Evosys للانظمة والتدريب للتواصل 775696928

                </Typography>

            </Box>

        </Box>

    );

};



export default HomePage; 

