import * as sel from './1_selectors.js';
import api from '../api.js'; 

const getAuth = () => JSON.parse(localStorage.getItem('cf_auth')); 

const closeModal = () => {
    sel.addExpenseForm.reset(); 
    sel.modalOverlay.classList.remove('show');
};


const handleAddSubmit = async (event) => {
    event.preventDefault(); 
    
    const auth = getAuth();
    if (!auth) {
        window.location.href = 'index.html';
        return;
    }

    const type = document.getElementById('g-tipo').value; // 'gasto' ou 'ganho'
    const name = document.getElementById('g-nome').value;
    const category = document.getElementById('g-cat').value;
    const valueStr = document.getElementById('g-val').value.replace(',', '.');
    const value = parseFloat(valueStr);
    const dateInput = document.getElementById('g-data').value; // Formato YYYY-MM-DD

    if (isNaN(value) || value <= 0) { 
        alert('Por favor, insira um valor numérico válido.'); 
        return; 
    }

    // Monta o objeto DTO esperado pelo Backend (GastoDTO ou GanhoDTO)
    // Ver referência em GastoDTO.java
    const dto = {
        usuarioId: auth.userId,
        nome: name,
        categoria: category,
        valor: value,
        data: dateInput
    };

    try {
        // Feedback visual simples
        const submitBtn = sel.addExpenseForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Salvando...';

        // Chamada API condicional
        if (type === 'gasto') {
            await api.createGasto(dto, auth.email, auth.senha);
        } else {
            await api.createGanho(dto, auth.email, auth.senha);
        }

        // SUCESSO!
        alert('Registro salvo com sucesso!');
        closeModal();
        
        // Opção A: Recarregar a página para atualizar tudo (mais simples)
        window.location.reload();

        // Opção B: Se quiser manter SPA, chame uma função global para recarregar a tabela
        // ex: window.loadDashboardData(); 

    } catch (error) {
        console.error(error);
        alert('Erro ao salvar: ' + error.message);
    } finally {
        if(submitBtn) submitBtn.textContent = originalText;
    }
};

export function initAddModal() {
    sel.openModalBtn.addEventListener('click', () => sel.modalOverlay.classList.add('show'));
    sel.closeModalBtn.addEventListener('click', closeModal);
    sel.modalOverlay.addEventListener('click', (e) => {
        if (e.target === sel.modalOverlay) closeModal();
    });
    // Substitui o listener antigo pelo novo async
    sel.addExpenseForm.addEventListener('submit', handleAddSubmit);
}