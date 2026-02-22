
class LottoNumber extends HTMLElement {
    static get observedAttributes() {
        return ['number'];
    }

    connectedCallback() {
        if (!this.classList.contains('lotto-number')) {
            this.classList.add('lotto-number');
        }
        this._syncNumber();
    }

    attributeChangedCallback() {
        this._syncNumber();
    }

    _syncNumber() {
        this.textContent = this.getAttribute('number') || '';
    }
}

customElements.define('lotto-number', LottoNumber);

const lottoNumbersDiv = document.getElementById('lotto-numbers');
const generateBtn = document.getElementById('generate-btn');
const lottoHistoryList = document.getElementById('lotto-history-list');
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

function addHistory(numbers) {
    const item = document.createElement('li');
    item.textContent = numbers.join(', ');
    lottoHistoryList.prepend(item);
    const items = lottoHistoryList.querySelectorAll('li');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
}

generateBtn.addEventListener('click', () => {
    const numbers = generateNumbers();
    displayNumbers(numbers);
    addHistory(numbers);
});

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
});

initTheme();

const animalFileInput = document.getElementById('animal-file');
const animalPreview = document.getElementById('animal-preview');
const webcamContainer = document.getElementById('webcam-container');
const labelContainer = document.getElementById('label-container');

const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/vEzP_z-VO/';

let animalModel;
let animalMaxPredictions = 0;

async function initAnimalModel() {
    if (animalModel) return;
    const modelURL = `${MODEL_URL}model.json`;
    const metadataURL = `${MODEL_URL}metadata.json`;
    animalModel = await tmImage.load(modelURL, metadataURL);
    animalMaxPredictions = animalModel.getTotalClasses();
}

async function predictAnimal(imageElement) {
    const prediction = await animalModel.predict(imageElement);
    for (let i = 0; i < animalMaxPredictions; i += 1) {
        const item = prediction[i];
        const row = labelContainer.childNodes[i];
        row.textContent = `${item.className}: ${(item.probability * 100).toFixed(1)}%`;
    }
}

animalFileInput.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
        labelContainer.innerHTML = 'Loading model...';
        await initAnimalModel();

        const imageURL = URL.createObjectURL(file);
        animalPreview.src = imageURL;
        await animalPreview.decode();

        labelContainer.innerHTML = '';
        for (let i = 0; i < animalMaxPredictions; i += 1) {
            const row = document.createElement('div');
            row.className = 'label-row';
            labelContainer.appendChild(row);
        }

        await predictAnimal(animalPreview);
        URL.revokeObjectURL(imageURL);
    } catch (error) {
        console.error(error);
        labelContainer.innerHTML = 'Prediction failed. Please try another image.';
    }
});
