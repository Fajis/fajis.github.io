// --- Initial Setup & Listeners ---
const currencies = [
    { code: "USD", name: "United States Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound Sterling" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "INR", name: "Indian Rupee" },
    { code: "BHD", name: "Bahraini Dinar" },
    { code: "AED", name: "United Arab Emirates Dirham" },
    { code: "SAR", name: "Saudi Riyal" },
    { code: "KWD", name: "Kuwaiti Dinar" },
    { code: "OMR", name: "Omani Rial" },
    { code: "QAR", name: "Qatari Rial" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "SGD", name: "Singapore Dollar" },
    { code: "NZD", name: "New Zealand Dollar" },
    { code: "HKD", name: "Hong Kong Dollar" },
    { code: "MYR", name: "Malaysian Ringgit" },
    { code: "THB", name: "Thai Baht" },
    { code: "IDR", name: "Indonesian Rupiah" },
    { code: "PHP", name: "Philippine Peso" },
    { code: "PKR", name: "Pakistani Rupee" },
    { code: "BDT", name: "Bangladeshi Taka" },
    { code: "LKR", name: "Sri Lankan Rupee" }
];

document.addEventListener('DOMContentLoaded', () => {
    const baseInput = document.getElementById('budgetCurrencyName');
    const foreignInput = document.getElementById('foreignCurrencyName');
    const rateInput = document.getElementById('budgetExchangeRate');

    initSearchableSelect('baseCurrencySelect', (code) => {
        updateExchangeRate();
    });

    initSearchableSelect('secondaryCurrencySelect', (code) => {
        updateExchangeRate();
    });

    loadBudgetData();
    if (baseInput) {
        rateInput.addEventListener('input', calculateBudget);

        // Initial setup
        updateBudgetCurrencyOptions();
        updateExchangeRate();
    }

    // Set Footer Year
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

function initSearchableSelect(containerId, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const trigger = container.querySelector('.searchable-select-trigger');
    const dropdown = container.querySelector('.searchable-select-dropdown');
    const searchInput = container.querySelector('.search-input-wrapper input');
    const optionsList = container.querySelector('.select-options-list');

    // Populate list
    function renderOptions(filter = "") {
        optionsList.innerHTML = "";
        const filtered = currencies.filter(c =>
            c.code.toLowerCase().includes(filter.toLowerCase()) ||
            c.name.toLowerCase().includes(filter.toLowerCase())
        );

        filtered.forEach(c => {
            const li = document.createElement('li');
            li.className = 'select-option';
            if (trigger.value === c.code) li.classList.add('selected');
            li.innerHTML = `
                <span class="currency-code">${c.code}</span>
                <span class="currency-name">${c.name}</span>
            `;
            li.onclick = () => {
                trigger.value = c.code;
                dropdown.classList.remove('active');
                if (onSelect) onSelect(c.code);
            };
            optionsList.appendChild(li);
        });
    }

    trigger.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
        if (dropdown.classList.contains('active')) {
            searchInput.value = "";
            renderOptions();
            searchInput.focus();
        }
    };

    searchInput.oninput = (e) => {
        renderOptions(e.target.value);
    };

    searchInput.onclick = (e) => e.stopPropagation();

    document.addEventListener('click', () => {
        dropdown.classList.remove('active');
    });
}

// --- Formatting Helper ---
function formatCurrency(value) {
    if (isNaN(value)) return "0.000";
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    });
}

function getSafeValue(id, defaultValue = 0) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`Element with ID "${id}" not found.`);
        return defaultValue;
    }
    const val = parseFloat(el.value);
    return isNaN(val) ? defaultValue : val;
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
    saveBudgetData();
}
// --- LocalStorage Logic ---

function saveBudgetData() {
    const data = {
        baseCurrency: document.getElementById('budgetCurrencyName').value,
        foreignCurrency: document.getElementById('foreignCurrencyName').value,
        exchangeRate: document.getElementById('budgetExchangeRate').value,
        income: [],
        expenses: []
    };

    document.querySelectorAll('#incomeList .budget-item').forEach(row => {
        data.income.push({
            source: row.querySelector('.source-input').value,
            amount: row.querySelector('.amount-input').value,
            currency: row.querySelector('.currency-input').value
        });
    });

    document.querySelectorAll('#expenseList .budget-item').forEach(row => {
        data.expenses.push({
            source: row.querySelector('.source-input').value,
            amount: row.querySelector('.amount-input').value,
            currency: row.querySelector('.currency-input').value
        });
    });

    localStorage.setItem('pishukkan_budget', JSON.stringify(data));
}

function loadBudgetData() {
    const saved = localStorage.getItem('pishukkan_budget');
    if (!saved) return;

    const data = JSON.parse(saved);

    document.getElementById('budgetCurrencyName').value = data.baseCurrency;
    document.getElementById('foreignCurrencyName').value = data.foreignCurrency;
    document.getElementById('budgetExchangeRate').value = data.exchangeRate;

    // Clear defaults
    document.getElementById('incomeList').innerHTML = '';
    document.getElementById('expenseList').innerHTML = '';

    data.income.forEach(item => addLoadedRow('incomeList', item));
    data.expenses.forEach(item => addLoadedRow('expenseList', item));

    calculateBudget();
}

function addLoadedRow(listId, item) {
    const list = document.getElementById(listId);
    const div = document.createElement('div');
    div.className = 'budget-item';

    div.innerHTML = `
        <input type="text" value="${item.source}" class="source-input">
        <input type="number" value="${item.amount}" class="amount-input" oninput="calculateBudget()">
        <select class="currency-input" onchange="calculateBudget()">
            <option value="${document.getElementById('budgetCurrencyName').value}">${document.getElementById('budgetCurrencyName').value}</option>
            <option value="${document.getElementById('foreignCurrencyName').value}">${document.getElementById('foreignCurrencyName').value}</option>
        </select>
        <button class="remove-btn" onclick="removeBudgetRow(this)">×</button>
    `;
    list.appendChild(div);
    div.querySelector('.currency-input').value = item.currency;
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
    const loan = getSafeValue('loanAmount');
    const interestInput = getSafeValue('interestRate');
    const years = getSafeValue('loanTenureYears');
    const extraMonths = getSafeValue('loanTenureMonths');
    const months = (years * 12) + extraMonths;

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
    const p = getSafeValue('sipAmount');
    const rateInput = getSafeValue('sipRate');
    const years = getSafeValue('sipTenureYears');
    const extraMonths = getSafeValue('sipTenureMonths');
    const n = (years * 12) + extraMonths;

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
    const investment = getSafeValue('lumpsumAmount');
    const rate = getSafeValue('lumpsumRate');
    const yearsInput = getSafeValue('lumpsumTenureYears');
    const monthsInput = getSafeValue('lumpsumTenureMonths');
    const years = yearsInput + (monthsInput / 12);

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
    const target = getSafeValue('goalTarget');
    const rate = getSafeValue('goalRate');
    const yearsInput = getSafeValue('goalTenureYears');
    const monthsInput = getSafeValue('goalTenureMonths');
    const n = (yearsInput * 12) + monthsInput;

    if (isNaN(target) || isNaN(n) || n <= 0 || target <= 0) return;

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
    const emi = getSafeValue('affordEMI');
    const rate = getSafeValue('affordRate');
    const yearsInput = getSafeValue('affordTenureYears');
    const monthsInput = getSafeValue('affordTenureMonths');
    const n = (yearsInput * 12) + monthsInput;

    if (isNaN(emi) || isNaN(n) || n <= 0 || emi <= 0) return;

    const r = rate / 12 / 100;
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