import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FeeTypeForm from '../components/FeeTypeForm';
import './FeeTypesPage.css';

const FeeTypesPage = () => {
    const [feeTypes, setFeeTypes] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedFeeType, setSelectedFeeType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:8080/api/fee-types';
    const YEARS_API_URL = 'http://localhost:8080/api/academic-years';

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [feeTypesRes, academicYearsRes] = await Promise.all([
                axios.get(API_BASE_URL),
                axios.get(YEARS_API_URL)
            ]);
            
            setFeeTypes(Array.isArray(feeTypesRes.data) ? feeTypesRes.data : []);
            setAcademicYears(Array.isArray(academicYearsRes.data) ? academicYearsRes.data : []);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('تعذر جلب البيانات. تأكد من تشغيل السيرفر.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFeeTypes = async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            setFeeTypes(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error refreshing list:', err);
        }
    };

    const handleAddFeeType = () => {
        setSelectedFeeType(null);
        setShowForm(true);
    };

    const handleEditFeeType = (feeType) => {
        setSelectedFeeType(feeType);
        setShowForm(true);
    };

    const handleDeleteFeeType = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا النوع؟')) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                fetchFeeTypes();
                alert('تم الحذف بنجاح');
            } catch (err) {
                alert('فشل الحذف. قد يكون النوع مرتبطاً بسجلات أخرى.');
            }
        }
    };

   const handleFormSubmit = async (formData) => {
    try {
        // بناء الكائن النهائي بشكل يضمن وصول السنة الأكاديمية للسيرفر
        const dataToSend = {
            ...formData,
            // إذا كان التعديل، نلحق الـ ID الخاص بالسجل
            id: selectedFeeType ? selectedFeeType.id : null
        };

        if (selectedFeeType) {
            // التعديل
            await axios.put(`${API_BASE_URL}/${selectedFeeType.id}`, dataToSend);
            alert('تم التحديث بنجاح!');
        } else {
            // الإضافة
            await axios.post(API_BASE_URL, dataToSend);
            alert('تمت الإضافة بنجاح!');
        }
        setShowForm(false);
        setSelectedFeeType(null);
        fetchFeeTypes();
    } catch (err) {
        console.error('Save Error Detail:', err.response?.data);
        const serverMsg = err.response?.data?.message || 'تأكد من اختيار السنة الأكاديمية وصحة البيانات';
        alert(`فشل الحفظ: ${serverMsg}`);
    }
};

    if (loading) return <div className="loading">جاري التحميل...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="fee-types-page-container">
            <h1>إدارة أنواع الرسوم</h1>

            {!showForm && (
                <button onClick={handleAddFeeType} className="add-button">
                    إضافة نوع رسوم جديد
                </button>
            )}

            {showForm ? (
                <FeeTypeForm
                    initialData={selectedFeeType}
                    onSubmit={handleFormSubmit}
                    onCancel={() => { setShowForm(false); setSelectedFeeType(null); }}
                    academicYears={academicYears}
                />
            ) : (
                <div className="fee-types-list">
                    {feeTypes.length === 0 ? (
                        <p>لا توجد بيانات حالياً.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>الاسم</th>
                                    <th>المبلغ</th>
                                    <th>السنة الأكاديمية</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feeTypes.map((feeType) => (
                                    <tr key={feeType.id}>
                                        <td>{feeType.feeName || feeType.name}</td>
                                        <td>{feeType.amount}</td>
                                        <td>
                                            {feeType.academicYear ? 
                                                (feeType.academicYear.yearName || feeType.academicYear.name || "موجودة") 
                                                : "غير محدد"
                                            }
                                        </td>
                                        <td>{feeType.isActive ? 'نشط' : 'غير نشط'}</td>
                                        <td>
                                            <button onClick={() => handleEditFeeType(feeType)} className="edit-button">تعديل</button>
                                            <button onClick={() => handleDeleteFeeType(feeType.id)} className="delete-button">حذف</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default FeeTypesPage;