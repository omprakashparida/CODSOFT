        // Get references to calculator elements
        const previousOperandTextElement = document.querySelector('.previous-operand');
        const currentOperandTextElement = document.querySelector('.current-operand');
        const buttons = document.querySelectorAll('.button');

        // Calculator state variables
        let currentOperand = '';
        let previousOperand = '';
        let operation = undefined;
        let waitingForSecondOperand = false; // Flag to indicate if we're waiting for a new number after an operation

        /**
         * Clears all calculator state and display.
         */
        function clear() {
            currentOperand = '';
            previousOperand = '';
            operation = undefined;
            waitingForSecondOperand = false;
            updateDisplay();
        }

        /**
         * Appends a number to the current operand.
         * If waitingForSecondOperand is true, it means a new calculation is starting,
         * so clear the currentOperand first.
         * @param {string} number - The digit to append.
         */
        function appendNumber(number) {
            if (waitingForSecondOperand) {
                currentOperand = number;
                waitingForSecondOperand = false;
            } else {
                currentOperand = currentOperand.toString() + number.toString();
            }
            updateDisplay();
        }

        /**
         * Appends a decimal point to the current operand, preventing multiple decimals.
         */
        function appendDecimal() {
            if (currentOperand.includes('.')) return; // Prevent multiple decimals
            if (waitingForSecondOperand) { // If starting a new number with a decimal
                currentOperand = '0.';
                waitingForSecondOperand = false;
            } else if (currentOperand === '') { // If display is empty and user types '.'
                currentOperand = '0.';
            } else {
                currentOperand += '.';
            }
            updateDisplay();
        }

        /**
         * Sets the chosen operation. If an operation already exists and
         * there's a current operand, compute the result first.
         * @param {string} selectedOperation - The operator symbol (+, -, ×, ÷).
         */
        function chooseOperation(selectedOperation) {
            if (currentOperand === '' && previousOperand === '') return; // No numbers to operate on

            if (currentOperand === '' && operation !== undefined) {
                // Allows changing operation if no current operand (e.g., 5 + * )
                operation = selectedOperation;
                updateDisplay();
                return;
            }

            if (previousOperand !== '') {
                compute(); // Compute previous operation if chaining operations
            }

            operation = selectedOperation;
            previousOperand = currentOperand;
            currentOperand = ''; // Clear current operand for new input
            waitingForSecondOperand = true; // Set flag to expect new number input
            updateDisplay();
        }

        /**
         * Performs the arithmetic computation based on the stored operation.
         * Handles division by zero.
         */
        function compute() {
            let computation;
            const prev = parseFloat(previousOperand);
            const current = parseFloat(currentOperand);

            if (isNaN(prev) || isNaN(current)) return; // Don't compute if operands are invalid

            switch (operation) {
                case '+':
                    computation = prev + current;
                    break;
                case '-':
                    computation = prev - current;
                    break;
                case '×':
                    computation = prev * current;
                    break;
                case '÷':
                    if (current === 0) {
                        // Replaced alert with console log and reset for better user experience in an embedded environment
                        console.error('Error: Division by zero!');
                        clear();
                        return;
                    }
                    computation = prev / current;
                    break;
                default:
                    return; // No valid operation
            }
            currentOperand = roundResult(computation); // Round to avoid floating point inaccuracies
            operation = undefined;
            previousOperand = '';
            waitingForSecondOperand = true; // Ready for next calculation
            updateDisplay();
        }

        /**
         * Rounds the result to a fixed number of decimal places if necessary,
         * to handle floating point precision issues in JavaScript.
         * @param {number} num - The number to round.
         * @returns {number} The rounded number.
         */
        function roundResult(num) {
            const decimalPlaces = 10; // Common precision
            return parseFloat(num.toFixed(decimalPlaces));
        }

        /**
         * Formats a number for display, adding commas for large numbers.
         * @param {string} number - The number string to format.
         * @returns {string} The formatted number string.
         */
        function getDisplayNumber(number) {
            const stringNumber = number.toString();
            const integerDigits = parseFloat(stringNumber.split('.')[0]);
            const decimalDigits = stringNumber.split('.')[1];
            let integerDisplay;
            if (isNaN(integerDigits)) {
                integerDisplay = '';
            } else {
                integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
            }
            if (decimalDigits != null) {
                return `${integerDisplay}.${decimalDigits}`;
            } else {
                return integerDisplay;
            }
        }

        /**
         * Updates the calculator's display with current and previous operands.
         */
        function updateDisplay() {
            currentOperandTextElement.innerText = getDisplayNumber(currentOperand);
            if (operation != null) {
                previousOperandTextElement.innerText = `${getDisplayNumber(previousOperand)} ${operation}`;
            } else {
                previousOperandTextElement.innerText = '';
            }
            // If currentOperand is empty and no previous operation, set current display to '0'
            if (currentOperand === '' && previousOperand === '' && operation === undefined) {
                 currentOperandTextElement.innerText = '0';
            }
        }

        // Initialize display on load
        updateDisplay();

        // Event listeners for all buttons
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const number = button.dataset.number;
                const action = button.dataset.action;
                const operator = button.dataset.operator;

                if (number != null) {
                    appendNumber(number);
                } else if (action === 'clear') {
                    clear();
                } else if (action === 'decimal') {
                    appendDecimal();
                } else if (action === 'equals') {
                    compute();
                } else if (operator != null) {
                    chooseOperation(operator);
                }
            });
        });