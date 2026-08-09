import React, { useState, useEffect } from 'react';
import './StudentForm.css';

const StudentForm = ({ initialData, onSubmit, onCancel, academicYears }) => {
    const [student, setStudent] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        phoneNumber: '',
        academicYearId: ''
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        if (initialData) {
            setStudent({
                ...initialData,
                dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : ''
            });
            setIsEditMode(true);
        } else {
            setStudent({
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                gender: '',
                address: '',
                phoneNumber: '',
                academicYearId: ''
            });
            setIsEditMode(false);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudent(prevStudent => ({
            ...prevStudent,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const handleConfirmSubmit = () => {
        setShowConfirmation(false);
        onSubmit(student);
    };

    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
    };

    // التعديل هنا: استخدام year.name بدلاً من year.yearName
    const getAcademicYearName = (id) => {
        if (!id || !academicYears) return 'غير محدد';
        const year = academicYears.find(y => y.id === parseInt(id));
        return year ? year.name : 'غير محدد';
    };

    return (
        <div className="student-form-container">
            <h3 className="form-header">{isEditMode ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
            <form onSubmit={handleSubmit} className="student-form">
                
                <div className="form-group">
                    <label htmlFor="firstName">الاسم الرباعي:</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={student.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="lastName">اللقب:</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={student.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dateOfBirth">تاريخ الميلاد:</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        lang="en-US"
                        value={student.dateOfBirth}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="gender">النوع:</label>
                    <select
                        id="gender"
                        name="gender"
                        value={student.gender}
                        onChange={handleChange}
                        required
                    >
                        <option value="">اختر النوع</option>
                        <option value="ذكر">ذكر</option>
                        <option value="انثى">أنثى</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="address">العنوان:</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={student.address}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber">رقم الهاتف:</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={student.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="academicYearId">السنة الدراسية:</label>
                    <select
                        id="academicYearId"
                        name="academicYearId"
                        value={student.academicYearId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">اختر السنة الدراسية</option>
                        {/* التعديل هنا: استخدام year.name لكي تظهر الأسماء */}
                        {academicYears && academicYears.map(year => (
                            <option key={year.id} value={year.id}>
                                {year.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        {isEditMode ? 'تحديث الطالب' : 'إضافة الطالب'}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">
                        إلغاء
                    </button>
                </div>
            </form>

            {/* النافذة المنبثقة للتأكيد */}
            {showConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>تأكيد بيانات الطالب</h4>
                        <div className="confirmation-details">
                            <p><strong>الاسم:</strong> {student.firstName} {student.lastName}</p>
                            <p><strong>تاريخ الميلاد:</strong> {student.dateOfBirth}</p>
                            <p><strong>النوع:</strong> {student.gender}</p>
                            <p><strong>السنة الدراسية:</strong> {getAcademicYearName(student.academicYearId)}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="confirm-button" onClick={handleConfirmSubmit}>تأكيد</button>
                            <button className="cancel-button-modal" onClick={handleCancelConfirmation}>تعديل</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentForm;