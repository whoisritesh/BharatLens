const video = document.getElementById('cameraPreview');
const canvas = document.getElementById('photoCanvas');
const imagePreview = document.getElementById('imagePreview');
const placeholder = document.getElementById('placeholder');
const startCamBtn = document.getElementById('startCamBtn');
const captureBtn = document.getElementById('captureBtn');
const fileInput = document.getElementById('fileInput');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('resultsSection');
const statesGrid = document.getElementById('statesGrid');
const identifiedName = document.getElementById('identifiedName');
const identifiedDesc = document.getElementById('identifiedDesc');
const triviaText = document.getElementById('triviaText');
const ayurvedaText = document.getElementById('ayurvedaText');
const giPill = document.getElementById('giPill');
const seasonPill = document.getElementById('seasonPill');
const apiKeyInput = document.getElementById('apiKey');
const clearKeyBtn = document.getElementById('clearKeyBtn');
const searchInput = document.getElementById('searchInput');
const copyAllBtn = document.getElementById('copyAllBtn');
const downloadCardBtn = document.getElementById('downloadCardBtn');
const historyGrid = document.getElementById('historyGrid');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const zoneButtons = document.querySelectorAll('.zone-btn');
const mapStates = document.querySelectorAll('.map-state');
const mapTooltip = document.getElementById('mapTooltip');
const quizSection = document.getElementById('quizSection');
const quizToggleBtn = document.getElementById('quizToggleBtn');
const closeQuizBtn = document.getElementById('closeQuizBtn');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizFeedback = document.getElementById('quizFeedback');

// Download Modal Elements
const openDownloadModalBtn = document.getElementById('openDownloadModalBtn');
const closeDownloadModalBtn = document.getElementById('closeDownloadModalBtn');
const downloadModal = document.getElementById('downloadModal');
const mainDownloadBtn = document.getElementById('mainDownloadBtn');
const deviceTitle = document.getElementById('deviceTitle');
const deviceSteps = document.getElementById('deviceSteps');

let stream = null;
let currentTranslations = [];
let currentItemData = null;
let activeZone = 'ALL';
let currentBase64Image = '';
let deferredPrompt = null;

// --- 1. Service Worker & PWA Download Hub Logic ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// Modal Toggles
openDownloadModalBtn.addEventListener('click', () => {
  setupDeviceInstructions();
  generateQrCode();
  downloadModal.classList.remove('hidden');
});

closeDownloadModalBtn.addEventListener('click', () => {
  downloadModal.classList.add('hidden');
});

function setupDeviceInstructions() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isAndroid = /android/i.test(userAgent);

  if (isIOS) {
    deviceTitle.textContent = "📱 iOS (Safari) Steps:";
    deviceSteps.innerHTML = `
      <li>Tap the <strong>Share</strong> button (square with arrow) at the bottom.</li>
      <li>Scroll down and tap <strong>'Add to Home Screen'</strong>.</li>
      <li>Tap <strong>'Add'</strong> in top right corner.</li>
    `;
    mainDownloadBtn.innerHTML = `<span>🍏</span> Add to Home Screen`;
  } else if (isAndroid) {
    deviceTitle.textContent = "🤖 Android (Chrome) Steps:";
    deviceSteps.innerHTML = `
      <li>Tap the <strong>'Install BharatLens App'</strong> button above.</li>
      <li>Or tap Chrome's <strong>3-dots (⋮)</strong> menu & select <strong>'Install App'</strong>.</li>
    `;
  } else {
    deviceTitle.textContent = "💻 Desktop / Laptop Steps:";
    deviceSteps.innerHTML = `
      <li>Click the <strong>Install icon</strong> in your browser's URL address bar.</li>
      <li>Or scan the QR code below using your mobile phone.</li>
    `;
  }
}

mainDownloadBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      mainDownloadBtn.textContent = '✅ App Installed Successfully!';
      mainDownloadBtn.style.background = '#16a34a';
    }
    deferredPrompt = null;
  } else {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      alert("On iOS: Tap Safari's Share button, then tap 'Add to Home Screen'.");
    } else {
      alert("App can be installed using the Install icon located directly in your browser's address bar.");
    }
  }
});

let qrGenerated = false;
function generateQrCode() {
  const qrContainer = document.getElementById('qrcode');
  if (qrGenerated || !qrContainer) return;
  qrContainer.innerHTML = '';
  new QRCode(qrContainer, {
    text: window.location.href,
    width: 110,
    height: 110,
    colorDark : "#0f172a",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
  qrGenerated = true;
}

// --- 2. Indian Female Voice Speech Engine ---
let availableVoices = [];
function refreshVoices() {
  if ('speechSynthesis' in window) availableVoices = window.speechSynthesis.getVoices();
}
if ('speechSynthesis' in window) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

function getIndianFemaleVoice() {
  refreshVoices();
  const femaleKeywords = ['female', 'swara', 'heera', 'neerja', 'priya', 'aditi', 'kalpana', 'geeta', 'zira', 'lekha', 'google'];
  const indicTags = ['hi-in', 'ta-in', 'te-in', 'mr-in', 'bn-in', 'gu-in', 'kn-in', 'ml-in', 'pa-in', 'en-in'];

  let voice = availableVoices.find(v => {
    const langMatch = indicTags.some(tag => v.lang.toLowerCase().includes(tag));
    const nameMatch = femaleKeywords.some(kw => v.name.toLowerCase().includes(kw));
    return langMatch && nameMatch;
  });

  if (!voice) {
    voice = availableVoices.find(v => v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('hi-in'));
  }
  return voice;
}

function playVoice(phoneticText, scriptText, languageName) {
  if (!('speechSynthesis' in window)) {
    alert('Audio synthesis is not supported on this device.');
    return;
  }
  window.speechSynthesis.cancel();

  const selectedVoice = getIndianFemaleVoice();
  const utteranceText = (selectedVoice && selectedVoice.lang.startsWith('en')) ? phoneticText : (scriptText || phoneticText);
  const utterance = new SpeechSynthesisUtterance(utteranceText);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  } else {
    utterance.lang = 'en-IN';
  }

  utterance.pitch = 1.18;
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
}

// --- 3. Initial Setup ---
window.addEventListener('DOMContentLoaded', () => {
  const savedKey = localStorage.getItem('bharatlens_gemini_api_key');
  if (savedKey) apiKeyInput.value = savedKey;
  renderHistory();
});

apiKeyInput.addEventListener('input', (e) => {
  localStorage.setItem('bharatlens_gemini_api_key', e.target.value.trim());
});

clearKeyBtn.addEventListener('click', () => {
  localStorage.removeItem('bharatlens_gemini_api_key');
  apiKeyInput.value = '';
  alert('Saved API key cleared.');
});

// --- 4. Camera & Upload Handlers ---
startCamBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    video.srcObject = stream;
    video.style.display = 'block';
    imagePreview.style.display = 'none';
    placeholder.style.display = 'none';
    captureBtn.style.display = 'inline-block';
    startCamBtn.style.display = 'none';
  } catch (err) {
    alert('Camera access denied. Please upload an image instead.');
  }
});

captureBtn.addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  const fullDataUrl = canvas.toDataURL('image/jpeg', 0.85);
  currentBase64Image = fullDataUrl.split(',')[1];

  imagePreview.src = fullDataUrl;
  imagePreview.style.display = 'block';
  video.style.display = 'none';
  captureBtn.style.display = 'none';
  startCamBtn.style.display = 'inline-block';

  if (stream) stream.getTracks().forEach(t => t.stop());
  processWithAI(currentBase64Image, fullDataUrl);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const fullDataUrl = reader.result;
    currentBase64Image = fullDataUrl.split(',')[1];

    imagePreview.src = fullDataUrl;
    imagePreview.style.display = 'block';
    video.style.display = 'none';
    placeholder.style.display = 'none';
    captureBtn.style.display = 'none';
    startCamBtn.style.display = 'inline-block';

    if (stream) stream.getTracks().forEach(t => t.stop());
    processWithAI(currentBase64Image, fullDataUrl);
  };
  reader.readAsDataURL(file);
});

// --- 5. Gemini API Multimodal Prompt ---
async function processWithAI(base64Image, fullImagePreviewUrl) {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    alert('Please enter your Gemini API Key first.');
    return;
  }

  loading.classList.remove('hidden');
  resultsSection.classList.add('hidden');
  statesGrid.innerHTML = '';
  searchInput.value = '';

  const promptText = `
Analyze this image. Identify the primary item, food, spice, dish, vegetable, or object shown.
Return a STRICT JSON object in this schema without any markdown backticks or commentary:
{
  "item_name_en": "Standard English Name",
  "short_description": "A concise one-sentence description.",
  "gi_tag_status": "Geographical Indication status or major geographical production origin",
  "peak_season": "Harvest / peak availability season (or 'Year-round')",
  "cultural_trivia": "2-sentence fascinating cultural significance in India.",
  "ayurvedic_profile": "Prakriti/Dosha balance (e.g., Vata/Pitta/Kapha), cooling or heating nature (Taseer), and wellness utility.",
  "translations": [
    {
      "state": "State Name",
      "zone": "North | South | East | West | Central",
      "language": "Primary Language",
      "native_script": "Name in Native Script",
      "phonetic_en": "Phonetic pronunciation in English",
      "mandi_phrase": "How to ask 'How much for 1kg of this?' in local dialect",
      "popular_dish_or_use": "Famous regional dish or household application"
    }
  ]
}

Provide translations for 12 distinct Indian states spanning North, South, East, West, and Central India.
`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'API request failed');
    }

    const data = await response.json();
    let textPayload = data.candidates[0].content.parts[0].text;
    textPayload = textPayload.replace(/```json|```/g, '').trim();
    const result = JSON.parse(textPayload);

    currentItemData = result;
    currentTranslations = result.translations || [];

    displayResults(result);
    saveToHistory(result, fullImagePreviewUrl);
  } catch (error) {
    alert('Analysis Error: ' + error.message);
  } finally {
    loading.classList.add('hidden');
  }
}

// --- 6. Results Rendering & SVG Map Interaction ---
function displayResults(data) {
  identifiedName.textContent = data.item_name_en;
  identifiedDesc.textContent = data.short_description;
  triviaText.textContent = data.cultural_trivia || 'Integral to Indian lifestyle.';
  ayurvedaText.textContent = data.ayurvedic_profile || 'Balancing and widely used in traditional households.';
  giPill.textContent = `🏷️ Origin/GI: ${data.gi_tag_status || 'Pan-India'}`;
  seasonPill.textContent = `🗓️ Season: ${data.peak_season || 'Year-round'}`;

  applyFilters();
  resultsSection.classList.remove('hidden');
}

function renderCards(translations) {
  statesGrid.innerHTML = '';
  if (translations.length === 0) {
    statesGrid.innerHTML = '<p style="color:#64748b; grid-column: 1/-1;">No matching regional cards found.</p>';
    return;
  }

  translations.forEach(item => {
    const card = document.createElement('div');
    card.className = 'state-card';
    card.id = `card-${item.state.replace(/\s+/g, '')}`;
    card.innerHTML = `
      <div>
        <div class="card-header">
          <span class="state-title">${item.state}</span>
          <button class="audio-btn" title="Listen Audio">🔊</button>
        </div>
        <div class="regional-name">${item.phonetic_en}</div>
        <div class="native-script">${item.native_script}</div>
        ${item.mandi_phrase ? `<div class="mandi-box">🛒 <strong>Mandi:</strong> "${item.mandi_phrase}"</div>` : ''}
        ${item.popular_dish_or_use ? `<div class="specialty-dish">🍛 <strong>Use/Dish:</strong> ${item.popular_dish_or_use}</div>` : ''}
      </div>
      <div class="card-footer">
        <span class="language-pill">${item.language}</span>
        <span class="zone-tag">${item.zone || ''}</span>
      </div>
    `;

    const audioBtn = card.querySelector('.audio-btn');
    audioBtn.addEventListener('click', () => {
      playVoice(item.phonetic_en, item.native_script, item.language);
    });

    card.addEventListener('mouseenter', () => highlightSvgState(item.state));
    card.addEventListener('mouseleave', () => resetSvgStateColors());

    statesGrid.appendChild(card);
  });
}

mapStates.forEach(path => {
  path.addEventListener('mouseenter', () => {
    const stateName = path.getAttribute('data-state');
    mapTooltip.textContent = stateName;
    mapTooltip.classList.remove('hidden');
  });

  path.addEventListener('mouseleave', () => {
    mapTooltip.classList.add('hidden');
  });

  path.addEventListener('click', () => {
    const stateName = path.getAttribute('data-state');
    searchInput.value = stateName;
    applyFilters();

    setTimeout(() => {
      const targetCard = document.querySelector('.state-card');
      if (targetCard) {
        targetCard.classList.add('highlight-card');
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => targetCard.classList.remove('highlight-card'), 2000);
      }
    }, 100);
  });
});

function highlightSvgState(stateName) {
  mapStates.forEach(p => {
    if (stateName.toLowerCase().includes(p.getAttribute('data-state').toLowerCase())) {
      p.classList.add('active-map-state');
    }
  });
}

function resetSvgStateColors() {
  mapStates.forEach(p => p.classList.remove('active-map-state'));
}

function setZone(zone) {
  activeZone = zone;
  zoneButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-zone') === zone);
  });
  mapStates.forEach(p => {
    const pZone = p.getAttribute('data-zone');
    if (zone === 'ALL' || pZone === zone) {
      p.style.opacity = '1';
    } else {
      p.style.opacity = '0.35';
    }
  });
  applyFilters();
}

zoneButtons.forEach(btn => {
  btn.addEventListener('click', () => setZone(btn.getAttribute('data-zone')));
});

function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = currentTranslations.filter(item => {
    const matchesZone = activeZone === 'ALL' || (item.zone && item.zone.toLowerCase() === activeZone.toLowerCase());
    const matchesQuery = !query || 
      item.state.toLowerCase().includes(query) ||
      item.language.toLowerCase().includes(query) ||
      item.phonetic_en.toLowerCase().includes(query) ||
      (item.mandi_phrase && item.mandi_phrase.toLowerCase().includes(query)) ||
      (item.popular_dish_or_use && item.popular_dish_or_use.toLowerCase().includes(query)) ||
      item.native_script.includes(query);

    return matchesZone && matchesQuery;
  });
  renderCards(filtered);
}

searchInput.addEventListener('input', applyFilters);

// --- 7. Interactive Quiz Game ---
quizToggleBtn.addEventListener('click', () => {
  if (!currentTranslations || currentTranslations.length < 3) {
    alert('Scan an item first to start the Quiz challenge!');
    return;
  }
  startQuiz();
  quizSection.classList.remove('hidden');
});

closeQuizBtn.addEventListener('click', () => {
  quizSection.classList.add('hidden');
});

function startQuiz() {
  quizFeedback.textContent = '';
  quizOptions.innerHTML = '';

  const correctItem = currentTranslations[Math.floor(Math.random() * currentTranslations.length)];
  quizQuestion.textContent = `In which state is "${identifiedName.textContent}" called "${correctItem.phonetic_en}" (${correctItem.native_script}) in ${correctItem.language}?`;

  const wrongOptions = currentTranslations
    .filter(i => i.state !== correctItem.state)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map(i => i.state);

  const allChoices = [correctItem.state, ...wrongOptions].sort(() => 0.5 - Math.random());

  allChoices.forEach(stateChoice => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.textContent = stateChoice;
    btn.onclick = () => {
      if (stateChoice === correctItem.state) {
        quizFeedback.textContent = `🎉 Correct! In ${correctItem.state}, it's spoken as "${correctItem.phonetic_en}".`;
        quizFeedback.style.color = '#16a34a';
      } else {
        quizFeedback.textContent = `❌ Not quite! The correct state is ${correctItem.state}.`;
        quizFeedback.style.color = '#dc2626';
      }
    };
    quizOptions.appendChild(btn);
  });
}

// --- 8. Flashcard Image Export & Text Copy ---
downloadCardBtn.addEventListener('click', async () => {
  const flashcardElement = document.getElementById('flashcardArea');
  try {
    const exportCanvas = await html2canvas(flashcardElement, { scale: 2 });
    const imageUri = exportCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUri;
    downloadLink.download = `BharatLens-${identifiedName.textContent.replace(/\s+/g, '_')}.png`;
    downloadLink.click();
  } catch (err) {
    alert('Failed to generate image: ' + err.message);
  }
});

copyAllBtn.addEventListener('click', () => {
  if (!currentItemData) return;
  let text = `🇮🇳 BharatLens Ultra: ${currentItemData.item_name_en}\n`;
  text += `${currentItemData.short_description}\n`;
  text += `Origin: ${currentItemData.gi_tag_status || 'Pan-India'} | Season: ${currentItemData.peak_season || 'Year-round'}\n\n`;
  currentTranslations.forEach(t => {
    text += `• ${t.state} (${t.language}): ${t.phonetic_en} [${t.native_script}] | Mandi: "${t.mandi_phrase || 'N/A'}"\n`;
  });
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied summary and translations to clipboard!');
  });
});

// --- 9. Local History Storage ---
function saveToHistory(itemData, thumbnailDataUrl) {
  let history = JSON.parse(localStorage.getItem('bharatlens_history') || '[]');
  const entry = {
    name: itemData.item_name_en,
    thumbnail: thumbnailDataUrl,
    data: itemData
  };
  history = [entry, ...history.filter(h => h.name !== entry.name)].slice(0, 8);
  localStorage.setItem('bharatlens_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('bharatlens_history') || '[]');
  if (history.length === 0) {
    historyGrid.innerHTML = '<p class="empty-msg">No previous scans found.</p>';
    return;
  }

  historyGrid.innerHTML = '';
  history.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <img src="${item.thumbnail}" alt="${item.name}" />
      <h4>${item.name}</h4>
    `;
    card.addEventListener('click', () => {
      currentItemData = item.data;
      currentTranslations = item.data.translations || [];
      imagePreview.src = item.thumbnail;
      imagePreview.style.display = 'block';
      video.style.display = 'none';
      placeholder.style.display = 'none';
      displayResults(item.data);
    });
    historyGrid.appendChild(card);
  });
}

clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem('bharatlens_history');
  renderHistory();
});