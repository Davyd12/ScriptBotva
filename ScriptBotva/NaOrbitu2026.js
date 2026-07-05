(function () {

    if (window.lunarTracker) return;

    const state = {
        stages: [],
        players: new Set(),
        playerOrder: [],
        data: {},
        stats: {},
        allies: new Set()
    };

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%) scale(0.75)';
    container.style.transformOrigin = 'bottom center';
    container.style.background = '#111';
    container.style.color = '#fff';
    container.style.padding = '10px';
    container.style.zIndex = 99999;
    container.style.maxHeight = '80vh';
    container.style.overflow = 'auto';

    document.body.appendChild(container);

    function parseStage() {
        return document.querySelector('.lunar_stage span')?.textContent.trim();
    }

    function addPlayer(name, isAlly = false) {
        if (!name || name === '[NAME]' || name.length < 2) return;

        if (!state.players.has(name)) {
            state.players.add(name);
            state.playerOrder.push(name);
        }

        if (isAlly) {
            state.allies.add(name);
        }
    }

    function parsePlayers() {

    // --- свои ---
    document.querySelectorAll('.lunar_allies .lunar_name').forEach(el => {
        addPlayer(el.textContent.trim(), true);
    });

    // --- враги ---
    document.querySelectorAll('.lunar_enemies .lunar_name').forEach(el => {
        addPlayer(el.textContent.trim(), false);
    });
}
    function addStat(player, skillClass) {
        if (!state.stats[player]) state.stats[player] = {};
        if (!state.stats[player][skillClass]) state.stats[player][skillClass] = 0;
        state.stats[player][skillClass]++;
    }

    function parseActions(stage) {
        if (!state.data[stage]) state.data[stage] = {};

        // --- свои ---
        document.querySelectorAll('.lunar_allies .user_block').forEach(playerEl => {
            const name = playerEl.querySelector('.lunar_name')?.textContent.trim();
            if (!name) return;

            const skill = playerEl.querySelector('.item_box');
            if (!skill) return;

            const cls = [...skill.classList].find(c => /^skill\d+$/.test(c));
            if (!cls) return;

            const skillNum = cls.replace('skill', '');
	    if (skillNum === '0') return;

            const iconClass = `icon_lunar_skill${skillNum}`;
            const iconHTML = `<b class="icon2 ${iconClass}"></b>`;

            const prev = state.data[stage][name];

            if (!prev || prev.skill !== iconClass) {
                state.data[stage][name] = {
                    html: iconHTML,
                    skill: iconClass
                };
                addStat(name, iconClass);
            }
        });

        // --- враги ---
        document.querySelectorAll('.lunar_log_row').forEach(row => {
            const player = row.querySelector('b:not([class])')?.textContent.trim();
            if (!player || player.length < 2) return;

            const icon = row.querySelector('.icon2');
            if (!icon) return;

            const iconClass = [...icon.classList].find(c => c.startsWith('icon_lunar_skill'));
            if (!iconClass) return;
            if (iconClass === 'icon_lunar_skill0') return;

            const prev = state.data[stage][player];

            if (!prev || prev.skill !== iconClass) {
                state.data[stage][player] = {
                    html: icon.outerHTML,
                    skill: iconClass
                };
                addStat(player, iconClass);
            }
        });
    }

    function buildTooltip(player) {
        const stats = state.stats[player];
        if (!stats) return '';

        let html = '<div style="padding:5px;">';

        Object.entries(stats).forEach(([skill, count]) => {
            html += `<div style="display:flex; align-items:center; gap:5px;">
                        <b class="icon2 ${skill}"></b> x${count}
                     </div>`;
        });

        html += '</div>';
        return html;
    }

    function render() {
        const players = state.playerOrder.filter(p => p && p.length > 2);

        const allies = players.filter(p => state.allies.has(p));
        const enemies = players.filter(p => !state.allies.has(p));

        const stages = state.stages;

        let html = `<table border="1" style="border-collapse: collapse; text-align:center;">`;

        // этапы
        html += `<tr><th>Игрок</th>`;
        stages.forEach(s => html += `<th>${s}</th>`);
        html += `</tr>`;

        // --- враги ---
        enemies.forEach(p => {
            const tooltip = buildTooltip(p).replace(/"/g, '&quot;');

            html += `<tr>`;
            html += `<td style="padding:4px 8px;" title="${tooltip}">${p}</td>`;

            stages.forEach(s => {
                const val = state.data[s]?.[p]?.html || '';
                html += `<td style="padding:6px;">${val}</td>`;
            });

            html += `</tr>`;
        });

        // --- линия ---
        if (enemies.length && allies.length) {
            html += `<tr>
                <td colspan="${stages.length + 1}" 
                    style="border-top:3px solid white;">
                </td>
            </tr>`;
        }

        // --- свои ---
        allies.forEach(p => {
            const tooltip = buildTooltip(p).replace(/"/g, '&quot;');

            html += `<tr>`;
            html += `<td style="padding:4px 8px;" title="${tooltip}">${p}</td>`;

            stages.forEach(s => {
                const val = state.data[s]?.[p]?.html || '';
                html += `<td style="padding:6px;">${val}</td>`;
            });

            html += `</tr>`;
        });

        html += `</table>`;

        container.innerHTML = html;
    }

    function tick() {
        const stage = parseStage();
        if (!stage) return;

        if (!state.stages.includes(stage)) {
            state.stages.push(stage);
        }

        parsePlayers();
        parseActions(stage);
        render();
    }

    window.lunarTracker = setInterval(tick, 5000);

})();