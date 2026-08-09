import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://system-backend-rwsk.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        if (onLogin) {
          onLogin();
        }
        navigate('/home', { replace: true });
      } else {
        const data = await response.json();
        setError(data.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', // خلفية متدرجة بالأخضر الداكن
      fontFamily: 'Cairo, sans-serif',
      direction: 'rtl'
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#ffffff',
        padding: '40px 30px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        width: '400px',
        borderTop: '6px solid #10b981' // لمسة جمالية علوية بالأخضر الفاتح المتميز
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#064e3b', fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '24px' }}>تسجيل الدخول</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>نظام إدارة المدرسة SAS</p>
        </div>
        
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '14px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600', fontSize: '14px' }}>اسم المستخدم</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
            placeholder="أدخل اسم المستخدم"
            style={{
              width: '100%',
              padding: '12px 15px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              outline: 'none',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#059669'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '600', fontSize: '14px' }}>كلمة المرور</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '12px 15px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              outline: 'none',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#059669'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '12px',
            background: '#064e3b', // لون أخضر داكن فخم للأزرار
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background 0.3s ease',
            boxShadow: '0 4px 6px rgba(6, 78, 59, 0.2)'
          }}
          onMouseOver={(e) => e.target.style.background = '#047857'}
          onMouseOut={(e) => e.target.style.background = '#064e3b'}
        >
          دخول للنظام
        </button>
      </form>
    </div>
  );
}