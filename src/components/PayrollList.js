import React, { useState, useEffect } from 'react';
import payrollService from '../services/payrollService';
import employeeService from '../services/employeeService';
import { Link, useParams } from 'react-router-dom';
import './PayrollList.css';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

const PayrollList = () => {
    const { employeeId } = useParams();
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [employeeName, setEmployeeName] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [totalGrossSalary, setTotalGrossSalary] = useState(0);
    
    const [schoolInfo, setSchoolInfo] = useState({
        name: 'التميز',
        logo: 'http://localhost:8080/uploads/logo.jpg'
    });

    const getMonthName = (monthNumber) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('ar-us', { month: 'long' });
    };

    const formatNumberToEnglish = (num) => {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                try {
const schoolRes = await fetch('http://localhost:8080/api/schools');
if (schoolRes.ok) {
    const schoolData = await schoolRes.json();
    console.log("School Data from DB:", schoolData);

    const activeSchool = Array.isArray(schoolData) ? schoolData[0] : schoolData;

    if (activeSchool) {
        const sName = activeSchool.name || 'التميز';
        
        // البحث عن أي مفتاح يحتوي على كلمة logo أو logo_url أو logoUrl بغض النظر عن طريقة كتابته
        const logoKey = Object.keys(activeSchool).find(key => key.toLowerCase().includes('logo'));
        const rawLogo = logoKey ? activeSchool[logoKey] : null;

        let finalLogo = 'http://localhost:8080/uploads/logo.jpg';
        if (rawLogo) {
            if (rawLogo.startsWith('http')) {
                finalLogo = rawLogo;
            } else {
                const cleanLogoName = rawLogo.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
                finalLogo = `http://localhost:8080/uploads/${cleanLogoName}`;
            }
        }

        setSchoolInfo({
            name: sName,
            logo: finalLogo
        });
    }
}
                } catch (err) {
                    console.log("Using default school info");
                }

                let payrollResponse;
                if (employeeId) {
                    try {
                        const empResponse = await employeeService.getEmployeeById(employeeId);
                        setEmployeeName(empResponse.data.fullName);
                    } catch (e) { console.error("Employee name not found"); }
                    payrollResponse = await payrollService.getPayrollRecordsByEmployeeId(employeeId);
                } else if (filterMonth && filterYear) {
                    payrollResponse = await payrollService.getPayrollRecordsForMonthAndYear(filterMonth, filterYear);
                } else {
                    payrollResponse = await payrollService.getAllPayrollRecords();
                }
                
                setPayrollRecords(Array.isArray(payrollResponse.data) ? payrollResponse.data : []);
                setMessage('');
            } catch (error) {
                console.error("API Error:", error);
                setMessage('فشل في تحميل سجلات الرواتب. تأكد من تشغيل السيرفر وصحة المعرف.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [employeeId, filterMonth, filterYear]);

 useEffect(() => {
        const calculateTotalGrossSalary = () => {
            if (payrollRecords.length > 0) {
                const total = payrollRecords.reduce((sum, record) => {
                    // استثناء السجلات الملغاة من المجموع الكلي
                    if (record.paymentStatus === 'Canceled') {
                        return sum;
                    }
                    return sum + (parseFloat(record.grossSalary) || 0);
                }, 0);
                setTotalGrossSalary(total);
            } else {
                setTotalGrossSalary(0);
            }
        };
        calculateTotalGrossSalary();
    }, [payrollRecords]);

   
const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد أنك تريد إلغاء وأرشفة سجل الرواتب هذا؟')) {
            try {
                // استبدل deletePayrollRecord بدالة الإلغاء أو الأرشفة المتاحة لديك في الـ service
                // مثلاً: payrollService.cancelPayrollRecord(id) أو التسمية المتفق عليها
                await payrollService.cancelPayrollRecord(id); 
                setMessage('تم إلغاء وأرشفة سجل الرواتب بنجاح!');
                
                const refetchFunction = employeeId
                    ? () => payrollService.getPayrollRecordsByEmployeeId(employeeId)
                    : (filterMonth && filterYear ? () => payrollService.getPayrollRecordsForMonthAndYear(parseInt(filterMonth), parseInt(filterYear)) : () => payrollService.getAllPayrollRecords());

                const response = await refetchFunction();
                setPayrollRecords(response.data);
            } catch (error) {
                console.error("خطأ في إلغاء سجل الرواتب:", error);
                setMessage('فشل في إلغاء سجل الرواتب. تأكد من اتصال الخادم.');
            }
        }
    };
    // التعديل هنا: دالة الطباعة لتجنب اختفاء الشعار عبر الانتظار حتى يتم تحميله بالكامل
    const handlePrint = async () => {
        const images = document.querySelectorAll('.print-header img');
        const promises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        });

        await Promise.all(promises);
        setTimeout(() => {
            window.print();
        }, 250);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="payroll-list-container shadow-sm p-4 mb-5 bg-white rounded">
            
            <div className="print-header d-none d-print-block text-center mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px', direction: 'rtl' }}>
                    <div style={{ textAlign: 'right' }}>
                        <h4 style={{ margin: '0', fontWeight: 'bold' }}>{schoolInfo.name}</h4>
                        <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>نظام إدارة الرواتب والشؤون المالية</p>
                    </div>
                       <div>
    <img 
        src={schoolInfo.logo} 
        alt="شعار المدرسة" 
        style={{ width: '70px', height: '70px', objectFit: 'contain', display: 'block' }} 
        onError={(e) => { e.target.style.display = 'none'; }} 
    />
</div>
                </div>

                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
                    {employeeId ? `سجلات الرواتب لـ: ${employeeName || 'الموظف'}` : `سجلات الرواتب لـ ${filterMonth && filterYear ? `${getMonthName(filterMonth)} ${filterYear}` : 'جميع الموظفين'}`}
                </h3>
                {totalGrossSalary > 0 && (
                    <p className="fw-bold" style={{ fontSize: '15px' }}>
                        إجمالي الرواتب: {formatNumberToEnglish(totalGrossSalary)} ر.ي
                    </p>
                )}
            </div>

            <h2 className="text-center mb-4 text-primary no-print">
                {employeeId ? `سجلات الرواتب لـ: ${employeeName || 'الموظف'}` : 'قائمة سجلات الرواتب'}
            </h2>

            {message && (
                <div className={`alert ${message.includes('فشل') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show no-print`} role="alert">
                    {message}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setMessage('')}></button>
                </div>
            )}

            {!employeeId && (
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 no-print">
                    <div className="d-flex align-items-center flex-wrap gap-3">
                        <div className="form-group">
                            <label htmlFor="filterMonth" className="form-label mb-0">الشهر:</label>
                            <select
                                id="filterMonth"
                                className="form-select"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                            >
                                <option value="">جميع الأشهر</option>
                                {[...Array(12).keys()].map(i => (
                                    <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="filterYear" className="form-label mb-0">السنة:</label>
                            <select
                                id="filterYear"
                                className="form-select"
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                            >
                                <option value="">جميع السنوات</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn btn-primary align-self-end" onClick={() => {
                            setFilterMonth(filterMonth);
                            setFilterYear(filterYear);
                        }}>
                            <i className="bi bi-funnel"></i> تصفية
                        </button>
                        <button
                            className="btn btn-info align-self-end"
                            onClick={() => {
                                setFilterMonth('');
                                setFilterYear('');
                            }}>
                            <i className="bi bi-x-circle"></i> مسح الفلاتر
                        </button>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                         <Link to="/payroll/add" className="btn btn-success">
                            <i className="bi bi-plus-circle"></i> إضافة سجل راتب
                        </Link>
                        <button className="btn btn-secondary" onClick={handlePrint}>
                            <i className="bi bi-printer"></i> طباعة
                        </button>
                    </div>
                </div>
            )}

            <div className="card text-center mb-4 shadow-sm">
                <div className="card-body bg-light rounded">
                    <h5 className="card-title text-primary mb-2">مجموع إجمالي الرواتب</h5>
                    <p className="card-text display-6 fw-bold text-success">
                        {formatNumberToEnglish(totalGrossSalary)} ر.ي
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">جاري التحميل...</span>
                    </div>
                    <p className="mt-2">جاري تحميل سجلات الرواتب، يرجى الانتظار...</p>
                </div>
            ) : payrollRecords.length === 0 ? (
                <div className="alert alert-info text-center" role="alert">
                    لا توجد سجلات رواتب لعرضها حالياً
                    {filterMonth || filterYear ? ' حسب معايير التصفية المحددة.' : '.'}
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover table-striped table-bordered payroll-table">
                        <thead className="table-primary">
                        <tr>
                            <th>الرقم</th>
                            {employeeId ? null : <th>اسم الموظف</th>}
                            <th>تاريخ الدفع</th>
                            <th>الشهر/السنة</th>
                            <th>إجمالي الراتب</th>
                            <th>الخصومات</th>
                            <th>الصافي</th>
                            <th>الحالة</th>
                            <th>طريقة الدفع</th>
                            <th className="no-print">الإجراءات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {payrollRecords.map(record => (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                {employeeId ? null : (
                                    <td>
                                        {record.employeeFullName || (record.employee && record.employee.fullName) || 'غير محدد'}
                                    </td>
                                )}
                               <td>{record.paymentDate ? format(new Date(record.paymentDate), 'd MMMM yyyy', { locale: arSA }) : 'غير محدد'}</td>
                                <td>{getMonthName(record.payrollMonth)}/{record.payrollYear}</td>
                                <td>{parseFloat(record.grossSalary).toFixed(2)} ر.ي</td>
                                <td>{parseFloat(record.deductions || record.totalAdvances || 0).toFixed(2)} ر.ي</td>
                                <td>{parseFloat(record.netSalary).toFixed(2)} ر.ي</td>
                                <td>
                                        <span className={`badge ${
                                            record.paymentStatus === 'Paid' ? 'bg-success' :
                                                record.paymentStatus === 'Pending' ? 'bg-warning text-dark' :
                                                    'bg-danger'
                                        }`}>
                                            {record.paymentStatus === 'Paid' ? 'مدفوع' :
                                                record.paymentStatus === 'Pending' ? 'معلق' :
                                                    record.paymentStatus === 'Canceled' ? 'ملغى' : record.paymentStatus}
                                        </span>
                                </td>
                                <td>{record.paymentMethod || 'غير محدد'}</td>
                                <td className="actions-column no-print">
                                    <button
                                        className="btn btn-sm btn-danger mb-1"
                                        onClick={() => handleDelete(record.id)}
                                    >
                                        <i className="bi bi-trash"></i> حذف
                                    </button>
                                    {employeeId && (
                                        <Link to={`/payroll/add/${employeeId}`} className="btn btn-sm btn-success ms-2 mb-1">
                                            <i className="bi bi-plus-circle"></i> إضافة لهذا الموظف
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {employeeId && (
                <div className="d-flex gap-2 mt-3 no-print">
                    <Link to="/employees" className="btn btn-secondary">
                        <i className="bi bi-arrow-right-circle"></i> العودة لقائمة الموظفين
                    </Link>
                    <button className="btn btn-primary" onClick={handlePrint}>
                        <i className="bi bi-printer"></i> طباعة كشف الراتب
                    </button>
                </div>
            )}
        </div>
    );
};

export default PayrollList;