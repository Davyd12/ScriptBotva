javascript:(function() {
    function decodeRussianText(text) {
        try {
            return decodeURIComponent(text);
        } catch (e) {
            return text;
        }
    }
    
    function fixEncoding() {
        if (!document.querySelector('meta[charset="windows-1251"]')) {
            const meta = document.createElement('meta');
            meta.setAttribute('charset', 'windows-1251');
            document.head.appendChild(meta);
        }
        if (!document.querySelector('meta[http-equiv="Content-Type"][content*="windows-1251"]')) {
            const meta2 = document.createElement('meta');
            meta2.setAttribute('http-equiv', 'Content-Type');
            meta2.setAttribute('content', 'text/html; charset=windows-1251');
            document.head.appendChild(meta2);
        }
    }
    
    fixEncoding();
    
    const allStats = ["power", "block", "dexterity", "endurance", "charisma"];
    let selectedStats = [...allStats];
    const values = ['24999999', '2499999', '999999', '99999'];
    
    const StatMaxValue = 4294967295n;
    const MaxErrorCount = 3;
    const MaxUpgradesPerCycle = 24999999n;
    
    let errorCount = 0;
    let previousGold = 0n;
    let iterationCount = 0;
    let isRunning = false;
    
    function setElementText(element, encodedText) {
        if (element) {
            element.textContent = decodeURIComponent(encodedText);
        }
    }
    
    function createControlPanel() {
        const oldPanel = document.getElementById('gold-trainer-panel');
        if (oldPanel) oldPanel.remove();
        
        // Инжектим стили
        const style = document.createElement('style');
        style.id = 'gold-trainer-styles';
        style.textContent = `
            #gold-trainer-panel {
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                background: #2d3748 !important;
                color: white !important;
                padding: 15px !important;
                border-radius: 10px !important;
                z-index: 99999 !important;
                font-family: Arial, sans-serif !important;
                width: 320px !important;
                min-width: 320px !important;
                max-width: 320px !important;
                border: 2px solid #4a5568 !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            #gold-trainer-panel * {
                background: transparent !important;
                color: white !important;
                font-family: Arial, sans-serif !important;
            }
            #gold-trainer-title {
                font-weight: bold !important;
                font-size: 14px !important;
                margin-bottom: 8px !important;
                text-align: center !important;
                color: #f6e05e !important;
                background: transparent !important;
            }
            #gold-trainer-status,
            #gold-trainer-gold-info,
            #gold-trainer-current-action,
            #gold-trainer-iterations {
                margin: 4px 0 !important;
                padding: 4px !important;
                background: #4a5568 !important;
                border-radius: 4px !important;
                font-size: 11px !important;
            }
            #gold-trainer-buttons {
                display: flex !important;
                gap: 8px !important;
                margin-top: 8px !important;
            }
            #gold-trainer-start-btn,
            #gold-trainer-stop-btn {
                flex: 1 !important;
                padding: 8px !important;
                color: white !important;
                border: none !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                font-weight: bold !important;
                font-size: 12px !important;
            }
            #gold-trainer-start-btn {
                background: #38a169 !important;
            }
            #gold-trainer-stop-btn {
                background: #e53e3e !important;
            }
            #gold-trainer-close-btn {
                position: absolute !important;
                top: 4px !important;
                right: 4px !important;
                background: transparent !important;
                border: none !important;
                color: #a0aec0 !important;
                cursor: pointer !important;
                font-size: 14px !important;
                padding: 4px !important;
            }
        `;
        document.head.appendChild(style);
        
        const panel = document.createElement('div');
        panel.id = 'gold-trainer-panel';
        
        const title = document.createElement('div');
        title.id = 'gold-trainer-title';
        setElementText(title, '💰 Автопрокачка (макс: 24999999)');
        
        const status = document.createElement('div');
        status.id = 'gold-trainer-status';
        setElementText(status, '🔴 Остановлен');
        
        const goldInfo = document.createElement('div');
        goldInfo.id = 'gold-trainer-gold-info';
        setElementText(goldInfo, '💰 Золото: 0');
        
        const iterations = document.createElement('div');
        iterations.id = 'gold-trainer-iterations';
        setElementText(iterations, '🔄 Итераций: 0');
        
        const currentAction = document.createElement('div');
        currentAction.id = 'gold-trainer-current-action';
        setElementText(currentAction, '⏳ Нажмите Старт');
        
        const btns = document.createElement('div');
        btns.id = 'gold-trainer-buttons';
        
        const startBtn = document.createElement('button');
        startBtn.id = 'gold-trainer-start-btn';
        setElementText(startBtn, '▶️ Старт');
        startBtn.onclick = () => startTraining();
        
        const stopBtn = document.createElement('button');
        stopBtn.id = 'gold-trainer-stop-btn';
        setElementText(stopBtn, '⏹️ Стоп');
        stopBtn.onclick = () => stopTraining();
        
        const closeBtn = document.createElement('button');
        closeBtn.id = 'gold-trainer-close-btn';
        setElementText(closeBtn, '❌');
        closeBtn.onclick = () => { stopTraining(); panel.remove(); };
        
        btns.appendChild(startBtn);
        btns.appendChild(stopBtn);
        
        panel.appendChild(closeBtn);
        panel.appendChild(title);
        panel.appendChild(status);
        panel.appendChild(goldInfo);
        panel.appendChild(iterations);
        panel.appendChild(currentAction);
        panel.appendChild(btns);
        
        document.body.appendChild(panel);
    }
    
    function updateAllInfo() {
        const status = document.getElementById('gold-trainer-status');
        if (status) {
            setElementText(status, isRunning ? '🟢 Запущен' : '🔴 Остановлен');
        }
        
        const goldInfo = document.getElementById('gold-trainer-gold-info');
        if (goldInfo) {
            setElementText(goldInfo, '💰 ' + findMyMoney());
        }
        
        const iterations = document.getElementById('gold-trainer-iterations');
        if (iterations) {
            setElementText(iterations, '🔄 Итераций: ' + iterationCount);
        }
    }
    
    function updateCurrentAction(text) {
        const a = document.getElementById('gold-trainer-current-action');
        if (a) setElementText(a, text);
    }
    
    function startTraining() {
        if (!isRunning) {
            isRunning = true;
            errorCount = 0;
            iterationCount = 0;
            previousGold = 0n;
            updateCurrentAction('▶️ Запущен');
            updateAllInfo();
            runUpgradeCycle();
        }
    }
    
    function stopTraining() {
        isRunning = false;
        updateCurrentAction('⏹️ Остановлен');
        updateAllInfo();
    }
    
    function findMyMoney() {
        const goldElement = document.querySelector('span[id="gold_upd_data"]')?.parentElement;
        if (!goldElement) return 0n;
        
        let money = goldElement.outerText || "";
        money = money.replace(/\./g, "").replace(/\r\n/g, "");
        
        return BigInt(money.split('').filter(c => c >= '0' && c <= '9').join('') || "0");
    }
    
    function getStatValue(stat) {
        const statElement = document.querySelector(`div[class*="avatar_stat_${stat}"]`);
        if (!statElement) return 0n;
        
        let statText = statElement.textContent || "";
        statText = statText.replace(/\./g, "").replace(/\s/g, "");
        
        return BigInt(statText.split('').filter(c => c >= '0' && c <= '9').join('') || "0");
    }
    
    function getAllStatPrices() {
        return allStats.map(stat => {
            const priceElement = document.querySelector(`div[rel="1001"] span[class*="avatar_price_${stat}"]`);
            let priceText = priceElement?.textContent || "";
            const cleanPrice = priceText.replace(/\./g, "").split('').filter(c => c >= '0' && c <= '9').join('');
            
            return {
                stat: stat,
                price: BigInt(cleanPrice || "0"),
                count: getStatValue(stat)
            };
        });
    }
    
    function findMinPriceUnderMax(statPriceArray, maxValue) {
        let minPriceInfo = null;
        
        statPriceArray.forEach(item => {
            if (item.count < maxValue && selectedStats.includes(item.stat)) {
                if (minPriceInfo === null || item.price < minPriceInfo.price) {
                    minPriceInfo = item;
                }
            }
        });
        
        return minPriceInfo || { stat: "Not found", price: 0n, count: 0n };
    }
    
    function calculateMaxUpgrade(statInfo, availableGold) {
        if (statInfo.price === 0n) return 0n;
        
        let affordableUpgrades = availableGold / statInfo.price;
        
        if (affordableUpgrades > MaxUpgradesPerCycle) {
            console.log(`⚠️ Лимит: ${MaxUpgradesPerCycle} (было ${affordableUpgrades})`);
            affordableUpgrades = MaxUpgradesPerCycle;
        }
        
        return affordableUpgrades;
    }
    
    function performUpgrade(statInfo, upgradeCount) {
        console.log(`⚡ ${statInfo.stat}: +${upgradeCount}`);
        updateCurrentAction(`⚡ ${statInfo.stat}: +${upgradeCount}`);
        
        const statInput = document.querySelector(`input[id="${statInfo.stat}"]`);
        if (!statInput) {
            console.error(`Input not found: ${statInfo.stat}`);
            return false;
        }
        
        let selectedValue = upgradeCount.toString();
        for (let value of values) {
            if (BigInt(upgradeCount) >= BigInt(value)) {
                selectedValue = value;
            }
        }
        
        statInput.value = selectedValue;
        statInput.dispatchEvent(new Event('input', { bubbles: true }));
        statInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        const improveButton = document.querySelector(`div.button_${statInfo.stat}:not(.cmd_blocked) input[type="submit"]`);
        if (improveButton) {
            improveButton.click();
            return true;
        }
        
        console.error(`Button not found: ${statInfo.stat}`);
        return false;
    }
    
    function runUpgradeCycle() {
        if (!isRunning) return;
        
        if (selectedStats.length === 0) {
            updateCurrentAction('⚠️ Не выбраны характеристики');
            setTimeout(runUpgradeCycle, 2000);
            return;
        }
        
        iterationCount++;
        console.log(`[START] Iteration ${iterationCount}`);
        
        const div = document.querySelector('div[rel="1001"]');
        if (!div) {
            errorCount++;
            console.error(`Error ${errorCount}: div not found`);
            if (errorCount >= MaxErrorCount) { stopTraining(); return; }
            setTimeout(runUpgradeCycle, 1000);
            return;
        }
        
        const statPrices = getAllStatPrices();
        const myMoney = findMyMoney();
        updateAllInfo();
        console.log(`Gold: ${myMoney}`);
        
        if (myMoney === 0n) {
            errorCount++;
            if (errorCount >= MaxErrorCount) { stopTraining(); return; }
            setTimeout(runUpgradeCycle, 1000);
            return;
        }
        
        const minPriceInfo = findMinPriceUnderMax(statPrices, StatMaxValue);
        console.log(`Min: ${minPriceInfo.stat} @ ${minPriceInfo.price}`);
        
        if (minPriceInfo.stat === "Not found" || myMoney < minPriceInfo.price) {
            stopTraining();
            return;
        }
        
        const upgradeCount = calculateMaxUpgrade(minPriceInfo, myMoney);
        console.log(`Count: ${upgradeCount}`);
        
        if (upgradeCount === 0n) {
            stopTraining();
            return;
        }
        
        if (performUpgrade(minPriceInfo, upgradeCount)) {
            setTimeout(() => {
                if (!isRunning) return;
                
                const newGold = findMyMoney();
                if (newGold === myMoney) {
                    errorCount++;
                    console.error(`Error ${errorCount}: Gold not changed`);
                    if (errorCount >= MaxErrorCount) { stopTraining(); return; }
                    setTimeout(runUpgradeCycle, 2000);
                    return;
                }
                
                previousGold = newGold;
                errorCount = 0;
                console.log('✅ OK');
                setTimeout(runUpgradeCycle, 800);
            }, 500);
        } else {
            errorCount++;
            if (errorCount >= MaxErrorCount) { stopTraining(); return; }
            setTimeout(runUpgradeCycle, 1000);
        }
    }
    
    window.startTraining = startTraining;
    window.stopTraining = stopTraining;
    
    createControlPanel();
    console.log('✅ Ready! Max: ' + MaxUpgradesPerCycle);
})();