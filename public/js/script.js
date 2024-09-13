// Função para capitalizar a primeira letra de cada palavra
function capitalizeWords(str) {
    return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
}

// Lista de itens da nota fiscal
let itens = [];
let totalReais = 0;
let totalMoedas = 0;

// Função para restaurar itens e totais salvos no localStorage
function restaurarTotais() {
    const itensSalvos = JSON.parse(localStorage.getItem('itensNotaFiscal'));
    const totalReaisSalvo = localStorage.getItem('totalReais');
    const totalMoedasSalvo = localStorage.getItem('totalMoedas');

    if (itensSalvos) {
        itens = itensSalvos;
        atualizarListaItens(); // Atualiza a lista de itens
    }

    if (totalReaisSalvo) {
        totalReais = parseFloat(totalReaisSalvo);
        document.getElementById('total-reais').textContent = totalReais.toFixed(2);
    }

    if (totalMoedasSalvo) {
        totalMoedas = parseFloat(totalMoedasSalvo);
        document.getElementById('total-cambios').textContent = totalMoedas.toFixed(0);
    }
}

function adicionarItem() {
    const quantidade = parseFloat(document.getElementById('item-quantity').value);
    let nome = document.getElementById('item-name').value;
    const tipo = document.getElementById('item-type').value;
    const valorUnitario = parseFloat(document.getElementById('item-value').value);

    if (isNaN(valorUnitario) || valorUnitario <= 0) {
        alert('O valor do item deve ser um número positivo.');
        return;
    }

    const valorTotal = valorUnitario * quantidade;

    nome = capitalizeWords(nome);

    if (quantidade > 0 && nome && !isNaN(valorUnitario)) {
        itens.push({ quantidade, nome, tipo, valor: valorTotal });

        if (tipo === 'dinheiro') {
            totalReais += valorTotal;
        } else {
            totalMoedas += valorTotal;
        }

        document.getElementById('total-reais').textContent = totalReais.toFixed(2);
        document.getElementById('total-cambios').textContent = totalMoedas.toFixed(0);

        atualizarListaItens();

        localStorage.setItem('itensNotaFiscal', JSON.stringify(itens));
        localStorage.setItem('totalReais', totalReais);
        localStorage.setItem('totalMoedas', totalMoedas);

        document.getElementById('item-quantity').value = '';
        document.getElementById('item-name').value = '';
        document.getElementById('item-value').value = '0';
    } else {
        alert('Preencha todos os campos corretamente.');
    }
}

function atualizarListaItens() {
    const listaItens = document.getElementById('lista-itens');
    listaItens.innerHTML = '';

    itens.forEach((item, index) => {
        const valorExibido = item.tipo === 'dinheiro' ? `R$${item.valor.toFixed(2)}` : `${item.valor.toFixed(0)}c`;

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="item-info">
                <strong>${item.quantidade}x</strong> <span class="item-name">${item.nome}</span> - <span>${valorExibido}</span>
            </div>
            <div class="action-buttons-list">
                <button class="btn-edit" onclick="editarItem(${index})">Editar</button>
                <button class="btn-remove" onclick="removerItem(${index})">Remover</button>
            </div>
        `;
        listaItens.appendChild(li);
    });
}

function editarItem(index) {
    const item = itens[index];
    document.getElementById('item-quantity').value = item.quantidade;
    document.getElementById('item-name').value = item.nome;
    document.getElementById('item-type').value = item.tipo;
    document.getElementById('item-value').value = (item.valor / item.quantidade).toFixed(2);

    removerItem(index);
}

function removerItem(index) {
    const item = itens[index];

    if (item.tipo === 'dinheiro') {
        totalReais -= item.valor;
    } else {
        totalMoedas -= item.valor;
    }

    document.getElementById('total-reais').textContent = totalReais.toFixed(2);
    document.getElementById('total-cambios').textContent = totalMoedas.toFixed(0);

    itens.splice(index, 1);
    atualizarListaItens();

    localStorage.setItem('itensNotaFiscal', JSON.stringify(itens));
    localStorage.setItem('totalReais', totalReais);
    localStorage.setItem('totalMoedas', totalMoedas);
}

// --- Geração de PDF no clique do botão "Finalizar Nota Fiscal" ---
const { PDFDocument, rgb, StandardFonts } = PDFLib;

async function gerarNotaFiscalPDF(cliente, arquiteto, itens, totalReais, totalMoedas, observacoes) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const dataAtual = new Date().toLocaleString();

        const fontSize = 12;
        const titleFontSize = 18;

        page.drawText('Nota Fiscal - Trippy Design', {
            x: 50,
            y: 750,
            size: titleFontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Nome do Cliente:`, {
            x: 50,
            y: 720,
            size: fontSize,
            font: helveticaBoldFont,
        });
        page.drawText(`${cliente}`, {
            x: 180,
            y: 720,
            size: fontSize,
            font: helveticaFont,
        });

        page.drawText(`Arquiteto(a):`, {
            x: 50,
            y: 700,
            size: fontSize,
            font: helveticaBoldFont,
        });
        page.drawText(`${arquiteto}`, {
            x: 180,
            y: 700,
            size: fontSize,
            font: helveticaFont,
        });

        page.drawText(`Data e Hora:`, {
            x: 50,
            y: 680,
            size: fontSize,
            font: helveticaBoldFont,
        });
        page.drawText(`${dataAtual}`, {
            x: 180,
            y: 680,
            size: fontSize,
            font: helveticaFont,
        });

        let yPos = 650;
        page.drawText('Itens da Nota Fiscal:', {
            x: 50,
            y: yPos,
            size: fontSize,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
        });

        yPos -= 20;

        itens.forEach(item => {
            const valorExibido = item.tipo === 'dinheiro' ? `R$${item.valor.toFixed(2)}` : `${item.valor.toFixed(0)}c`;

            page.drawText(`${item.quantidade}x`, {
                x: 50,
                y: yPos,
                size: fontSize,
                font: helveticaBoldFont,
            });

            page.drawText(`${item.nome} - ${valorExibido}`, {
                x: 100,
                y: yPos,
                size: fontSize,
                font: helveticaFont,
            });

            yPos -= 20;
        });

        page.drawText(`Total em R$:`, {
            x: 50,
            y: yPos - 20,
            size: fontSize,
            font: helveticaBoldFont,
        });
        page.drawText(`R$ ${totalReais}`, {
            x: 180,
            y: yPos - 20,
            size: fontSize,
            font: helveticaFont,
        });

        page.drawText(`Total em Moedas:`, {
            x: 50,
            y: yPos - 40,
            size: fontSize,
            font: helveticaBoldFont,
        });
        page.drawText(`${totalMoedas}`, {
            x: 180,
            y: yPos - 40,
            size: fontSize,
            font: helveticaFont,
        });

        if (observacoes) {
            page.drawText('Observações:', {
                x: 50,
                y: yPos - 80,
                size: fontSize,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
            });
            page.drawText(observacoes, {
                x: 50,
                y: yPos - 100,
                size: fontSize,
                font: helveticaFont,
            });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `NotaFiscal_${cliente}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        localStorage.removeItem('itensNotaFiscal');
        localStorage.removeItem('totalReais');
        localStorage.removeItem('totalMoedas');
    } catch (error) {
        console.error('Erro ao gerar o PDF:', error);
    }
}

document.querySelector('.finalize-btn').addEventListener('click', () => {
    const cliente = document.getElementById('client-name').value;
    const arquiteto = document.getElementById('architect-name').value;
    const observacoes = document.getElementById('observations').value;

    const itens = [];

    document.querySelectorAll('#lista-itens li').forEach((li) => {
        const quantidade = parseFloat(li.querySelector('strong').textContent.replace('x', '').trim());
        const nome = li.querySelector('.item-name').textContent.trim();
        
        let valor = li.querySelector('.item-info span').textContent.replace(/[^\d.,-]/g, '').replace(',', '.').trim();
        valor = parseFloat(valor);

        if (isNaN(valor) || valor <= 0) {
            valor = 0;
        }

        const tipo = li.querySelector('.item-info span').textContent.includes('R$') ? 'dinheiro' : 'moedas';

        itens.push({ quantidade, nome, tipo, valor });
    });

    const totalReais = parseFloat(document.getElementById('total-reais').textContent);
    const totalMoedas = parseFloat(document.getElementById('total-cambios').textContent);

    console.log("Itens capturados: ", itens);

    gerarNotaFiscalPDF(cliente, arquiteto, itens, totalReais, totalMoedas, observacoes);
});

restaurarTotais();

// Função para gerar a garantia ao clicar no botão "Gerar garantia do cliente"
async function gerarGarantiaPDF(cliente, projeto, arquiteto) {
    try {
        const existingPdfBytes = await fetch('/pdf/Termos de garantia - protótipo.pdf').then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        const nomeClienteField = form.getTextField('nomeCliente');
        const projetoField = form.getTextField('projeto');
        const arquitetoField = form.getTextField('arquiteto');
        const dataField = form.getTextField('data');
        const horaField = form.getTextField('hora');

        nomeClienteField.setText(cliente);
        projetoField.setText(projeto);
        arquitetoField.setText(arquiteto);

        const dataAtual = new Date().toLocaleDateString();
        const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        dataField.setText(dataAtual);
        horaField.setText(horaAtual);

        nomeClienteField.enableReadOnly();
        projetoField.enableReadOnly();
        arquitetoField.enableReadOnly();
        dataField.enableReadOnly();
        horaField.enableReadOnly();

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `Garantia_${cliente}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Erro ao gerar o PDF:', error);
    }
}

document.querySelector('.warranty-btn').addEventListener('click', () => {
    const cliente = document.getElementById('client-name').value;
    const arquiteto = document.getElementById('architect-name').value;
    const projeto = prompt('Para qual projeto é a garantia?');

    if (projeto && cliente && arquiteto) {
        gerarGarantiaPDF(cliente, projeto, arquiteto);
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
});

document.getElementById('toggle-theme-btn').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        this.textContent = '☀️';
    } else {
        this.textContent = '🌙';
    }
});
