// src/pages/ClosingEntriesPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClosingEntriesPage.css'; // You'll create this CSS file
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // أيقونات للرسائل

const ClosingEntriesPage = () => {
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
    const [closingDate, setClosingDate] = useState(''); // Default to current date or end of academic year
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [closingStatusData, setClosingStatusData] = useState([]); // To display status of closed years

    useEffect(() => {
        // Load academic years on component mount
        const fetchAcademicYears = async () => {
            try {
                const academicYearsRes = await axios.get('http://localhost:8080/api/academic-years');
                setAcademicYears(Array.isArray(academicYearsRes.data) ? academicYearsRes.data : []);
            } catch (err) {
                console.error('Failed to load academic years:', err);
                setError('فشل في تحميل السنوات الأكاديمية.');
            }
        };

        // Load initial closing status
        const fetchClosingStatus = async () => {
            try {
                const statusRes = await axios.get('http://localhost:8080/api/closing-entries/status');
                setClosingStatusData(Array.isArray(statusRes.data) ? statusRes.data : []);
            } catch (err) {
                console.error('Failed to load closing status:', err);
                // لا نضع setError هنا لأن عدم وجود بيانات إقفال سابقة ليس خطأً
            }
        };

        fetchAcademicYears();
        fetchClosingStatus();

        // Set default closing date to today
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        setClosingDate(`${year}-${month}-${day}`);

    }, []);

    const handleAcademicYearChange = (e) => {
        setSelectedAcademicYearId(e.target.value);
        setMessage(''); // Clear previous messages
        setError(null);
    };

    const handleClosingDateChange = (e) => {
        setClosingDate(e.target.value);
        setMessage(''); // Clear previous messages
        setError(null);
    };

    const handlePerformClosing = async () => {
        if (!selectedAcademicYearId) {
            setError('الرجاء اختيار سنة أكاديمية لإجراء الإقفال.');
            return;
        }
        if (!closingDate) {
            setError('الرجاء تحديد تاريخ الإقفال.');
            return;
        }

        const selectedYearName = academicYears.find(y => y.id === parseInt(selectedAcademicYearId))?.yearName || 'غير معروف';

        if (!window.confirm(`هل أنت متأكد من رغبتك في إجراء الإقفال المحاسبي للسنة الأكاديمية "${selectedYearName}"؟ هذه العملية ستقوم بتصفير الحسابات الاسمية بشكل دائم في قاعدة البيانات ولا يمكن التراجع عنها بسهولة.`)) {
            return; // User cancelled
        }

        setLoading(true);
        setMessage('');
        setError(null);

        try {
            const response = await axios.post('http://localhost:8080/api/closing-entries/process', {
                academicYearId: selectedAcademicYearId,
                closingDate: closingDate
            });
            setMessage(response.data.message || 'تمت عملية الإقفال بنجاح!');
            // Re-fetch closing status to update the table
            const statusRes = await axios.get('http://localhost:8080/api/closing-entries/status');
            setClosingStatusData(Array.isArray(statusRes.data) ? statusRes.data : []);

        } catch (err) {
            console.error('Failed to perform closing entries:', err);
            if (err.response) {
                setError(`خطأ من الخادم: ${err.response.status} - ${err.response.data.message || 'مشكلة غير معروفة أثناء الإقفال.'}`);
            } else if (err.request) {
                setError('لا يمكن الاتصال بالخادم. يرجى التأكد من تشغيل الواجهة الخلفية (Backend).');
            } else {
                setError('حدث خطأ غير متوقع أثناء إعداد طلب الإقفال.');
            }
        } finally {
            setLoading(false);
        }
    };

    // استخدام 'ar-EG' لتنسيق العملة باللغة العربية مع ريال يمني
    const formatCurrency = (amount) => {
        return amount?.toLocaleString('ar-EG', { style: 'currency', currency: 'YER' }) || formatCurrency(0);
    };

    return (
        <div className="closing-entries-page-container">
            <h1>إقفال الحسابات للسنة الدراسية</h1>

            <div className="closing-form-section">
                <h3>إجراء الإقفال</h3>
                <div className="form-group">
                    <label htmlFor="academicYear">السنة الأكاديمية:</label>
                    <select
                        id="academicYear"
                        value={selectedAcademicYearId}
                        onChange={handleAcademicYearChange}
                        disabled={loading}
                    >
                        <option value="">-- اختر سنة --</option>
                        {academicYears.map(year => (
                            <option key={year.id} value={year.id}>{year.yearName}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="closingDate">تاريخ الإقفال:</label>
                    <input
                        type="date"
                        id="closingDate"
                        value={closingDate}
                        onChange={handleClosingDateChange}
                        disabled={loading}
                    />
                </div>
                <button
                    onClick={handlePerformClosing}
                    disabled={loading || !selectedAcademicYearId || !closingDate}
                    className="perform-closing-button"
                >
                    {loading ? 'جاري الإقفال...' : 'إجراء الإقفال للسنة المختارة'}
                </button>

                {message && (
                    <div className="status-message success-message">
                        <FaCheckCircle />
                        <p>{message}</p>
                    </div>
                )}
                {error && (
                    <div className="status-message error-message">
                        <FaExclamationCircle />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            <div className="closing-status-section">
                <h3>حالة إقفال السنوات</h3>
                {closingStatusData.length === 0 ? (
                    <p className="no-data-message">لا توجد بيانات عن حالة الإقفالات.</p>
                ) : (
                    <table className="closing-status-table">
                        <thead>
                        <tr>
                            <th>السنة الأكاديمية</th>
                            <th>تاريخ الإقفال</th>
                            <th>صافي الدخل/الخسارة</th>
                            <th>الحالة</th>
                        </tr>
                        </thead>
                        <tbody>
                        {closingStatusData.map(status => (
                            <tr key={status.academicYearId}>
                                <td>{status.yearName}</td>
                                <td>{status.closingDate}</td>
                                <td>{formatCurrency(status.netIncomeLoss)}</td>
                                <td>{status.status}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ClosingEntriesPage;