document.addEventListener('DOMContentLoaded', function() {
    // Create background animation elements
    function createBackgroundAnimations() {
        const bgAnimation = document.createElement('div');
        bgAnimation.className = 'bg-animation';
        document.body.appendChild(bgAnimation);
        
        // Add currency symbols
        const currencySymbols = ['$', '€', '£', '¥', '₹', '₽', '₣', '₴', '₦', '₩', '฿', '₱'];
        
        // Create 20 currency symbols
        for (let i = 0; i < 20; i++) {
            const symbol = document.createElement('div');
            symbol.className = 'currency-symbol';
            symbol.textContent = currencySymbols[Math.floor(Math.random() * currencySymbols.length)];
            
            // Random position
            const posX = Math.random() * 100;
            symbol.style.left = `${posX}%`;
            
            // Random size
            const size = Math.random() * 30 + 20;
            symbol.style.fontSize = `${size}px`;
            
            // Random animation duration
            const duration = Math.random() * 15 + 10;
            symbol.style.setProperty('--float-duration', `${duration}s`);
            
            // Random rotation
            const rotation = Math.random() * 360;
            symbol.style.setProperty('--rotation', `${rotation}deg`);
            
            // Random opacity
            const opacity = Math.random() * 0.06 + 0.02;
            symbol.style.setProperty('--symbol-opacity', opacity);
            
            // Random delay
            symbol.style.animationDelay = `${Math.random() * duration}s`;
            
            bgAnimation.appendChild(symbol);
        }
        
        // Add ripple effects
        for (let i = 0; i < 3; i++) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            
            // Random position
            const posX = Math.random() * 80 + 10;
            const posY = Math.random() * 80 + 10;
            ripple.style.left = `${posX}%`;
            ripple.style.top = `${posY}%`;
            
            // Random animation duration and delay
            const duration = Math.random() * 8 + 8;
            ripple.style.setProperty('--ripple-duration', `${duration}s`);
            ripple.style.animationDelay = `${Math.random() * duration}s`;
            
            bgAnimation.appendChild(ripple);
        }
    }
    
    // Call to create background animations
    createBackgroundAnimations();

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
    const resultContainer = document.getElementById('result');
    const amountText = document.querySelector('.amount-text');
    const convertedAmount = document.querySelector('.converted-amount');
    const updateTimeElement = document.getElementById('update-time');
    const loader = document.querySelector('.loader');
    const historyList = document.getElementById('history-list');
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
        { code: 'NOK', name: 'Norwegian Krone', flag: 'no' }
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
    function populateCurrencyList(listElement, selectedCurrency, isFrom) {
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
        element.querySelector('.flag').src = `https://flagcdn.com/w40/${currency.flag}.png`;
        element.querySelector('.flag').alt = currency.code;
        element.querySelector('.currency-code').textContent = currency.code;
        element.querySelector('.currency-name').textContent = currency.name;
    }

    // Initialize dropdowns
    populateCurrencyList(fromCurrencyList, fromCurrency, true);
    populateCurrencyList(toCurrencyList, toCurrency, false);

    // Update selected currencies to initial values
    const fromCurrencyObj = currencies.find(c => c.code === fromCurrency);
    const toCurrencyObj = currencies.find(c => c.code === toCurrency);
    updateSelectedCurrency(fromSelected, fromCurrencyObj);
    updateSelectedCurrency(toSelected, toCurrencyObj);

    // Toggle dropdowns
    fromSelected.addEventListener('click', function(e) {
        e.stopPropagation();
        fromDropdown.classList.toggle('active');
        toDropdown.classList.remove('active');
        fromSelected.querySelector('i').style.transform = fromDropdown.classList.contains('active') ? 'rotate(180deg)' : '';
    });

    toSelected.addEventListener('click', function(e) {
        e.stopPropagation();
        toDropdown.classList.toggle('active');
        fromDropdown.classList.remove('active');
        toSelected.querySelector('i').style.transform = toDropdown.classList.contains('active') ? 'rotate(180deg)' : '';
    });

    document.addEventListener('click', closeDropdowns);

    function closeDropdowns() {
        fromDropdown.classList.remove('active');
        toDropdown.classList.remove('active');
        fromSelected.querySelector('i').style.transform = '';
        toSelected.querySelector('i').style.transform = '';
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
        this.classList.add('rotate');
        setTimeout(() => {
            this.classList.remove('rotate');
            
            // Update conversion if we have rates
            if (Object.keys(exchangeRates).length > 0) {
                performConversion();
            }
        }, 300);
    });

    // Add rotate animation for swap
    const style = document.createElement('style');
    style.textContent = `
        .rotate {
            animation: rotateAnimation 0.3s ease;
        }
        
        @keyframes rotateAnimation {
            0% { transform: scale(1) rotate(0); }
            50% { transform: scale(1.2) rotate(180deg); }
            100% { transform: scale(1) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Fetch exchange rates
    async function fetchExchangeRates() {
        showLoader();
        
        try {
            // For educational purposes only - in a real application, you should use your own API key
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
            alert('Failed to fetch exchange rates. Please try again later.');
        }
    }

    // Convert currencies
    function performConversion() {
        const amount = parseFloat(amountInput.value) || 1;
        
        if (exchangeRates[toCurrency]) {
            const rate = exchangeRates[toCurrency];
            const result = amount * rate;
            
            amountText.textContent = `${amount} ${fromCurrency} = `;
            convertedAmount.textContent = `${result.toFixed(2)} ${toCurrency}`;
            
            updateTimeElement.textContent = getTimeDifference(lastFetchTime);
            
            resultContainer.classList.add('active');
            
            // Add to history
            addToHistory(amount, fromCurrency, result.toFixed(2), toCurrency);
        } else {
            resultContainer.classList.remove('active');
        }
    }

    // Format time difference
    function getTimeDifference(date) {
        if (!date) return 'N/A';
        
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // difference in seconds
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }

    // Loader functions
    function showLoader() {
        loader.style.display = 'flex';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    // Add to conversion history
    function addToHistory(fromAmount, fromCurrency, toAmount, toCurrency) {
        const historyItem = {
            id: Date.now(),
            fromAmount,
            fromCurrency,
            toAmount,
            toCurrency,
            date: new Date()
        };
        
        conversionHistory.unshift(historyItem);
        
        // Limit history to 10 items
        if (conversionHistory.length > 10) {
            conversionHistory.pop();
        }
        
        // Save to localStorage
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
        
        // Update UI
        renderHistory();
    }

    // Render conversion history
    function renderHistory() {
        historyList.innerHTML = '';
        
        if (conversionHistory.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = 'No conversion history yet';
            emptyMessage.style.color = 'var(--text-light)';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '15px';
            historyList.appendChild(emptyMessage);
            return;
        }
        
        conversionHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-details">
                    <div class="history-conversion">${item.fromAmount} ${item.fromCurrency} → ${item.toAmount} ${item.toCurrency}</div>
                    <div class="history-date">${formatDate(item.date)}</div>
                </div>
                <button class="history-delete" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Add delete listeners
        document.querySelectorAll('.history-delete').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteHistoryItem(id);
            });
        });
    }

    // Format date for history
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
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
        this.classList.add('pulse');
        setTimeout(() => this.classList.remove('pulse'), 500);
    });

    // Add pulse animation for convert button
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        .pulse {
            animation: pulseAnimation 0.5s ease;
        }
        
        @keyframes pulseAnimation {
            0% { transform: scale(1); }
            50% { transform: scale(0.97); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(pulseStyle);

    // Initial data load
    function init() {
        // Load conversion history
        renderHistory();
        
        // Fetch initial exchange rates
        fetchExchangeRates();
        
        // Add input animations
        amountInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        amountInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        const inputStyle = document.createElement('style');
        inputStyle.textContent = `
            .focused {
                animation: focusAnimation 0.3s forwards;
            }
            
            @keyframes focusAnimation {
                0% { transform: translateY(0); }
                50% { transform: translateY(-2px); }
                100% { transform: translateY(0); }
            }
        `;
        document.head.appendChild(inputStyle);
    }

    // Initialize the app
    init();
});