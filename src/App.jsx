import React, { useState, useEffect } from 'react';
import Login from './pages/Login.jsx'; 
import Dashboard from './pages/Dashboard.jsx'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [token, setToken] = useState('');

  
  useEffect(() => {
    const savedToken = localStorage.getItem('esg_token');
    const savedEmail = localStorage.getItem('bg_user_email');
    const savedCompany = localStorage.getItem('bg_company_name');

    if (savedToken && savedEmail) {
      setToken(savedToken);
      setUserEmail(savedEmail);
      setCompanyName(savedCompany || "BlueGreen Müəssisə");
      setIsLoggedIn(true);
    }
  }, []);

  
  const handleLoginSuccess = (email, company, userToken, rememberMe) => {
    setUserEmail(email);
    setCompanyName(company || "BlueGreen Müəssisə");
    setToken(userToken);
    setIsLoggedIn(true);

    
    localStorage.setItem('esg_token', userToken);
    localStorage.setItem('bg_user_email', email);
    localStorage.setItem('bg_company_name', company || "BlueGreen Müəssisə");
  };

  
  const handleLogout = () => {
    localStorage.clear(); 
    setIsLoggedIn(false);
    setUserEmail('');
    setCompanyName('');
    setToken('');
  };

  return (
    <>
      {!isLoggedIn ? (
        
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        
        <Dashboard 
          userEmail={userEmail} 
          companyName={companyName} 
          token={token} 
          onLogout={handleLogout} 
        />
      )}
    </>
  );
}

export default App;