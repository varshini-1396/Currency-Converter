# Currency Converter

This is a responsive web-based currency converter application that allows users to convert amounts between different currencies. The app fetches real-time exchange rates using an API and displays the results in an intuitive interface.

## Features

- **Real-time exchange rates**: Fetches up-to-date exchange rates from the exchangerate-api.
- **Currency flags**: Displays flags corresponding to the selected currencies.
- **Light/Dark mode toggle**: Allows users to switch between light and dark themes.
- **Keyboard support**: Press Enter to trigger the conversion.

## Technologies Used

- **HTML**: For structuring the webpage.
- **CSS**: For styling and responsive design.
- **JavaScript**: For dynamic functionality and API interactions.

## Setup Instructions

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge).

### Installation

1. Clone the repository or download the project files:
   ```bash
   git clone https://github.com/yourusername/currency-converter.git
   ```

2. Navigate to the project directory:
   ```bash
   cd currency-converter
   ```

3. Open the `index.html` file in your browser.

## How to Use

1. Open the application in a browser.
2. Enter the amount to convert in the **Amount** field.
3. Select the currencies to convert **from** and **to** using the dropdowns.
4. Click the **Convert** button to see the converted amount and the exchange rate.
5. Use the **Switch to Light/Dark Mode** button to toggle themes.

## File Structure

```
.
├── index.html         # Main HTML file for the app structure.
├── style.css          # CSS file for styling the app.
├── script.js          # JavaScript file for app logic and API integration.
```

## API Used

- [ExchangeRate-API](https://www.exchangerate-api.com/) for fetching real-time exchange rates.

## Note

Replace the placeholder API key (`afd235ee389654b798f7efe7`) in `script.js` with your own API key for the ExchangeRate-API.

## Customization

- To change the default currencies:
  - Update the `fromCurrency.value` and `toCurrency.value` in `script.js`.
- To add additional styles, edit the `style.css` file.

## Future Enhancements

- Add support for cryptocurrency conversions.
- Provide historical exchange rate trends.
- Allow users to save frequently used currency pairs.

## License

This project is open source and available under the [MIT License](LICENSE).

---

Feel free to contribute to this project or provide suggestions to improve it!
