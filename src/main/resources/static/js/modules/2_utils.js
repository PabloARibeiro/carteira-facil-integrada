import { expensesTbody, recordsCountEl, totalEntradaEl, totalSaidaEl } from './1_selectors.js';
export const formatCurrency = (number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);

export const updateRecordsCount = () => {
    if (!expensesTbody) return; // Proteção caso o seletor falhe
    const rowCount = expensesTbody.getElementsByTagName('tr').length;
    if (recordsCountEl) recordsCountEl.textContent = `${rowCount} Registros`;
};

export const recalculateAndDisplayTotals = () => {
    if (!expensesTbody) return; // arrumar isso depois
    let totalEntrada = 0, totalSaida = 0;
    expensesTbody.querySelectorAll('tr').forEach(row => {
        const type = row.dataset.type; 
        const value = parseFloat(row.dataset.value); 
        if (!isNaN(value)) {
            if (type === 'ganho') totalEntrada += value;
            else if (type === 'gasto') totalSaida += value;
        }
    });
    // atualiza o HTML 
    totalEntradaEl.innerHTML = `${formatCurrency(totalEntrada)} <span class="label">Entrada</span>`;
    totalSaidaEl.innerHTML = `${formatCurrency(totalSaida)} <span class="label">Saída</span>`;
};
