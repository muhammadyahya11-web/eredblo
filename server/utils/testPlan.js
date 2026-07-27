const testCreatePlan = async () => {
  try {
    // 1. Login to get token
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@eredbloo.com',
        password: 'SuperAdminPassword123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful');

    // 2. Create plan
    const res = await fetch('http://localhost:5000/api/plans', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Starter Plan',
        depositAmount: 5000,
        dailyProfit: 100,
        duration: 30,
        totalReturn: 8000,
        status: 'active'
      })
    });
    const data = await res.json();
    console.log('Plan creation response:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
};

testCreatePlan();
