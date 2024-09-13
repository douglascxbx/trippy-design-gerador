const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); 
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos como CSS e JS
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para gerar a nota fiscal
app.post('/gerar-nota-fiscal', (req, res) => {
    const { nomeCliente, arquiteto, itens, totalReais, totalMoedas, observacoes } = req.body;

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'public', `nota_fiscal_${nomeCliente}.pdf`);

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(16).text('Nota Fiscal - Trippy Design', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Nome do Cliente: ${nomeCliente}`);
    doc.text(`Arquiteto(a): ${arquiteto}`);
    doc.moveDown();

    doc.text('Itens cadastrados na Nota Fiscal:');
    itens.forEach(item => {
        // Não duplicar a quantidade aqui
        doc.text(`- ${item.quantidade} x ${item.nome} (${item.tipo}): R$ ${item.valor}`);
    });

    
    doc.moveDown();
    doc.text(`Total em R$: R$ ${totalReais}`);
    doc.text(`Total em Moedas: ${totalMoedas}`);
    doc.moveDown();

    if (observacoes) {
        doc.text(`Observações: ${observacoes}`);
    }

    doc.end();

    res.status(200).json({ message: 'Nota fiscal gerada com sucesso!', filePath: `nota_fiscal_${nomeCliente}.pdf` });
});


// Rota para gerar a garantia
app.post('/gerar-garantia', (req, res) => {
    const { nomeCliente, arquiteto, projeto } = req.body;

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'public', `garantia_cliente_${nomeCliente}.pdf`);

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(16).text('Garantia do Cliente - Trippy Design', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Nome do Cliente: ${nomeCliente}`);
    doc.text(`Arquiteto(a): ${arquiteto}`);
    doc.text(`Projeto: ${projeto}`);
    doc.text('Garantia válida por 3 meses.');
    doc.end();

    res.status(200).json({ message: 'Garantia gerada com sucesso!', filePath: `garantia_cliente_${nomeCliente}.pdf` });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

