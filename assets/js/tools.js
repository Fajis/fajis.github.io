// Financial tools page. Markup comes from _data/tools.yml; this file wires up
// opening tools, the calculators and the budget planner.
// Uses $, $$ and storage from main.js, which loads first.

(function () {
    const CURRENCIES = [
        { code: 'USD', name: 'United States Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound Sterling' },
        { code: 'JPY', name: 'Japanese Yen' },
        { code: 'INR', name: 'Indian Rupee' },
        { code: 'BHD', name: 'Bahraini Dinar' },
        { code: 'AED', name: 'United Arab Emirates Dirham' },
        { code: 'SAR', name: 'Saudi Riyal' },
        { code: 'KWD', name: 'Kuwaiti Dinar' },
        { code: 'OMR', name: 'Omani Rial' },
        { code: 'QAR', name: 'Qatari Rial' },
        { code: 'AUD', name: 'Australian Dollar' },
        { code: 'CAD', name: 'Canadian Dollar' },
        { code: 'CHF', name: 'Swiss Franc' },
        { code: 'CNY', name: 'Chinese Yuan' },
        { code: 'SGD', name: 'Singapore Dollar' },
        { code: 'NZD', name: 'New Zealand Dollar' },
        { code: 'HKD', name: 'Hong Kong Dollar' },
        { code: 'MYR', name: 'Malaysian Ringgit' },
        { code: 'THB', name: 'Thai Baht' },
        { code: 'IDR', name: 'Indonesian Rupiah' },
        { code: 'PHP', name: 'Philippine Peso' },
        { code: 'PKR', name: 'Pakistani Rupee' },
        { code: 'BDT', name: 'Bangladeshi Taka' },
        { code: 'LKR', name: 'Sri Lankan Rupee' }
    ];
    const BUDGET_STORAGE_KEY = 'pishukkan_budget';
    const RATES_URL = code => `https://www.floatrates.com/daily/${code}.json`;

    // ---------- Shared helpers ----------

    function formatCurrency(value) {
        if (isNaN(value)) return '0.000';
        return value.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }

    // Number from an input by id; empty or invalid counts as 0
    function readNumber(id) {
        const value = parseFloat(document.getElementById(id)?.value);
        return isNaN(value) ? 0 : value;
    }

    // Total months from the <prefix>Years and <prefix>Months fields
    function readMonths(prefix) {
        return readNumber(`${prefix}Years`) * 12 + readNumber(`${prefix}Months`);
    }

    // Write each { elementId: number } to the page with a short fade-in
    function showResults(results) {
        Object.entries(results).forEach(([id, value]) => {
            const output = document.getElementById(id);
            output.textContent = formatCurrency(value);
            output.style.opacity = 0;
            setTimeout(() => {
                output.style.transition = 'opacity 0.5s';
                output.style.opacity = 1;
            }, 50);
        });
    }

    // ---------- Calculators ----------
    // Each returns { elementId: value } to show, or null when inputs are incomplete.

    const calculators = {
        emi() {
            const loan = readNumber('loanAmount');
            const yearlyRate = readNumber('interestRate');
            const months = readMonths('loanTenure');
            if (months <= 0) return null;

            let emi;
            if (yearlyRate === 0) {
                emi = loan / months;
            } else {
                const rate = yearlyRate / 12 / 100;
                emi = (loan * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
            }
            return { monthlyEMI: emi, totalPayment: emi * months, totalInterest: emi * months - loan };
        },

        sip() {
            const monthly = readNumber('sipAmount');
            const yearlyRate = readNumber('sipRate');
            const months = readMonths('sipTenure');
            if (months <= 0) return null;

            let total;
            if (yearlyRate === 0) {
                total = monthly * months;
            } else {
                const rate = yearlyRate / 12 / 100;
                total = monthly * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
            }
            const invested = monthly * months;
            return { sipTotal: total, sipInvested: invested, sipReturns: total - invested };
        },

        lumpsum() {
            const investment = readNumber('lumpsumAmount');
            const yearlyRate = readNumber('lumpsumRate');
            const years = readMonths('lumpsumTenure') / 12;
            if (investment <= 0) return null;

            // A = P (1 + r)^years, compounded yearly
            const total = investment * Math.pow(1 + yearlyRate / 100, years);
            return { lumpsumTotal: total, lumpsumInvested: investment, lumpsumReturns: total - investment };
        },

        goal() {
            const target = readNumber('goalTarget');
            const yearlyRate = readNumber('goalRate');
            const months = readMonths('goalTenure');
            if (months <= 0 || target <= 0) return null;

            let monthly;
            if (yearlyRate === 0) {
                monthly = target / months;
            } else {
                const rate = yearlyRate / 12 / 100;
                // SIP formula solved for the monthly amount
                monthly = target / ((Math.pow(1 + rate, months) - 1) * (1 + rate) / rate);
            }
            return { goalSIP: monthly };
        },

        affordability() {
            const emi = readNumber('affordEMI');
            const yearlyRate = readNumber('affordRate');
            const months = readMonths('affordTenure');
            if (months <= 0 || emi <= 0) return null;

            let principal;
            if (yearlyRate === 0) {
                principal = emi * months;
            } else {
                const rate = yearlyRate / 12 / 100;
                // EMI formula solved for the loan amount
                principal = emi * (Math.pow(1 + rate, months) - 1) / (rate * Math.pow(1 + rate, months));
            }
            const totalPayment = emi * months;
            return { affordLoan: principal, affordTotal: totalPayment, affordInterest: totalPayment - principal };
        }
    };

    function initCalculators() {
        $$('form[data-calculate]').forEach(form => {
            const calculate = calculators[form.dataset.calculate];
            form.addEventListener('submit', e => {
                e.preventDefault();
                const results = calculate();
                if (results) showResults(results);
            });
        });
    }

    // ---------- Opening and closing tools ----------

    function initToolNavigation() {
        const dashboard = $('#toolsDashboard');
        if (!dashboard) return;

        function showView(view) {
            $$('.tool-view').forEach(v => {
                v.style.display = v === view ? 'block' : 'none';
            });
            dashboard.style.display = view ? 'none' : 'grid';
        }

        $$('[data-open-tool]').forEach(button => {
            button.addEventListener('click', () => {
                showView(document.getElementById(button.dataset.openTool));
                window.scrollTo(0, 0);
            });
        });
        $$('[data-close-tool]').forEach(button => {
            button.addEventListener('click', () => showView(null));
        });
    }

    // ---------- Searchable currency picker ----------

    function initCurrencyPicker(container, onSelect) {
        const trigger = $('.searchable-select-trigger', container);
        const dropdown = $('.searchable-select-dropdown', container);
        const search = $('.search-input-wrapper input', container);
        const list = $('.select-options-list', container);

        function renderOptions(filter = '') {
            const query = filter.toLowerCase();
            const matches = CURRENCIES.filter(c =>
                c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query));

            list.replaceChildren(...matches.map(currency => {
                const option = document.createElement('li');
                option.className = 'select-option';
                option.classList.toggle('selected', trigger.value === currency.code);

                const code = document.createElement('span');
                code.className = 'currency-code';
                code.textContent = currency.code;
                const name = document.createElement('span');
                name.className = 'currency-name';
                name.textContent = currency.name;
                option.append(code, name);

                option.addEventListener('click', () => {
                    trigger.value = currency.code;
                    dropdown.classList.remove('active');
                    onSelect(currency.code);
                });
                return option;
            }));
        }

        trigger.addEventListener('click', e => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            if (dropdown.classList.contains('active')) {
                search.value = '';
                renderOptions();
                search.focus();
            }
        });
        search.addEventListener('input', () => renderOptions(search.value));
        search.addEventListener('click', e => e.stopPropagation());
        document.addEventListener('click', () => dropdown.classList.remove('active'));
    }

    // ---------- Budget planner ----------

    function initBudget() {
        const tool = $('#budgetTool');
        if (!tool) return;

        const baseInput = $('#budgetCurrencyName');
        const foreignInput = $('#foreignCurrencyName');
        const rateInput = $('#budgetExchangeRate');
        const lists = { income: $('#incomeList'), expenses: $('#expenseList') };
        const placeholders = { incomeList: 'Source', expenseList: 'Expense' };

        const baseCurrency = () => baseInput.value.trim();
        const foreignCurrency = () => foreignInput.value.trim();

        // Fill a currency <select> with the two chosen currencies
        function setCurrencyOptions(select, value) {
            const options = [baseCurrency(), foreignCurrency()].map(code => new Option(code, code));
            select.replaceChildren(...options);
            select.value = value === foreignCurrency() ? foreignCurrency() : baseCurrency();
        }

        // One income or expense row. The first default rows cannot be removed.
        function createRow(listId, { source = '', amount = '0', currency = '' } = {}, removable = true) {
            const placeholder = placeholders[listId];
            const row = document.createElement('div');
            row.className = 'budget-item';

            const sourceInput = Object.assign(document.createElement('input'), {
                type: 'text', className: 'source-input', value: source, placeholder
            });
            sourceInput.setAttribute('aria-label', placeholder);

            const amountInput = Object.assign(document.createElement('input'), {
                type: 'number', className: 'amount-input', value: amount, placeholder: 'Amount'
            });
            amountInput.setAttribute('aria-label', 'Amount');

            const currencySelect = Object.assign(document.createElement('select'), { className: 'currency-input' });
            currencySelect.setAttribute('aria-label', 'Currency');
            setCurrencyOptions(currencySelect, currency);

            const removeButton = Object.assign(document.createElement('button'), {
                type: 'button', className: 'remove-btn', textContent: '×'
            });
            if (removable) {
                removeButton.setAttribute('aria-label', 'Remove row');
                removeButton.addEventListener('click', () => {
                    row.remove();
                    calculate();
                });
            } else {
                removeButton.classList.add('invisible');
                removeButton.setAttribute('aria-hidden', 'true');
                removeButton.tabIndex = -1;
            }

            row.append(sourceInput, amountInput, currencySelect, removeButton);
            document.getElementById(listId).append(row);
        }

        function readRows(list) {
            return $$('.budget-item', list).map(row => ({
                source: $('.source-input', row).value,
                amount: $('.amount-input', row).value,
                currency: $('.currency-input', row).value
            }));
        }

        // Amount of a row in the main currency (rate = 1 main = X second)
        function toBase(row, rate) {
            const amount = parseFloat(row.amount) || 0;
            if (row.currency === foreignCurrency()) return rate !== 0 ? amount / rate : 0;
            return amount;
        }

        function save() {
            storage.set(BUDGET_STORAGE_KEY, JSON.stringify({
                baseCurrency: baseInput.value,
                foreignCurrency: foreignInput.value,
                exchangeRate: rateInput.value,
                income: readRows(lists.income),
                expenses: readRows(lists.expenses)
            }));
        }

        function calculate() {
            const rate = parseFloat(rateInput.value) || 0;
            const sum = rows => rows.reduce((total, row) => total + toBase(row, rate), 0);
            const income = sum(readRows(lists.income));
            const expenses = sum(readRows(lists.expenses));
            const savings = income - expenses;
            const withCode = value => `${formatCurrency(value)} ${baseCurrency()}`;

            $('#totalIncome').textContent = withCode(income);
            $('#totalExpenses').textContent = withCode(expenses);
            const savingsOutput = $('#totalSavings');
            savingsOutput.textContent = withCode(savings);
            savingsOutput.classList.toggle('is-negative', savings < 0);
            save();
        }

        function refreshCurrencyOptions() {
            $$('.currency-input', tool).forEach(select => setCurrencyOptions(select, select.value));
        }

        async function updateExchangeRate() {
            const base = baseCurrency().toLowerCase();
            const target = foreignCurrency().toLowerCase();
            refreshCurrencyOptions();

            if (base === target) {
                rateInput.value = (1).toFixed(6);
                calculate();
                return;
            }

            try {
                const response = await fetch(RATES_URL(base));
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const rates = await response.json();
                const rate = parseFloat(rates[target]?.rate);
                if (!isNaN(rate)) rateInput.value = rate.toFixed(6);
            } catch (error) {
                console.error('Exchange rate error:', error);
            }
            calculate();
        }

        function load() {
            let saved = null;
            try {
                saved = JSON.parse(storage.get(BUDGET_STORAGE_KEY));
            } catch (e) { /* ignore broken data */ }

            if (saved) {
                baseInput.value = saved.baseCurrency;
                foreignInput.value = saved.foreignCurrency;
                rateInput.value = saved.exchangeRate;
                saved.income.forEach(row => createRow('incomeList', row));
                saved.expenses.forEach(row => createRow('expenseList', row));
            } else {
                createRow('incomeList', { source: 'Salary' }, false);
                createRow('expenseList', { source: 'Rent' }, false);
            }
        }

        // Any edit inside the planner updates the totals
        tool.addEventListener('input', calculate);
        tool.addEventListener('change', calculate);

        $$('[data-add-row]', tool).forEach(button => {
            button.addEventListener('click', () => {
                createRow(button.dataset.addRow);
                calculate();
            });
        });

        initCurrencyPicker($('#baseCurrencySelect'), updateExchangeRate);
        initCurrencyPicker($('#secondaryCurrencySelect'), updateExchangeRate);

        load();
        calculate();
        updateExchangeRate();
    }

    // ---------- Start ----------

    initToolNavigation();
    initCalculators();
    initBudget();
})();
