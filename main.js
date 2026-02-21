
class LottoNumber extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
            .lotto-number {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 2px solid white;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 28px;
                font-weight: 600;
                margin: 0 10px;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            }
        `;

        const numberDiv = document.createElement('div');
        numberDiv.classList.add('lotto-number');
        numberDiv.textContent = this.getAttribute('number');

        shadow.appendChild(style);
        shadow.appendChild(numberDiv);
    }
}

customElements.define('lotto-number', LottoNumber);

const lottoNumbersDiv = document.getElementById('lotto-numbers');
const generateBtn = document.getElementById('generate-btn');

function generateNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }
    return Array.from(numbers).sort((a, b) => a - b);
}

function displayNumbers(numbers) {
    lottoNumbersDiv.innerHTML = '';
    for (const number of numbers) {
        const lottoNumberElement = document.createElement('lotto-number');
        lottoNumberElement.setAttribute('number', number);
        lottoNumbersDiv.appendChild(lottoNumberElement);
    }
}

generateBtn.addEventListener('click', () => {
    const numbers = generateNumbers();
    displayNumbers(numbers);
});
