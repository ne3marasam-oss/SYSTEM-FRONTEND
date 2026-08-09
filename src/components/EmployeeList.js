// src/components/EmployeeList.js

import React, { useState, useEffect } from 'react';

import employeeService from '../services/employeeService';

import { Link } from 'react-router-dom';

import './EmployeeList.css';



const EmployeeList = () => {

    const [employees, setEmployees] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');

    const [message, setMessage] = useState('');

    const [loading, setLoading] = useState(true);



    useEffect(() => {

        fetchEmployees();

    }, []);



    const fetchEmployees = async () => {

        setLoading(true);

        try {

            const response = await employeeService.getAllEmployees();

            setEmployees(response.data);

            setMessage('');

        } catch (error) {

            console.error("خطأ في جلب بيانات الموظفين:", error);

            setMessage('فشل في تحميل بيانات الموظفين. الرجاء التحقق من اتصال الخادم.');

        } finally {

            setLoading(false);

        }

    };



    const handleDelete = async (id) => {

        if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الموظف؟ لن تتمكن من التراجع عن هذا الإجراء.')) {

            try {

                await employeeService.deleteEmployee(id);

                setMessage('تم حذف الموظف بنجاح!');

                fetchEmployees();

            } catch (error) {

                console.error("خطأ في حذف الموظف:", error);

                setMessage('فشل في حذف الموظف. قد يكون مرتبطاً ببيانات رواتب أو سجلات أخرى.');

            }

        }

    };
const handleSearch = async () => {
    // إذا كان الحقل فارغاً، اجلب كل الموظفين بدلاً من إظهار خطأ
    if (!searchTerm.trim()) {
        fetchEmployees();
        return;
    }

    setLoading(true);
    try {
        const response = await employeeService.searchEmployees(searchTerm);
        setEmployees(response.data);
        setMessage('');
    } catch (error) {
        console.error("خطأ في البحث عن الموظفين:", error);
        // فحص نوع الخطأ لتنبيهك كمبرمج
        if (error.response && error.response.status === 405) {
            setMessage('خطأ برمجي: السيرفر لا يدعم طريقة الطلب الحالية (405).');
        } else {
            setMessage('فشل في البحث عن الموظفين. يرجى المحاولة لاحقاً.');
        }
    } finally {
        setLoading(false);
    }
};



    // دالة محسنة جداً لتنسيق التاريخ ومنع ظهور "غير محدد" إذا كانت البيانات موجودة

    const formatDate = (dateValue) => {

        if (!dateValue) return "غير محدد";

       

        try {

            // التعامل مع التاريخ سواء كان String أو Object

            const date = new Date(dateValue);

           

            // التأكد من أن القيمة ليست "Invalid Date"

            if (isNaN(date.getTime())) {

                return "تاريخ غير صالح";

            }



            // التنسيق باللغة العربية (يوم/شهر/سنة)

            return new Intl.DateTimeFormat('ar-SA', {

                year: 'numeric',

                month: '2-digit',

                day: '2-digit'

            }).format(date);

        } catch (e) {

            return "خطأ في التاريخ";

        }

    };



    const getStatusText = (status) => {

        switch (status) {

            case 'Active': return 'نشط';

            case 'Inactive': return 'غير نشط';

            case 'On Leave': return 'في إجازة';

            default: return status;

        }

    };



    const getStatusBadgeClass = (status) => {

        switch (status) {

            case 'Active': return 'bg-success';

            case 'Inactive': return 'bg-danger';

            case 'On Leave': return 'bg-warning text-dark';

            default: return 'bg-secondary';

        }

    };



    return (

        <div className="employee-list-container shadow-sm p-4 mb-5 bg-white rounded">

            <h2 className="text-center mb-4 text-primary">قائمة الموظفين</h2>

            {message && (

                <div className={`alert ${message.includes('فشل') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`} role="alert">

                    {message}

                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setMessage('')}></button>

                </div>

            )}

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">

                <div className="input-group flex-grow-1 me-md-3 mb-2 mb-md-0">

                    <input

                        type="text"

                        className="form-control"

                        placeholder="البحث بالاسم أو المسمى الوظيفي..."

                        value={searchTerm}

                        onChange={(e) => setSearchTerm(e.target.value)}

                        onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}

                    />

                    <button className="btn btn-outline-primary" type="button" onClick={handleSearch}>

                        <i className="bi bi-search"></i> بحث

                    </button>

                </div>

                <Link to="/employees/add" className="btn btn-success btn-lg">

                    <i className="bi bi-person-plus"></i> إضافة موظف جديد

                </Link>

            </div>

            {loading ? (

                <div className="text-center">

                    <div className="spinner-border text-primary" role="status">

                        <span className="visually-hidden">جاري التحميل...</span>

                    </div>

                    <p className="mt-2">جاري تحميل بيانات الموظفين...</p>

                </div>

            ) : employees.length === 0 ? (

                <div className="alert alert-info text-center" role="alert">

                    لا توجد بيانات موظفين لعرضها حالياً.

                </div>

            ) : (

                <div className="table-responsive">

                    <table className="table table-hover table-striped table-bordered employee-table">

                        <thead className="table-primary">

                        <tr>

                            <th>الرقم الوظيفي</th>

                            <th>الاسم الكامل</th>

                            <th>المسمى الوظيفي</th>

                            <th>الراتب الأساسي</th>

                            <th>الحالة</th>

                            <th>تاريخ البدء</th>

                            <th>الإجراءات</th>

                        </tr>

                        </thead>

                        <tbody>

                        {employees.map(employee => (

                            <tr key={employee.id}>

                                <td>{employee.id}</td>

                                <td>{employee.fullName}</td>

                                <td>{employee.jobTitle}</td>

                                <td>{employee.basicSalary ? parseFloat(employee.basicSalary).toFixed(2) : "0.00"} ر.ي</td>

                                <td>

                                    <span className={`badge ${getStatusBadgeClass(employee.status)}`}>

                                        {getStatusText(employee.status)}

                                    </span>

                                </td>

                                {/* تم استخدام الدالة المحدثة هنا */}

                                <td className="text-center fw-bold">{formatDate(employee.startDate)}</td>

                                <td className="actions-column">

                                    <Link to={`/employees/edit/${employee.id}`} className="btn btn-sm btn-warning me-2 mb-1">

                                        <i className="bi bi-pencil-square"></i> تعديل

                                    </Link>

                                    <button

                                        className="btn btn-sm btn-danger me-2 mb-1"

                                        onClick={() => handleDelete(employee.id)}

                                    >

                                        <i className="bi bi-trash"></i> حذف

                                    </button>

                                    <Link to={`/payroll/employee/${employee.id}`} className="btn btn-sm btn-info mb-1">

                                        <i className="bi bi-cash-stack"></i> عرض الرواتب

                                    </Link>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

};



export default EmployeeList;