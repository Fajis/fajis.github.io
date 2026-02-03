// --- Initial Setup & Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    const baseInput = document.getElementById('budgetCurrencyName');
    const foreignInput = document.getElementById('foreignCurrencyName');
    const rateInput = document.getElementById('budgetExchangeRate');

    if (baseInput) {
        baseInput.addEventListener('change', updateExchangeRate);
        foreignInput.addEventListener('change', updateExchangeRate);
        rateInput.addEventListener('input', calculateBudget);
        
        // Initial setup
        updateBudgetCurrencyOptions();
        updateExchangeRate();
    }
    
    // Set Footer Year
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// --- Formatting Helper ---
function formatCurrency(value) {
    return value.toLocaleString('en-US', { 
        minimumFractionDigits: 3, 
        maximumFractionDigits: 3 
    });
}

// --- Currency Fetching ---
async function updateExchangeRate() {
    const base = document.getElementById('budgetCurrencyName').value.trim().toLowerCase();
    const target = document.getElementById('foreignCurrencyName').value.trim().toLowerCase();
    const rateInput = document.getElementById('budgetExchangeRate');

    if (base === target) {
        rateInput.value = 1;
        calculateBudget();
        return;
    }

    try {
        const response = await fetch(`https://www.floatrates.com/daily/${base}.json`);
        const data = await response.json();

        if (data[target]) {
            rateInput.value = data[target].inverseRate.toFixed(6);
            updateBudgetCurrencyOptions();
            calculateBudget();
        }
    } catch (error) {
        console.error("API Error:", error);
    }
}

// --- Budget Planner Logic ---
function calculateBudget() {
    const incomeItems = document.querySelectorAll('#incomeList .budget-item');
    const expenseItems = document.querySelectorAll('#expenseList .budget-item');
    
    const baseCurrency = document.getElementById('budgetCurrencyName').value.trim();
    const foreignCurrency = document.getElementById('foreignCurrencyName').value.trim();
    const exchangeRate = parseFloat(document.getElementById('budgetExchangeRate').value) || 0;

    let totalIncome = 0;
    let totalExpenses = 0;

    const convertToBase = (item) => {
        const amount = parseFloat(item.querySelector('.amount-input').value) || 0;
        const rowCurrency = item.querySelector('.currency-input').value;

        // LOGIC FIX: Use multiplication because exchangeRate is a ratio (e.g., 0.0042)
        if (rowCurrency === foreignCurrency) {
            return amount * exchangeRate;
        }
        return amount;
    };

    incomeItems.forEach(item => totalIncome += convertToBase(item));
    expenseItems.forEach(item => totalExpenses += convertToBase(item));

    const savings = totalIncome - totalExpenses;

    document.getElementById('totalIncome').textContent = `${formatCurrency(totalIncome)} ${baseCurrency}`;
    document.getElementById('totalExpenses').textContent = `${formatCurrency(totalExpenses)} ${baseCurrency}`;
    
    const savingsEl = document.getElementById('totalSavings');
    savingsEl.textContent = `${formatCurrency(savings)} ${baseCurrency}`;
    savingsEl.style.color = savings < 0 ? "#ff4d4d" : "#fff";
}

// --- Row Management ---
function updateBudgetCurrencyOptions() {
    const base = document.getElementById('budgetCurrencyName').value.trim();
    const foreign = document.getElementById('foreignCurrencyName').value.trim();

    document.querySelectorAll('.currency-input').forEach(select => {
        const currentVal = select.value;
        select.innerHTML = `<option value="${base}">${base}</option>
                            <option value="${foreign}">${foreign}</option>`;
        select.value = (currentVal === foreign) ? foreign : base;
    });
}

function addBudgetRow(listId) {
    const list = document.getElementById(listId);
    const base = document.getElementById('budgetCurrencyName').value.trim();
    const foreign = document.getElementById('foreignCurrencyName').value.trim();
    const div = document.createElement('div');
    div.className = 'budget-item';
    const placeholder = listId === 'incomeList' ? 'Source' : 'Expense';

    div.innerHTML = `
        <input type="text" placeholder="${placeholder}" class="source-input">
        <input type="number" value="0" class="amount-input" oninput="calculateBudget()">
        <select class="currency-input" onchange="calculateBudget()">
            <option value="${base}">${base}</option>
            <option value="${foreign}">${foreign}</option>
        </select>
        <button class="remove-btn" onclick="removeBudgetRow(this)">×</button>
    `;
    list.appendChild(div);
}

function removeBudgetRow(button) {
    button.parentElement.remove();
    calculateBudget();
}

// --- Global UI Helpers ---
function openTool(toolId) {
    document.getElementById('toolsDashboard').style.display = 'none';
    document.querySelectorAll('.tool-view').forEach(v => v.style.display = 'none');
    document.getElementById(toolId).style.display = 'block';
    window.scrollTo(0, 0);
}

function closeTool() {
    document.querySelectorAll('.tool-view').forEach(v => v.style.display = 'none');
    document.getElementById('toolsDashboard').style.display = 'grid';
}

function animateValue(id, value) {
    const element = document.getElementById(id);
    element.textContent = formatCurrency(value);
    element.style.opacity = 0;
    setTimeout(() => {
        element.style.transition = 'opacity 0.5s';
        element.style.opacity = 1;
    }, 50);
}

// --- Other Calculators ---
function calculateEMI() {
    const loan = parseFloat(document.getElementById('loanAmount').value);
    const interestInput = parseFloat(document.getElementById('interestRate').value);
    const months = parseFloat(document.getElementById('loanTenure').value) * 12;

    if (isNaN(loan) || isNaN(months) || months <= 0) return;

    let emi;
    if (interestInput === 0) {
        // Simple linear division for 0% interest
        emi = loan / months;
    } else {
        const rate = interestInput / 12 / 100;
        emi = (loan * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    }

    animateValue('monthlyEMI', emi);
    animateValue('totalPayment', emi * months);
    animateValue('totalInterest', (emi * months) - loan);
}

function calculateSIP() {
    const p = parseFloat(document.getElementById('sipAmount').value);
    const rateInput = parseFloat(document.getElementById('sipRate').value);
    const n = parseFloat(document.getElementById('sipTenure').value) * 12;

    if (isNaN(p) || isNaN(n) || n <= 0) return;

    let fv;
    if (rateInput === 0) {
        // Total savings with no growth
        fv = p * n;
    } else {
        const r = rateInput / 12 / 100;
        fv = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    }

    animateValue('sipTotal', fv);
    animateValue('sipInvested', p * n);
    animateValue('sipReturns', fv - (p * n));
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

    const n = years * 12;
    let sip = 0;
    if (rate === 0) {
        sip = target / n;
    } else {
        const r = rate / 12 / 100;
        // Rearranging SIP formula: P = FV / ( [ (1+i)^n - 1 ] * (1+i)/i )
        sip = target / ((Math.pow(1 + r, n) - 1) * (1 + r) / r);
    }

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