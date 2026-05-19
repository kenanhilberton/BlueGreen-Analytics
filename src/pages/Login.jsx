import React, { useState } from 'react';
import Silk from '../components/ui/Silk.jsx';
import LogoImg from '../assets/logo.png';
import ClickSpark from '../components/ui/ClickSpark.jsx';

const MainLayout = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState(null);
  
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [userId, setUserId] = useState(''); 
  
  
  const [rememberMe, setRememberMe] = useState(false);

  
  const [message, setMessage] = useState({ text: '', type: '' }); 

  
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const url = authMode === 'login' 
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/auth/register';

    
    const bodyData = authMode === 'login'
      ? { email, password, userId }
      : { email, password, companyName: name, userId };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      
      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: `❌ ${data.message}`, type: 'error' });
        return;
      }

      if (authMode === 'login') {
        setMessage({ text: "✓ Giriş uğurludur!", type: 'success' });
        
        
        localStorage.setItem('bg_user_id', data.user.userId || userId);

        
        onLoginSuccess(data.user.email, data.user.companyName, data.token, rememberMe); 
      } else {
        setMessage({ text: "✓ Qeydiyyat uğurludur! Giriş edə bilərsiniz.", type: 'success' });
        setEmail('');
        setPassword('');
        setName('');
        setUserId(''); 
        setTimeout(() => {
          setAuthMode('login');
          setMessage({ text: '', type: '' });
        }, 2000);
      }

    } catch (err) {
      console.error("Bağlantı xətası:", err);
      setMessage({ text: "❌ Serverlə əlaqə qurulmadı. Backendin açıq olduğundan əmin olun.", type: 'error' });
    }
  };

  const globalFont = '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', fontFamily: globalFont, color: '#fff', backgroundColor: '#050816' }}>
      
      {/* ANİMASİYALI ARXAPLAN */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none' }}>
        <Silk speed={6} scale={0.8} color="#150f3d" noiseIntensity={1.2} rotation={30} />
      </div>

      {}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {}
        <div style={{ padding: '2rem 4rem 0 4rem', position: 'sticky', top: 0, zIndex: 100 }}>
          <nav style={{
            display: 'flex', alignItems: 'center', background: 'rgba(5, 8, 22, 0.4)', backdropFilter: 'blur(20px)',
            padding: '0.8rem 2rem', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.08)',
            width: '100%', justifyContent: 'space-between', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
              <img src={LogoImg} alt="Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
              <div style={{ fontWeight: '800', fontSize: '1.3rem', letterSpacing: '0.5px' }}>
                <span style={{ color: '#00D2FF' }}>Blue</span>
                <span style={{ color: '#00FF87' }}>Green</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '2.5rem', fontSize: '0.95rem', fontWeight: '500', color: '#bbb' }}>
              <span onClick={() => scrollToSection('features')} style={{ cursor: 'pointer', transition: '0.3s' }}>Xüsusiyyətlər</span>
              <span onClick={() => scrollToSection('about')} style={{ cursor: 'pointer', transition: '0.3s' }}>Haqqımızda</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={() => { setAuthMode('login'); setMessage({ text: '', type: '' }); }} style={{ background: 'transparent', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', padding: '0.6rem 1.2rem', fontSize: '0.95rem' }}>Log in</button>
              <button onClick={() => { setAuthMode('register'); setMessage({ text: '', type: '' }); }} style={{ background: 'linear-gradient(135deg, #00D2FF 0%, #00FF87 100%)', color: '#0a1128', border: 'none', fontWeight: '700', cursor: 'pointer', padding: '0.7rem 1.6rem', borderRadius: '25px', fontSize: '0.95rem' }}>Sign up</button>
            </div>
          </nav>
        </div>

        {}
        <div style={{ width: '100%', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 4rem 4rem 4rem' }}>
          <h1 style={{ fontSize: '3.6rem', fontWeight: '800', maxWidth: '850px', lineHeight: '1.2', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>
            Sənaye müəssisələri üçün ESG monitoring sistemi
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#b0b7c6', maxWidth: '650px', marginBottom: '2.5rem', fontWeight: '400', lineHeight: '1.6' }}>
            Davamlı gələcək üçün karbon ayaq izinizi, sosial təsirlərinizi və idarəetgea göstəricilərinizi real vaxtda analiz edin.
          </p>
          <div style={{ display: 'flex', gap: '1.2rem' }}>
            <button onClick={() => setAuthMode('register')} style={{ background: 'linear-gradient(135deg, #00D2FF 0%, #00FF87 100%)', color: '#0a1128', border: 'none', padding: '1rem 2.5rem', borderRadius: '30px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: '0.3s' }}>Başla</button>
            <button onClick={() => scrollToSection('features')} style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '1rem 2.5rem', borderRadius: '30px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: '0.3s' }}>Daha çox öyrən</button>
          </div>
        </div>

        {}
        <div id="features" style={{ width: '100%', minHeight: '60vh', padding: '6rem 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Sistemin Geniş Xüsusiyyətləri</h2>
          <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, #00D2FF, #00FF87)', marginBottom: '4rem', borderRadius: '2px' }}></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1200px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '2.5rem', borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>🌱</div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.8rem', color: '#00FF87' }}>E - Ekoloji Monitorinq</h4>
              <p style={{ color: '#b0b7c6', fontSize: '0.95rem', lineHeight: '1.6' }}>Scope 1, 2 və 3 səviyyəli karbon emissiyalarının, su və elektrik resurslarının real vaxt rejimində rəqəmsal izlənilməsi.</p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '2.5rem', borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>🤝</div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.8rem', color: '#00D2FF' }}>S - Sosial Məsuliyyət</h4>
              <p style={{ color: '#b0b7c6', fontSize: '0.95rem', lineHeight: '1.6' }}>Müəssisədaxili əmək təhlükəsizliyi (HSE), kadr axını, kollektiv təlim saatları və işçi rifahının analitikası.</p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '2.5rem', borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>⚖️</div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.8rem', color: '#9d4edd' }}>G - Korporativ İdarəetmə</h4>
              <p style={{ color: '#b0b7c6', fontSize: '0.95rem', lineHeight: '1.6' }}>Beynəlxalq GRI indekslərinə tam uyğunluq, kiber təhlükəsizlik auditləri və rəqəmsal şəffaflıq dərəcəsinin hesabatlanması.</p>
            </div>
          </div>
        </div>

        {}
        <div id="about" style={{ width: '100%', minHeight: '50vh', padding: '6rem 4rem', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Haqqımızda</h2>
          <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, #00D2FF, #00FF87)', marginBottom: '3rem', borderRadius: '2px' }}></div>
          <p style={{ fontSize: '1.1rem', color: '#b0b7c6', maxWidth: '800px', textAlign: 'center', lineHeight: '1.8', fontWeight: '400' }}>
            <strong>BlueGreen Analytics</strong> sənaye müəssisələrinin beynəlxalq davamlılıq standartlarına inteqrasiyasını sürətləndirən DeepTech platformadır. Süni İntellekt (AI) dəstəkli alqoritmlərimiz sayəsində zavod və fabriklər həm ətraf mühitə vurduqları ziyanı minimuma endirir, həm də rəsmi audit hesabatlarını bir kliklə beynəlxalq səviyyədə ixrac edə bilirlər.
          </p>
        </div>

        {}
        <footer style={{ padding: '2.5rem 4rem', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem', color: '#666' }}>
          &copy; {new Date().getFullYear()} BlueGreen Analytics. Bütün hüquqlar qorunur.
        </footer>
      </div>

      {}
      {authMode && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(5, 8, 22, 0.75)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(25px)', padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)', position: 'relative' }}>
            <span onClick={() => { setAuthMode(null); setMessage({ text: '', type: '' }); }} style={{ position: 'absolute', top: '1.2rem', right: '1.5rem', cursor: 'pointer', fontSize: '1.2rem', color: '#999' }}>✕</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img src={LogoImg} alt="Logo" style={{ width: '50px', height: '50px', marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.6rem', fontWeight: '700', textAlign: 'center', margin: 0 }}>{authMode === 'login' ? 'Giriş Edin' : 'Qeydiyyat'}</h3>
            </div>
            
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {authMode === 'register' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#b0b7c6' }}>Müəssisə / Adı</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', outline: 'none' }} />
                </div>
              )}
              
              {/* 🔑 MÜƏSSİSƏ ID (USER ID) - Həm Girişdə (Login) həm də Qeydiyyatda görünür */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#b0b7c6' }}>Müəssisə ID (User ID)</label>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required placeholder="Məs: ENTERPRISE-2026" style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', outline: 'none' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#b0b7c6' }}>E-poçt</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', outline: 'none' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#b0b7c6' }}>Şifrə</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', outline: 'none' }} />
              </div>

              {authMode === 'login' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginTop: '0.2rem' }} onClick={() => setRememberMe(!rememberMe)}>
                  <input type="checkbox" checked={rememberMe} onChange={() => {}} style={{ width: '16px', height: '16px', accentColor: '#00FF87', cursor: 'pointer' }} />
                  <label style={{ fontSize: '0.85rem', color: '#b0b7c6', cursor: 'pointer', userSelect: 'none' }}>Məni xatırla</label>
                </div>
              )}
              
              <button type="submit" style={{ padding: '0.9rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #00D2FF 0%, #00FF87 100%)', color: '#0a1128', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                {authMode === 'login' ? 'Daxil Ol' : 'Hesab Yarat'}
              </button>
            </form>

            {message.text && (
              <div style={{
                marginTop: '1.2rem', padding: '0.8rem', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500',
                background: message.type === 'success' ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 75, 75, 0.1)',
                border: message.type === 'success' ? '1px solid rgba(0, 255, 135, 0.3)' : '1px solid rgba(255, 75, 75, 0.3)',
                color: message.type === 'success' ? '#00FF87' : '#ff4b4b'
              }}>
                {message.text}
              </div>
            )}
            
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#b0b7c6' }}>
              {authMode === 'login' ? "Hesabınız yoxdur? " : "Artıq qeydiyyatınız var? "}
              <span onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setMessage({ text: '', type: '' }); }} style={{ color: '#00D2FF', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}>
                {authMode === 'login' ? 'Qeydiyyatdan keçin' : 'Giriş edin'}
              </span>
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default MainLayout;