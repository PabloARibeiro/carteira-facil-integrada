import api from './api.js';
import { deleteIconSVG } from './modules/0_constants.js';

async function loadAdminPanel() {
    console.log("Iniciando Painel Admin..."); 
    const auth = JSON.parse(localStorage.getItem('cf_auth'));

    if (!auth || auth.role !== 'ADMIN') {
        alert('Acesso negado. Redirecionando...');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('admin-name').textContent = `Olá, Admin`;

    try {
        const users = await api.listUsuarios(auth.email, auth.senha);
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Nenhum usuário encontrado.</td></tr>';
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            const deleteButton = user.role !== 'ADMIN' 
                ? `<button class="delete-btn" data-id="${user.id}" data-name="${user.nome}" style="cursor:pointer; border:none; background:none; color:#666;">${deleteIconSVG}</button>` 
                : '<span style="color:#ccc;">-</span>';

            tr.innerHTML = `
                <td>#${user.id}</td>
                <td class="col-name">${user.nome}</td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-client'}">${user.role}</span></td>
                <td><span class="badge ${user.subscriptionType === 'PREMIUM' ? 'badge-premium' : 'badge-client'}">${user.subscriptionType}</span></td>
                <td class="actions" style="text-align:center;">
                    ${deleteButton}
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.target.closest('button');
                const id = button.dataset.id;
                const nome = button.dataset.name;
                
                if(confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) {
                    try {
                        await api.deleteUsuario(id, auth.email, auth.senha);
                        button.closest('tr').remove();
                        alert("Usuário removido.");
                    } catch (err) {
                        alert('Erro ao excluir: ' + err.message);
                    }
                }
            });
        });

    } catch (err) {
        console.error(err);
        alert('Erro ao carregar dados: ' + err.message);
    }
}

document.addEventListener('DOMContentLoaded', loadAdminPanel);