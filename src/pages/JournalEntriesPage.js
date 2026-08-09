// src/pages/JournalEntriesPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import './JournalEntriesPage.css';

const JournalEntriesPage = () => {
    const [journalEntries, setJournalEntries] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // 1. جلب السنوات الأكاديمية عند تحميل الصفحة
    const fetchAcademicYears = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/academic-years');
            setAcademicYears(response.data);
            const activeYear = response.data.find(year => year.isActive);
            if (activeYear) {
                setSelectedAcademicYearId(activeYear.id);
                fetchJournalEntries({ academicYearId: activeYear.id });
            } else {
                fetchJournalEntries({}); 
            }
        } catch (err) {
            console.error("Failed to fetch academic years:", err);
            setError("فشل في تحميل السنوات الأكاديمية.");
        }
    };

    // 2. الدالة المركزية لجلب البيانات (تدعم البحث والفلترة)
    const fetchJournalEntries = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const isSearch = params.academicYearId || params.startDate || params.endDate;
            const url = isSearch 
                ? 'http://localhost:8080/api/journal-entries/search' 
                : 'http://localhost:8080/api/journal-entries';

            const response = await axios.get(url, { params });
            setJournalEntries(response.data);
        } catch (err) {
            console.error("خطأ في الاتصال:", err);
            setError("فشل في تحميل القيود المحاسبية. تأكد من تشغيل السيرفر.");
        } finally {
            setLoading(false);
        }
    };

    // 3. معالج البحث بالتاريخ
    const handleDateSearch = () => {
        const params = {};
        if (selectedAcademicYearId) params.academicYearId = selectedAcademicYearId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        fetchJournalEntries(params);
    };

    // 4. معالج بحث تاريخ اليوم
    const handleSearchToday = () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        setStartDate(today);
        setEndDate(today);
        fetchJournalEntries({ 
            academicYearId: selectedAcademicYearId, 
            startDate: today, 
            endDate: today 
        });
    };

    // 5. إعادة تعيين الفلاتر
    const handleResetSearch = () => {
        setStartDate('');
        setEndDate('');
        setSelectedAcademicYearId('');
        fetchJournalEntries({}); 
    };

    // 6. تغيير السنة الأكاديمية والبحث التلقائي
    const handleAcademicYearChange = (event) => {
        const yearId = event.target.value;
        setSelectedAcademicYearId(yearId);
        fetchJournalEntries({ 
            academicYearId: yearId, 
            startDate: startDate, 
            endDate: endDate 
        });
    };

    useEffect(() => {
        fetchAcademicYears();
    }, []);

    if (loading) return <div className="loading-message">جاري تحميل البيانات...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="journal-entries-container">
            <h1>القيود المحاسبية</h1>

            <div className="filter-section">
                <label htmlFor="academicYearSelect">اختر السنة الأكاديمية:</label>
                <select
                    id="academicYearSelect"
                    value={selectedAcademicYearId}
                    onChange={handleAcademicYearChange}
                    className="academic-year-select"
                >
                    <option value="">كل السنوات</option>
                    {academicYears.map(year => (
                        <option key={year.id} value={year.id}>
                            {year.yearName} {year.isActive && '(نشطة)'}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ margin: '0 5px' }}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ margin: '0 5px' }}
                />
                
                <button onClick={handleDateSearch} className="search-button">بحث بالتاريخ</button>
                <button onClick={handleSearchToday} className="search-button">قيود اليوم</button>
                <button onClick={handleResetSearch} className="reset-button">عرض الكل</button>
            </div>

            {journalEntries.length === 0 ? (
                <div className="info-message">لا توجد قيود محاسبية متاحة للمعايير المختارة.</div>
            ) : (
                <div className="table-responsive">
                    <table className="journal-entries-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>التاريخ</th>
                                <th>رقم المستند / السند</th>
                                <th>الوصف / البيان</th>
                                <th>نوع المعاملة</th>
                                <th>الحساب المدين</th>
                                <th>الحساب الدائن</th>
                                <th>المبلغ</th>
                                <th>السنة الأكاديمية</th>
                            </tr>
                        </thead>
                        <tbody>
                            {journalEntries.map(entry => (
                                <tr key={entry.id}>
                                    <td>{entry.id}</td>
                                    <td>{entry.entryDate ? new Date(entry.entryDate).toLocaleDateString('ar-YE') : '---'}</td>
                                    {/* عمود مستقل لعرض رقم السند أو المستند */}
{/* عمود مستقل لعرض رقم السند أو المستند */}
<td>
    <span style={{ fontWeight: 'bold', color: '#0066cc' }}>
        {entry.referenceNumber 
            ? entry.referenceNumber 
            : (entry.transactionType === 'PAYROLL' 
                ? `PAY-${entry.id}` 
                : (entry.description && entry.description.includes('رقم:') 
                    ? entry.description.split('رقم:')[1].trim().split(' ')[0] 
                    : '---'))}
    </span>
</td>
                                    <td>{entry.description}</td>
                                    <td>{entry.transactionType}</td>
                                    <td>{entry.debitAccount ? (entry.debitAccount.accountName || entry.debitAccount.name) : '---'}</td>
                                    <td>{entry.creditAccount ? (entry.creditAccount.accountName || entry.creditAccount.name) : '---'}</td>
                                    <td>{entry.amount ? entry.amount.toLocaleString('ar-YE') : '0'}</td>
                                    <td>{entry.academicYear ? entry.academicYear.yearName : '---'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default JournalEntriesPage;