// src/components/AcademicYearList.js
import React from 'react';

const AcademicYearList = ({ academicYears, onEdit, onDelete }) => {
    if (!academicYears || academicYears.length === 0) {
        return <p>لا توجد سنوات دراسية لعرضها.</p>;
    }

    return (
        <div className="academic-year-list-container">
            <h2>قائمة السنوات الدراسية</h2>
            <table className="academic-year-table">
                <thead>
                <tr>
                    <th>اسم السنة</th>
                    <th>السنة الأكاديمية</th>
                    <th>تاريخ البدء</th>
                    <th>تاريخ الانتهاء</th>
                    <th>الإجراءات</th>
                </tr>
                </thead>
                <tbody>
                {academicYears.map(year => (
                    <tr key={year.id}>
                        <td style={{fontWeight: 'bold'}}>{year.name}</td>
                        <td>{year.academicYearName}</td>
                        <td>{new Date(year.startDate).toLocaleDateString('en-us')}</td>
                        <td>{new Date(year.endDate).toLocaleDateString('en-us')}</td>
                        <td>
                            <button onClick={() => onEdit(year.id)} className="edit-button">تعديل</button>
                            <button onClick={() => onDelete(year.id)} className="delete-button">حذف</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AcademicYearList;