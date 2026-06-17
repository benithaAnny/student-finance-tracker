import { State } from "./state.js";
import { save, seed } from "./storage.js";
import { validate } from "./validator.js";
import { search } from "./search.js";

export const UI = {

async init() {
  await seed();
  this.render();

  // SEARCH
  document.querySelector("#search")
    .addEventListener("input", (e) => {
      this.render(e.target.value);
    });
    

  // SETTINGS TOGGLE (clean single version)
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");

  settingsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    settingsPanel.style.display =
      settingsPanel.style.display === "block" ? "none" : "block";
  });
  document.getElementById("exportBtn")?.addEventListener("click", () => {
  const data = JSON.stringify(State.records, null, 2);

  const blob = new Blob([data], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "finance-data.json";
  a.click();
});

document.getElementById("importFile")?.addEventListener("change", (e) => {
  const file = e.target.files[0];

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);

      if (!Array.isArray(parsed)) {
        return alert("Invalid file format");
      }

      State.records = parsed;
      save(State.records);

      this.render();
    } catch {
      alert("Invalid JSON file");
    }
  };

  reader.readAsText(file);
});

  // BUDGET TARGET
  const savedTarget = localStorage.getItem("budgetTarget");
  if (savedTarget) {
    document.querySelector("#budgetTarget").value = savedTarget;
  }

  document.querySelector("#saveTarget")
    .addEventListener("click", () => {
      const val = Number(document.querySelector("#budgetTarget").value);
      localStorage.setItem("budgetTarget", val);
      this.render();
    });

  
  const themeSelect = document.getElementById("themeSelect");

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.className = savedTheme;
    if (themeSelect) themeSelect.value = savedTheme;
  }

  themeSelect?.addEventListener("change", (e) => {
    document.body.className = e.target.value;
    localStorage.setItem("theme", e.target.value);
  });
},

addRecord() {

  const desc = document.querySelector("#desc");
  const amount = document.querySelector("#amount");
  const cat = document.querySelector("#cat");
  const date = document.querySelector("#date");

  const r = {
    id: crypto.randomUUID(),
    description: desc.value,
    amount: Number(amount.value),
    category: cat.value,
    date: date.value,
    type: Number(amount.value) >= 0 ? "income" : "expense",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const err = validate(r);
  if (err) return alert(err);

  if (!r.description || !r.amount || !r.category || !r.date) {
    return alert("Please fill all fields");
  }

  State.records.push(r);
  save(State.records);

  this.render();

  desc.value = "";
  amount.value = "";
  cat.value = "";
  date.value = "";
},

deleteRecord(id) {
  State.records = State.records.filter(r => r.id !== id);
  save(State.records);
  this.render();
},

render(q = "") {

  const list = document.querySelector("#list");
  list.innerHTML = "";

  const data = q ? search(q) : State.records;

  let income = 0;
  let expenses = 0;

  data.forEach(r => {

    if (r.type === "income") {
      income += Number(r.amount);
    } else {
      expenses += Number(r.amount);
    }

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div>
        <b>${r.description}</b><br>
        <small>${r.category} | ${r.date}</small>
      </div>

      <div>
        ${r.amount}
        <button onclick="UI.deleteRecord('${r.id}')">X</button>
      </div>
    `;

    list.appendChild(div);
  });

  const balance = income - expenses;
  const budget = Number(localStorage.getItem("budgetTarget")) || 0;
  const remaining = budget - expenses;

  document.querySelector("#stats").innerHTML = `
    <p>Total Records: ${State.records.length}</p>
    <p>Income: ${income}</p>
    <p>Expenses: ${expenses}</p>
    <p>Balance: ${balance}</p>
  `;

  const targetBox = document.querySelector("#targetStats");
  if (targetBox) {
    targetBox.innerHTML = budget
      ? `
        <p>Budget: ${budget}</p>
        <p>Spent: ${expenses}</p>
        <p>Remaining: ${remaining}</p>
      `
      : "No target set";
  }
}

};

UI.init();
window.UI = UI;