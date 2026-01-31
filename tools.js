// Add listeners for currency inputs
if (document.getElementById('budgetCurrencyName')) {
    document.getElementById('budgetCurrencyName').addEventListener('input', calculateBudget);
    document.getElementById('foreignCurrencyName').addEventListener('change', calculateBudget);
    document.getElementById('budgetExchangeRate').addEventListener('input', calculateBudget);
}
});

// --- View Navigation ---

function openTool(toolId) {
    // Hide Dashboard
    document.getElementById('toolsDashboard').style.display = 'none';

    // Hide all tools (safety)
    document.querySelectorAll('.tool-view').forEach(view => {
        view.style.display = 'none';
    });

    // Show selected tool
    document.getElementById(toolId).style.display = 'block';

    // Scroll to top of tool view
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeTool() {
    // Hide all tools
    document.querySelectorAll('.tool-view').forEach(view => {
        view.style.display = 'none';
    });

    // Show Dashboard
    document.getElementById('toolsDashboard').style.display = 'grid'; // Grid layout

    // Scroll back to top
    // window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- EMI Calculator Functions ---

function calculateEMI() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const loanTenure = parseFloat(document.getElementById('loanTenure').value);
    const errorElement = document.getElementById('emiError');

    // Reset output
    errorElement.style.display = 'none';

    if (isNaN(loanAmount) || isNaN(interestRate) || isNaN(loanTenure) || loanAmount <= 0 || loanTenure <= 0) {
        errorElement.textContent = "Please enter valid positive numbers for all fields.";
        errorElement.style.display = 'block';
        return;
    }

    const r = interestRate / 12 / 100; // Monthly interest rate
    const n = loanTenure * 12; // Total months

    let emi = 0;
    if (interestRate === 0) {
        emi = loanAmount / n;
    } else {
        emi = loanAmount * r * (Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = emi * n;
    const totalInterest = totalPayment - loanAmount;

    // Format and Display
    animateValue('monthlyEMI', emi);
    animateValue('totalPayment', totalPayment);
    animateValue('totalInterest', totalInterest);
}

function animateValue(id, value) {
    const element = document.getElementById(id);
    const formatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    element.textContent = formatted;
    // Simple fade in effect
    element.style.opacity = 0;
    setTimeout(() => {
        element.style.transition = 'opacity 0.5s';
        element.style.opacity = 1;
    }, 50);
}


// --- Investment & Planning Functions ---

function calculateSIP() {
    const monthlyInvest = parseFloat(document.getElementById('sipAmount').value);
    const rate = parseFloat(document.getElementById('sipRate').value);
    const years = parseFloat(document.getElementById('sipTenure').value);

    if (isNaN(monthlyInvest) || isNaN(rate) || isNaN(years) || monthlyInvest <= 0) return;

    const r = rate / 12 / 100;
    const n = years * 12;

    // FV = P * [ (1+i)^n - 1 ] * (1+i)/i
    const fv = monthlyInvest * (Math.pow(1 + r, n) - 1) * (1 + r) / r;
    const invested = monthlyInvest * n;
    const returns = fv - invested;

    animateValue('sipInvested', invested);
    animateValue('sipReturns', returns);
    animateValue('sipTotal', fv);
}

function calculateLumpsum() {
    const investment = parseFloat(document.getElementById('lumpsumAmount').value);
    const rate = parseFloat(document.getElementById('lumpsumRate').value);
    const years = parseFloat(document.getElementById('lumpsumTenure').value);

    if (isNaN(investment) || isNaN(rate) || isNaN(years) || investment <= 0) return;

    // A = P(1 + r/n)^(nt) , n=1 for annual compounding usually implied in simple lumpsum calcs, 
    // but standard mutual fund lumpsum calc uses A = P (1 + r)^n
    const total = investment * Math.pow(1 + rate / 100, years);
    const returns = total - investment;

    animateValue('lumpsumInvested', investment);
    animateValue('lumpsumReturns', returns);
    animateValue('lumpsumTotal', total);
}

function calculateGoal() {
    const target = parseFloat(document.getElementById('goalTarget').value);
    const rate = parseFloat(document.getElementById('goalRate').value);
    const years = parseFloat(document.getElementById('goalTenure').value);

    if (isNaN(target) || isNaN(rate) || isNaN(years) || target <= 0) return;

    const r = rate / 12 / 100;
    const n = years * 12;

    // Rearranging SIP formula: P = FV / ( [ (1+i)^n - 1 ] * (1+i)/i )
    const sip = target / ((Math.pow(1 + r, n) - 1) * (1 + r) / r);

    animateValue('goalSIP', sip);
}

function calculateAffordability() {
    const emi = parseFloat(document.getElementById('affordEMI').value);
    const rate = parseFloat(document.getElementById('affordRate').value);
    const years = parseFloat(document.getElementById('affordTenure').value);

    if (isNaN(emi) || isNaN(rate) || isNaN(years) || emi <= 0 || years <= 0) return;

    const r = rate / 12 / 100;
    const n = years * 12;

    let principal = 0;

    if (rate === 0) {
        principal = emi * n;
    } else {
        // Rearranging EMI formula: P = E / ( r * (1+r)^n / ((1+r)^n - 1) )
        // P = E * ( (1+r)^n - 1 ) / ( r * (1+r)^n )
        principal = emi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    }
    const totalPayment = emi * n;
    const totalInterest = totalPayment - principal;

    animateValue('affordLoan', principal);
    animateValue('affordTotal', totalPayment);
    animateValue('affordInterest', totalInterest);
}


// --- Budget Planner Functions ---

function addBudgetRow(listId) {
    const list = document.getElementById(listId);
    const div = document.createElement('div');
    div.className = 'budget-item animate-new-row'; // custom animation class defined later or reusing fade-in approach

    // Determine placeholder based on list
    const placeholder = listId === 'incomeList' ? 'Source' : 'Expense';

    div.innerHTML = `
        <input type="text" placeholder="${placeholder}" class="source-input">
        <input type="number" value="0" class="amount-input" oninput="calculateBudget()" placeholder="Amount">
        <select class="currency-input" style="width: 70px; text-align: center; border: none; background: transparent; border-bottom: 1px solid #eee;" onchange="calculateBudget()">
            <option value="INR" selected>INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="AED">AED</option>
            <option value="SAR">SAR</option>
            <option value="BHD">BHD</option>
            <option value="KWD">KWD</option>
            <option value="OMR">OMR</option>
            <option value="QAR">QAR</option>
        </select>
        <button class="remove-btn" onclick="removeBudgetRow(this)">×</button>
    `;

    list.appendChild(div);

    // Focus on the new text input
    div.querySelector('.source-input').focus();
}

function removeBudgetRow(button) {
    const row = button.parentElement;
    row.remove();
    calculateBudget();
}

function calculateBudget() {
    // --- Budget Logic with Global Exchange Rate ---
    const incomeItems = document.querySelectorAll('#incomeList .budget-item');
    const expenseItems = document.querySelectorAll('#expenseList .budget-item');

    let totalIncome = 0;
    let totalExpenses = 0;

    const foreignCurrency = document.getElementById('foreignCurrencyName').value;
    const exchangeRate = parseFloat(document.getElementById('budgetExchangeRate').value) || 1;

    // Helper to calculate row total
    const getRowTotal = (item) => {
        const amount = parseFloat(item.querySelector('.amount-input').value) || 0;
        const rowCurrency = item.querySelector('.currency-input').value;

        if (rowCurrency === foreignCurrency) {
            return amount * exchangeRate;
        }
        return amount; // Assume base currency or 1:1 for others
    };

    incomeItems.forEach(item => {
        totalIncome += getRowTotal(item);
    });

    expenseItems.forEach(item => {
        totalExpenses += getRowTotal(item);
    });

    const savings = totalIncome - totalExpenses;
    const baseCurrency = document.getElementById('budgetCurrencyName').value.trim() || ' ';

    // Update Totals Display
    document.getElementById('totalIncome').textContent = `${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${baseCurrency}`;
    document.getElementById('totalExpenses').textContent = `${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${baseCurrency}`;

    const savingsElement = document.getElementById('totalSavings');
    savingsElement.textContent = `${savings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${baseCurrency}`;

    // Visual feedback for negative savings
    if (savings < 0) {
        savingsElement.style.color = '#ff4d4d'; // Red-ish for negative
    } else {
        savingsElement.style.color = '#fff'; // Default white
    }
}
