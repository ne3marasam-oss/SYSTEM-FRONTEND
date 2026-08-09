import React, { useState, useEffect } from 'react';
import './FeeTypeForm.css';

const FeeTypeForm = ({ initialData, onSubmit, onCancel, academicYears = [] }) => {
    const [feeType, setFeeType] = useState({
        feeName: '',
        description: '',
        amount: '',
        isActive: true,
        academicYearId: ''
    });
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

   useEffect(() => {
    if (initialData) {
        setIsEditMode(true);
        setFeeType({
            feeName: initialData.feeName || initialData.name || '',
            description: initialData.description || '',
            amount: initialData.amount || '',
            isActive: initialData.isActive !== undefined ? initialData.isActive : true,
            academicYearId: initialData.academicYear?.id || ''
        });
    }

    }, [initialData, academicYears]); // أضفنا academicYears هنا للتأكد من التحديث

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFeeType(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    const submittedData = {
        feeName: feeType.feeName, // سيطابق @JsonProperty("feeName")
        amount: parseFloat(feeType.amount),
        description: feeType.description,
        isActive: feeType.isActive,
        academicYear: {
            id: parseInt(feeType.academicYearId)
        }
        // لا نرسل revenueAccountId لأنه nullable الآن
    };
    onSubmit(submittedData);
};
    return (
        <div className="fee-type-form-container">
            <h2>{isEditMode ? 'تعديل نوع الرسوم' : 'إضافة نوع رسوم جديد'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); setShowConfirmation(true); }} className="fee-type-form">
                
                <div className="form-group">
                    <label>اسم نوع الرسوم:</label>
                    <input name="feeName" value={feeType.feeName} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>المبلغ:</label>
                    <input type="number" name="amount" value={feeType.amount} onChange={handleChange} required step="0.01" />
                </div>

                {/* جزء القائمة المنسدلة - تأكد من هذا الجزء */}
                <div className="form-group">
                    <label>السنة الأكاديمية:</label>
                    <select 
                        name="academicYearId" 
                        value={feeType.academicYearId} 
                        onChange={handleChange} 
                        required
                    >
                        <option value="">اختر سنة...</option>
                        {Array.isArray(academicYears) && academicYears.length > 0 ? (
                            academicYears.map(year => (
                                <option key={year.id} value={year.id}>
                                    {year.yearName || year.name}
                                </option>
                            ))
                        ) : (
                            <option disabled>لا توجد سنوات متاحة</option>
                        )}
                    </select>
                </div>

                <div className="form-group">
                    <label>الوصف:</label>
                    <textarea name="description" value={feeType.description} onChange={handleChange} />
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">حفظ</button>
                    <button type="button" onClick={onCancel} className="cancel-button">إلغاء</button>
                </div>
            </form>

            {showConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>تأكيد الحفظ</h4>
                        <p>هل أنت متأكد من الحفظ؟</p>
                        <button className="confirm-button" onClick={handleConfirmSubmit}>تأكيد</button>
                        <button className="cancel-button" onClick={() => setShowConfirmation(false)}>تراجع</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeTypeForm;