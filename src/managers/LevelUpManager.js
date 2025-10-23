export class LevelUpManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.passiveStats = [
      { name: 'moveSpeed', displayName: '이동 속도', value: 0.1, icon: '🏃' },
      { name: 'maxHealth', displayName: '최대 체력', value: 20, icon: '❤️' },
      { name: 'damage', displayName: '공격력', value: 0.1, icon: '⚔️' },
      { name: 'cooldown', displayName: '쿨다운 감소', value: 0.05, icon: '⏱️' },
      { name: 'areaSize', displayName: '범위 증가', value: 0.1, icon: '📏' },
      { name: 'magnet', displayName: '자석 범위', value: 30, icon: '🧲' }
    ];
  }

  showSkillChoices() {
    const choices = this.generateChoices();
    this.gameEngine.uiManager.showLevelUpChoices(choices, (choice) => {
      this.applyChoice(choice);
      this.gameEngine.gameState = 'playing';
    });
  }

  generateChoices() {
    const choices = [];
    const weaponManager = this.gameEngine.weaponManager;
    const currentWeapons = weaponManager.weaponSlots;
    const allWeapons = weaponManager.getAllWeaponNames();

    // 로직 1: 슬롯이 6개 미만일 때
    if (currentWeapons.length < weaponManager.maxSlots) {
      // 현재 보유 중인 무기 업그레이드 옵션
      const upgradableWeapons = currentWeapons.filter(w => !w.isMaxLevel());
      
      // 새로운 무기 옵션
      const availableWeapons = allWeapons.filter(name => !weaponManager.hasWeapon(name));

      // 패시브 스탯 옵션도 포함
      const allOptions = [
        ...upgradableWeapons.map(w => ({
          type: 'weapon_upgrade',
          name: w.name,
          level: w.currentLevel + 1,
          description: w.description
        })),
        ...availableWeapons.slice(0, 5).map(name => {
          const weapon = weaponManager.createWeapon(name);
          return {
            type: 'weapon_new',
            name: weapon.name,
            level: 1,
            description: weapon.description
          };
        }),
        ...this.passiveStats.slice(0, 2).map(stat => ({
          type: 'passive',
          name: stat.displayName,
          statName: stat.name,
          value: stat.value,
          icon: stat.icon,
          description: `${stat.displayName}을(를) 증가시킵니다.`
        }))
      ];

      // 무작위로 3개 선택
      const shuffled = allOptions.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    }

    // 로직 2: 슬롯이 6개 꽉 찼을 때
    const upgradableWeapons = currentWeapons.filter(w => !w.isMaxLevel());

    if (upgradableWeapons.length === 0) {
      // 로직 3: 모든 무기가 극대화되었을 때
      return [
        {
          type: 'item',
          name: '골드 주머니',
          description: '골드를 획득합니다. (현재 미구현)',
          icon: '💰'
        },
        {
          type: 'item',
          name: '치킨',
          description: '체력을 50 회복합니다.',
          icon: '🍗'
        },
        {
          type: 'passive',
          name: this.passiveStats[Math.floor(Math.random() * this.passiveStats.length)].displayName,
          statName: this.passiveStats[Math.floor(Math.random() * this.passiveStats.length)].name,
          value: this.passiveStats[Math.floor(Math.random() * this.passiveStats.length)].value,
          icon: this.passiveStats[Math.floor(Math.random() * this.passiveStats.length)].icon,
          description: '스탯을 증가시킵니다.'
        }
      ];
    }

    // 보유한 무기 중에서만 선택
    const weaponChoices = upgradableWeapons.map(w => ({
      type: 'weapon_upgrade',
      name: w.name,
      level: w.currentLevel + 1,
      description: w.description
    }));

    // 패시브 스탯도 포함
    const passiveChoices = this.passiveStats.slice(0, 2).map(stat => ({
      type: 'passive',
      name: stat.displayName,
      statName: stat.name,
      value: stat.value,
      icon: stat.icon,
      description: `${stat.displayName}을(를) 증가시킵니다.`
    }));

    const allOptions = [...weaponChoices, ...passiveChoices];
    const shuffled = allOptions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  applyChoice(choice) {
    const player = this.gameEngine.player;
    const weaponManager = this.gameEngine.weaponManager;

    switch (choice.type) {
    case 'weapon_new':
      weaponManager.addWeapon(choice.name);
      break;

    case 'weapon_upgrade':
      weaponManager.upgradeWeapon(choice.name);
      break;

    case 'passive':
      player.addPassiveStat(choice.statName, choice.value);
      break;

    case 'item':
      if (choice.name === '치킨') {
        player.heal(50);
      }
      break;
    }
  }
}
