import { initAddModal } from './modules/3_modalAdd.js';
import { initTable } from './modules/4_table.js';
import { initGastosModal } from './modules/5_modalGastos.js';
import { initGanhosModal } from './modules/6_modalGanhos.js';
import api from './api.js'; 
import { expensesTbody, totalEntradaEl, totalSaidaEl, recordsCountEl } from './modules/1_selectors.js';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);


const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

function updateCurrentDate() {
    const dateElement = document.getElementById('display-data-atual');
    if (dateElement) {
        const now = new Date();
        const dateString = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        dateElement.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    }
}

function createRow(item, type) {
    const tr = document.createElement('tr');
    tr.dataset.type = type;
    tr.dataset.id = item.id; 
    tr.dataset.value = item.valor;
    
    const isIncome = type === 'ganho';
    const dateObj = new Date(item.data);
    const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
    const date = new Date(dateObj.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const valueDisplay = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(item.valor);

    const editSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    const trashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

    tr.innerHTML = `
        <td class="col-name">${item.nome}</td>
        <td class="col-category">${item.categoria || (isIncome ? 'Ganho' : 'Gasto')}</td>
        <td class="col-value ${isIncome ? 'income' : ''}">${isIncome ? '+ ' : ''}${valueDisplay}</td>
        <td class="col-date">${date}</td>
        <td class="actions">
            <button class="edit-btn">${editSvg}</button>
            <button class="delete-btn">${trashSvg}</button>
        </td>`;
    return tr;
}

async function loadDashboard() {
    const auth = JSON.parse(localStorage.getItem('cf_auth'));
    if (!auth) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const [me, gastos, ganhos, rendaOficial] = await Promise.all([
            api.fetchAuthUser(auth.email, auth.senha),
            api.listGastosByUser(auth.userId, auth.email, auth.senha),
            api.listGanhosByUser(auth.userId, auth.email, auth.senha),
            api.fetchRenda(auth.userId, auth.email, auth.senha)
        ]);

        if (me && me.user && me.user.nome) {
            document.getElementById('welcome-message').textContent = `Bem vindo, ${me.user.nome}`;
        }

        
        if (me && me.user && me.user.subscriptionType === 'PREMIUM') {
            const toggleBtn = document.getElementById('dark-mode-toggle');
            if (toggleBtn) {
                // Ajuste de layout para centralizar o ícone
                toggleBtn.style.display = 'flex'; 
                toggleBtn.style.alignItems = 'center';
                toggleBtn.style.justifyContent = 'center';
                toggleBtn.style.padding = '0'; // Remove padding extra se houver

                // Estado Inicial
                if (localStorage.getItem('theme') === 'dark') {
                    document.body.classList.add('dark-mode');
                    toggleBtn.innerHTML = sunIcon; 
                } else {
                    toggleBtn.innerHTML = moonIcon; 
                }

                // Evento de Clique
                toggleBtn.onclick = () => {
                    document.body.classList.toggle('dark-mode');
                    const isDark = document.body.classList.contains('dark-mode');
                    toggleBtn.innerHTML = isDark ? sunIcon : moonIcon;
                    localStorage.setItem('theme', isDark ? 'dark' : 'light');
                };
            }
        }

        expensesTbody.innerHTML = '';
        const listaGanhos = Array.isArray(ganhos) ? ganhos : [];
        const listaGastos = Array.isArray(gastos) ? gastos : [];

        listaGanhos.forEach(g => expensesTbody.appendChild(createRow(g, 'ganho')));
        listaGastos.forEach(g => expensesTbody.appendChild(createRow(g, 'gasto')));

        updateTotalsAndBalance(listaGastos, listaGanhos);

    } catch (err) {
        console.error("Erro ao carregar dados:", err);
    }
}

function updateTotalsAndBalance(gastos, ganhos) {
    const totalGanhos = ganhos.reduce((acc, g) => acc + g.valor, 0);
    const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0);
    const saldoFinal = totalGanhos - totalGastos;
    
    if(totalEntradaEl) totalEntradaEl.innerHTML = `${formatCurrency(totalGanhos)} <span class="label">Entrada</span>`;
    if(totalSaidaEl) totalSaidaEl.innerHTML = `${formatCurrency(totalGastos)} <span class="label">Saída</span>`;
    if(recordsCountEl) recordsCountEl.textContent = `${gastos.length + ganhos.length} Registros`;

    const saldoEl = document.getElementById('saldo-atual');
    if (saldoEl) {
        saldoEl.innerHTML = `${formatCurrency(saldoFinal)} <span class="label">Saldo Atual</span>`;
        saldoEl.style.color = saldoFinal >= 0 ? '#2E7D32' : '#d32f2f'; 
        saldoEl.style.fontWeight = 'bold';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAddModal();
    initTable();
    initGastosModal();
    initGanhosModal();
    updateCurrentDate();
    loadDashboard();
});