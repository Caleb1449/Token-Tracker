let tokenList = [];

// DOM elements
const tokenNameInput = document.getElementById('tokenName');
const tokenPowerInput = document.getElementById('tokenPower');
const tokenToughnessInput = document.getElementById('tokenToughness');
const tokenKeywordsInput = document.getElementById('tokenKeywords');
const tokenQtyInput = document.getElementById('tokenQty');
const addTokenBtn = document.getElementById('addTokenBtn');
const untapAllBtn = document.getElementById('untapAllBtn');
const removeAllBtn = document.getElementById('removeAllBtn');
const battlefield = document.getElementById('battlefield');

// Create token click handler
addTokenBtn.addEventListener('click', () => {
    const name = tokenNameInput.value.trim() || "Token";
    const basePower = tokenPowerInput.value.trim();
    const baseToughness = tokenToughnessInput.value.trim();
    const qty = parseInt(tokenQtyInput.value) || 1;
    const layout = document.querySelector('input[name="layoutType"]:checked').value;

    const keywordText = tokenKeywordsInput.value.trim();
    const keywords = keywordText ? keywordText.split(',').map(kw => kw.trim()).filter(kw => kw !== '') : [];

    const hasNumericPT = !isNaN(basePower) && !isNaN(baseToughness) && basePower !== '' && baseToughness !== '';

    const createTokenObject = (uniqueId) => ({
        id: uniqueId,
        name: name,
        basePower: basePower,
        baseToughness: baseToughness,
        hasNumericPT: hasNumericPT,
        keywords: keywords,
        quantity: layout === 'stacked' ? qty : 1,
        isTapped: false,
        counters: { plusOne: 0 }
    });

    if (layout === 'stacked') {
        tokenList.push(createTokenObject(Date.now()));
    } else {
        for (let i = 0; i < qty; i++) {
            tokenList.push(createTokenObject(Date.now() + i));
        }
    }

    tokenNameInput.value = '';
    tokenPowerInput.value = '';
    tokenToughnessInput.value = '';
    tokenKeywordsInput.value = '';
    tokenQtyInput.value = '1';
    renderBattlefield();
});

// Untap All Button Action
untapAllBtn.addEventListener('click', () => {
    tokenList.forEach(token => token.isTapped = false);
    renderBattlefield();
});

// Remove All Button Action - Optimized to clear without blocking popups
removeAllBtn.addEventListener('click', () => {
    tokenList = [];
    renderBattlefield();
});

// Render cards dynamically to HTML
function renderBattlefield() {
    battlefield.innerHTML = '';

    tokenList.forEach(token => {
        let displayPT = "";
        if (token.basePower !== "" || token.baseToughness !== "") {
            if (token.hasNumericPT) {
                const totalPower = parseInt(token.basePower) + token.counters.plusOne;
                const totalToughness = parseInt(token.baseToughness) + token.counters.plusOne;
                displayPT = `${totalPower}/${totalToughness}`;
            } else {
                displayPT = `${token.basePower}/${token.baseToughness}`;
            }
        }

        let keywordsHTML = '';
        if (token.keywords && token.keywords.length > 0) {
            keywordsHTML = `<div class="keywords-area">`;
            token.keywords.forEach(kw => {
                keywordsHTML += `<span class="keyword-badge">${kw}</span>`;
            });
            keywordsHTML += `</div>`;
        }

        const card = document.createElement('div');
        card.className = `token-card ${token.isTapped ? 'tapped' : ''}`;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="token-title">
                    ${token.name} ${token.quantity > 1 ? `(x${token.quantity})` : ''}
                </div>
                <button class="delete-btn" onclick="removeToken(${token.id})">×</button>
            </div>

            ${keywordsHTML}

            <div class="counters-area">
                <div class="counter-row">
                    <span>+1/+1 Counters: <strong>${token.counters.plusOne}</strong></span>
                    <div>
                        <button class="counter-btn" onclick="updateCounter(${token.id}, 'plusOne', -1, event)">-</button>
                        <button class="counter-btn" onclick="updateCounter(${token.id}, 'plusOne', 1, event)">+</button>
                    </div>
                </div>
            </div>

            <div class="card-footer">
                <div class="tap-zone" onclick="toggleTap(${token.id}, event)">
                    ${token.isTapped ? 'TAPPED' : 'TAP'}
                </div>
                ${displayPT ? `<div class="pt-badge">${displayPT}</div>` : ''}
            </div>
        `;

        battlefield.appendChild(card);
    });
}

window.toggleTap = function(id, event) {
    event.stopPropagation();
    const token = tokenList.find(t => t.id === id);
    if (token) {
        token.isTapped = !token.isTapped;
        renderBattlefield();
    }
};

window.updateCounter = function(id, counterType, amount, event) {
    event.stopPropagation();
    const token = tokenList.find(t => t.id === id);
    if (token) {
        token.counters[counterType] += amount;
        renderBattlefield();
    }
};

window.removeToken = function(id) {
    tokenList = tokenList.filter(t => t.id !== id);
    renderBattlefield();
};
