import React, { useEffect, useState } from 'react';
import studentService from '../services/StudentService';
import academicYearService from '../services/AcademicYearService';
import StudentList from '../components/StudentList';
import StudentForm from '../components/StudentForm';
import './StudentsPage.css';

function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentService.getAllStudents();
            setStudents(response.data);
            setError(null);
        } catch (err) {
            setError('فشل في جلب بيانات الطلاب. يرجى التأكد من تشغيل الخادم الخلفي.');
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const response = await academicYearService.getAllAcademicYears();
            setAcademicYears(response.data);
        } catch (err) {
            console.error('Error fetching academic years:', err);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchAcademicYears();
    }, []);

    const handleAddStudent = () => {
        setCurrentStudent(null);
        setShowForm(true);
    };

    // التعديل الجذري هنا: نستقبل كائن الطالب مباشرة
    const handleEditStudent = (student) => {
        // لا نحتاج لعمل await أو fetch هنا لأن البيانات موجودة أصلاً في الجدول
        setCurrentStudent(student);
        setShowForm(true);
    };

    const handleDeleteStudent = async (id) => {
        if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الطالب؟')) {
            try {
                await studentService.deleteStudent(id);
                fetchStudents();
            } catch (err) {
                console.error('Error deleting student:', err);
                setError('فشل في حذف الطالب.');
            }
        }
    };

    const handleSubmitForm = async (studentData) => {
        try {
            if (currentStudent && currentStudent.id) {
                // تعديل طالب موجود
                await studentService.updateStudent(currentStudent.id, studentData);
            } else {
                // إضافة طالب جديد
                await studentService.createStudent(studentData);
            }
            setShowForm(false);
            setCurrentStudent(null);
            fetchStudents(); // تحديث الجدول بالبيانات الجديدة
        } catch (err) {
            setError('فشل في حفظ بيانات الطالب. يرجى التحقق من البيانات.');
            console.error('Error saving student:', err);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setCurrentStudent(null);
    };

    if (loading) return <p>جاري تحميل بيانات الطلاب...</p>;

    return (
        <div className="students-page">
            <h1>إدارة الطلاب</h1>
            {/* عرض رسالة الخطأ بشكل بسيط فوق الجدول إذا وجدت */}
            {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
            
            {!showForm && (
                <button className="add-button" onClick={handleAddStudent}>
                    إضافة طالب جديد
                </button>
            )}

            {showForm ? (
                <StudentForm
                    initialData={currentStudent}
                    onSubmit={handleSubmitForm}
                    onCancel={handleCancelForm}
                    academicYears={academicYears}
                />
            ) : (
                <StudentList
                    students={students}
                    onEdit={handleEditStudent}
                    onDelete={handleDeleteStudent}
                />
            )}
        </div>
    );
}

export default StudentsPage;