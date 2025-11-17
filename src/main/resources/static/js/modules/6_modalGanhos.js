//importanto do selectors.js
import * as sel from './1_selectors.js';
import { formatCurrency } from './2_utils.js';

const getGanhosFromTable = () => {
    const ganhos = [];
    sel.expensesTbody.querySelectorAll('tr[data-type="ganho"]').forEach(row => {
        ganhos.push({
            name: row.querySelector('.col-name').textContent,
            value: parseFloat(row.dataset.value)
        });
    });
    return ganhos;
};

const renderGanhosList = (ganhos) => {
    sel.analysisGanhosList.innerHTML = '';
    if (ganhos.length === 0) {
        sel.analysisGanhosList.innerHTML = '<li>Nenhum ganho encontrado.</li>';
        return;
    }
    ganhos.forEach(ganho => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span class="item-name">${ganho.name}</span><span class="item-value">${formatCurrency(ganho.value)}</span>`;
        sel.analysisGanhosList.appendChild(listItem);
    });
};

const openAnalysisGanhosModal = () => {
    const ganhos = getGanhosFromTable();
    renderGanhosList(ganhos);
    sel.analysisGanhosModal.classList.add('show');
};

const closeAnalysisGanhosModal = () => sel.analysisGanhosModal.classList.remove('show');

export function initGanhosModal() {
    if (!sel.analysisGanhosCard) return; // Proteção
    sel.analysisGanhosCard.addEventListener('click', openAnalysisGanhosModal);
    sel.closeAnalysisGanhosModalBtn.addEventListener('click', closeAnalysisGanhosModal);
    sel.analysisGanhosModal.addEventListener('click', (event) => {
        if(event.target === sel.analysisGanhosModal) closeAnalysisGanhosModal();
    });
    sel.sortGanhosDescBtn.addEventListener('click', () => {
        const ganhos = getGanhosFromTable();
        ganhos.sort((a, b) => b.value - a.value);
        renderGanhosList(ganhos);
    });
    sel.sortGanhosAscBtn.addEventListener('click', () => {
        const ganhos = getGanhosFromTable();
        ganhos.sort((a, b) => a.value - b.value);
        renderGanhosList(ganhos);
    });
}
