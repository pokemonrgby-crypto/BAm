// WeaponManager.js
import { MagicMissile } from '../weapons/MagicMissile.js';
import { Axe } from '../weapons/Axe.js';
import { Garlic } from '../weapons/Garlic.js';
import { HolyBible } from '../weapons/HolyBible.js';
import { HolyWater } from '../weapons/HolyWater.js';
import { Lightning, Satellite } from '../weapons/AdvancedWeapons1.js';
import { HomingMissile, FireBall, IceSpear } from '../weapons/AdvancedWeapons2.js';
import { LaserBeam, Boomerang, PoisonCloud } from '../weapons/AdvancedWeapons3.js';
import {
  Whirlwind, Meteor, ChainWhip, PulseWave, Shotgun,
  Drill, TimeStop, StormBlade, Shield, LifeSteal
} from '../weapons/AdvancedWeapons4.js';
import {
  PoisonDart, Minion, BombRain, ElectricShock, SpinningSword,
  Clone, GravityField, BeamSaber, Counter, WindBlast
} from '../weapons/AdvancedWeapons5.js';

export class WeaponManager {
  constructor(player) {
    this.player = player;
    this.weaponSlots = []; // 최대 6개
    this.maxSlots = 6;
  }

  reset() {
    this.weaponSlots = [];
  }

  update(dt, enemies) {
    this.weaponSlots.forEach(weapon => {
      weapon.update(dt, this.player, enemies);
    });
  }

  render(ctx) {
    this.weaponSlots.forEach(weapon => {
      if (weapon.render) {
        weapon.render(ctx, this.player);
      }
    });
  }

  addWeapon(weaponName) {
    if (this.weaponSlots.length >= this.maxSlots) {
      return false;
    }

    const weapon = this.createWeapon(weaponName);
    if (weapon) {
      this.weaponSlots.push(weapon);
      return true;
    }
    return false;
  }

  upgradeWeapon(weaponName) {
    const weapon = this.weaponSlots.find(w => w.name === weaponName);
    if (weapon) {
      return weapon.upgrade();
    }
    return false;
  }

  hasWeapon(weaponName) {
    return this.weaponSlots.some(w => w.name === weaponName);
  }

  getWeaponSlots() {
    return this.weaponSlots.map(w => ({
      name: w.name,
      level: w.currentLevel,
      maxLevel: w.maxLevel
    }));
  }

  createWeapon(weaponName) {
    const weaponMap = {
      '마법 지팡이': MagicMissile,
      '도끼': Axe,
      '마늘': Garlic,
      '성경': HolyBible,
      '성수': HolyWater,
      '전기장': Lightning,
      '위성': Satellite,
      '유도탄': HomingMissile,
      '화염탄': FireBall,
      '얼음 창': IceSpear,
      '레이저 빔': LaserBeam,
      '부메랑': Boomerang,
      '독구름': PoisonCloud,
      '회오리': Whirlwind,
      '운석': Meteor,
      '체인 소': ChainWhip,
      '펄스 웨이브': PulseWave,
      '샷건': Shotgun,
      '드릴': Drill,
      '시간 정지': TimeStop,
      '폭풍검': StormBlade,
      '방패': Shield,
      '흡혈 오라': LifeSteal,
      '독침': PoisonDart,
      '소환수': Minion,
      '폭탄 비': BombRain,
      '전기 충격': ElectricShock,
      '회전 검': SpinningSword,
      '분신': Clone,
      '중력장': GravityField,
      '광선검': BeamSaber,
      '카운터': Counter,
      '바람': WindBlast
    };

    const WeaponClass = weaponMap[weaponName];
    return WeaponClass ? new WeaponClass() : null;
  }

  getAllWeaponNames() {
    return [
      '마법 지팡이', '도끼', '마늘', '성경', '성수',
      '전기장', '위성', '유도탄', '화염탄', '얼음 창',
      '레이저 빔', '부메랑', '독구름', '회오리', '운석',
      '체인 소', '펄스 웨이브', '샷건', '드릴', '시간 정지',
      '폭풍검', '방패', '흡혈 오라', '독침', '소환수',
      '폭탄 비', '전기 충격', '회전 검', '분신', '중력장',
      '광선검', '카운터', '바람'
    ];
  }
}
