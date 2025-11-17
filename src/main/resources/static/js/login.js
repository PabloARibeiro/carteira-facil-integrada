import api from './api.js';

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;
    const btn = event.target.querySelector('button');
    const originalBtnText = btn.textContent;

    try {
        btn.textContent = 'Entrando...';
        btn.disabled = true;

        const response = await api.fetchAuthUser(email, senha);
        
        let userId = null;
        let userRole = 'CLIENT'; 

        if (response.user) {
            userId = response.user.id;
            userRole = response.user.role;
        } else if (response.totalClients !== undefined) {
            userRole = 'ADMIN';
            userId = 0;
        }

        localStorage.setItem('cf_auth', JSON.stringify({ 
            email, 
            senha, 
            userId, 
            role: userRole 
        }));

        if (userRole === 'ADMIN') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }

    } catch (error) {
        console.error(error);
        alert('Login falhou: Verifique suas credenciais.');
        btn.textContent = originalBtnText;
        btn.disabled = false;
    }
});