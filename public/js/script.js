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

    // Verificação se o valor unitário é válido
    if (isNaN(valorUnitario) || valorUnitario <= 0) {
        alert('O valor do item deve ser um número positivo.');
        return;
    }

    const valorTotal = valorUnitario * quantidade;

    // Capitalizando o nome do item
    nome = capitalizeWords(nome);
    

    // Verificação para garantir que todos os campos estão preenchidos corretamente
    if (quantidade > 0 && nome && !isNaN(valorUnitario)) {
        // Adiciona o item à lista de itens com o valor correto
        itens.push({ quantidade, nome, tipo, valor: valorTotal });

        // Atualiza os totais de valores
        if (tipo === 'dinheiro') {
            totalReais += valorTotal;
        } else {
            totalMoedas += valorTotal;
        }

        // Atualiza os campos totais
        document.getElementById('total-reais').textContent = totalReais.toFixed(2);
        document.getElementById('total-cambios').textContent = totalMoedas.toFixed(0);

        // Exibe os itens adicionados na lista
        atualizarListaItens();

        // Salva os itens e totais no localStorage
        localStorage.setItem('itensNotaFiscal', JSON.stringify(itens));
        localStorage.setItem('totalReais', totalReais);
        localStorage.setItem('totalMoedas', totalMoedas);

        // Limpa os campos de entrada para nova entrada
        document.getElementById('item-quantity').value = '';
        document.getElementById('item-name').value = '';
        document.getElementById('item-value').value = '0';
    } else {
        alert('Preencha todos os campos corretamente.');
    }
}


function atualizarListaItens() {
    const listaItens = document.getElementById('lista-itens');
    listaItens.innerHTML = ''; // Limpa a lista antes de atualizá-la

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

    // Atualiza o localStorage com os itens e totais atualizados
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

        // Após gerar o PDF, limpa o localStorage
        localStorage.removeItem('itensNotaFiscal');
        localStorage.removeItem('totalReais');
        localStorage.removeItem('totalMoedas');
    } catch (error) {
        console.error('Erro ao gerar o PDF:', error);
    }
}

// Capturar o evento de clique no botão "Finalizar Nota Fiscal"
document.querySelector('.finalize-btn').addEventListener('click', () => {
    const cliente = document.getElementById('client-name').value;
    const arquiteto = document.getElementById('architect-name').value;
    const observacoes = document.getElementById('observations').value;

    const itens = []; // Inicializa um novo array de itens

    document.querySelectorAll('#lista-itens li').forEach((li) => {
        const quantidade = parseFloat(li.querySelector('strong').textContent.replace('x', '').trim());
        const nome = li.querySelector('.item-name').textContent.trim();
        
        let valor = li.querySelector('.item-info span').textContent.replace(/[^\d.,-]/g, '').replace(',', '.').trim();
        valor = parseFloat(valor);

        // Garantir que o valor não seja NaN
        if (isNaN(valor) || valor <= 0) {
            valor = 0;
        }

        const tipo = li.querySelector('.item-info span').textContent.includes('R$') ? 'dinheiro' : 'moedas';

        // Adicionar o item na lista com o valor correto
        itens.push({ quantidade, nome, tipo, valor });
    });

    const totalReais = parseFloat(document.getElementById('total-reais').textContent);
    const totalMoedas = parseFloat(document.getElementById('total-cambios').textContent);

    // Verificar os itens capturados
    console.log("Itens capturados: ", itens);

    // Chama a função para gerar o PDF
    gerarNotaFiscalPDF(cliente, arquiteto, itens, totalReais, totalMoedas, observacoes);
});

// Chamada para restaurar os dados ao carregar a página
restaurarTotais();






// --- Função para gerar a garantia ao clicar no botão "Gerar garantia do cliente" ---
async function gerarGarantiaPDF(cliente, projeto, arquiteto) {
    try {
        // Carregar o PDF de termos de garantia
        const existingPdfBytes = await fetch('/pdf/Termos de garantia - protótipo.pdf').then(res => res.arrayBuffer());

        // Carregar o PDF existente
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Obter o formulário do PDF
        const form = pdfDoc.getForm();

        // Obter os campos de texto do formulário
        const nomeClienteField = form.getTextField('nomeCliente');
        const projetoField = form.getTextField('projeto');
        const arquitetoField = form.getTextField('arquiteto');
        const dataField = form.getTextField('data');
        const horaField = form.getTextField('hora');

        // Preencher os campos com os valores fornecidos
        nomeClienteField.setText(cliente);
        projetoField.setText(projeto);
        arquitetoField.setText(arquiteto);

        // Preencher data e hora
        const dataAtual = new Date().toLocaleDateString();
        const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        dataField.setText(dataAtual);
        horaField.setText(horaAtual);

        // Tornar os campos read-only (apenas leitura) usando setReadOnly()
        nomeClienteField.enableReadOnly();
        projetoField.enableReadOnly();
        arquitetoField.enableReadOnly();
        dataField.enableReadOnly();
        horaField.enableReadOnly();

        // Salvar o PDF preenchido
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Baixar o PDF preenchido
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

// Capturar o evento de clique no botão "Gerar Garantia"
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
        this.textContent = '☀️'; // Muda o ícone para o sol
    } else {
        this.textContent = '🌙'; // Muda o ícone para a lua
    }
});


