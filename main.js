
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

const animalStartBtn = document.getElementById('animal-start');
const webcamContainer = document.getElementById('webcam-container');
const labelContainer = document.getElementById('label-container');

const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/vEzP_z-VO/';

let animalModel;
let animalWebcam;
let animalMaxPredictions = 0;
let animalLoopActive = false;

async function initAnimalTest() {
    if (animalLoopActive) return;
    animalStartBtn.disabled = true;
    animalStartBtn.textContent = 'Loading...';

    const modelURL = `${MODEL_URL}model.json`;
    const metadataURL = `${MODEL_URL}metadata.json`;

    animalModel = await tmImage.load(modelURL, metadataURL);
    animalMaxPredictions = animalModel.getTotalClasses();

    const flip = true;
    animalWebcam = new tmImage.Webcam(260, 260, flip);
    await animalWebcam.setup();
    await animalWebcam.play();
    animalLoopActive = true;

    webcamContainer.innerHTML = '';
    webcamContainer.appendChild(animalWebcam.canvas);

    labelContainer.innerHTML = '';
    for (let i = 0; i < animalMaxPredictions; i += 1) {
        const row = document.createElement('div');
        row.className = 'label-row';
        labelContainer.appendChild(row);
    }

    animalStartBtn.textContent = 'Running';
    requestAnimationFrame(animalLoop);
}

async function animalLoop() {
    if (!animalLoopActive) return;
    animalWebcam.update();
    await predictAnimal();
    requestAnimationFrame(animalLoop);
}

async function predictAnimal() {
    const prediction = await animalModel.predict(animalWebcam.canvas);
    for (let i = 0; i < animalMaxPredictions; i += 1) {
        const item = prediction[i];
        const row = labelContainer.childNodes[i];
        row.textContent = `${item.className}: ${(item.probability * 100).toFixed(1)}%`;
    }
}

animalStartBtn.addEventListener('click', () => {
    initAnimalTest().catch((error) => {
        console.error(error);
        animalStartBtn.disabled = false;
        animalStartBtn.textContent = 'Start';
        labelContainer.innerHTML = 'Camera access failed. Please allow permissions and try again.';
    });
});
