
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
                background: var(--ball-bg);
                color: var(--ball-text);
                border: 2px solid var(--ball-border);
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 28px;
                font-weight: 600;
                margin: 0 8px;
                box-shadow: 0 0 10px rgba(15, 23, 42, 0.25);
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
const themeToggle = document.getElementById('theme-toggle');

const THEME_KEY = 'lotto-theme';

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
}

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

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
});

initTheme();
