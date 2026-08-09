// src/pages/SchoolPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SchoolForm from '../components/SchoolForm';
import './SchoolPage.css';

const SchoolPage = () => {
    const [school, setSchool] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSchool();
    }, []);

    const fetchSchool = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:8080/api/schools');
            if (Array.isArray(response.data) && response.data.length > 0) {
                setSchool(response.data[0]);
            } else if (response.data) {
                setSchool(response.data);
            } else {
                setSchool(null);
            }
        } catch (err) {
            console.error('Error fetching school data:', err);
            if (err.response && err.response.status === 404) {
                setError('لا توجد بيانات مدرسة. يمكنك إضافة واحدة.');
                setSchool(null);
                setShowForm(true);
            } else {
                setError(`خطأ في جلب بيانات المدرسة: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditSchool = () => {
        setShowForm(true);
    };

    // ✅ التعديل هنا ليدعم إرسال الشعار عبر FormData إلى الـ Endpoint الجديدة
    const handleFormSubmit = async (schoolData) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("name", schoolData.name || '');
            formData.append("address", schoolData.address || '');
            formData.append("phoneNumber", schoolData.phoneNumber || '');
            formData.append("email", schoolData.email || '');
            
            // إذا كان هناك ملف شعار تم اختياره في النموذج
            if (schoolData.logoFile) {
                formData.append("logo", schoolData.logoFile);
            }

            if (school && school.id) {
                // تعديل مدرسة موجودة مع الشعار
                await axios.post(`http://localhost:8080/api/schools/update-with-logo/${school.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('تم تحديث معلومات المدرسة والشعار بنجاح!');
            } else {
                // إذا لم تكن موجودة، يمكن استخدام الـ POST العادي أو إنشاء واحدة
                await axios.post('http://localhost:8080/api/schools', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('تم إضافة معلومات المدرسة بنجاح!');
            }
            setShowForm(false);
            fetchSchool();
        } catch (err) {
            console.error('Error saving school data:', err);
            let userMessage = 'فشل في حفظ معلومات المدرسة.';
            if (err.response && err.response.data) {
                userMessage += ` رسالة الخادم: ${typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)}`;
            } else if (err.message) {
                userMessage += ` (${err.message})`;
            }
            alert(userMessage);
            setError(userMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
    };

    if (loading) {
        return <div className="loading">جاري تحميل بيانات المدرسة...</div>;
    }

    if (error && !school && !showForm) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="school-page-container">
            <h1>إدارة معلومات المدرسة</h1>

            {showForm ? (
                <SchoolForm
                    initialData={school}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                />
            ) : (
                <div className="school-details-card">
                    {school ? (
                        <>
                            {/* ✅ عرض شعار المدرسة إذا كان موجوداً */}
                            {school.logoUrl && (
                                <div className="school-logo-preview" style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <img 
                                        src={`http://localhost:8080${school.logoUrl}`} 
                                        alt="شعار المدرسة" 
                                        style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '50%', border: '2px solid #ddd' }} 
                                    />
                                </div>
                            )}
                            <p><strong>اسم المدرسة:</strong> {school.name}</p>
                            <p><strong>العنوان:</strong> {school.address || 'غير محدد'}</p>
                            <p><strong>رقم الهاتف:</strong> {school.phoneNumber || 'غير محدد'}</p>
                            <p><strong>البريد الإلكتروني:</strong> {school.email || 'غير محدد'}</p>
                            <p><strong>تاريخ الإنشاء:</strong> {school.createdAt ? new Date(school.createdAt).toLocaleString('ar-EG') : 'غير محدد'}</p>
                            <p><strong>آخر تحديث:</strong> {school.updatedAt ? new Date(school.updatedAt).toLocaleString('ar-EG') : 'غير محدد'}</p>
                            <button onClick={handleEditSchool} className="edit-button">
                                تعديل معلومات المدرسة والشعار
                            </button>
                        </>
                    ) : (
                        <div className="no-data-message">
                            <p>لا توجد معلومات مدرسة مسجلة.</p>
                            <button onClick={handleEditSchool} className="add-button">
                                إضافة معلومات مدرسة
                            </button>
                            {error && <p className="error-message">{error}</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SchoolPage;