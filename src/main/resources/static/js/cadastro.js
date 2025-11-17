import api from './api.js';

document.getElementById('cadastro-form').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const btn = event.target.querySelector('button');

    try {
        btn.textContent = 'Cadastrando...';
        btn.disabled = true;

        await api.registerUser(nome, email, senha);

        alert('Conta criada com sucesso! Faça login.');
        window.location.href = 'index.html';

    } catch (error) {
        console.error(error);
        alert('Erro ao cadastrar: ' + error.message);
        btn.textContent = 'Cadastrar';
        btn.disabled = false;
    }
});