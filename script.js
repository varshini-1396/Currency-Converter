document.addEventListener("DOMContentLoaded", async function () {
    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");
    const fromFlag = document.getElementById("fromFlag");
    const toFlag = document.getElementById("toFlag");
    const convertBtn = document.getElementById("convertBtn");
    const resultDiv = document.getElementById("result");
    const amountInput = document.getElementById("amount");
    const themeToggle = document.getElementById("themeToggle");
    const exchangeRateDiv = document.getElementById("exchangeRate");

    const apiKey = "afd235ee389654b798f7efe7"; // Replace with your API key
    const baseUrl = `https://v6.exchangerate-api.com/v6/${apiKey}`;

    async function populateCurrencies() {
        try {
            const response = await fetch(`${baseUrl}/latest/USD`);
            const data = await response.json();

            if (data.result === "success") {
                const currencies = Object.keys(data.conversion_rates);

                currencies.forEach(currency => {
                    const countryCode = currency.slice(0, 2).toLowerCase();

                    const optionFrom = document.createElement("option");
                    const optionTo = document.createElement("option");

                    optionFrom.value = currency;
                    optionTo.value = currency;

                    optionFrom.textContent = currency;
                    optionTo.textContent = currency;

                    optionFrom.setAttribute("data-flag", `https://flagcdn.com/w40/${countryCode}.png`);
                    optionTo.setAttribute("data-flag", `https://flagcdn.com/w40/${countryCode}.png`);

                    fromCurrency.appendChild(optionFrom);
                    toCurrency.appendChild(optionTo);
                });

                fromCurrency.value = "USD";
                toCurrency.value = "INR";

                updateFlag(fromCurrency, fromFlag);
                updateFlag(toCurrency, toFlag);
            } else {
                console.error("Failed to fetch currencies.");
            }
        } catch (error) {
            console.error("Error fetching currencies:", error);
        }
    }

    function updateFlag(selectElement, flagElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const flagUrl = selectedOption.getAttribute("data-flag");
        flagElement.src = flagUrl || "";
    }

    async function convertCurrency() {
        const amount = amountInput.value;
        const from = fromCurrency.value;
        const to = toCurrency.value;

        if (!amount || amount <= 0) {
            resultDiv.textContent = "Please enter a valid amount.";
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/latest/${from}`);
            const data = await response.json();

            if (data.result === "success") {
                const rate = data.conversion_rates[to];
                const convertedAmount = (amount * rate).toFixed(2);
                resultDiv.textContent = `${amount} ${from} = ${convertedAmount} ${to}`;
                exchangeRateDiv.textContent = `1 ${from} = ${rate} ${to}`;
            } else {
                resultDiv.textContent = "Error fetching exchange rates.";
            }
        } catch (error) {
            resultDiv.textContent = "Failed to fetch data. Please try again later.";
        }
    }

    fromCurrency.addEventListener("change", () => updateFlag(fromCurrency, fromFlag));
    toCurrency.addEventListener("change", () => updateFlag(toCurrency, toFlag));
    convertBtn.addEventListener("click", convertCurrency);

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light");
        
        const title = document.querySelector('.title');
        title.classList.toggle('light', document.body.classList.contains('light'));
    
        themeToggle.textContent = document.body.classList.contains("light")
            ? "Switch to Dark Mode"
            : "Switch to Light Mode";
    });

    amountInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            convertCurrency();
        }
    });

    populateCurrencies();
});
