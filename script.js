document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeSwitch = document.getElementById('theme-switch');
    const fromSelected = document.getElementById('from-selected');
    const toSelected = document.getElementById('to-selected');
    const fromDropdown = document.getElementById('from-dropdown');
    const toDropdown = document.getElementById('to-dropdown');
    const fromCurrencyList = document.getElementById('from-currency-list');
    const toCurrencyList = document.getElementById('to-currency-list');
    const swapButton = document.getElementById('swap-button');
    const convertButton = document.getElementById('convert-button');
    const amountInput = document.getElementById('amount');
    const resultSection = document.getElementById('result');
    const fromAmountSpan = document.querySelector('.from-amount');
    const toAmountSpan = document.querySelector('.to-amount');
    const exchangeRateSpan = document.querySelector('.exchange-rate span');
    const updateTimeElement = document.getElementById('update-time');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const historyList = document.getElementById('history-list');
    const historyCount = document.getElementById('history-count');
    const searchInputs = document.querySelectorAll('.search-input');

    // State
    let fromCurrency = 'USD';
    let toCurrency = 'EUR';
    let exchangeRates = {};
    let lastFetchTime = null;
    let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];

    // Currency data with flags
    const currencies = [
        { code: 'USD', name: 'US Dollar', flag: 'us' },
        { code: 'EUR', name: 'Euro', flag: 'eu' },
        { code: 'GBP', name: 'British Pound', flag: 'gb' },
        { code: 'JPY', name: 'Japanese Yen', flag: 'jp' },
        { code: 'AUD', name: 'Australian Dollar', flag: 'au' },
        { code: 'CAD', name: 'Canadian Dollar', flag: 'ca' },
        { code: 'CHF', name: 'Swiss Franc', flag: 'ch' },
        { code: 'CNY', name: 'Chinese Yuan', flag: 'cn' },
        { code: 'INR', name: 'Indian Rupee', flag: 'in' },
        { code: 'BRL', name: 'Brazilian Real', flag: 'br' },
        { code: 'RUB', name: 'Russian Ruble', flag: 'ru' },
        { code: 'KRW', name: 'South Korean Won', flag: 'kr' },
        { code: 'SGD', name: 'Singapore Dollar', flag: 'sg' },
        { code: 'NZD', name: 'New Zealand Dollar', flag: 'nz' },
        { code: 'MXN', name: 'Mexican Peso', flag: 'mx' },
        { code: 'HKD', name: 'Hong Kong Dollar', flag: 'hk' },
        { code: 'TRY', name: 'Turkish Lira', flag: 'tr' },
        { code: 'ZAR', name: 'South African Rand', flag: 'za' },
        { code: 'SEK', name: 'Swedish Krona', flag: 'se' },
        { code: 'NOK', name: 'Norwegian Krone', flag: 'no' },
        { code: 'DKK', name: 'Danish Krone', flag: 'dk' },
        { code: 'PLN', name: 'Polish Zloty', flag: 'pl' },
        { code: 'CZK', name: 'Czech Koruna', flag: 'cz' },
        { code: 'HUF', name: 'Hungarian Forint', flag: 'hu' },
        { code: 'ILS', name: 'Israeli Shekel', flag: 'il' },
        { code: 'AED', name: 'UAE Dirham', flag: 'ae' },
        { code: 'SAR', name: 'Saudi Riyal', flag: 'sa' },
        { code: 'THB', name: 'Thai Baht', flag: 'th' },
        { code: 'MYR', name: 'Malaysian Ringgit', flag: 'my' },
        { code: 'PHP', name: 'Philippine Peso', flag: 'ph' }
    ];

    // Initialize theme from local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }

    // Theme toggle functionality
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    // Initialize currency dropdowns
    function populateCurrencyList(listElement, isFrom) {
        listElement.innerHTML = '';
        
        currencies.forEach(currency => {
            const item = document.createElement('div');
            item.className = 'currency-item';
            item.innerHTML = `
                <img src="https://flagcdn.com/w40/${currency.flag}.png" alt="${currency.code}" class="flag">
                <span class="currency-code">${currency.code}</span>
                <span class="currency-name">${currency.name}</span>
            `;
            
            item.addEventListener('click', function() {
                if (isFrom) {
                    fromCurrency = currency.code;
                    updateSelectedCurrency(fromSelected, currency);
                } else {
                    toCurrency = currency.code;
                    updateSelectedCurrency(toSelected, currency);
                }
                
                closeDropdowns();
                
                // Update conversion immediately if we have rates
                if (Object.keys(exchangeRates).length > 0) {
                    performConversion();
                }
            });
            
            listElement.appendChild(item);
        });
    }

    function updateSelectedCurrency(element, currency) {
        const flag = element.querySelector('.flag');
        const code = element.querySelector('.currency-code');
        const name = element.querySelector('.currency-name');
        
        flag.src = `https://flagcdn.com/w40/${currency.flag}.png`;
        flag.alt = currency.code;
        code.textContent = currency.code;
        name.textContent = currency.name;
    }

    // Initialize dropdowns
    populateCurrencyList(fromCurrencyList, true);
    populateCurrencyList(toCurrencyList, false);

    // Update selected currencies to initial values
    const fromCurrencyObj = currencies.find(c => c.code === fromCurrency);
    const toCurrencyObj = currencies.find(c => c.code === toCurrency);
    updateSelectedCurrency(fromSelected, fromCurrencyObj);
    updateSelectedCurrency(toSelected, toCurrencyObj);

    // Toggle dropdowns
    fromSelected.addEventListener('click', function(e) {
        e.stopPropagation();
        const fromSelector = document.getElementById('from-selector');
        const toSelector = document.getElementById('to-selector');
        
        fromDropdown.classList.toggle('active');
        fromSelector.classList.toggle('active');
        
        toDropdown.classList.remove('active');
        toSelector.classList.remove('active');
    });

    toSelected.addEventListener('click', function(e) {
        e.stopPropagation();
        const fromSelector = document.getElementById('from-selector');
        const toSelector = document.getElementById('to-selector');
        
        toDropdown.classList.toggle('active');
        toSelector.classList.toggle('active');
        
        fromDropdown.classList.remove('active');
        fromSelector.classList.remove('active');
    });

    document.addEventListener('click', closeDropdowns);

    function closeDropdowns() {
        fromDropdown.classList.remove('active');
        toDropdown.classList.remove('active');
        document.getElementById('from-selector').classList.remove('active');
        document.getElementById('to-selector').classList.remove('active');
    }

    // Search functionality
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            const isFromDropdown = this.closest('#from-dropdown') !== null;
            const currencyListItems = isFromDropdown ? 
                fromCurrencyList.querySelectorAll('.currency-item') : 
                toCurrencyList.querySelectorAll('.currency-item');
            
            currencyListItems.forEach(item => {
                const code = item.querySelector('.currency-code').textContent.toLowerCase();
                const name = item.querySelector('.currency-name').textContent.toLowerCase();
                
                if (code.includes(searchValue) || name.includes(searchValue)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Swap functionality
    swapButton.addEventListener('click', function() {
        const tempCurrency = fromCurrency;
        const tempCurrencyObj = currencies.find(c => c.code === fromCurrency);
        
        fromCurrency = toCurrency;
        updateSelectedCurrency(fromSelected, currencies.find(c => c.code === toCurrency));
        
        toCurrency = tempCurrency;
        updateSelectedCurrency(toSelected, tempCurrencyObj);
        
        // Animate swap button
        this.style.transform = 'rotate(180deg) scale(1.1)';
        setTimeout(() => {
            this.style.transform = '';
            
            // Update conversion if we have rates
            if (Object.keys(exchangeRates).length > 0) {
                performConversion();
            }
        }, 300);
    });

    // Fetch exchange rates
    async function fetchExchangeRates() {
        showLoader();
        
        try {
            const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
            const data = await response.json();
            
            if (data && data.rates) {
                exchangeRates = data.rates;
                lastFetchTime = new Date();
                hideLoader();
                performConversion();
            } else {
                throw new Error('Failed to fetch exchange rates');
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            hideLoader();
            showNotification('Failed to fetch exchange rates. Please try again later.', 'error');
        }
    }

    // Convert currencies
    function performConversion() {
        const amount = parseFloat(amountInput.value) || 1;
        
        if (exchangeRates[toCurrency]) {
            const rate = exchangeRates[toCurrency];
            const result = amount * rate;
            
            // Update display
            fromAmountSpan.textContent = `${formatNumber(amount)} ${fromCurrency}`;
            toAmountSpan.textContent = `${formatNumber(result)} ${toCurrency}`;
            exchangeRateSpan.textContent = `1 ${fromCurrency} = ${formatNumber(rate)} ${toCurrency}`;
            
            updateTimeElement.textContent = getTimeDifference(lastFetchTime);
            
            resultSection.classList.add('active');
            
            // Add to history
            addToHistory(amount, fromCurrency, result, toCurrency, rate);
        } else {
            resultSection.classList.remove('active');
        }
    }

    // Format numbers for display
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        } else if (num < 0.01 && num > 0) {
            return num.toExponential(2);
        } else {
            return num.toFixed(2);
        }
    }

    // Format time difference
    function getTimeDifference(date) {
        if (!date) return 'N/A';
        
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    // Loader functions
    function showLoader() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoader() {
        loadingOverlay.style.display = 'none';
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.3s ease;
            }
            .notification-error {
                background: #ef4444;
            }
            .notification-success {
                background: #10b981;
            }
            .notification-info {
                background: #6366f1;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        if (!document.querySelector('style[data-notifications]')) {
            style.setAttribute('data-notifications', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add to conversion history
    function addToHistory(fromAmount, fromCurrency, toAmount, toCurrency, rate) {
        const historyItem = {
            id: Date.now(),
            fromAmount: parseFloat(fromAmount.toFixed(2)),
            fromCurrency,
            toAmount: parseFloat(toAmount.toFixed(2)),
            toCurrency,
            rate: parseFloat(rate.toFixed(4)),
            date: new Date()
        };
        
        // Remove duplicate if exists
        conversionHistory = conversionHistory.filter(item => 
            !(item.fromCurrency === fromCurrency && 
              item.toCurrency === toCurrency && 
              item.fromAmount === historyItem.fromAmount)
        );
        
        conversionHistory.unshift(historyItem);
        
        // Limit history to 15 items
        if (conversionHistory.length > 15) {
            conversionHistory = conversionHistory.slice(0, 15);
        }
        
        // Save to localStorage
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
        
        // Update UI
        renderHistory();
    }

    // Render conversion history
    function renderHistory() {
        historyCount.textContent = conversionHistory.length;
        
        if (conversionHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-history"></i>
                    <p>No conversions yet</p>
                    <span>Your conversion history will appear here</span>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = '';
        
        conversionHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-details">
                    <div class="history-conversion">
                        ${formatNumber(item.fromAmount)} ${item.fromCurrency} → ${formatNumber(item.toAmount)} ${item.toCurrency}
                    </div>
                    <div class="history-date">${formatDate(item.date)}</div>
                </div>
                <button class="history-delete" data-id="${item.id}" title="Delete conversion">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Add delete listeners
        document.querySelectorAll('.history-delete').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.getAttribute('data-id'));
                deleteHistoryItem(id);
            });
        });
    }

    // Format date for history
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Delete history item
    function deleteHistoryItem(id) {
        conversionHistory = conversionHistory.filter(item => item.id !== id);
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
        renderHistory();
        showNotification('Conversion deleted', 'success');
    }

    // Convert button click event
    convertButton.addEventListener('click', function() {
        // Check if rates are stale (more than 1 hour old)
        const now = new Date();
        const needsRefresh = !lastFetchTime || (now - lastFetchTime) / 1000 / 60 > 60;
        
        if (needsRefresh || Object.keys(exchangeRates).length === 0) {
            fetchExchangeRates();
        } else {
            performConversion();
        }
        
        // Add button animation
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });

    // Enter key support for amount input
    amountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertButton.click();
        }
    });

    // Auto-convert on amount change (with debounce)
    let convertTimeout;
    amountInput.addEventListener('input', function() {
        clearTimeout(convertTimeout);
        convertTimeout = setTimeout(() => {
            if (Object.keys(exchangeRates).length > 0) {
                performConversion();
            }
        }, 500);
    });

    // Initialize the app
    function init() {
        renderHistory();
        
        // Fetch initial exchange rates
        fetchExchangeRates();
        
        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter to convert
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                convertButton.click();
            }
            
            // Ctrl/Cmd + S to swap
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                swapButton.click();
            }
        });
        
        console.log('CurrencyX initialized successfully!');
    }

    // Initialize the app
    init();
});