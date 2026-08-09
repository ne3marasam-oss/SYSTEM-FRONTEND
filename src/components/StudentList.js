import React from 'react';

const StudentList = ({ students, onEdit, onDelete }) => {
    if (!students || students.length === 0) {
        return <p>لا يوجد طلاب لعرضهم.</p>;
    }

    return (
        <div className="student-list-container">
            <h2>قائمة الطلاب</h2>
            <table className="student-table">
                <thead>
                    <tr>
                        <th>الاسم الكامل</th>
                        <th>تاريخ الميلاد</th>
                        <th>النوع</th>
                        <th>العنوان</th>
                        <th>رقم الهاتف</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => (
                        <tr key={student.id}>
                            {/* استخدام الحقول كما هي مع التأكد من وجود قيم */}
                            <td>{student.firstName || ''} {student.lastName || ''}</td>
                            
                            {/* معالجة التاريخ لتجنب رسالة Invalid Date */}
                             <td>
                             {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('ar-EG') : 'غير محدد'}
                            </td>

                            {/* إضافة عامل الحماية || '---' لضمان عدم بقاء الخلية فارغة تماماً إذا لم تصل القيمة */}
                            <td>{student.gender || '---'}</td>
                            <td>{student.address || '---'}</td>
                            <td>{student.phoneNumber || '---'}</td>

                            <td>
                                {/* تمرير كائن الطالب بالكامل (student) بدلاً من الـ id فقط لضمان وصول البيانات للفورم عند التعديل */}
                                {/* تأكد من تمرير (student) بالكامل وليس (student.id) فقط */}
                                <button onClick={() => onEdit(student)} className="edit-button">تعديل</button>
                                <button onClick={() => onDelete(student.id)} className="delete-button">حذف</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentList;