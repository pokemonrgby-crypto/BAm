export class UIManager {
  constructor(overlayElement) {
    this.overlay = overlayElement;
  }

  // 메인 메뉴
  showMainMenu(onStart) {
    this.overlay.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 100;" id="mainMenu">
        <h1 style="color: white; font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">뱀파이어 서바이벌</h1>
        <p style="color: #ccc; font-size: 18px; margin-bottom: 40px;">생존하고 성장하세요!</p>
        <button id="startButton" style="
          padding: 15px 40px;
          font-size: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        ">게임 시작</button>
        <div style="margin-top: 30px; color: #888; font-size: 14px; text-align: center;">
          <p>WASD 또는 화살표 키로 이동</p>
          <p>Space: 대시 | Q: 폭탄</p>
          <p>터치로 조작 가능</p>
        </div>
      </div>
    `;

    const startButton = document.getElementById('startButton');
    startButton.addEventListener('mouseenter', () => {
      startButton.style.transform = 'scale(1.1)';
      startButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    });
    startButton.addEventListener('mouseleave', () => {
      startButton.style.transform = 'scale(1)';
      startButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    });
    startButton.addEventListener('click', () => {
      onStart();
    });
  }

  hideMainMenu() {
    const menu = document.getElementById('mainMenu');
    if (menu) menu.remove();
  }

  // 게임 HUD
  showGameHUD() {
    const hudHTML = `
      <div id="gameHUD" style="position: absolute; top: 0; left: 0; width: 100%; padding: 20px; z-index: 50; pointer-events: none;">
        <!-- 상단 정보 -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <!-- 왼쪽: 체력 및 경험치 -->
          <div style="background: rgba(0,0,0,0.7); padding: 15px; border-radius: 10px; min-width: 250px;">
            <div style="margin-bottom: 10px;">
              <div style="color: white; font-size: 14px; margin-bottom: 5px;">레벨 <span id="playerLevel">1</span></div>
              <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                <div id="expBar" style="background: linear-gradient(90deg, #4CAF50, #8BC34A); height: 100%; width: 0%; transition: width 0.3s;"></div>
              </div>
            </div>
            <div>
              <div style="color: white; font-size: 14px; margin-bottom: 5px;">체력 <span id="playerHealth">100</span> / <span id="playerMaxHealth">100</span></div>
              <div style="background: rgba(255,255,255,0.2); height: 12px; border-radius: 6px; overflow: hidden;">
                <div id="healthBar" style="background: linear-gradient(90deg, #FF5252, #FF1744); height: 100%; width: 100%; transition: width 0.3s;"></div>
              </div>
            </div>
          </div>

          <!-- 오른쪽: 시간 및 액티브 스킬 -->
          <div style="background: rgba(0,0,0,0.7); padding: 15px; border-radius: 10px;">
            <div style="color: white; font-size: 18px; text-align: center; margin-bottom: 10px;">
              <span id="gameTime">00:00</span>
            </div>
            <div style="display: flex; gap: 10px;">
              <div id="dashSkill" style="width: 50px; height: 50px; background: rgba(100,200,255,0.3); border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2px solid rgba(100,200,255,0.5);">
                <div style="color: white; font-size: 10px;">Space</div>
                <div style="color: white; font-size: 16px; font-weight: bold;" id="dashCharges">2</div>
              </div>
              <div id="bombSkill" style="width: 50px; height: 50px; background: rgba(255,100,100,0.3); border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2px solid rgba(255,100,100,0.5); position: relative; overflow: hidden;">
                <div style="color: white; font-size: 10px;">Q</div>
                <div style="color: white; font-size: 16px; font-weight: bold;">💣</div>
                <div id="bombCooldown" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 0%; background: rgba(0,0,0,0.5); transition: height 0.1s;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 하단: 무기 슬롯 -->
        <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px;" id="weaponSlots">
        </div>
      </div>
    `;

    this.overlay.innerHTML += hudHTML;
  }

  updateGameHUD(data) {
    // 레벨 및 경험치
    const levelEl = document.getElementById('playerLevel');
    const expBar = document.getElementById('expBar');
    if (levelEl) levelEl.textContent = data.level;
    if (expBar) {
      const expPercent = (data.exp / data.expToNext) * 100;
      expBar.style.width = `${expPercent}%`;
    }

    // 체력
    const healthEl = document.getElementById('playerHealth');
    const maxHealthEl = document.getElementById('playerMaxHealth');
    const healthBar = document.getElementById('healthBar');
    if (healthEl) healthEl.textContent = Math.ceil(data.health);
    if (maxHealthEl) maxHealthEl.textContent = Math.ceil(data.maxHealth);
    if (healthBar) {
      const healthPercent = (data.health / data.maxHealth) * 100;
      healthBar.style.width = `${healthPercent}%`;
    }

    // 시간
    const timeEl = document.getElementById('gameTime');
    if (timeEl) {
      const minutes = Math.floor(data.time / 60);
      const seconds = Math.floor(data.time % 60);
      timeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 액티브 스킬
    const dashCharges = document.getElementById('dashCharges');
    if (dashCharges && data.activeSkills) {
      dashCharges.textContent = data.activeSkills.dash.charges;
    }

    const bombCooldown = document.getElementById('bombCooldown');
    if (bombCooldown && data.activeSkills) {
      if (data.activeSkills.bomb.isReady) {
        bombCooldown.style.height = '0%';
      } else {
        const cooldownPercent = (1 - data.activeSkills.bomb.cooldownProgress) * 100;
        bombCooldown.style.height = `${cooldownPercent}%`;
      }
    }

    // 무기 슬롯
    const slotsEl = document.getElementById('weaponSlots');
    if (slotsEl && data.weapons) {
      slotsEl.innerHTML = data.weapons.map(weapon => `
        <div style="background: rgba(0,0,0,0.7); padding: 8px; border-radius: 8px; min-width: 60px; text-align: center; border: 2px solid ${weapon.level >= weapon.maxLevel ? '#FFD700' : 'rgba(255,255,255,0.3)'};">
          <div style="color: white; font-size: 12px; margin-bottom: 3px;">${weapon.name}</div>
          <div style="color: ${weapon.level >= weapon.maxLevel ? '#FFD700' : '#4CAF50'}; font-size: 14px; font-weight: bold;">Lv ${weapon.level}</div>
        </div>
      `).join('');
    }
  }

  hideGameHUD() {
    const hud = document.getElementById('gameHUD');
    if (hud) hud.remove();
  }

  // 레벨업 선택 UI
  showLevelUpChoices(choices, onSelect) {
    const choicesHTML = `
      <div id="levelUpModal" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 200;">
        <h2 style="color: white; font-size: 36px; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">레벨 업!</h2>
        <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; max-width: 900px;">
          ${choices.map((choice, index) => `
            <div class="choice-card" data-index="${index}" style="
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
              padding: 25px;
              border-radius: 15px;
              min-width: 250px;
              max-width: 280px;
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
              border: 3px solid rgba(255,255,255,0.3);
            ">
              <div style="color: white; font-size: 24px; font-weight: bold; margin-bottom: 10px;">
                ${choice.icon || '⭐'} ${choice.name}
              </div>
              ${choice.level ? `<div style="color: #FFD700; font-size: 18px; margin-bottom: 10px;">Level ${choice.level}</div>` : ''}
              <div style="color: #E0E0E0; font-size: 14px; line-height: 1.5;">
                ${choice.description}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.overlay.innerHTML += choicesHTML;

    // 카드에 이벤트 리스너 추가
    document.querySelectorAll('.choice-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05) translateY(-5px)';
        card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1) translateY(0)';
        card.style.boxShadow = 'none';
      });
      card.addEventListener('click', () => {
        const index = parseInt(card.getAttribute('data-index'));
        const modal = document.getElementById('levelUpModal');
        if (modal) modal.remove();
        onSelect(choices[index]);
      });
    });
  }

  // 일시정지 메뉴
  showPauseMenu(onResume, onMainMenu) {
    const pauseHTML = `
      <div id="pauseMenu" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 150;">
        <h2 style="color: white; font-size: 42px; margin-bottom: 40px;">일시정지</h2>
        <button class="menu-button" id="resumeButton" style="
          padding: 15px 50px;
          font-size: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          margin-bottom: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        ">계속하기</button>
        <button class="menu-button" id="mainMenuButton" style="
          padding: 15px 50px;
          font-size: 20px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s;
        ">메인 메뉴</button>
      </div>
    `;

    this.overlay.innerHTML += pauseHTML;

    document.querySelectorAll('.menu-button').forEach(btn => {
      btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.05)');
      btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
    });

    document.getElementById('resumeButton').addEventListener('click', onResume);
    document.getElementById('mainMenuButton').addEventListener('click', onMainMenu);
  }

  hidePauseMenu() {
    const menu = document.getElementById('pauseMenu');
    if (menu) menu.remove();
  }

  // 게임 오버
  showGameOver(time, level, onRestart, onMainMenu) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const gameOverHTML = `
      <div id="gameOverModal" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 200;">
        <h1 style="color: #FF5252; font-size: 56px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">게임 오버</h1>
        <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin-bottom: 40px;">
          <div style="color: white; font-size: 24px; margin-bottom: 15px;">생존 시간: <span style="color: #4CAF50;">${timeString}</span></div>
          <div style="color: white; font-size: 24px;">도달 레벨: <span style="color: #FFD700;">${level}</span></div>
        </div>
        <button class="menu-button" id="restartButton" style="
          padding: 15px 50px;
          font-size: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          margin-bottom: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        ">다시 시작</button>
        <button class="menu-button" id="menuButton" style="
          padding: 15px 50px;
          font-size: 20px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s;
        ">메인 메뉴</button>
      </div>
    `;

    this.overlay.innerHTML += gameOverHTML;

    document.querySelectorAll('.menu-button').forEach(btn => {
      btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.05)');
      btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
    });

    document.getElementById('restartButton').addEventListener('click', onRestart);
    document.getElementById('menuButton').addEventListener('click', onMainMenu);
  }
}
