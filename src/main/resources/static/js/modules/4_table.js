import { editIconSVG, saveIconSVG } from './0_constants.js';
import { expensesTbody } from './1_selectors.js';
import api from '../api.js';

const handleTableClick = async (event) => {
    const targetButton = event.target.closest('button');
    if (!targetButton) return; 
    
    const row = targetButton.closest('tr');
    const id = row.dataset.id; // ID vindo do Dataset
    const type = row.dataset.type; // 'gasto' ou 'ganho'
    const auth = JSON.parse(localStorage.getItem('cf_auth'));

    // --- Lógica de EXCLUSÃO ---
    if (targetButton.classList.contains('delete-btn')) {
        if (confirm('Tem certeza que deseja apagar este registo?')) {
            try {
                if (type === 'gasto') {
                    await api.deleteGasto(id, auth.email, auth.senha);
                } else {
                    await api.deleteGanho(id, auth.email, auth.senha);
                }
                // Remove a linha da tabela visualmente
                row.remove(); 
                
                // Recarrega a página para atualizar os saldos e contadores corretamente
                // (Solução mais simples para garantir sincronia com o banco)
                window.location.reload();
                
            } catch (err) {
                alert("Erro ao apagar: " + err.message);
            }
        }
    
    // --- Lógica de EDIÇÃO (Botão Salvar) ---
    } else if (targetButton.classList.contains('save-btn')) {
        const nameInput = row.querySelector('.col-name input').value;
        const categoryInput = row.querySelector('.col-category input').value;
        const valueInput = parseFloat(row.querySelector('.col-value input').value);
        const dateInput = row.querySelector('.col-date input').value;

        if (isNaN(valueInput)) { alert('Valor inválido'); return; }

        const dto = {
            usuarioId: auth.userId,
            nome: nameInput,
            categoria: categoryInput,
            valor: valueInput,
            data: dateInput
        };

        try {
            let updated;
            if (type === 'gasto') {
                updated = await api.updateGasto(id, dto, auth.email, auth.senha);
            } else {
                updated = await api.updateGanho(id, dto, auth.email, auth.senha);
            }

            // Atualiza o dataset para ordenação
            row.dataset.value = updated.valor; 
            
            // Atualiza visualmente
            row.querySelector('.col-name').textContent = updated.nome;
            row.querySelector('.col-category').textContent = updated.categoria;
            
            const isIncome = type === 'ganho';
            const valueDisplay = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(updated.valor);
            row.querySelector('.col-value').textContent = `${isIncome ? '+ ' : ''}${valueDisplay}`;
            
            const dateObj = new Date(updated.data);
            // Ajuste de fuso horário simples para visualização
            const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
            const dateCorrected = new Date(dateObj.getTime() + userTimezoneOffset);
            row.querySelector('.col-date').textContent = dateCorrected.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            // Restaura o botão de editar
            targetButton.innerHTML = editIconSVG;
            targetButton.classList.remove('save-btn');
            targetButton.classList.add('edit-btn');
            
            // Recarrega para atualizar saldos
            window.location.reload();

        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar: " + err.message);
        }
    
    // --- Lógica de TRANSFORMAR EM INPUT (Botão Editar) ---
    } else if (targetButton.classList.contains('edit-btn')) {
        targetButton.innerHTML = saveIconSVG; 
        targetButton.classList.remove('edit-btn');
        targetButton.classList.add('save-btn');

        const nameCell = row.querySelector('.col-name');
        const categoryCell = row.querySelector('.col-category');
        const valueCell = row.querySelector('.col-value');
        const dateCell = row.querySelector('.col-date');
        const currentValue = parseFloat(row.dataset.value);
        
        // Converte data dd/MM para YYYY-MM-DD (aproximado para o ano atual)
        const [day, month] = dateCell.textContent.split('/');
        const year = new Date().getFullYear();
        const dateForInput = `${year}-${month}-${day}`;
        
        nameCell.innerHTML = `<input type="text" value="${nameCell.textContent}">`;
        categoryCell.innerHTML = `<input type="text" value="${categoryCell.textContent}">`;
        valueCell.innerHTML = `<input type="number" step="0.01" value="${currentValue}">`;
        dateCell.innerHTML = `<input type="date" value="${dateForInput}">`;
    }
};

export function initTable() {
    expensesTbody.addEventListener('click', handleTableClick);
}