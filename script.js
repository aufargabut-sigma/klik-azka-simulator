// Game variables
let level = 1;
let xp = 0;
let coins = 0;
let xpNeeded = 10;
let prestigeMultiplier = 1;
let soundEnabled = true;

// Item data
let items = {
    autoKlik: { level: 0, description: "Klik otomatis setiap 5 detik." },
    penggandaXP: { level: 0, description: "Kalikan XP per klik x2." },
    peluangKritis: { level: 0, description: "Peluang 10% dapat bonus XP kritis." },
    klikSuper: { level: 0, description: "Tahan untuk klik super." },
    koinKeberuntungan: { level: 0, description: "Bonus koin acak per klik." }
};

// Achievements
let achievements = {
    first100Clicks: { unlocked: false, description: "100 klik pertama." },
    level10: { unlocked: false, description: "Capai Level 10." },
    firstItem: { unlocked: false, description: "Beli item pertama." }
};

// DOM elements
const clickableImage = document.getElementById('clickable-image');
const levelDisplay = document.getElementById('level-display');
const xpDisplay = document.getElementById('xp-display');
const coinsDisplay = document.getElementById('coins-display');
const xpFill = document.getElementById('xp-fill');
const clickEffects = document.getElementById('click-effects');
const shopBtn = document.getElementById('shop-btn');
const settingsBtn = document.getElementById('settings-btn');
const achievementsBtn = document.getElementById('achievements-btn');
const uploadBtn = document.getElementById('upload-btn');
const imageUpload = document.getElementById('image-upload');
const shopModal = document.getElementById('shop-modal');
const settingsModal = document.getElementById('settings-modal');
const achievementsModal = document.getElementById('achievements-modal');
const levelUpPopup = document.getElementById('level-up-popup');
const prestigeModal = document.getElementById('prestige-modal');
const soundToggle = document.getElementById('sound-toggle');
const exportBtn = document.getElementById('export-save');
const importBtn = document.getElementById('import-save');
const importFile = document.getElementById('import-file');
const resetBtn = document.getElementById('reset-game');
const prestigeBtn = document.getElementById('prestige-btn');

// Audio elements
const clickSound = document.getElementById('click-sound');
const levelupSound = document.getElementById('levelup-sound');
const purchaseSound = document.getElementById('purchase-sound');
const achievementSound = document.getElementById('achievement-sound');

// Load saved game data
function loadGame() {
    const saved = localStorage.getItem('klikNaikLevel');
    if (saved) {
        const data = JSON.parse(saved);
        level = data.level ?? 1;
        xp = data.xp ?? 0;
        coins = data.coins ?? 0;
        prestigeMultiplier = data.prestigeMultiplier ?? 1;
        items = data.items ?? items;
        achievements = data.achievements ?? achievements;
        if (data.imageSrc) clickableImage.src = data.imageSrc;
        soundEnabled = data.soundEnabled !== false;
        soundToggle.checked = soundEnabled;
        xpNeeded = Math.floor(10 * Math.pow(level, 1.5));
    }
    updateDisplay();
    updateShop();
    updateAchievements(); // Now defined, no error
}

// Save game data
function saveGame() {
    const data = {
        level, xp, coins, prestigeMultiplier, items, achievements,
        imageSrc: clickableImage.src, soundEnabled
    };
    localStorage.setItem('klikNaikLevel', JSON.stringify(data));
}

// Update UI display
function updateDisplay() {
    levelDisplay.textContent = `Level Saat Ini: ${level}`;
    xpDisplay.textContent = `XP: ${xp} / ${xpNeeded}`;
    coinsDisplay.textContent = `Koin: ${coins}`;
    xpFill.style.width = `${(xp / xpNeeded) * 100}%`;
}

// Stub achievement check to avoid errors (expand this with real logic later)
function checkAchievements() {
    // Example: Unlock "level10" if level >= 10
    if (!achievements.level10.unlocked && level >= 10) {
        achievements.level10.unlocked = true;
        if (soundEnabled && achievementSound) achievementSound.play();
        updateAchievements(); // Refresh UI after unlock
        saveGame();
    }
    // Add more checks here, e.g., for first100Clicks or firstItem
}

// Update achievements modal UI
function updateAchievements() {
    const achievementsList = document.getElementById('achievements-list');
    achievementsList.innerHTML = ''; // Clear existing list
    for (const [key, achievement] of Object.entries(achievements)) {
        const li = document.createElement('li');
        li.textContent = `${achievement.description} - ${achievement.unlocked ? 'Terbuka' : 'Tertutup'}`;
        li.style.color = achievement.unlocked ? '#4caf50' : '#999'; // Green if unlocked, gray if not
        achievementsList.appendChild(li);
    }
}

// Show xp/coin gain effect on click
function showClickEffect(xpText, coinText) {
    const effect = document.createElement('div');
    effect.innerHTML = `<p>${xpText}</p><p>${coinText}</p>`;
    effect.style.position = 'absolute';
    effect.style.color = '#4caf50';
    effect.style.fontWeight = 'bold';
    effect.style.pointerEvents = 'none';
    clickEffects.appendChild(effect);

    let y = 0;
    function animate() {
        y -= 2;
        effect.style.transform = `translateY(${y}px)`;
        effect.style.opacity = 1 - Math.abs(y) / 100;
        if (Math.abs(y) < 100) requestAnimationFrame(animate);
        else clickEffects.removeChild(effect);
    }
    animate();
}

// Show level-up popup
function showLevelUp() {
    levelUpPopup.style.display = 'block';
    setTimeout(() => {
        levelUpPopup.style.display = 'none';
    }, 2000);
}

// Show prestige modal when level 1000 reached
function showPrestige() {
    prestigeModal.style.display = 'block';
}

// Handle clicking on central image
clickableImage.addEventListener('click', () => {
    // Start with base xpGain and coinGain
    let xpGain = 1 * prestigeMultiplier;
    let coinGain = Math.floor(Math.random() * 5) + 1;

    // Apply item effects if applicable
    if (items.penggandaXP.level > 0) xpGain *= 2;
    if (items.peluangKritis.level > 0 && Math.random() < 0.1) xpGain *= 5;
    if (items.koinKeberuntungan.level > 0) coinGain *= 2;

    // Add XP and coins earned
    xp += xpGain;
    coins += coinGain;

    // Show visual click effects
    showClickEffect(`+${xpGain} XP`, `+${coinGain} Koin`);

    // Play click sound if enabled
    if (soundEnabled && clickSound) clickSound.play();

    // Level up while enough XP
    while (xp >= xpNeeded) {
        xp -= xpNeeded;
        level++;
        xpNeeded = Math.floor(10 * Math.pow(level, 1.5));
        showLevelUp();
        if (soundEnabled && levelupSound) levelupSound.play();

        if (level >= 1000) showPrestige();
    }

    // Check achievements after click
    checkAchievements();

    // Update UI and save progress
    updateDisplay();
    saveGame();
});

// Auto click if item purchased
setInterval(() => {
    if (items.autoKlik.level > 0) {
        clickableImage.click();
    }
}, 5000);

// Shop modal open/close handlers
shopBtn.addEventListener('click', () => shopModal.style.display = 'block');
settingsBtn.addEventListener('click', () => settingsModal.style.display = 'block');
achievementsBtn.addEventListener('click', () => achievementsModal.style.display = 'block');

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        shopModal.style.display = 'none';
        settingsModal.style.display = 'none';
        achievementsModal.style.display = 'none';
        prestigeModal.style.display = 'none';
    });
});

// Get item display name in Bahasa Indonesia
function getItemName(key) {
    const names = {
        autoKlik: "Auto Klik",
        penggandaXP: "Pengganda XP",
        peluangKritis: "Peluang Kritis",
        klikSuper: "Klik Super",
        koinKeberuntungan: "Koin Keberuntungan"
    };
    return names[key] || key;
}

// Calculate item cost based on current level
function getItemCost(level) {
    return 10 * Math.pow(2, level);
}

// Update and display shop items and their buy buttons
function updateShop() {
    const shopItems = document.getElementById('shop-items');
    shopItems.innerHTML = '';
    for (const [key, item] of Object.entries(items)) {
        const cost = getItemCost(item.level);
        const btnDisabled = coins < cost ? 'disabled' : '';
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <h3>${getItemName(key)}</h3>
            <p>Level: ${item.level}</p>
            <p>Biaya: ${cost} Koin</p>
            <p>${item.description}</p>
            <button ${btnDisabled} data-item="${key}">Beli</button>
        `;
        shopItems.appendChild(div);
    }

    // Add purchase button event listeners
    document.querySelectorAll('#shop-items button').forEach(btn => {
        btn.addEventListener('click', handlePurchase);
    });
}

// Handle purchase button click
function handlePurchase(event) {
    const key = event.target.getAttribute('data-item');
    const item = items[key];
    const cost = getItemCost(item.level);
    if (coins >= cost) {
        coins -= cost;
        item.level++;
        if (soundEnabled && purchaseSound) purchaseSound.play();
        updateShop();
        updateDisplay();
        checkAchievements(); // e.g. "beli item pertama"
        saveGame();
    }
}

// Initialize game on load
loadGame();