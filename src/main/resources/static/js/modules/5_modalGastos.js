//importanto do selectors.js
import * as sel from './1_selectors.js';
import { formatCurrency } from './2_utils.js';

const getGastosFromTable = () => {
    const gastos = [];
    sel.expensesTbody.querySelectorAll('tr[data-type="gasto"]').forEach(row => {
        gastos.push({
            name: row.querySelector('.col-name').textContent,
            value: parseFloat(row.dataset.value)
        });
    });
    return gastos;
};

const renderGastosList = (gastos) => {
    sel.analysisList.innerHTML = '';
    if (gastos.length === 0) {
        sel.analysisList.innerHTML = '<li>Nenhum gasto encontrado.</li>';
        return;
    }
    gastos.forEach(gasto => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span class="item-name">${gasto.name}</span><span class="item-value">${formatCurrency(gasto.value)}</span>`;
        sel.analysisList.appendChild(listItem);
    });
};

const openAnalysisModal = () => {
    const gastos = getGastosFromTable();
    renderGastosList(gastos);
    sel.analysisModal.classList.add('show');
};

const closeAnalysisModal = () => sel.analysisModal.classList.remove('show');

export function initGastosModal() {
    if (!sel.analysisCard) return; // Proteção
    sel.analysisCard.addEventListener('click', openAnalysisModal);
    sel.closeAnalysisModalBtn.addEventListener('click', closeAnalysisModal);
    sel.analysisModal.addEventListener('click', (event) => {
        if(event.target === sel.analysisModal) closeAnalysisModal();
    });
    sel.sortDescBtn.addEventListener('click', () => {
        const gastos = getGastosFromTable();
        gastos.sort((a, b) => b.value - a.value);
        renderGastosList(gastos);
    });
    sel.sortAscBtn.addEventListener('click', () => {
        const gastos = getGastosFromTable();
        gastos.sort((a, b) => a.value - b.value);
        renderGastosList(gastos);
    });
}
