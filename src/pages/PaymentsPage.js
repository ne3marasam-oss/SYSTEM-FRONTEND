// src/pages/PaymentsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PaymentsPage.css';
import PaymentReceipt from '../components/PaymentReceipt';

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [printingReceipt, setPrintingReceipt] = useState(null);

    // حالات البحث
    const [searchQuery, setSearchQuery] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // دالة جلب المدفوعات من الواجهة الخلفية
    const fetchPayments = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            // تجميع المعايير الصالحة فقط لتجنب خطأ 400
            const validParams = {};
            if (params.query) validParams.query = params.query;
            if (params.academicYear) validParams.academicYear = params.academicYear;
            if (params.startDate) validParams.startDate = params.startDate;
            if (params.endDate) validParams.endDate = params.endDate;

            // تحديد المسار بناءً على وجود معايير بحث
            const url = Object.keys(validParams).length > 0
                ? 'http://localhost:8080/api/payments/search'
                : 'http://localhost:8080/api/payments';

            const response = await axios.get(url, {
                params: validParams,
            });
            setPayments(response.data);
            setLoading(false);
        } catch (err) {
            setError('فشل في جلب بيانات المدفوعات.');
            setLoading(false);
            console.error('Failed to fetch payments:', err);
        }
    };

    // جلب كل المدفوعات عند تحميل الصفحة لأول مرة
    useEffect(() => {
        fetchPayments();
    }, []);

    // دالة البحث التي يتم استدعاؤها عند النقر على الزر
    const handleSearch = () => {
        const params = {
            query: searchQuery,
            academicYear: academicYear,
            startDate: startDate,
            endDate: endDate
        };
        fetchPayments(params);
    };

    // دالة الحذف
    const handleDeletePayment = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
            try {
                await axios.delete(`http://localhost:8080/api/payments/${id}`);
                // إعادة جلب القائمة بعد الحذف
                fetchPayments();
            } catch (err) {
                setError('فشل في حذف الدفعة');
                console.error('Failed to delete payment:', err);
            }
        }
    };

    // دالة عرض الإيصال للطباعة
    const handlePrintReceipt = (payment) => {
        setPrintingReceipt(payment);
    };

    // دالة إغلاق شاشة الطباعة
    const handleClosePrintView = () => {
        setPrintingReceipt(null);
    };

    if (loading) {
        return <div className="loading">جاري التحميل...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="payments-page">
            <h1 className="page-title">إدارة المدفوعات</h1>

            {/* نموذج البحث */}
            <div className="search-form">
                <input
                    type="text"
                    placeholder="ابحث بالاسم أو المرجع..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <button onClick={handleSearch} className="search-button">بحث</button>
            </div>

            {/* جدول عرض الدفعات */}
            {payments.length === 0 ? (
                <div className="no-data">لا توجد مدفوعات لعرضها.</div>
            ) : (
                <div className="payments-table-container">
                    <table className="payments-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>الطالب</th>
                            <th>المبلغ</th>
                            <th>التاريخ</th>
                            <th>طريقة الدفع</th>
                            <th>رقم المرجع</th>
                            <th>الإجراءات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.studentFirstName} {p.studentLastName}</td>
                                <td>{p.amount}</td>
                                <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                <td>{p.paymentMethod}</td>
                                <td>{p.referenceNumber}</td>
                                <td className="actions-cell">
                                    <button onClick={() => handleDeletePayment(p.id)} className="delete-button">
                                        حذف
                                    </button>
                                    <button onClick={() => handlePrintReceipt(p)} className="print-button">
                                        طباعة إيصال
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* عرض الإيصال للطباعة */}
            {printingReceipt && (
                <div className="print-view-overlay">
                    <button onClick={handleClosePrintView} className="close-print-view no-print">إغلاق عرض الطباعة</button>
                    <PaymentReceipt payment={printingReceipt} />
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;