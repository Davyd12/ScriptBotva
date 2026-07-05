//javascript:script=document.createElement('script');script.type='text/javascript';script.src='https://cdn.jsdelivr.net/gh/Davyd12/ScriptBotva@master/ScriptBotva/BotvaKachFish_Avatar.js';document.getElementsByTagName("head")[0].appendChild(script);void(0);


(function() {
    function decodeRussianText(text) {
        try {
            return decodeURIComponent(text);
        } catch (e) {
            return text;
        }
    }
    
    function fixEncoding() {
        if (!document.querySelector('meta[charset="UTF-8"], meta[charset="utf-8"]')) {
            const meta = document.createElement('meta');
            meta.setAttribute('charset', 'UTF-8');
            document.head.appendChild(meta);
        }
        if (!document.querySelector('meta[http-equiv="Content-Type"][content*="UTF-8"]')) {
            const meta2 = document.createElement('meta');
            meta2.setAttribute('http-equiv', 'Content-Type');
            meta2.setAttribute('content', 'text/html; charset=UTF-8');
            document.head.appendChild(meta2);
        }
    }
    
    fixEncoding();
    
    const allStats = ["power", "block", "dexterity", "endurance", "charisma"];
    let selectedStats = [...allStats];
    const StatMaxValue = 4294967295n;
    const MaxKachPerRequest = 99999;
    
    let previousFish = 0n;
    let errorCount = 0;
    let KEY = window.KEY || '';
    let isRunning = false;
    let iterationCount = 0;
    
    function setElementText(element, encodedText) {
        if (element) {
            element.textContent = decodeURIComponent(encodedText);
        }
    }
    
    function createControlPanel() {
        const oldPanel = document.getElementById('trainer-control-panel');
        if (oldPanel) oldPanel.remove();
        
        const panel = document.createElement('div');
        panel.id = 'trainer-control-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2d3748;
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            font-family: Arial, sans-serif;
            min-width: 350px;
            border: 2px solid #4a5568;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const title = document.createElement('div');
        setElementText(title, '%F0%9F%A4%96%20%D0%90%D0%B2%D1%82%D0%BE%D0%BF%D1%80%D0%BE%D0%BA%D0%B0%D1%87%D0%BA%D0%B0%20%D1%85%D0%B0%D1%80%D0%B0%D0%BA%D1%82%D0%B5%D1%80%D0%B8%D1%81%D1%82%D0%B8%D0%BA');
        title.style.cssText = `
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            text-align: center;
            color: #63b3ed;
        `;
        
        const status = document.createElement('div');
        status.id = 'trainer-status';
        setElementText(status, '%F0%9F%9F%A2%20%D0%A1%D1%82%D0%B0%D1%82%D1%83%D1%81%3A%20%D0%97%D0%B0%D0%BF%D1%83%D1%89%D0%B5%D0%BD');
        status.style.cssText = `
            margin: 8px 0;
            padding: 6px;
            background: #4a5568;
            border-radius: 5px;
            font-size: 13px;
        `;
        
        const iterationsInfo = document.createElement('div');
        iterationsInfo.id = 'trainer-iterations-info';
        setElementText(iterationsInfo, '%F0%9F%94%84%20%D0%98%D1%82%D0%B5%D1%80%D0%B0%D1%86%D0%B8%D0%B9%3A%200');
        iterationsInfo.style.cssText = `
            margin: 8px 0;
            padding: 6px;
            background: #2d3748;
            border-radius: 5px;
            font-size: 13px;
            border: 1px solid #4a5568;
        `;
        
        const fishInfo = document.createElement('div');
        fishInfo.id = 'trainer-fish-info';
        setElementText(fishInfo, '%F0%9F%92%B0%20%D0%A0%D1%8B%D0%B1%D0%B0%3A%200');
        fishInfo.style.cssText = `
            margin: 8px 0;
            padding: 6px;
            background: #4a5568;
            border-radius: 5px;
            font-size: 13px;
        `;
        
        const statsSection = document.createElement('div');
        statsSection.style.cssText = `
            margin: 10px 0;
            padding: 10px;
            background: #2d3748;
            border-radius: 5px;
            border: 1px solid #4a5568;
        `;
        
        const statsTitle = document.createElement('div');
        setElementText(statsTitle, '%F0%9F%93%8A%20%D0%92%D1%8B%D0%B1%D0%BE%D1%80%20%D1%85%D0%B0%D1%80%D0%B0%D0%BA%D1%82%D0%B5%D1%80%D0%B8%D1%81%D1%82%D0%B8%D0%BA%3A');
        statsTitle.style.cssText = `
            margin-bottom: 8px;
            font-weight: bold;
            color: #a0aec0;
            font-size: 13px;
        `;
        
        const checkboxesContainer = document.createElement('div');
        checkboxesContainer.id = 'trainer-checkboxes';
        checkboxesContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 6px;
        `;
        
        allStats.forEach(stat => {
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `stat-checkbox-${stat}`;
            checkbox.checked = selectedStats.includes(stat);
            checkbox.style.cssText = `
                width: 16px;
                height: 16px;
                cursor: pointer;
            `;
            
            checkbox.onchange = function() {
                if (this.checked) {
                    if (!selectedStats.includes(stat)) {
                        selectedStats.push(stat);
                    }
                } else {
                    const index = selectedStats.indexOf(stat);
                    if (index > -1) {
                        selectedStats.splice(index, 1);
                    }
                }
                updateSelectedStatsInfo();
                console.log(`Выбранные характеристики: ${selectedStats.join(', ')}`);
            };
            
            const label = document.createElement('label');
            label.htmlFor = `stat-checkbox-${stat}`;
            
let encodedStatName = '';
if (stat === 'power') encodedStatName = '%D0%A1%D0%B8%D0%BB%D0%B0'; // Сила
else if (stat === 'block') encodedStatName = '%D0%97%D0%B0%D1%89%D0%B8%D1%82%D0%B0'; // Защита
else if (stat === 'dexterity') encodedStatName = '%D0%9B%D0%BE%D0%B2%D0%BA%D0%BE%D1%81%D1%82%D1%8C'; // Ловкость
else if (stat === 'endurance') encodedStatName = '%D0%9C%D0%B0%D1%81%D1%81%D0%B0'; // Масса
else if (stat === 'charisma') encodedStatName = '%D0%9C%D0%B0%D1%81%D1%82%D0%B5%D1%80%D1%81%D1%82%D0%B2%D0%BE'; // Мастерство
            
            setElementText(label, encodedStatName);
            label.style.cssText = `
                cursor: pointer;
                font-size: 13px;
                user-select: none;
            `;
            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            checkboxesContainer.appendChild(checkboxContainer);
        });
        
        const selectedStatsInfo = document.createElement('div');
        selectedStatsInfo.id = 'trainer-selected-stats';
        setElementText(selectedStatsInfo, `%D0%92%D1%8B%D0%B1%D1%80%D0%B0%D0%BD%D0%BE%3A%20${selectedStats.length}/${allStats.length}`);
        selectedStatsInfo.style.cssText = `
            margin-top: 8px;
            padding: 4px 8px;
            background: #4a5568;
            border-radius: 4px;
            font-size: 12px;
            text-align: center;
        `;
        
        const selectionButtons = document.createElement('div');
        selectionButtons.style.cssText = `
            display: flex;
            gap: 5px;
            margin-top: 8px;
        `;
        
        const selectAllBtn = document.createElement('button');
        setElementText(selectAllBtn, '%D0%92%D1%8B%D0%B1%D1%80%D0%B0%D1%82%D1%8C%20%D0%B2%D1%81%D0%B5');
        selectAllBtn.style.cssText = `
            flex: 1;
            padding: 4px;
            background: #38a169;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
        `;
        selectAllBtn.onclick = () => {
            selectedStats = [...allStats];
            updateCheckboxes();
            updateSelectedStatsInfo();
        };
        
        const selectNoneBtn = document.createElement('button');
        setElementText(selectNoneBtn, '%D0%A1%D0%B1%D1%80%D0%BE%D1%81%D0%B8%D1%82%D1%8C');
        selectNoneBtn.style.cssText = `
            flex: 1;
            padding: 4px;
            background: #e53e3e;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
        `;
        selectNoneBtn.onclick = () => {
            selectedStats = [];
            updateCheckboxes();
            updateSelectedStatsInfo();
        };
        
        selectionButtons.appendChild(selectAllBtn);
        selectionButtons.appendChild(selectNoneBtn);
        
        statsSection.appendChild(statsTitle);
        statsSection.appendChild(checkboxesContainer);
        statsSection.appendChild(selectedStatsInfo);
        statsSection.appendChild(selectionButtons);
        
        const currentAction = document.createElement('div');
        currentAction.id = 'trainer-current-action';
        setElementText(currentAction, '%E2%8F%B3%20%D0%9E%D0%B6%D0%B8%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5...');
        currentAction.style.cssText = `
            margin: 8px 0;
            padding: 6px;
            background: #2d3748;
            border-radius: 5px;
            font-size: 13px;
            border: 1px dashed #4a5568;
            min-height: 20px;
        `;
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 10px;
        `;
        
        const startBtn = document.createElement('button');
        startBtn.id = 'trainer-start-btn';
        setElementText(startBtn, '%E2%96%B6%EF%B8%8F%20%D0%A1%D1%82%D0%B0%D1%80%D1%82');
        startBtn.style.cssText = `
            flex: 1;
            padding: 10px;
            background: #38a169;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s;
        `;
        startBtn.onmouseover = () => startBtn.style.background = '#2f855a';
        startBtn.onmouseout = () => startBtn.style.background = '#38a169';
        startBtn.onclick = () => startTraining();
        
        const stopBtn = document.createElement('button');
        stopBtn.id = 'trainer-stop-btn';
        setElementText(stopBtn, '%E2%8F%B9%EF%B8%8F%20%D0%A1%D1%82%D0%BE%D0%BF');
        stopBtn.style.cssText = `
            flex: 1;
            padding: 10px;
            background: #e53e3e;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s;
        `;
        stopBtn.onmouseover = () => stopBtn.style.background = '#c53030';
        stopBtn.onmouseout = () => stopBtn.style.background = '#e53e3e';
        stopBtn.onclick = () => stopTraining();
        
        const closeBtn = document.createElement('button');
        setElementText(closeBtn, '%E2%9C%95');
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            color: #a0aec0;
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            width: 24px;
            height: 24px;
        `;
        closeBtn.onclick = () => panel.remove();
        
        const signature = document.createElement('div');
        setElementText(signature, '@%D0%94%D0%B0%D0%B2%D1%8B%D0%B4%202026');
        signature.style.cssText = `
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #4a5568;
            text-align: center;
            color: #a0aec0;
            font-size: 11px;
        `;
        
        buttonsContainer.appendChild(startBtn);
        buttonsContainer.appendChild(stopBtn);
        
        panel.appendChild(closeBtn);
        panel.appendChild(title);
        panel.appendChild(status);
        panel.appendChild(iterationsInfo);
        panel.appendChild(fishInfo);
        panel.appendChild(statsSection);
        panel.appendChild(currentAction);
        panel.appendChild(buttonsContainer);
        panel.appendChild(signature);
        
        document.body.appendChild(panel);
        
        updateAllInfo();
    }
    
    function updateCheckboxes() {
        allStats.forEach(stat => {
            const checkbox = document.getElementById(`stat-checkbox-${stat}`);
            if (checkbox) {
                checkbox.checked = selectedStats.includes(stat);
            }
        });
    }
    
    function updateSelectedStatsInfo() {
        const selectedStatsInfo = document.getElementById('trainer-selected-stats');
        if (selectedStatsInfo) {
            setElementText(selectedStatsInfo, `%D0%92%D1%8B%D0%B1%D1%80%D0%B0%D0%BD%D0%BE%3A%20${selectedStats.length}/${allStats.length}`);
            
            if (selectedStats.length === 0) {
                selectedStatsInfo.style.background = '#742a2a';
            } else if (selectedStats.length === allStats.length) {
                selectedStatsInfo.style.background = '#2d4a37';
            } else {
                selectedStatsInfo.style.background = '#744210';
            }
        }
    }
    
    function updateAllInfo() {
        updateStatus();
        updateIterationsInfo();
        updateFishInfo();
        updateSelectedStatsInfo();
    }
    
    function updateStatus() {
        const status = document.getElementById('trainer-status');
        if (status) {
            const statusIcon = isRunning ? '%F0%9F%9F%A2' : '%F0%9F%94%B4';
            const statusText = isRunning ? '%D0%97%D0%B0%D0%BF%D1%83%D1%89%D0%B5%D0%BD' : '%D0%9E%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD';
            setElementText(status, `${statusIcon}%20%D0%A1%D1%82%D0%B0%D1%82%D1%83%D1%81%3A%20${statusText}`);
        }
    }
    
    function updateIterationsInfo() {
        const iterationsInfo = document.getElementById('trainer-iterations-info');
        if (iterationsInfo) {
            setElementText(iterationsInfo, `%F0%9F%94%84%20%D0%98%D1%82%D0%B5%D1%80%D0%B0%D1%86%D0%B8%D0%B9%3A%20${iterationCount}`);
            
            if (iterationCount === 0) {
                iterationsInfo.style.background = '#2d3748';
            } else if (iterationCount < 10) {
                iterationsInfo.style.background = '#2d4a37';
            } else if (iterationCount < 50) {
                iterationsInfo.style.background = '#3a5c2d';
            } else {
                iterationsInfo.style.background = '#4a7432';
            }
        }
    }
    
    function updateFishInfo() {
        const fishInfo = document.getElementById('trainer-fish-info');
        if (fishInfo) {
            const fish = findMyFish();
            setElementText(fishInfo, `%F0%9F%92%B0%20%D0%A0%D1%8B%D0%B1%D0%B0%3A%20${fish}`);
            
            if (fish === 0n) {
                fishInfo.style.background = '#742a2a';
            } else if (fish < 1000n) {
                fishInfo.style.background = '#744210';
            } else if (fish < 10000n) {
                fishInfo.style.background = '#745c10';
            } else {
                fishInfo.style.background = '#4a5568';
            }
        }
    }
    
    function updateCurrentAction(encodedText) {
        const currentAction = document.getElementById('trainer-current-action');
        if (currentAction) {
            setElementText(currentAction, encodedText);
            
            const text = decodeURIComponent(encodedText);
            if (text.includes('⏳')) {
                currentAction.style.background = '#2d3748';
            } else if (text.includes('⚡')) {
                currentAction.style.background = '#374151';
            } else if (text.includes('✅')) {
                currentAction.style.background = '#2d4a37';
            } else if (text.includes('❌')) {
                currentAction.style.background = '#742a2a';
            } else if (text.includes('🏁')) {
                currentAction.style.background = '#4a5568';
            } else if (text.includes('🔍')) {
                currentAction.style.background = '#744210';
            } else if (text.includes('⚠️')) {
                currentAction.style.background = '#745c10';
            } else if (text.includes('▶️')) {
                currentAction.style.background = '#2d4a37';
            }
        }
    }
    
    function findMyFish() {
        const fishElement = document.querySelector('span[id="fish_upd_data"]')?.parentElement;
        if (!fishElement) return 0n;
        let fish = fishElement.outerText || "";
        fish = fish.replace(/\./g, "").replace(/\r\n/g, "");
        const digits = fish.split('').filter(c => /\d/.test(c)).join('');
        return BigInt(digits || "0");
    }
    
    function getStatValue(stat) {
        const statElement = document.querySelector(`div[class*="avatar_stat_${stat}"]`);
        if (!statElement) return 0n;
        let statText = statElement.textContent || "";
        const digits = statText.replace(/\D/g, '');
        return BigInt(digits || "0");
    }
    
    function getAllStatPrices(statList) {
        const myFish = findMyFish();
        const result = [];
        
        const statsToCheck = statList.filter(stat => selectedStats.includes(stat));
        
        if (statsToCheck.length === 0) {
            console.log('⚠️ Не выбрано ни одной характеристики для улучшения');
            return result;
        }
        
        statsToCheck.forEach(stat => {
            const priceElement = document.getElementById(`price_${stat}_fish`);
            let priceText = priceElement?.textContent || "";
            const cleanPrice = priceText.replace(/\D/g, '');
            const priceBigInt = BigInt(cleanPrice || "0");
            const statCount = getStatValue(stat);
            
            let kach = 0n;
            
            if (priceBigInt > 0n && myFish > 0n) {
                kach = myFish / priceBigInt;
                if (kach > MaxKachPerRequest) kach = BigInt(MaxKachPerRequest);
                if ((statCount + kach) > StatMaxValue) kach = StatMaxValue - statCount;
                if (kach < 1n) kach = 0n;
            }
            
            result.push({ 
                stat: stat, 
                price: priceBigInt,
                count: statCount,
                kach: kach
            });
        });
        
        return result;
    }
    
    function trainStat(statToTrain, count) {
        const myFish = findMyFish();
        
        if (previousFish > 0n && myFish === previousFish) {
            errorCount++;
            if (errorCount >= 3) {
                updateCurrentAction('%E2%9D%8C%20%D0%9E%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BA%D0%B0%3A%20%D1%81%D0%BB%D0%B8%D1%88%D0%BA%D0%BE%D0%BC%20%D0%BC%D0%BD%D0%BE%D0%B3%D0%BE%20%D0%BE%D1%88%D0%B8%D0%B1%D0%BE%D0%BA');
                isRunning = false;
                updateAllInfo();
                return false;
            }
        } else {
            errorCount = 0;
        }
        
        previousFish = myFish;
        
        const priceElement = document.getElementById(`price_${statToTrain}_fish`);
        if (!priceElement) return false;
        
        let priceText = priceElement.textContent || "";
        const cleanPrice = priceText.replace(/\D/g, '');
        const upgradePrice = BigInt(cleanPrice || "0");
        const currentStatValue = getStatValue(statToTrain);
        
        let maxKach = 0n;
        if (upgradePrice > 0n && myFish > 0n) {
            maxKach = myFish / upgradePrice;
            if (maxKach > MaxKachPerRequest) maxKach = BigInt(MaxKachPerRequest);
            if ((currentStatValue + maxKach) > StatMaxValue) maxKach = StatMaxValue - currentStatValue;
            if (maxKach < 1n) maxKach = 0n;
        }
        
        let actualCount = count;
        if (!count || BigInt(count) > maxKach) {
            actualCount = maxKach.toString();
        }
        
        const countBigInt = BigInt(actualCount || "0");
        if (countBigInt === 0n) {
            updateCurrentAction('%E2%9D%8C%20%D0%9D%D0%B5%D0%BB%D1%8C%D0%B7%D1%8F%20%D1%83%D0%BB%D1%83%D1%87%D1%88%D0%B8%D1%82%D1%8C%3A%20%D0%BC%D0%B0%D0%BA%D1%81%D0%B8%D0%BC%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5%20%D0%BA%D0%BE%D0%BB%D0%B8%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%BE%20%D1%83%D0%BB%D1%83%D1%87%D1%88%D0%B5%D0%BD%D0%B8%D0%B9%20%3D%200');
            return false;
        }
        
        if (upgradePrice * countBigInt > myFish) {
            updateCurrentAction('%E2%9D%8C%20%D0%9D%D0%B5%D0%B4%D0%BE%D1%81%D1%82%D0%B0%D1%82%D0%BE%D1%87%D0%BD%D0%BE%20%D1%80%D1%8B%D0%B1%D1%8B');
            return false;
        }
        
        let discountElement = document.getElementById('avatar_' + statToTrain + '_fish_amount').closest('form').querySelector('input[name="total_discount"]');
        let discount = discountElement ? discountElement.value : '0';
        
        const cost = upgradePrice * countBigInt;
        updateCurrentAction(`%E2%9A%A1%20%D0%A3%D0%BB%D1%83%D1%87%D1%88%D0%B0%D0%B5%D0%BC%20${statToTrain}%3A%20%2B${countBigInt}%20%D1%83%D1%80%D0%BE%D0%B2%D0%BD%D0%B5%D0%B9%20(${cost}%20%D1%80%D1%8B%D0%B1%D1%8B)`);
        
        $.post('index.php?a=basic', { 
            k: KEY,
            autobuy: '0',
            greenpack: '0',
            [statToTrain]: actualCount,
            cmd: 'do_upgrade_fish_fast',
            'total_discount': discount,
            do_content_as_json: '1'
        },
        function(result) {
            if (!result || !result.update) {
                updateCurrentAction('%E2%9D%8C%20%D0%9E%D1%88%D0%B8%D0%B1%D0%BA%D0%B0%20%D0%BE%D1%82%D0%B2%D0%B5%D1%82%D0%B0%20%D1%81%D0%B5%D1%80%D0%B2%D0%B5%D1%80%D0%B0');
                scheduleNext();
                return;
            }
            
            if (result.update.fish && result.update.fish.data) {
                var fishElement = document.getElementById('fish_upd_data');
                if (fishElement) {
                    var newValue = result.update.fish.data;
                    var valueWithoutDots = newValue.toString().replace(/\./g, '');
                    fishElement.textContent = valueWithoutDots;
                    var event = new Event('input', { bubbles: true });
                    fishElement.dispatchEvent(event);
                }
            }
            
            if (result.update.body && result.update.body.data) {
                try {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = result.update.body.data;
                    
                    const statElement = tempDiv.querySelector(`div[onmouseover*="doItem('${statToTrain}"] div.value1avatar:not([class*="avatar_stat_"])`);
                    if (statElement) {
                        var avatarStat = document.querySelector(`div[onmouseover*="doItem('${statToTrain}"] div.value1avatar:not([class*="avatar_stat_"])`);
                        if (avatarStat) avatarStat.innerHTML = statElement.innerHTML;
                    }
                    
                    const discountElement = tempDiv.querySelector('.training_' + statToTrain + '_fish input[name="total_discount"]');       
                    if (discountElement) {
                        var avatarDiscount = document.querySelector('.training_' + statToTrain + '_fish input[name="total_discount"]');
                        if (avatarDiscount) avatarDiscount.value = discountElement.value || discountElement.getAttribute('value') || '';
                    }
                    
                    const priceElement = tempDiv.querySelector('#price_' + statToTrain + '_fish.ability_price');       
                    if (priceElement) {
                        var avatarPrice = document.querySelector('#price_' + statToTrain + '_fish.ability_price');
                        if (avatarPrice) avatarPrice.innerHTML = priceElement.innerHTML;
                    }
                } catch (e) {}
            }
            
            if (result.data && result.data.key) {
                KEY = result.data.key;
            }
            
            updateFishInfo();
            updateCurrentAction(`%E2%9C%85%20%D0%A3%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D0%BE!%20%D0%A3%D0%BB%D1%83%D1%87%D1%88%D0%B5%D0%BD%D0%BE%20${countBigInt}%20%D1%83%D1%80%D0%BE%D0%B2%D0%BD%D0%B5%D0%B9`);
            
            scheduleNext();
        },
        'json');
        
        return true;
    }
    
    function autoTrainCheapestStat() {
        if (!isRunning) {
            updateCurrentAction('%E2%8F%B9%EF%B8%8F%20%D0%A1%D0%BA%D1%80%D0%B8%D0%BF%D1%82%20%D0%BE%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD');
            return false;
        }
        
        if (selectedStats.length === 0) {
            updateCurrentAction('%E2%9A%A0%EF%B8%8F%20%D0%9D%D0%B5%20%D0%B2%D1%8B%D0%B1%D1%80%D0%B0%D0%BD%D0%BE%20%D0%BD%D0%B8%20%D0%BE%D0%B4%D0%BD%D0%BE%D0%B9%20%D1%85%D0%B0%D1%80%D0%B0%D0%BA%D1%82%D0%B5%D1%80%D0%B8%D1%81%D1%82%D0%B8%D0%BA%D0%B8');
            setTimeout(scheduleNext, 2000);
            return false;
        }
        
        iterationCount++;
        updateIterationsInfo();
        
        const myFish = findMyFish();
        updateFishInfo();
        
        if (myFish === 0n) {
            updateCurrentAction('%F0%9F%8F%81%20%D0%A0%D1%8B%D0%B1%D0%B0%20%D0%B7%D0%B0%D0%BA%D0%BE%D0%BD%D1%87%D0%B8%D0%BB%D0%B0%D1%81%D1%8C');
            isRunning = false;
            updateAllInfo();
            return false;
        }
        
        const prices = getAllStatPrices(allStats);
        const validPrices = prices.filter(item => 
            item.price > 0n && 
            item.count < StatMaxValue &&
            item.kach > 0n
        );
        
        if (validPrices.length === 0) {
            updateCurrentAction('%F0%9F%8F%81%20%D0%9D%D0%B5%D1%82%20%D0%B4%D0%BE%D1%81%D1%82%D1%83%D0%BF%D0%BD%D1%8B%D1%85%20%D1%85%D0%B0%D1%80%D0%B0%D0%BA%D1%82%D0%B5%D1%80%D0%B8%D1%81%D1%82%D0%B8%D0%BA');
            isRunning = false;
            updateAllInfo();
            return false;
        }
        
        const sortedByPrice = [...validPrices].sort((a, b) => {
            if (a.price < b.price) return -1;
            if (a.price > b.price) return 1;
            return 0;
        });
        
        const cheapest = sortedByPrice[0];
        
        updateCurrentAction(`%F0%9F%94%8D%20%D0%90%D0%BD%D0%B0%D0%BB%D0%B8%D0%B7...%20%D0%92%D1%8B%D0%B1%D1%80%D0%B0%D0%BD%D0%B0%20${cheapest.stat}`);
        
        return trainStat(cheapest.stat, cheapest.kach.toString());
    }
    
    function scheduleNext() {
        if (!isRunning) return;
        
        const delay = 1000;
        
        let countdown = delay / 1000;
        const countdownInterval = setInterval(() => {
            updateCurrentAction(`%E2%8F%B3%20%D0%A1%D0%BB%D0%B5%D0%B4%D1%83%D1%8E%D1%89%D0%B5%D0%B5%20%D1%83%D0%BB%D1%83%D1%87%D1%88%D0%B5%D0%BD%D0%B8%D0%B5%20%D1%87%D0%B5%D1%80%D0%B5%D0%B7%20${countdown}%D1%81...`);
            countdown--;
            
            if (countdown < 0) {
                clearInterval(countdownInterval);
                autoTrainCheapestStat();
            }
        }, 1000);
    }
    
    function startTraining() {
        if (!isRunning) {
            isRunning = true;
            updateCurrentAction('%E2%96%B6%EF%B8%8F%20%D0%A1%D0%BA%D1%80%D0%B8%D0%BF%D1%82%20%D0%B7%D0%B0%D0%BF%D1%83%D1%89%D0%B5%D0%BD');
            updateAllInfo();
            autoTrainCheapestStat();
        }
    }
    
    function stopTraining() {
        isRunning = false;
        updateCurrentAction('%E2%8F%B9%EF%B8%8F%20%D0%A1%D0%BA%D1%80%D0%B8%D0%BF%D1%82%20%D0%BE%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD');
        updateAllInfo();
    }
    
    window.updateSelectedStats = function(statsArray) {
        selectedStats = [...statsArray];
        updateCheckboxes();
        updateSelectedStatsInfo();
        console.log(`Характеристики обновлены: ${selectedStats.join(', ')}`);
    };
    
    window.getSelectedStats = function() {
        return [...selectedStats];
    };
    
    window.startTraining = startTraining;
    window.stopTraining = stopTraining;
    
    createControlPanel();
    
    console.log('✅ Панель управления создана!');
    console.log('Команды: startTraining(), stopTraining()');
    console.log('Дополнительно: updateSelectedStats(["power", "charisma"]), getSelectedStats()');
    console.log(`Выбранные характеристики: ${selectedStats.join(', ')}`);
    
    setTimeout(() => {
        console.log('🚀 Автоматический запуск...');
        autoTrainCheapestStat();
    }, 100);
    
})();
