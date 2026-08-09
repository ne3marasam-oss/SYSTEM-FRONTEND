import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const TransferModal = ({ show, handleClose, onTransferSuccess }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transferData, setTransferData] = useState({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: ''
    });

    // جلب قائمة الحسابات (الصناديق والبنوك) عند فتح النافذة
    useEffect(() => {
        if (show) {
            fetchAccounts();
            setTransferData({ fromAccountId: '', toAccountId: '', amount: '', description: '' });
            setError(null);
        }
    }, [show]);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get('https://system-backend-rwsk.onrender.com/api/accounts');
            setAccounts(response.data);
        } catch (err) {
            setError("فشل في جلب قائمة الحسابات");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTransferData(prev => ({ ...prev, [name]: value }));
    };

    const handleExecuteTransfer = async () => {
        // التحقق من المدخلات في الواجهة قبل الإرسال
        if (!transferData.fromAccountId || !transferData.toAccountId || !transferData.amount) {
            setError("يرجى اختيار الحسابات وإدخال المبلغ");
            return;
        }

        if (transferData.fromAccountId === transferData.toAccountId) {
            setError("لا يمكن التحويل لنفس الحساب");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // إرسال البيانات إلى السيرفر (TransferDto)
            const response = await axios.post('https://system-backend-rwsk.onrender.com/api/transfers', transferData);
            
            if (response.status === 200) {
                alert("تم التحويل بنجاح");
                onTransferSuccess(); // تحديث الأرصدة في الشاشة الرئيسية
                handleClose();
            }
        } catch (err) {
            // عرض رسالة الخطأ القادمة من السيرفر (مثل: الرصيد غير كافٍ)
            const serverMessage = err.response?.data;
            setError(typeof serverMessage === 'string' ? serverMessage : "حدث خطأ أثناء عملية التحويل");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} dir="rtl" className="text-end">
            <Modal.Header closeButton>
                <Modal.Title>تحويل أموال بين الحسابات</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>من حساب (مصدر الأموال)</Form.Label>
                        <Form.Select 
                            name="fromAccountId" 
                            value={transferData.fromAccountId} 
                            onChange={handleChange}
                        >
                            <option value="">اختر الحساب المصدر...</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.accountName} (الرصيد: {acc.currentBalance})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>إلى حساب (المستلم)</Form.Label>
                        <Form.Select 
                            name="toAccountId" 
                            value={transferData.toAccountId} 
                            onChange={handleChange}
                        >
                            <option value="">اختر الحساب المستلم...</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.accountName}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>المبلغ المراد تحويله</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="number"
                                name="amount"
                                value={transferData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                            <InputGroup.Text>د.أ</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>ملاحظات / وصف</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="description"
                            value={transferData.description}
                            onChange={handleChange}
                            placeholder="مثلاً: تغذية صندوق المحاسب"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>إلغاء</Button>
                <Button 
                    variant="primary" 
                    onClick={handleExecuteTransfer} 
                    disabled={loading}
                >
                    {loading ? "جاري التحويل..." : "تأكيد التحويل"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TransferModal;