// ===============================
// Damage.js
// ===============================

// Class tính toán sát thương
class DamageCalculator {
  constructor(attackCount) {
    this.attackCount = parseInt(attackCount) || 0;
  }

  calculateDamage() {
    const results = [];

    for (let i = 0; i < this.attackCount; i++) {
      // Lấy giá trị từ các input
      const attackValue = parseFloat(document.getElementById(`attackValue${i}`)?.value) || 0;
      const damageType = document.getElementById(`damageType${i}`)?.value || "None";
      const trueDamageChecked = document.getElementById(`trueDamage${i}`)?.checked || false;
      const pierceDamageChecked = document.getElementById(`pierceDamage${i}`)?.checked || false;
      const antiTrue = document.getElementById(`antiTrue${i}`)?.checked || false;
      const antiPierce = document.getElementById(`antiPierce${i}`)?.checked || false;
      let resistance = parseFloat(document.getElementById(`resistance${i}`)?.value) || 0;

      // [CẬP NHẬT] Nếu hệ None, hệ số kháng là 0
      if (damageType === "None") resistance = 0;

      // Thu thập các giá trị modifier
      const modifierFields = document.getElementById(`modifierFields${i}`);
      const percentModifiers = [];
      const fixedModifiers = [];

      if (modifierFields && modifierFields.children.length > 0) {
        let count = 1;
        for (let field of modifierFields.children) {
          const percentMod = parseFloat(field.querySelector(`#percentMod${i}_${count}`)?.value) || 0;
          const fixedMod = parseFloat(field.querySelector(`#fixedMod${i}_${count}`)?.value) || 0;
          percentModifiers.push(percentMod);
          fixedModifiers.push(fixedMod);
          count++;
        }
      }
      
      const hasTrueDamage = trueDamageChecked && !antiTrue;
      const hasPierceDamage = pierceDamageChecked && !antiPierce;

      let damageTaken = attackValue;
      let formula = "";
      
      // [CẬP NHẬT] Logic cho True Damage: giá trị kháng không được vượt quá 0
      let effectiveResistance = resistance;
      if (hasTrueDamage) {
        effectiveResistance = Math.min(resistance, 0);
      }

      // [CẬP NHẬT] Công thức mới: nhân với (1 - resistance)
      const resistanceFactor = 1 - effectiveResistance;

      // Hàm trợ giúp xây dựng chuỗi công thức, xử lý dấu +/-
      const buildFormula = (base, percents, fixeds, resFactor) => {
          const percentStr = percents.map(p => `(100${p >= 0 ? ' - ' : ' + '}${Math.abs(p)})%`).join(" * ");
          const fixedStr = fixeds.map(f => f >= 0 ? ` - ${f}` : ` + ${Math.abs(f)}`).join("");
          return `(${base} * ${percentStr || "1"}${fixedStr}) * ${resFactor.toFixed(2)}`;
      };

      if (hasTrueDamage) {
        // True Damage: Bỏ qua modifier % và Cố định dương (giảm ST). Chỉ áp dụng các giá trị âm (tăng ST).
        const applicablePercentMods = percentModifiers.filter(m => m < 0);
        const applicableFixedMods = fixedModifiers.filter(m => m < 0);

        const percentFactor = applicablePercentMods.reduce((acc, res) => acc * (100 - res) / 100, 1);
        const totalFixed = applicableFixedMods.reduce((a, b) => a + b, 0);
        
        damageTaken = (attackValue * percentFactor - totalFixed) * resistanceFactor;
        formula = buildFormula(attackValue, applicablePercentMods, applicableFixedMods, resistanceFactor);

      } else if (hasPierceDamage) {
        // Pierce Damage: Bỏ qua modifier Cố định dương (giảm ST). Áp dụng tất cả modifier % và Cố định âm.
        const applicableFixedMods = fixedModifiers.filter(m => m < 0);

        const percentFactor = percentModifiers.reduce((acc, res) => acc * (100 - res) / 100, 1);
        const totalFixed = applicableFixedMods.reduce((a, b) => a + b, 0);
        
        damageTaken = (attackValue * percentFactor - totalFixed) * resistanceFactor;
        formula = buildFormula(attackValue, percentModifiers, applicableFixedMods, resistanceFactor);
        
      } else {
        // Normal Damage: Áp dụng tất cả modifier.
        const percentFactor = percentModifiers.reduce((acc, res) => acc * (100 - res) / 100, 1);
        const totalFixed = fixedModifiers.reduce((a, b) => a + b, 0);
        damageTaken = (attackValue * percentFactor - totalFixed) * resistanceFactor;
        formula = buildFormula(attackValue, percentModifiers, fixedModifiers, resistanceFactor);
      }

      damageTaken = Math.round(damageTaken * 100) / 100;

      // [CẬP NHẬT] Logic hiển thị kết quả cuối cùng dựa trên sát thương âm (hồi máu)
      let finalMessage = "";
      if (damageTaken < 0) {
          const healing = Math.abs(damageTaken);
          finalMessage = `Công thức: ${formula}<br> ➜ Bạn hấp thụ và hồi phục ${healing} HP. (Lưu ý: Giới hạn hồi phục mỗi lượt có thể được áp dụng.)`;
      } else {
          const finalDamage = Math.max(0, damageTaken);
          finalMessage = `Công thức: ${formula}<br> ➜ Sát thương bạn phải nhận là ${finalDamage}`;
      }

      results.push({
        damage: damageTaken,
        message: finalMessage
      });
    }

    return results;
  }
}

// ===============================
// UI Manager
// ===============================
class DamageUIManager {
  constructor() {
    this.container = document.getElementById("damageCalculator");
    this.addAttackBtn = document.getElementById("addAttackBtn");
    this.clearBtn = document.createElement("button");
    this.clearBtn.textContent = "Xóa tất cả";
    this.clearBtn.className = "btn btn-danger";
    this.container.parentNode.insertBefore(this.clearBtn, this.addAttackBtn.nextSibling);

    this.damageTypes = ["Kinetic", "Pressure", "Force", "None"];
  }

  renderAttackInputs(count, attacks = []) {
    this.container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const attack = attacks[i] || {};
      const group = document.createElement("div");
      group.className = "attack-group";
      group.innerHTML = `
        <h3>Đòn tấn công ${i + 1}</h3>
        <div class="form-group">
          <label for="attackValue${i}">Sát thương:</label>
          <input type="number" id="attackValue${i}" value="${attack.value || 0}">
        </div>
        <div class="form-group">
          <label for="damageType${i}">Hệ sát thương:</label>
          <select id="damageType${i}" class="damageType-select">
            ${this.damageTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Hiệu ứng sát thương:</label>
          <label><input type="checkbox" id="trueDamage${i}"> True Damage</label>
          <label><input type="checkbox" id="pierceDamage${i}"> Pierce Damage</label>
        </div>
        <div class="form-group">
          <label for="modifierFields${i}">Modifier của người nhận sát thương:</label>
          <small class="help">Nhập giá trị dương để giảm sát thương, giá trị âm để tăng sát thương nhận vào.</small>
          <button class="btn" onclick="addModifier(${i})">Thêm giá trị modifier</button>
          <div id="modifierFields${i}"></div>
        </div>
        <div class="form-group">
          <label for="resistance${i}">Hệ số kháng:</label>
          <input type="number" id="resistance${i}" step="0.01" value="0">
        </div>
        <div class="form-group">
          <label for="antiTrue${i}">Anti True Damage:</label>
          <input type="checkbox" id="antiTrue${i}">
        </div>
        <div class="form-group">
          <label for="antiPierce${i}">Anti Pierce Damage:</label>
          <input type="checkbox" id="antiPierce${i}">
        </div>
        <div id="damageResult${i}" class="result"></div>
      `;
      this.container.appendChild(group);

      document.getElementById(`damageType${i}`).addEventListener('change', (e) => {
        const resistanceInput = document.getElementById(`resistance${i}`);
        if (e.target.value === 'None') {
          resistanceInput.disabled = true;
          // [CẬP NHẬT] Set giá trị về 0 nếu là None
          resistanceInput.value = 0;
        } else {
          resistanceInput.disabled = false;
        }
        this.triggerCalculation();
      });
    }
    this.triggerCalculation();
  }

  triggerCalculation() {
    const controller = window.damageController;
    if (controller) controller.calculateDamage();
  }

  updateDamageResult(index, result) {
    const div = document.getElementById(`damageResult${index}`);
    div.innerHTML = `<p>${result.message}</p>`;
    div.style.display = "block";
  }
}

// ===============================
// Local Storage
// ===============================
class DamageLocalStorage {
  save(data) {
    localStorage.setItem("damageData", JSON.stringify(data));
  }

  load() {
    const raw = localStorage.getItem("damageData");
    return raw ? JSON.parse(raw) : { attackCount: 1, attacks: [] };
  }

  clear() {
    localStorage.removeItem("damageData");
  }
}

// ===============================
// Damage Controller
// ===============================
class DamageController {
  constructor(storage, uiManager) {
    this.storage = storage;
    this.uiManager = uiManager;
    this.attackCount = 1;
    this.loadData();
    this.setupEventListeners();
    this.calculateDamage();
  }

  loadData() {
    const data = this.storage.load();
    this.attackCount = data.attackCount || 1;
    this.uiManager.renderAttackInputs(this.attackCount, data.attacks);
  }

  saveData() {
    const data = { attackCount: this.attackCount };
    this.storage.save(data);
  }

  calculateDamage() {
    const attackCount = this.uiManager.container.children.length;
    const calculator = new DamageCalculator(attackCount);
    const results = calculator.calculateDamage();
    results.forEach((res, i) => this.uiManager.updateDamageResult(i, res));
    this.saveData();
  }

  addAttack() {
    this.attackCount++;
    this.uiManager.renderAttackInputs(this.attackCount, []);
  }

  clearData() {
    this.storage.clear();
    this.attackCount = 1;
    this.uiManager.renderAttackInputs(this.attackCount, []);
  }



  setupEventListeners() {
    this.uiManager.addAttackBtn.addEventListener("click", () => this.addAttack());
    this.uiManager.clearBtn.addEventListener("click", () => this.clearData());
    this.uiManager.container.addEventListener("input", () => this.calculateDamage());
    this.uiManager.container.addEventListener("change", () => this.calculateDamage());
  }
}

// ===============================
// Hàm quản lý Modifier
// ===============================
function addModifier(index) {
  const modifierFields = document.getElementById(`modifierFields${index}`);
  const count = modifierFields.children.length + 1;
  const group = document.createElement("div");
  group.className = "form-group";
  group.innerHTML = `
    <label>Modifier ${count}:</label>
    <input type="number" id="percentMod${index}_${count}" placeholder="Modifier dạng % (30, 50, -100)">
    <input type="number" id="fixedMod${index}_${count}" placeholder="Modifier dạng cố định (20, 40, -200)">
    <button class="btn btn-danger" onclick="removeModifier(this)">Xóa</button>
  `;
  modifierFields.appendChild(group);

  const controller = window.damageController;
  if (controller) controller.calculateDamage();
}

function removeModifier(button) {
    const fieldToRemove = button.parentElement;
    if (fieldToRemove) {
        fieldToRemove.parentElement.removeChild(fieldToRemove);
        const controller = window.damageController;
        if (controller) controller.calculateDamage();
    }
}


// ===============================
// Khởi tạo
// ===============================
window.damageStorage = new DamageLocalStorage();
window.damageUIManager = new DamageUIManager();
window.damageController = new DamageController(window.damageStorage, window.damageUIManager);