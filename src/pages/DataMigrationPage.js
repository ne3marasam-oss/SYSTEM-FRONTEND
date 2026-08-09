// src/pages/DataMigrationPage.js
import React, { useState } from 'react';
import axios from 'axios';
import './DataMigrationPage.css'; // سنقوم بإنشاء هذا الملف لاحقاً

const DataMigrationPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState(''); // 'students', 'expenses', 'payments', etc.
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
        setIsError(false);
    };

    const handleFileTypeChange = (event) => {
        setFileType(event.target.value);
        setSelectedFile(null); // Clear selected file when type changes
        setMessage('');
        setIsError(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('الرجاء اختيار ملف للتحميل.');
            setIsError(true);
            return;
        }
        if (!fileType) {
            setMessage('الرجاء اختيار نوع البيانات المراد ترحيلها.');
            setIsError(true);
            return;
        }

        setLoading(true);
        setMessage('');
        setIsError(false);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // بناء URL ديناميكيًا بناءً على fileType
            const uploadUrl = `https://system-backend-rwsk.onrender.com/api/import/${fileType}`;
            const response = await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(`تم ترحيل البيانات بنجاح: ${response.data.message || 'لا توجد رسالة محددة.'}`);
            setIsError(false);
            setSelectedFile(null); // Clear the file input
            document.getElementById('fileInput').value = ''; // Reset file input visually
        } catch (error) {
            console.error('Error uploading file:', error);
            setIsError(true);
            if (error.response) {
                setMessage(`فشل ترحيل البيانات: ${error.response.data.message || error.response.statusText}`);
            } else if (error.request) {
                setMessage('لا يمكن الاتصال بالخادم. يرجى التأكد من تشغيل الواجهة الخلفية (Backend).');
            } else {
                setMessage('حدث خطأ غير متوقع أثناء إعداد طلب التحميل.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="data-migration-page-container">
            <h1>ترحيل البيانات</h1>
            <p className="description-text">
                قم بتحميل ملفات CSV أو Excel لترحيل البيانات إلى النظام. يرجى التأكد من أن الملفات منسقة بشكل صحيح.
            </p>

            <div className="form-section">
                <div className="form-group">
                    <label htmlFor="fileType">نوع البيانات:</label>
                    <select id="fileType" value={fileType} onChange={handleFileTypeChange}>
                        <option value="">اختر نوع البيانات...</option>
                        <option value="students">الطلاب</option>
                        <option value="academic-years">السنوات الأكاديمية</option>
                        <option value="accounts">الحسابات</option>
                        <option value="fee-types">أنواع الرسوم</option>
                        <option value="student-fees">رسوم الطلاب</option>
                        <option value="payments">المدفوعات</option>
                        <option value="expenses">المصروفات</option>
                        <option value="employees">الموظفون</option>
                        <option value="payroll">الرواتب</option>
                        {/* أضف المزيد من الخيارات حسب نقاط نهاية الاستيراد في الواجهة الخلفية */}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="fileInput">اختر ملف:</label>
                    <input
                        type="file"
                        id="fileInput"
                        onChange={handleFileChange}
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    />
                </div>

                <button onClick={handleUpload} disabled={loading || !selectedFile || !fileType} className="upload-button">
                    {loading ? 'جاري التحميل...' : 'ترحيل البيانات'}
                </button>

                {message && (
                    <div className={`message ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </div>

            <div className="guidance-section">
                <h3>إرشادات ترحيل البيانات:</h3>
                <ul>
                    <li>يجب أن يكون الملف بتنسيق CSV أو Excel (.xlsx, .xls).</li>
                    <li>تأكد من أن الصف الأول في الملف يحتوي جميع حقول البيانات.</li>
                    <li>يجب أن تتطابق أسماء الأعمدة في ملفك مع أسماء الحقول المتوقعة .</li>
                    <li>للتواريخ، استخدم تنسيقًا واضحًا مثل `YYYY-MM-DD` أو `YYYY-MM-DD HH:MM:SS`.</li>
                    <li>للعلاقات (مثل `academicYearId` أو `accountId`)، يجب أن تحتوي على الـ ID الصحيح للكائن المرتبط الموجود بالفعل في قاعدة البيانات.</li>
                    <li>للحصول على قوالب دقيقة، يرجى مراجعة   طلب قوالب من مطور النظام .</li>
                </ul>
            </div>
        </div>
    );
};

export default DataMigrationPage;
