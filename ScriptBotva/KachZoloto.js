javascript:(function() {
    function decodeRussianText(text) {
        try {
            return decodeURIComponent(text);
        } catch (e) {
            return text;
        }
    }
    
  
    javascript:script=document.createElement('script');script.type='text/javascript';script.src='https://cdn.jsdelivr.net/gh/Davyd12/ScriptBotva@master/ScriptBotva/KachZoloto.js';document.getElementsByTagName("head")[0].appendChild(script);void(0);

    function fixEncoding() {
        if (!document.querySelector('meta[charset="windows-1251"], meta[charset="windows-1251"]')) {
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
    const values = ['24999999','2499999', '999999', '99999'];
    
    const StatMaxValue = 4294967295n;
    const MaxErrorCount = 3;
    let errorCount = 0;
    let previousGold = 0n;
    const MaxIterations = 100000000;
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
        
        const panel = document.createElement('div');
        panel.id = 'gold-trainer-panel';
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
        setElementText(title, '💰 Автопрокачка золотом');
        title.style.cssText = `
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            text-align: center;
            color: #f6e05e;
        `;
        
        const status = document.createElement('div');
        status.id = 'gold-trainer-status';
        setElementText(status, '🟢 Статус: Запущен');
        status.style.cssText = `
            margin: 8px 0;
            padding: 6px;
            background: #4a5568;
            border-radius: 5px;
            font-size: 13px;
        `;
        
        const iterationsInfo = document.createElement('div');
        iterationsInfo.id = 'gold-trainer-iterations-info';
        setElementText(iterationsInfo, '🔄 Итераций: 0');
        iterationsInfo.style.cssText = `
            margin: 8px 0;
            padding: 6px;
            background: #2d3748;
            border-radius: 5px;
            font-size: 13px;
            border: 1px solid #4a5568;
        `;
        
        const goldInfo = document.createElement('div');
        goldInfo.id = 'gold-trainer-gold-info';
        setElementText(goldInfo, '💰 Золото: 0');
        goldInfo.style.cssText = `
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
        setElementText(statsTitle, '📊 Выбор характеристики:');
        statsTitle.style.cssText = `
            margin-bottom: 8px;
            font-weight: bold;
            color: #a0aec0;
            font-size: 13px;
        `;
        
        const checkboxesContainer = document.createElement('div');
        checkboxesContainer.id = 'gold-trainer-checkboxes';
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
            checkbox.id = `gold-stat-checkbox-${stat}`;
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
            label.htmlFor = `gold-stat-checkbox-${stat}`;
            
let encodedStatName = '';
if (stat === 'power') encodedStatName = 'Сила';
else if (stat === 'block') encodedStatName = 'Защита';
else if (stat === 'dexterity') encodedStatName = 'Ловкость';
else if (stat === 'endurance') encodedStatName = 'Выносливость';
else if (stat === 'charisma') encodedStatName = 'Харизма';
            
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
        selectedStatsInfo.id = 'gold-trainer-selected-stats';
        setElementText(selectedStatsInfo, `Выбрано: ${selectedStats.length}/${allStats.length}`);
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
        setElementText(selectAllBtn, 'Выбрать все');
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
        setElementText(selectNoneBtn, 'Сбросить');
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
        currentAction.id = 'gold-trainer-current-action';
        setElementText(currentAction, '⏳ Ожидание...');
        currentAction.style.cssText = `
            margin: 8px 0;
            padding: 6px;
            background: #2d3748;
            border-radius: 5px;
            font-size: 13px;
            border: 1px dashed #4a5568;
            min-height: 20px;
        `;
        
        const upgradeInfo = document.createElement('div');
        upgradeInfo.id = 'gold-trainer-upgrade-info';
        setElementText(upgradeInfo, '📊 Ожидание данных...');
        upgradeInfo.style.cssText = `
            margin: 8px 0;
            padding: 6px;
            background: #4a5568;
            border-radius: 5px;
            font-size: 13px;
        `;
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 10px;
        `;
        
        const startBtn = document.createElement('button');
        startBtn.id = 'gold-trainer-start-btn';
        setElementText(startBtn, '▶️ Старт');
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
        stopBtn.id = 'gold-trainer-stop-btn';
        setElementText(stopBtn, '⏹️ Стоп');
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
        setElementText(closeBtn, '❌');
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
        
        buttonsContainer.appendChild(startBtn);
        buttonsContainer.appendChild(stopBtn);
        
        const signature = document.createElement('div');
        setElementText(signature, '@Давыд 2026');
        signature.style.cssText = `
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #4a5568;
            text-align: center;
            color: #a0aec0;
            font-size: 11px;
        `;
        
        panel.appendChild(closeBtn);
        panel.appendChild(title);
        panel.appendChild(status);
        panel.appendChild(iterationsInfo);
        panel.appendChild(goldInfo);
        panel.appendChild(statsSection);
        panel.appendChild(currentAction);
        panel.appendChild(upgradeInfo);
        panel.appendChild(buttonsContainer);
        panel.appendChild(signature);
        
        document.body.appendChild(panel);
        
        updateAllInfo();
    }
    
    function updateCheckboxes() {
        allStats.forEach(stat => {
            const checkbox = document.getElementById(`gold-stat-checkbox-${stat}`);
            if (checkbox) {
                checkbox.checked = selectedStats.includes(stat);
            }
        });
    }
    
    function updateSelectedStatsInfo() {
        const selectedStatsInfo = document.getElementById('gold-trainer-selected-stats');
        if (selectedStatsInfo) {
            setElementText(selectedStatsInfo, `Выбрано: ${selectedStats.length}/${allStats.length}`);
            
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
        updateGoldInfo();
        updateSelectedStatsInfo();
    }
    
    function updateStatus() {
        const status = document.getElementById('gold-trainer-status');
        if (status) {
            const statusIcon = isRunning ? '🟢' : '🔴';
            const statusText = isRunning ? 'Запущен' : 'Остановлен';
            setElementText(status, `${statusIcon} Статус: ${statusText}`);
        }
    }
    
    function updateIterationsInfo() {
        const iterationsInfo = document.getElementById('gold-trainer-iterations-info');
        if (iterationsInfo) {
            setElementText(iterationsInfo, `🔄 Итераций: ${iterationCount}`);
            
            if (iterationCount === 0) {
                iterationsInfo.style.background = '#2d3748';
            } else if (iterationCount < 10) {
                iterationsInfo.style.background = '#2d4a37';
            } else if (iterationCount < 50) {
                iterationsInfo.style.background = '#38a169';
            } else {
                iterationsInfo.style.background = '#4a7432';
            }
        }
    }
    
    function updateGoldInfo() {
        const goldInfo = document.getElementById('gold-trainer-gold-info');
        if (goldInfo) {
            const gold = findMyMoney();
            setElementText(goldInfo, `💰 Золото: ${gold}`);
            
            if (gold === 0n) {
                goldInfo.style.background = '#742a2a';
            } else if (gold < 1000n) {
                goldInfo.style.background = '#744210';
            } else if (gold < 10000n) {
                goldInfo.style.background = '#745c10';
            } else if (gold < 100000n) {
                goldInfo.style.background = '#746a10';
            } else {
                goldInfo.style.background = '#747210';
            }
        }
    }
    
    function updateCurrentAction(text) {
        const currentAction = document.getElementById('gold-trainer-current-action');
        if (currentAction) {
            setElementText(currentAction, text);
            
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
            }
        }
    }
    
    function updateUpgradeInfo(stat, price, count, upgradeCount) {
        const upgradeInfo = document.getElementById('gold-trainer-upgrade-info');
        if (upgradeInfo) {
            let encodedStatName = '';
            if (stat === 'power') encodedStatName = 'Сила';
            else if (stat === 'block') encodedStatName = 'Блок';
            else if (stat === 'dexterity') encodedStatName = 'Ловкость';
            else if (stat === 'endurance') encodedStatName = 'Выносливость';
            else if (stat === 'charisma') encodedStatName = 'Харизма';
            
            setElementText(upgradeInfo, `📊 Улучшаем ${encodedStatName}: +${upgradeCount} уровнем (цена: ${price}, текущее: ${count})`);
            upgradeInfo.style.background = '#4a5568';
        }
    }
    
    function startTraining() {
        if (!isRunning) {
            isRunning = true;
            updateCurrentAction('▶️ Скрипт запущен');
            updateAllInfo();
            if (selectedStats.length === 0) {
                updateCurrentAction('⚠️ Не выбрано ни одной характеристики');
                return;
            }
            runUpgradeCycle();
        }
    }
    
    function stopTraining() {
        isRunning = false;
        updateCurrentAction('⏹️ Скрипт остановлен');
        updateAllInfo();
    }
    
    function getAllStatPrices(statList) {
        const result = [];
        statList.forEach(stat => {
            const priceElement = document.querySelector(`div[rel="1001"] span[class*="avatar_price_${stat}"]`);
            let priceText = priceElement?.textContent || "";
            
            const isPremiumCurrency = document.querySelector(`div[rel="1001"] span[class*="avatar_price_${stat}"] b.icon.money_ingots_small`) !== null;
            
            if (isPremiumCurrency) {
                priceText += "000";
            }
            
            const cleanPrice = priceText.replace(/\./g, "").split('').filter(c => /\d/.test(c)).join('');
            const priceBigInt = BigInt(cleanPrice || "0");








            const statCount = getStatValue(stat);
            
            result.push({ 
                stat: stat, 
                price: priceBigInt,
                count: statCount
            });
        });
        return result;
    }








    function findMyMoney() {
        const goldElement = document.querySelector('span[id="gold_upd_data"]')?.parentElement;
        if (!goldElement) return 0n;
        
        let money = goldElement.outerText || "";
        money = money.replace(/\./g, "").replace(/\r\n/g, "");
        
        if (money.indexOf("слитки") > -1) {
            money += "000000";
        }
        
        const digits = money.split('').filter(c => /\d/.test(c)).join('');
        return BigInt(digits || "0");
    }








    function getStatValue(stat) {
        const statElement = document.querySelector(`div[class*="avatar_stat_${stat}"]`);
        if (!statElement) return 0n;








        let statText = statElement.textContent || "";
        statText = statText.replace(/\./g, "").replace(/\s/g, "");
        
        const digits = statText.split('').filter(c => /\d/.test(c)).join('');
        return BigInt(digits || "0");
    }








    function findMinPriceUnderMax(statPriceArray, maxValue) {
        let minPriceInfo = null;
        
        const filteredArray = statPriceArray.filter(item => 
            selectedStats.includes(item.stat)
        );
        
        if (filteredArray.length === 0) {
            return { stat: "Not found", price: 0n, count: 0n };
        }
        
        filteredArray.forEach(item => {
            if (item.count < maxValue) {
                if (minPriceInfo === null || item.price < minPriceInfo.price) {
                    minPriceInfo = {
                        stat: item.stat,
                        price: item.price,
                        count: item.count
                    };
                }
            }
        });
        
        return minPriceInfo !== null ? minPriceInfo : { stat: "Not found", price: 0n, count: 0n };
    }








    function calculateMaxUpgrade(statInfo, availableGold, maxStatValue) {
        if (statInfo.price === 0n) {
            return 0n;
        }
        
        let affordableUpgrades = availableGold / statInfo.price;
        
        if (affordableUpgrades > 100n) {
            affordableUpgrades = affordableUpgrades * 8n / 10n;
            console.log(`Безопасное уменьшение: ${affordableUpgrades}`);
        }
        
        const possibleUpgrades = maxStatValue - statInfo.count;
        
        return affordableUpgrades < possibleUpgrades ? affordableUpgrades : possibleUpgrades;
    }








    function performUpgrade(statInfo, upgradeCount) {
        updateCurrentAction(`⚡ Улучшаем ${statInfo.stat}...`);
        updateUpgradeInfo(statInfo.stat, statInfo.price, statInfo.count, upgradeCount);
        
        console.log(`Upgrading ${statInfo.stat} by ${upgradeCount} levels`);
        
        const statInput = document.querySelector(`input[id="${statInfo.stat}"]`);
        if (!statInput) {
            updateCurrentAction('❌ Поле ввода не найдено');
            console.log(`Input field for ${statInfo.stat} not found`);
            return false;
        }
        
        const upgradeCountNum = Number(upgradeCount);
        
        let selectedValue = upgradeCount.toString();
        for (let value of values) {
            if (upgradeCountNum >= Number(value)) {
                selectedValue = value;
                break;
            }
        }
        
        if (selectedValue.length > 5) {
            statInput.maxLength = selectedValue.length;
            console.log(`Changed maxLength to: ${selectedValue.length}`);
        }
        
        statInput.value = selectedValue;
        
        const eventTypes = ['input', 'change', 'keyup'];
        eventTypes.forEach(eventType => {
            const event = new Event(eventType, {
                bubbles: true,
                cancelable: true
            });
            statInput.dispatchEvent(event);
        });
        
        if (typeof change === 'function') {
            try {
                change(statInfo.stat, 0, selectedValue);
            } catch (e) {
                console.log('Could not call change function:', e);
            }
        }
        
        if (statInput.onkeyup) {
            try {
                statInput.onkeyup();
            } catch (e) {
                console.log('Could not call onkeyup:', e);
            }
        }
        
        statInput.style.border = "3px solid #1fde52";
        statInput.style.backgroundColor = "#e6eb6e";
        
        console.log(`Upgrade count: ${upgradeCount}, Selected value: ${selectedValue}`);
        console.log(`Set ${statInfo.stat} to: ${selectedValue}`);
        
        const improveButton = document.querySelector(`div.button_${statInfo.stat}:not(.cmd_blocked) input[type="submit"]`);
        if (improveButton) {
            console.log(`Clicking improve button for ${statInfo.stat}`);
            
            setTimeout(() => {
                improveButton.click();
                console.log(`Improve button clicked for ${statInfo.stat}`);
            }, 100);
            
            return true;
        } else {
            updateCurrentAction('❌ Кнопка улучшения не найдена');
            console.log(`Improve button not found or blocked for ${statInfo.stat}`);
            return false;
        }
    }








    function runUpgradeCycle() {
        if (!isRunning) {
            updateCurrentAction('⏹️ Скрипт остановлен');
            return false;
        }
        
        if (selectedStats.length === 0) {
            updateCurrentAction('⚠️ Не выбрано ни одной характеристики');
            setTimeout(runUpgradeCycle, 2000);
            return false;
        }
        
        updateCurrentAction('🔍 Поиск самой дешевой характеристики...');
        console.log(`[START] Cycle started, errorCount: ${errorCount}`);
        
        if (!isRunning) return false;
        
        iterationCount++;
        updateIterationsInfo();
        
        if (iterationCount > MaxIterations) {
            updateCurrentAction('🏁 Достигнут максимум итераций');
            return false;
        }








        const div = document.querySelector('div[rel="1001"]');    
        if (!div) {
            errorCount++;
            updateCurrentAction('❌ Не найден блок характеристик');
            console.log(`Error ${errorCount}: div[rel="1001"] not found`);
            if (errorCount >= MaxErrorCount) {
                updateCurrentAction('🏁 Слишком много ошибок');
                stopTraining();
                return false;
            }
            setTimeout(runUpgradeCycle, 1000);
            return;
        }








        const statPrices = getAllStatPrices(allStats);
        
        const myMoney = findMyMoney();
        updateGoldInfo();
        console.log(`My gold: ${myMoney}`);
        
        if (previousGold > 0n && myMoney === previousGold) {
            errorCount++;
            updateCurrentAction('❌ Золото не изменилось после улучшения');
            console.log(`Error ${errorCount}: Gold didn't change after upgrade`);
            if (errorCount >= MaxErrorCount) {
                updateCurrentAction('🏁 Слишком много ошибок');
                stopTraining();
                return false;
            }
        }
        
        previousGold = myMoney;
        
        const minPriceInfo = findMinPriceUnderMax(statPrices, StatMaxValue);
        console.log(`Minimum price: ${minPriceInfo.price} for stat: ${minPriceInfo.stat} with count: ${minPriceInfo.count}`);








        if (myMoney === 0n) {
            errorCount++;
            updateCurrentAction('❌ Золото закончилось');
            console.log(`Error ${errorCount}: No gold found`);
            if (errorCount >= MaxErrorCount) {
                updateCurrentAction('🏁 Слишком много ошибок');
                stopTraining();
                return false;
            }
            setTimeout(runUpgradeCycle, 1000);
            return;
        }








        if (minPriceInfo.price === 0n || minPriceInfo.stat === "Not found") {
            updateCurrentAction('🏁 Нет доступных характеристик для улучшения');
            console.log(`No stats to upgrade`);
            stopTraining();
            return false;
        }
        
        if (myMoney < minPriceInfo.price) {
            updateCurrentAction('❌ Недостаточно золота для улучшения');
            console.log(`Not enough gold for any stat`);
            stopTraining();
            return false;
        }








        const upgradeCount = calculateMaxUpgrade(minPriceInfo, myMoney, StatMaxValue);
        console.log(`Can upgrade ${minPriceInfo.stat} by: ${upgradeCount}`);








        if (upgradeCount === 0n) {
            updateCurrentAction('❌ Невозможно улучшить выбранную характеристику');
            console.log(`Cannot upgrade selected stat`);
            const index = selectedStats.indexOf(minPriceInfo.stat);
            if (index > -1) {
                selectedStats.splice(index, 1);
                updateCheckboxes();
                updateSelectedStatsInfo();
                updateCurrentAction(`⚠️ Убрали ${minPriceInfo.stat} из выбранных`);
            }
            setTimeout(runUpgradeCycle, 1000);
            return false;
        }








        if (performUpgrade(minPriceInfo, upgradeCount)) {
            
            setTimeout(() => {
                if (!isRunning) return;
                
                const pageText = document.body.textContent;
                
                if (pageText.includes("Нужно больше ресурсов!")) {
                    errorCount++;
                    updateCurrentAction('❌ Нужно больше ресурсов');
                    console.log(`Error ${errorCount}: Обнаружено: Нужно больше ресурсов!`);
                    
                    if (errorCount >= MaxErrorCount) {
                        updateCurrentAction('🏁 Слишком много ошибок');
                        stopTraining();
                        return;
                    }
                    
                    setTimeout(runUpgradeCycle, 3000);
                    return;
                }
                
                errorCount = 0;
                updateCurrentAction('✅ Успешно улучшено');
                console.log("Upgrade successful");
                setTimeout(runUpgradeCycle, 1500);
                
            }, 500);
            
        } else {
            errorCount++;
            updateCurrentAction('❌ Ошибка улучшения');
            console.log(`Error ${errorCount}: Upgrade failed`);
            if (errorCount >= MaxErrorCount) {
                updateCurrentAction('🏁 Слишком много ошибок');
                stopTraining();
                return false;
            }
            setTimeout(runUpgradeCycle, 1000);
        }
        
        console.log(`[END] Cycle finished, errorCount: ${errorCount}`);
        return true;
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
        runUpgradeCycle();
    }, 100);
})();
