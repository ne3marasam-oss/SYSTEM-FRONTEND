// src/pages/AcademicYearsPage.js
import React, { useEffect, useState } from 'react';
import academicYearService from '../services/AcademicYearService'; // استيراد خدمة السنوات
import AcademicYearList from '../components/AcademicYearList';     // استيراد مكون القائمة
import AcademicYearForm from '../components/AcademicYearForm';     // استيراد مكون النموذج
import './AcademicYearsPage.css';                                // استيراد التنسيقات

function AcademicYearsPage() {
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [currentAcademicYear, setCurrentAcademicYear] = useState(null);

    const fetchAcademicYears = async () => {
        try {
            setLoading(true);
            const response = await academicYearService.getAllAcademicYears();
            setAcademicYears(response.data);
            setError(null);
        } catch (err) {
            setError('فشل في جلب بيانات السنوات الدراسية. يرجى التأكد من تشغيل الخادم الخلفي.');
            console.error('Error fetching academic years:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAcademicYears();
    }, []);

    const handleAddAcademicYear = () => {
        setCurrentAcademicYear(null);
        setShowForm(true);
    };

    const handleEditAcademicYear = async (id) => {
        try {
            const response = await academicYearService.getAcademicYearById(id);
            setCurrentAcademicYear(response.data);
            setShowForm(true);
        } catch (err) {
            setError('فشل في جلب بيانات السنة الدراسية للتعديل.');
            console.error('Error fetching academic year for edit:', err);
        }
    };

    const handleDeleteAcademicYear = async (id) => {
        if (window.confirm('هل أنت متأكد أنك تريد حذف هذه السنة الدراسية؟')) {
            try {
                await academicYearService.deleteAcademicYear(id);
                fetchAcademicYears(); // إعادة جلب القائمة بعد الحذف
                console.log('Academic Year deleted successfully!');
            } catch (err) {
                console.error('Error deleting academic year:', err);
                setError('فشل في حذف السنة الدراسية.');
            }
        }
    };

    const handleSubmitForm = async (academicYearData) => {
        try {
            if (currentAcademicYear) {
                await academicYearService.updateAcademicYear(currentAcademicYear.id, academicYearData);
                console.log('Academic Year updated successfully!');
            } else {
                await academicYearService.createAcademicYear(academicYearData);
                console.log('Academic Year added successfully!');
            }
            setShowForm(false);
            fetchAcademicYears(); // إعادة جلب القائمة بعد الإرسال
        } catch (err) {
            setError('فشل في حفظ بيانات السنة الدراسية. يرجى التحقق من البيانات.');
            console.error('Error saving academic year:', err.response ? err.response.data : err.message);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setCurrentAcademicYear(null);
    };

    if (loading) {
        return <p>جاري تحميل بيانات السنوات الدراسية...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="academic-years-page">
            <h1>إدارة السنوات الدراسية</h1>

            {!showForm && (
                <button className="add-button" onClick={handleAddAcademicYear}>
                    إضافة سنة دراسية جديدة
                </button>
            )}

            {showForm ? (
                <AcademicYearForm
                    initialData={currentAcademicYear}
                    onSubmit={handleSubmitForm}
                    onCancel={handleCancelForm}
                />
            ) : (
                <AcademicYearList
                    academicYears={academicYears}
                    onEdit={handleEditAcademicYear}
                    onDelete={handleDeleteAcademicYear}
                />
            )}
        </div>
    );
}

export default AcademicYearsPage;