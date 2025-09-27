// Comment: Khởi tạo sự kiện DOM khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
  // Comment: Khai báo các thành phần giao diện
  const baseValue = document.getElementById("baseValue");
  const buffDebuffCount = document.getElementById("buffDebuffCount");
  const buffDebuffInputs = document.getElementById("buffDebuffInputs");
  const buffDebuffFields = document.getElementById("buffDebuffFields");
  const result = document.getElementById("result");
  const calculationSteps = document.getElementById("calculationSteps");
  const finalValue = document.getElementById("finalValue");
  const warning = document.getElementById("warning");
  const clearBtn = document.getElementById("clearBtn");
  const backToHomeBtn = document.getElementById("backToHomeBtn");

  // Comment: Interface Segregation - Định nghĩa các interface (dùng comment để mô phỏng)
  // ICalculator: { calculate() }
  // IStorage: { save(data), load(), clear() }

  // Comment: Single Responsibility - Class lưu trữ dữ liệu
  class LocalStorage {
    save(data) {
      localStorage.setItem("calcData", JSON.stringify(data));
    }

    load() {
      const raw = localStorage.getItem("calcData");
      return raw ? JSON.parse(raw) : { baseValue: 0, buffDebuffCount: 0, buffs: {} };
    }

    clear() {
      localStorage.removeItem("calcData");
    }
  }

  // Comment: Single Responsibility - Class quản lý giao diện
  class UIManager {
    constructor() {
      this.buffDebuffInputs = document.getElementById("buffDebuffInputs");
      this.buffDebuffFields = document.getElementById("buffDebuffFields");
    }

    updateBuffDebuffInputs(count, buffs) {
      const currentBuffs = {};
      // Lưu dữ liệu hiện tại của các ô đã nhập
      for (let i = 1; i <= buffDebuffCount.value; i++) {
        currentBuffs[`percentValue${i}`] = document.getElementById(`percentValue${i}`)?.value || buffs[`percentValue${i}`] || "";
        currentBuffs[`fixedValue${i}`] = document.getElementById(`fixedValue${i}`)?.value || buffs[`fixedValue${i}`] || "";
      }

      this.buffDebuffFields.innerHTML = "";
      this.buffDebuffInputs.style.display = count > 0 ? "block" : "none";

      if (count > 0) {
        for (let i = 1; i <= count; i++) {
          const group = document.createElement("div");
          group.className = "form-group";
          group.innerHTML = `
            <label>Buff/Debuff ${i}:</label>
            <input type="number" id="percentValue${i}" placeholder="Giá trị % (VD: 30 hoặc -20)" step="0.01" value="${currentBuffs[`percentValue${i}`] || ""}">
            <input type="number" id="fixedValue${i}" placeholder="Giá trị cố định (VD: 50 hoặc -50)" value="${currentBuffs[`fixedValue${i}`] || ""}">
          `;
          this.buffDebuffFields.appendChild(group);
        }
      }
    }

    showResult() {
      document.getElementById("result").style.display = "block";
    }

    updateCalculationSteps(steps) {
      document.getElementById("calculationSteps").textContent = steps;
    }

    updateFinalValue(value) {
      document.getElementById("finalValue").textContent = value;
    }

    showWarning(show) {
      document.getElementById("warning").style.display = show ? "block" : "none";
    }
  }

  // Comment: Open/Closed - Class tính toán (mở rộng được)
  class Calculator {
    constructor(baseValue, buffDebuffCount, buffs) {
      this.baseValue = parseFloat(baseValue) || 0;
      this.buffDebuffCount = parseInt(buffDebuffCount) || 0;
      this.buffs = buffs || {};
    }

    calculate() {
      // Comment: Công thức: Final Value = Base Value * (1 + buff1%) * ... + buff cố định1 + ...
      let finalValue = this.baseValue;
      let steps = `${this.baseValue}`;

      if (this.buffDebuffCount > 0) {
        for (let i = 1; i <= this.buffDebuffCount; i++) {
          const percentValue = parseFloat(this.buffs[`percentValue${i}`]) || 0;
          const percentFactor = 1 + (percentValue / 100);
          finalValue *= percentFactor;
          steps += ` * (100 ${percentValue >= 0 ? "+" : ""}${percentValue})%`;
        }
        steps += ` = ${finalValue.toFixed(2)}`; // Tạm thời hiển thị sau phần trăm
      }

      for (let i = 1; i <= this.buffDebuffCount; i++) {
        const fixedValue = parseFloat(this.buffs[`fixedValue${i}`]) || 0;
        if (fixedValue !== 0) {
          steps += ` ${fixedValue >= 0 ? "+" : ""}${fixedValue}`;
          finalValue += fixedValue;
        }
      }

      steps += ` = ${finalValue.toFixed(2)}`; // Hiển thị giá trị cuối cùng
      const showWarning = finalValue < 0;

      return { finalValue: Math.round(finalValue * 100) / 100, steps, showWarning };
    }
  }

  // Comment: Dependency Inversion - Class điều phối (sử dụng abstraction)
  class CalcController {
    constructor(storage, uiManager) {
      this.storage = storage;
      this.uiManager = uiManager;
      this.loadData();
      this.calculateValue(); // Tự động tính toán sau khi tải dữ liệu
      this.setupAutoUpdate();
    }

    loadData() {
      const data = this.storage.load();
      baseValue.value = data.baseValue;
      buffDebuffCount.value = data.buffDebuffCount;
      this.uiManager.updateBuffDebuffInputs(data.buffDebuffCount, data.buffs);
      for (let key in data.buffs) {
        const input = document.getElementById(key);
        if (input) input.value = data.buffs[key];
      }
    }

    saveData() {
      const data = {
        baseValue: baseValue.value,
        buffDebuffCount: buffDebuffCount.value,
        buffs: {}
      };
      for (let i = 1; i <= buffDebuffCount.value; i++) {
        data.buffs[`percentValue${i}`] = document.getElementById(`percentValue${i}`).value || "";
        data.buffs[`fixedValue${i}`] = document.getElementById(`fixedValue${i}`).value || "";
      }
      this.storage.save(data);
    }

    calculateValue() {
      const buffs = {};
      for (let i = 1; i <= buffDebuffCount.value; i++) {
        buffs[`percentValue${i}`] = document.getElementById(`percentValue${i}`).value || "";
        buffs[`fixedValue${i}`] = document.getElementById(`fixedValue${i}`).value || "";
      }
      const calculator = new Calculator(baseValue.value, buffDebuffCount.value, buffs);
      const { finalValue, steps, showWarning } = calculator.calculate();
      this.uiManager.updateCalculationSteps(steps);
      this.uiManager.updateFinalValue(finalValue);
      this.uiManager.showResult();
      this.uiManager.showWarning(showWarning);
      this.saveData();
    }

    clearData() {
      this.storage.clear();
      baseValue.value = "";
      buffDebuffCount.value = "0";
      this.uiManager.updateBuffDebuffInputs(0, {});
      result.style.display = "none";
      this.saveData();
    }

    setupAutoUpdate() {
      [baseValue, buffDebuffCount].forEach(input => {
        input.addEventListener("input", () => {
          this.uiManager.updateBuffDebuffInputs(buffDebuffCount.value, this.storage.load().buffs);
          this.calculateValue();
        });
      });
      buffDebuffFields.addEventListener("input", (e) => {
        if (e.target.matches("input")) this.calculateValue();
      });
    }
  }

  const storage = new LocalStorage();
  const uiManager = new UIManager();
  const controller = new CalcController(storage, uiManager);

  clearBtn.addEventListener("click", () => controller.clearData());
  backToHomeBtn.addEventListener("click", () => {
    window.location.href = "../home.html";
  });
});