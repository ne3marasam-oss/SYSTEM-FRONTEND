// src/components/SchoolForm.js
import React, { useState, useEffect } from 'react';
import './SchoolForm.css';

const SchoolForm = ({ initialData, onSubmit, onCancel }) => {
    // حالة لتخزين بيانات المدرسة في النموذج
    const [school, setSchool] = useState({
        name: '',
        address: '',
        phoneNumber: '',
        email: ''
    });

    // ✅ حالة جديدة لتخزين ملف شعار المدرسة المختار
    const [logoFile, setLogoFile] = useState(null);

    // حالة لتحديد ما إذا كنا في وضع التعديل (لتغيير عنوان النموذج)
    const [isEditMode, setIsEditMode] = useState(false);

    // useEffect لتعبئة النموذج بالبيانات الأولية عند التعديل
    useEffect(() => {
        if (initialData) {
            setIsEditMode(true);
            setSchool({
                name: initialData.name || '',
                address: initialData.address || '',
                phoneNumber: initialData.phoneNumber || '',
                email: initialData.email || ''
            });
        } else {
            setIsEditMode(false);
            setSchool({
                name: '',
                address: '',
                phoneNumber: '',
                email: ''
            });
        }
        setLogoFile(null); // إعادة تعيين ملف الشعار عند تغيير البيانات الأولية
    }, [initialData]);

    // معالج التغيير لحقول النص في النموذج
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSchool((prevSchool) => ({
            ...prevSchool,
            [name]: value,
        }));
    };

    // ✅ معالج تغيير الملف (شعار المدرسة)
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    // معالج الإرسال للنموذج
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!school.name) {
            alert('اسم المدرسة مطلوب.');
            return;
        }

        // ✅ إرسال البيانات مع ملف الشعار (logoFile) إلى المكون الأب (SchoolPage)
        onSubmit({
            ...school,
            logoFile
        });
    };

    return (
        <div className="school-form-container">
            <h2>{isEditMode ? 'تعديل معلومات المدرسة وشعارها' : 'إضافة مدرسة جديدة'}</h2>
            <form onSubmit={handleSubmit} className="school-form">
                <div className="form-group">
                    <label htmlFor="name">اسم المدرسة:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={school.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="address">العنوان:</label>
                    <textarea
                        id="address"
                        name="address"
                        value={school.address}
                        onChange={handleChange}
                        rows="3"
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber">رقم الهاتف:</label>
                    <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={school.phoneNumber}
                        onChange={handleChange}
                        maxLength="50"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">البريد الإلكتروني:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={school.email}
                        onChange={handleChange}
                    />
                </div>

                {/* ✅ حقل جديد لاختيار رفع شعار المدرسة (Logo) */}
                <div className="form-group">
                    <label htmlFor="logo">شعار المدرسة (اللوجو):</label>
                    <input
                        type="file"
                        id="logo"
                        name="logo"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {initialData && initialData.logoUrl && !logoFile && (
                        <small className="form-text text-muted" style={{ display: 'block', marginTop: '5px' }}>
                            (ملاحظة: يوجد شعار حالي للمدرسة، اترك الحقل فارغاً إذا لم ترد تغييره)
                        </small>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        {isEditMode ? 'حفظ التعديلات' : 'إضافة مدرسة'}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SchoolForm;