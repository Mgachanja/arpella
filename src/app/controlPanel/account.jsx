import React, { useState } from 'react';
import { Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Modal, Box } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Dummy Data for Income and Expenses
const incomeData = [
  { date: '2025-01-01', amount: 500 },
  { date: '2025-01-15', amount: 200 },
  { date: '2025-02-01', amount: 800 },
];

const expenseData = [
  { date: '2025-01-02', description: 'Inventory Purchase', amount: 150 },
  { date: '2025-01-10', description: 'Marketing', amount: 50 },
  { date: '2025-02-05', description: 'Software Subscription', amount: 100 },
];

const Accounts = () => {
  const [income, setIncome] = useState(incomeData);
  const [expenses, setExpenses] = useState(expenseData);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const calculateGrossProfit = () => {
    const totalIncome = income.reduce((acc, cur) => acc + cur.amount, 0);
    const totalExpenses = expenses.reduce((acc, cur) => acc + cur.amount, 0);
    return totalIncome - totalExpenses;
  };

  const handleAddIncome = () => {
    if (incomeAmount === '') {
      toast.error('Please enter an income amount.');
      return;
    }
    setIncome([...income, { date: new Date().toISOString().split('T')[0], amount: parseFloat(incomeAmount) }]);
    setIncomeAmount('');
    toast.success('Income added successfully!');
  };

  const handleAddExpense = () => {
    if (expenseAmount === '' || expenseName === '') {
      toast.error('Please enter both expense name and amount.');
      return;
    }
    setExpenses([
      ...expenses,
      { date: new Date().toISOString().split('T')[0], description: expenseName, amount: parseFloat(expenseAmount) }
    ]);
    setExpenseName('');
    setExpenseAmount('');
    toast.success('Expense added successfully!');
  };

  // Export table to PDF using jsPDF and jspdf-autotable
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add the income table
    autoTable(doc, {
      html: '#income-table', // Specify the table by id
    });

    // Add the expense table after the income table
    autoTable(doc, {
      html: '#expense-table', // Specify the table by id
      startY: doc.lastAutoTable.finalY + 10, // Ensure the second table starts after the first one
    });

    doc.save('financial_report.pdf');
    toast.success('Financial report exported as PDF!');
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#2d2d2d' }}>
        Accounts Overview
      </Typography>

      <div style={{ marginBottom: '20px' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Gross Profit: <span style={{ fontWeight: 'bold' }}>{calculateGrossProfit()}</span>
        </Typography>
      </div>

      {/* Income Table */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
        Income Management
      </Typography>
      <TableContainer sx={{ mb: 4 }}>
        <Table id="income-table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {income.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Expense Table */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
        Expense Management
      </Typography>
      <TableContainer sx={{ mb: 4 }}>
        <Table id="expense-table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>{entry.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Income Form */}
      <div style={{ marginBottom: '20px' }}>
        <TextField
          label="Income Amount"
          type="number"
          value={incomeAmount}
          onChange={(e) => setIncomeAmount(e.target.value)}
          sx={{ marginRight: '10px', width: '200px' }}
        />
        <Button variant="contained" color="primary" onClick={handleAddIncome}>
          Add Income
        </Button>
      </div>

      {/* Add Expense Form */}
      <div style={{ marginBottom: '20px' }}>
        <TextField
          label="Expense Name"
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
          sx={{ marginRight: '10px', width: '300px' }}
        />
        <TextField
          label="Expense Amount"
          type="number"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          sx={{ marginRight: '10px', width: '200px' }}
        />
        <Button variant="contained" color="primary" onClick={handleAddExpense}>
          Add Expense
        </Button>
      </div>

      {/* Export Financial Report */}
      <Button variant="contained" color="secondary" onClick={exportToPDF}>
        Export Report as PDF
      </Button>
    </div>
  );
};

export default Accounts;
