 import React, { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import employeeService from '../services/employeeService';

import './EmployeeList.css';



const EmployeeForm = () => {

    const { id } = useParams();

    const navigate = useNavigate();

   

    const [employee, setEmployee] = useState({

        fullName: '',

        jobTitle: '',

        department: '',

        basicSalary: '',

        status: 'Active',

        startDate: ''

    });



    const [message, setMessage] = useState('');

    const [loading, setLoading] = useState(false);



    useEffect(() => {

        if (id) {

            setLoading(true);

            employeeService.getEmployeeById(id)

                .then(response => {

                    const data = response.data;

                    setEmployee({

                        ...data,

                        startDate: data.startDate ? data.startDate : ''

                    });

                    setLoading(false);

                })

                .catch(error => {

                    console.error("خطأ في جلب بيانات الموظف:", error);

                    setMessage('حدث خطأ أثناء تحميل بيانات الموظف.');

                    setLoading(false);

                });

        }

    }, [id]);



    const handleChange = (e) => {

        const { name, value } = e.target;

        setEmployee({ ...employee, [name]: value });

    };

const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage('');

    setLoading(true);



    // التأكد من أن الراتب رقم صحيح قبل الإرسال

    const salary = employee.basicSalary ? parseFloat(employee.basicSalary) : 0;



    const dataToSave = {

        ...(id && { id: parseInt(id) }),

        fullName: employee.fullName || '',

        jobTitle: employee.jobTitle || '',

        department: employee.department || '',

        basicSalary: salary,

        status: employee.status || 'Active',

        startDate: employee.startDate || null

    };



    try {

        if (id) {

            await employeeService.updateEmployee(id, dataToSave);

            setMessage('تم تحديث بيانات الموظف بنجاح!');

        } else {

            await employeeService.saveEmployee(dataToSave);

            setMessage('تمت إضافة الموظف بنجاح!');

        }

        // تأخير التوجيه ليرى المستخدم رسالة النجاح

        setTimeout(() => navigate('/employees'), 2000);

    } catch (error) {

        console.error("تفاصيل الخطأ في الحفظ:", error);

        const errorMsg = error.response?.data || error.message || 'حدث خطأ أثناء الحفظ.';

        setMessage(`خطأ: ${errorMsg}`);

    } finally {

        setLoading(false);

    }

};



    return (

        <div className="container mt-4" dir="rtl">

            <h2 className="text-center mb-4 text-primary">

                <i className={`bi ${id ? 'bi-pencil-square' : 'bi-person-plus-fill'} me-2`}></i>

                {id ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}

            </h2>

           

            {message && (

                <div className={`alert ${message.includes('خطأ') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show shadow-sm`}>

                    {message}

                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>

                </div>

            )}



            {loading ? (

                <div className="text-center my-5">

                    <div className="spinner-border text-primary" role="status"></div>

                    <p className="mt-2">جاري معالجة البيانات...</p>

                </div>

            ) : (

                <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">

                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <label className="form-label fw-bold">الاسم الكامل:</label>

                            <input

                                type="text"

                                className="form-control"

                                name="fullName"

                                value={employee.fullName}

                                onChange={handleChange}

                                required

                                placeholder="أدخل اسم الموظف الثلاثي"

                            />

                        </div>



                        <div className="col-md-6 mb-3">

                            <label className="form-label fw-bold">المسمى الوظيفي:</label>

                            <input

                                type="text"

                                className="form-control"

                                name="jobTitle"

                                value={employee.jobTitle}

                                onChange={handleChange}

                                required

                                placeholder="مثال: محاسب، مهندس..."

                            />

                        </div>

                    </div>



                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <label className="form-label fw-bold">القسم:</label>

                            <input

                                type="text"

                                className="form-control"

                                name="department"

                                value={employee.department}

                                onChange={handleChange}

                                placeholder="أدخل اسم القسم"

                            />

                        </div>



                        <div className="col-md-6 mb-3">

                            <label className="form-label fw-bold">الراتب الأساسي:</label>

                            <div className="input-group">

                                <input

                                    type="number"

                                    className="form-control"

                                    name="basicSalary"

                                    value={employee.basicSalary}

                                    onChange={handleChange}

                                    required

                                    step="0.01"

                                />

                                <span className="input-group-text">ر.س</span>

                            </div>

                        </div>

                    </div>



                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <label className="form-label fw-bold">تاريخ البدء:</label>

                            <input

                                type="date"

                                className="form-control"

                                name="startDate"

                                value={employee.startDate}

                                onChange={handleChange}

                                required

                            />

                        </div>



                        <div className="col-md-6 mb-3">

                            <label className="form-label fw-bold">الحالة:</label>

                            <select

                                className="form-select"

                                name="status"

                                value={employee.status}

                                onChange={handleChange}

                            >

                                <option value="Active">نشط</option>

                                <option value="Inactive">غير نشط</option>

                                <option value="On Leave">في إجازة</option>

                            </select>

                        </div>

                    </div>



                    <hr className="my-4" />



                    <div className="d-flex gap-3 justify-content-center">

                        <button type="submit" className="btn btn-success px-5 py-2 fw-bold" disabled={loading}>

                            <i className="bi bi-save me-2"></i>

                            {id ? 'تعديل البيانات' : 'حفظ الموظف'}

                        </button>

                        <button type="button" className="btn btn-outline-secondary px-5 py-2" onClick={() => navigate('/employees')}>

                            إلغاء

                        </button>

                    </div>

                </form>

            )}

        </div>

    );

};



export default EmployeeForm;