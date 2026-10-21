(() => {
  const STORAGE_KEY = '__skillUsageByStage';
  const TIMER_KEY = '__skillTotalSkillsTimer';
  const TABLE_CLASS = 'my-total-skill-table';

  const skillNames = {
    1: 'Лёгкая ракета',
    2: 'Вампиризм',
    3: 'Малый ремонтный комплект',
    4: 'Большой ремонтный комплект',
    5: 'Фиолетовая спираль',
    6: 'Жёлтая спираль',
    7: 'Механизм внеземной защиты',
    8: 'Армагеддон',
    9: 'Лазерная граната',
    10: 'Световая бомба',
    11: 'Космическая ракета',
    12: 'Бомбардировка по площади'
  };

  // Останавливаем предыдущий таймер при повторной вставке скрипта
  if (window[TIMER_KEY]) {
    clearInterval(window[TIMER_KEY]);
    window[TIMER_KEY] = null;
  }

  /*
   * Статистика хранится отдельно по этапам:
   *
   * {
   *   "22": {
   *     "Имя игрока": {
   *       "1": 3,
   *       "3": 2
   *     }
   *   }
   * }
   */
  window[STORAGE_KEY] ??= {};

  let previousData = '';
  let lastKnownStage = null;

  /*
   * Проверка состояния из HTML:
   *
   * <body class="lang_RU old_bg2 battle resolving">
   *
   * Важно: battle и resolving — это классы body,
   * а не текст на странице.
   */
  function isBattleResolvingVisible() {
    const body = document.body;

    return Boolean(
      body &&
      body.classList.contains('battle') &&
      body.classList.contains('resolving')
    );
  }

  function getCurrentStage() {
    const stageElement = document.querySelector(
      '.lunar_stage span'
    );

    if (stageElement) {
      const stageNumber = parseInt(
        stageElement.textContent.trim(),
        10
      );

      if (Number.isFinite(stageNumber)) {
        lastKnownStage = stageNumber;
        return stageNumber;
      }
    }

    // Запасной вариант — ищем число внутри блока lunar_stage
    const stageBlock = document.querySelector(
      '.lunar_stage'
    );

    if (stageBlock) {
      const match = stageBlock.textContent.match(/\d+/);

      if (match) {
        const stageNumber = Number(match[0]);
        lastKnownStage = stageNumber;
        return stageNumber;
      }
    }

    /*
     * Если во время battle resolving блок этапа
     * временно отсутствует, используем последний
     * известный номер этапа.
     */
    return lastKnownStage;
  }

  function collectCurrentStage() {
    const stage = getCurrentStage();

    if (stage === null) {
      console.warn(
        '[Умения] Не удалось определить номер этапа.'
      );

      return null;
    }

    const stageStats = {};

    document
      .querySelectorAll('.lunar_log_row')
      .forEach(row => {
        const skillIcon = row.querySelector(
          '[class*="icon_lunar_skill"]'
        );

        if (!skillIcon) {
          return;
        }

        const skillMatch = skillIcon.className.match(
          /icon_lunar_skill(\d+)/
        );

        if (!skillMatch) {
          return;
        }

        const skillId = Number(skillMatch[1]);
        const boldElements = [
          ...row.querySelectorAll('b')
        ];

        if (!boldElements.length) {
          return;
        }

        /*
         * Как и в исходном C#:
         * первый <b> — игрок, который использовал умение.
         */
        const playerName = boldElements[0]
          .textContent
          .trim();

        if (!playerName) {
          return;
        }

        if (!stageStats[playerName]) {
          stageStats[playerName] = {};
        }

        stageStats[playerName][skillId] =
          (stageStats[playerName][skillId] || 0) + 1;
      });

    /*
     * Полностью заменяем данные текущего этапа.
     * Это важно: при обновлении каждые 2 секунды
     * одинаковые записи не прибавляются повторно.
     *
     * Предыдущие этапы не удаляются.
     */
    window[STORAGE_KEY][stage] = stageStats;

    return stage;
  }

  function getTotalStats() {
    const totalStats = {};

    Object.values(window[STORAGE_KEY])
      .forEach(stagePlayers => {
        Object.entries(stagePlayers)
          .forEach(([playerName, skills]) => {
            if (!totalStats[playerName]) {
              totalStats[playerName] = {};
            }

            Object.entries(skills)
              .forEach(([skillId, count]) => {
                totalStats[playerName][skillId] =
                  (totalStats[playerName][skillId] || 0) +
                  count;
              });
          });
      });

    return totalStats;
  }

  function findPlayerBlock(playerName) {
    return [
      ...document.querySelectorAll('.user_block')
    ].find(block => {
      const nameElement = block.querySelector(
        '.lunar_name'
      );

      return (
        nameElement &&
        nameElement.textContent.trim() === playerName
      );
    });
  }

  function renderPlayer(
    playerName,
    stats,
    playerBlock
  ) {
    if (!playerBlock) {
      return;
    }

    const oldTable = playerBlock.querySelector(
      `.${TABLE_CLASS}`
    );

    if (oldTable) {
      oldTable.remove();
    }

    const skills = Object.entries(stats)
      .sort((a, b) => Number(a[0]) - Number(b[0]));

    if (!skills.length) {
      return;
    }

    const rows = skills
      .map(([skillId, count]) => {
        const skillName =
          skillNames[skillId] ||
          `Умение ${skillId}`;

        return `
          <tr>
            <td style="
              padding-right:5px;
              vertical-align:middle;
            ">
              <b
                class="icon2 icon_lunar_skill${skillId}"
                title="${skillName}"
              ></b>
            </td>

            <td
              title="${skillName}"
              style="
                color:#0f0;
                text-align:right;
                padding-left:3px;
                vertical-align:middle;
              "
            >
              ${count}
            </td>
          </tr>
        `;
      })
      .join('');

    playerBlock.style.position = 'relative';

    const container = document.createElement('div');
    container.className = TABLE_CLASS;

    Object.assign(container.style, {
      position: 'absolute',
      right: '-5px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '10px',
      lineHeight: '14px',
      background: '#111',
      color: '#fff',
      border: '1px solid #333',
      borderRadius: '3px',
      padding: '3px',
      zIndex: '9999',
      whiteSpace: 'nowrap',
      boxShadow: '0 0 5px #000'
    });

    container.innerHTML = `
      <div style="
        color:#ffd700;
        font-weight:bold;
        text-align:center;
        margin-bottom:2px;
      ">
        Всего
      </div>

      <table>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    playerBlock.appendChild(container);
  }

  function renderAllPlayers() {
    const totalStats = getTotalStats();

    Object.entries(totalStats)
      .forEach(([playerName, stats]) => {
        const playerBlock =
          findPlayerBlock(playerName);

        renderPlayer(
          playerName,
          stats,
          playerBlock
        );
      });
  }

  function update() {
    const resolving =
      isBattleResolvingVisible();

    /*
     * В том числе при resolving продолжаем
     * читать текущий финальный журнал.
     */
    const stage = collectCurrentStage();

    if (stage === null) {
      return;
    }

    const currentData = JSON.stringify(
      window[STORAGE_KEY]
    );

    /*
     * Если данные не изменились, не перерисовываем
     * таблицы и не создаём лишнюю нагрузку.
     */
    if (currentData === previousData) {
      return;
    }

    previousData = currentData;

    renderAllPlayers();

    if (resolving) {
      console.log(
        `[Умения] battle resolving: ` +
        `финальная статистика прочитана. ` +
        `Этап: ${stage}`
      );
    } else {
      console.log(
        `[Умения] Статистика обновлена. ` +
        `Этап: ${stage}`
      );
    }

    console.table(getTotalStats());
  }

  // Первый запуск сразу
  update();

  // Обновление каждые 2 секунды
  window[TIMER_KEY] = setInterval(
    update,
    2000
  );

  console.log(
    '[Умения] Скрипт включён.',
    'Обновление каждые 2 секунды.',
    'Состояние battle resolving только читается, ' +
    'статистика не очищается.'
  );
})();
