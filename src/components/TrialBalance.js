// src/pages/TrialBalancePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TrialBalancePage.css'; // ملف التنسيقات
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // أيقونات للرسائل

const TrialBalancePage = () => {
    const [trialBalanceData, setTrialBalanceData] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [closingStatusMessage, setClosingStatusMessage] = useState(null); 

    const [filters, setFilters] = useState({
        academicYearId: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        setClosingStatusMessage(null);
    }, [filters.academicYearId, filters.startDate, filters.endDate]);

    const loadInitialData = async () => {
        setLoading(true);
        setError(null);
        setClosingStatusMessage(null); 
        try {
            const academicYearsRes = await axios.get('http://localhost:8080/api/academic-years');
            const years = Array.isArray(academicYearsRes.data) ? academicYearsRes.data : [];
            setAcademicYears(years);

            let currentAcademicYearId = filters.academicYearId;
            if (!currentAcademicYearId && years.length > 0) {
                const activeYear = years.find(year => year.isActive);
                if (activeYear) {
                    currentAcademicYearId = activeYear.id;
                } else {
                    currentAcademicYearId = years[0].id;
                }
                
                if (currentAcademicYearId !== filters.academicYearId) {
                    setFilters(prevFilters => ({
                        ...prevFilters,
                        academicYearId: currentAcademicYearId
                    }));
                }
            }

            if (!currentAcademicYearId) {
                setTrialBalanceData([]);
                setLoading(false);
                return;
            }

            const params = {
                academicYearId: currentAcademicYearId,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined
            };

            const trialBalanceRes = await axios.get('http://localhost:8080/api/trial-balance-report', { params });
            setTrialBalanceData(Array.isArray(trialBalanceRes.data) ? trialBalanceRes.data : []);

        } catch (err) {
            console.error('Failed to load trial balance data:', err);
            setError(err.response?.data?.message || 'فشل الاتصال بالخادم. تأكد من تشغيل الـ Backend.');
            setTrialBalanceData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    const handleApplyFilters = () => {
        setClosingStatusMessage(null);
        loadInitialData();
    };

    // --- الدالة المعدلة لإقفال السنة ---
    const handleCloseYear = async () => {
        if (!filters.academicYearId) {
            setClosingStatusMessage({ type: 'error', text: 'الرجاء اختيار سنة أكاديمية لإجراء الإقفال.' });
            return;
        }

        const selectedYear = academicYears.find(year => year.id === parseInt(filters.academicYearId));
        const selectedYearName = selectedYear?.yearName || 'السنة المختارة';

        if (!window.confirm(`هل أنت متأكد من إقفال السنة "${selectedYearName}"؟ سيتم تصفير الحسابات الاسمية.`)) {
            return;
        }

        setLoading(true);
        setClosingStatusMessage(null);

        try {
            // المسار الجديد المطابق لـ YearEndClosingController
            const url = `http://localhost:8080/api/closing-entries/close-year/${filters.academicYearId}`;
            
            // إرسال كائن DTO بدلاً من ID فقط
            const closingDto = {
                academicYearId: filters.academicYearId,
                closingDate: new Date().toISOString().split('T')[0], // تاريخ اليوم بصيغة YYYY-MM-DD
                description: `إقفال نهاية السنة المالية لـ ${selectedYearName}`
            };

            const response = await axios.post(url, closingDto);

            if (response.status === 200) {
                setClosingStatusMessage({
                    type: 'success',
                    text: response.data.message || `تم إقفال السنة "${selectedYearName}" وتصفير الحسابات بنجاح.`
                });
                // تحديث الجدول فوراً لرؤية الأرصدة المصفّرة
                loadInitialData();
            }
        } catch (err) {
            console.error('Error during closing process:', err);
            const errorText = err.response?.data?.error || err.response?.data?.message || 'حدث خطأ أثناء الإقفال.';
            setClosingStatusMessage({ type: 'error', text: `خطأ: ${errorText}` });
        } finally {
            setLoading(false);
        }
    };

    const totalDebit = trialBalanceData.reduce((sum, item) => sum + (item.debitBalance || 0), 0);
    const totalCredit = trialBalanceData.reduce((sum, item) => sum + (item.creditBalance || 0), 0);

    const formatCurrency = (amount) => {
        return amount.toLocaleString('ar-YE', { style: 'currency', currency: 'YER' });
    };

    if (loading && academicYears.length === 0) return <div className="loading">جاري التحميل...</div>;

    return (
        <div className="trial-balance-page-container">
            <h1>ميزان المراجعة</h1>

            <div className="filters-section">
                <h3>تصفية ميزان المراجعة</h3>
                <div className="form-group">
                    <label>السنة الأكاديمية:</label>
                    <select name="academicYearId" value={filters.academicYearId} onChange={handleFilterChange}>
                        <option value="">كل السنوات</option>
                        {academicYears.map(year => (
                            <option key={year.id} value={year.id}>{year.yearName}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>من تاريخ:</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                </div>
                <div className="form-group">
                    <label>إلى تاريخ:</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                </div>
                <button onClick={handleApplyFilters} className="apply-filters-button" disabled={loading}>تطبيق الفلاتر</button>
            </div>

            {closingStatusMessage && (
                <div className={`status-message ${closingStatusMessage.type}`}>
                    {closingStatusMessage.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    <p>{closingStatusMessage.text}</p>
                </div>
            )}

            {trialBalanceData.length === 0 ? (
                <p className="no-data-message">لا توجد بيانات متاحة حالياً.</p>
            ) : (
                <div className="trial-balance-table">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم الحساب</th>
                                <th>اسم الحساب</th>
                                <th>الرصيد المدين</th>
                                <th>الرصيد الدائن</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trialBalanceData.map(item => (
                                <tr key={item.accountCode}>
                                    <td>{item.accountCode}</td>
                                    <td>{item.accountName}</td>
                                    <td className="debit-balance">{formatCurrency(item.debitBalance || 0)}</td>
                                    <td className="credit-balance">{formatCurrency(item.creditBalance || 0)}</td>
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td colSpan="2">الإجمالي</td>
                                <td className="debit-balance-total">{formatCurrency(totalDebit)}</td>
                                <td className="credit-balance-total">{formatCurrency(totalCredit)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <button
                        onClick={handleCloseYear}
                        className="close-year-button"
                        disabled={loading || !filters.academicYearId}
                    >
                        {loading ? 'جاري المعالجة...' : 'إجراء إقفال السنة (تصفير فعلي)'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default TrialBalancePage;