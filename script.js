const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const expensesFile = 'expenses.json';

// Load expenses from file
let expenses = [];
if (fs.existsSync(expensesFile)) {
    try {
        const data = fs.readFileSync(expensesFile, 'utf-8');
        if (data) {
            expenses = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading expenses file:', error);
    }
}

// Save expenses to file
const saveExpenses = () => {
    fs.writeFileSync(expensesFile, JSON.stringify(expenses, null, 2));
};

const calculateTotal = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
};

app.post('/add-expense', (req, res) => {
    const { amount, product } = req.body;
    const date = new Date().toLocaleString();
    const expense = { id: Date.now(), amount, product, date };
    expenses.push(expense);
    saveExpenses();
    const total = calculateTotal();
    res.json({ expense, total });
});

app.put('/update-expense/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { amount, product } = req.body;
    const expense = expenses.find(expense => expense.id === id);
    if (expense) {
        expense.amount = amount;
        expense.product = product;
        saveExpenses();
        const total = calculateTotal();
        res.json({ success: true, expense, total });
    } else {
        res.status(404).json({ success: false, message: 'Expense not found' });
    }
});

app.delete('/delete-expense/:id', (req, res) => {
    const id = parseInt(req.params.id);
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses();
    const total = calculateTotal();
    res.json({ success: true, total });
});

app.get('/expenses', (req, res) => {
    const total = calculateTotal();
    res.json({ expenses, total });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
