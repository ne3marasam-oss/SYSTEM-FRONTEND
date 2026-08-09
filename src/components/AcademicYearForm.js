import React, { useState, useEffect } from 'react';
import './AcademicYearForm.css'; 

const AcademicYearForm = ({ initialData, onSubmit, onCancel }) => {
    // الحالة الابتدائية متوافقة مع مسميات الـ Entity في Java
    const [academicYear, setAcademicYear] = useState({
        name: '',              // يمثل YEAR_NAME
        academicYearName: '',  // يمثل ACADEMIC_YEAR_NAME
        startDate: '',         // يمثل start_date
        endDate: '',           // يمثل end_date
        status: 'ACTIVE',
        isActive: true
    });

    useEffect(() => {
        if (initialData) {
            setAcademicYear({
                ...initialData,
                // تنسيق التواريخ للعرض في المتصفح
                startDate: formatDateForInput(initialData.startDate),
                endDate: formatDateForInput(initialData.endDate),
                name: initialData.name || '',
                academicYearName: initialData.academicYearName || ''
            });
        }
    }, [initialData]);

    // معالجة التواريخ القادمة من السيرفر (سواء مصفوفة أو نص)
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        if (Array.isArray(dateValue)) {
            const [year, month, day] = dateValue;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        return new Date(dateValue).toISOString().split('T')[0];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAcademicYear(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // إرسال البيانات النهائية للمطابقة مع الـ Backend Entity
        // الأسماء هنا يجب أن تطابق Variables في AcademicYear.java تماماً
        onSubmit(academicYear);
    };

    return (
        <div className="academic-year-container">
            <h1 className="main-header">إدارة السنوات الدراسية</h1>
            
            <div className="form-card-box">
                <h2 className="form-sub-header">إضافة سنة دراسية جديدة</h2>
                
                <form onSubmit={handleSubmit} className="custom-year-form">
                    
                    {/* الحقل الأول: يقابل حقل name في الـ Entity */}
                    <div className="input-field-group">
                        <label>اسم السنة:</label>
                        <input
                            type="text"
                            name="name"
                            value={academicYear.name}
                            onChange={handleChange}
                            placeholder="مثال: 2025"
                            required
                        />
                    </div>

                    {/* الحقل الثاني: يقابل حقل academicYearName في الـ Entity */}
                    <div className="input-field-group">
                        <label>اسم السنة الأكاديمية:</label>
                        <input
                            type="text"
                            name="academicYearName"
                            value={academicYear.academicYearName}
                            onChange={handleChange}
                            placeholder="مثال: 2024-2025"
                            required 
                        />
                    </div>

                    <div className="input-field-group">
                        <label>تاريخ البدء:</label>
                        <input
                            type="date"
                            name="startDate"
                            lang="en-US"
                            value={academicYear.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-field-group">
                        <label>تاريخ الانتهاء:</label>
                        <input
                            type="date"
                            name="endDate"
                            lang="en-US"
                            value={academicYear.endDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="button-actions-row">
                        <button type="button" onClick={onCancel} className="btn-cancel-gray">إلغاء</button>
                        <button type="submit" className="btn-add-blue">إضافة السنة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AcademicYearForm;