import { State } from "./state.js";
import { save, seed } from "./storage.js";
import { validate } from "./validator.js";
import { search } from "./search.js";
import { regexRules } from "./app.js";

export const UI = {

async init() {
  await seed();
  this.render();

  document.querySelector("#search")
    .addEventListener("input", (e) => {
      this.render(e.target.value);
    });

  document.getElementById("addBtn")
    .addEventListener("click", () => this.addRecord());

  document.getElementById("desc")
    .addEventListener("input", () => this.validateField("desc"));
  document.getElementById("amount")
    .addEventListener("input", () => this.validateField("amount"));
  document.getElementById("cat")
    .addEventListener("input", () => this.validateField("cat"));
  document.getElementById("date")
    .addEventListener("input", () => this.validateField("date"));

  const settingsBtn   = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");

  settingsBtn.addEventListener("click", () => {
    const isOpen = settingsPanel.style.display === "block";
    settingsPanel.style.display = isOpen ? "none" : "block";
    settingsBtn.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) {
      const firstFocusable = settingsPanel.querySelector("select, input, button");
      if (firstFocusable) firstFocusable.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (
      !settingsPanel.contains(e.target) &&
      !settingsBtn.contains(e.target)
    ) {
      settingsPanel.style.display = "none";
      settingsBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && settingsPanel.style.display === "block") {
      settingsPanel.style.display = "none";
      settingsBtn.setAttribute("aria-expanded", "false");
      settingsBtn.focus();
    }
  });

  document.getElementById("importLabel")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.getElementById("importFile").click();
    }
  });

  document.getElementById("exportBtn")?.addEventListener("click", () => {
    const blob = new Blob(
      [JSON.stringify(State.records, null, 2)],
      { type: "application/json" }
    );
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
        if (!Array.isArray(parsed)) return this.showError("Invalid file format");
        State.records = parsed;
        save(State.records);
        this.render();
      } catch {
        this.showError("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  });

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
  const savedTheme  = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.className = savedTheme;
    if (themeSelect) themeSelect.value = savedTheme;
  }

  themeSelect?.addEventListener("change", (e) => {
    document.body.className = e.target.value;
    localStorage.setItem("theme", e.target.value);
    this.render();
  });
},


setFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);
  if (!input || !error) return;
  if (message) {
    error.textContent = message;
    input.classList.add("invalid");
    input.classList.remove("valid");
  } else {
    error.textContent = "";
    input.classList.remove("invalid");
    input.classList.add("valid");
  }
},


validateField(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const val = input.value.trim();

  if (fieldId === "desc") {
    if (val.length < 3)
      this.setFieldError("desc", "At least 3 characters required");
    else if (regexRules.duplicate.test(val))
      this.setFieldError("desc", "Duplicate words detected");
    else
      this.setFieldError("desc", "");
  }

  if (fieldId === "amount") {
    if (!regexRules.number.test(val))
      this.setFieldError("amount", "Enter a valid amount (e.g. 10 or 10.50)");
    else
      this.setFieldError("amount", "");
  }

  if (fieldId === "cat") {
    if (!regexRules.category.test(val))
      this.setFieldError("cat", "Letters only (e.g. Food or Food-Drink)");
    else
      this.setFieldError("cat", "");
  }

  if (fieldId === "date") {
    if (!regexRules.date.test(val))
      this.setFieldError("date", "Use YYYY-MM-DD format");
    else
      this.setFieldError("date", "");
  }
},


showError(msg) {
  alert(msg);
},

addRecord() {
  const desc   = document.getElementById("desc");
  const amount = document.getElementById("amount");
  const type   = document.getElementById("type");
  const cat    = document.getElementById("cat");
  const date   = document.getElementById("date");

  this.validateField("desc");
  this.validateField("amount");
  this.validateField("cat");
  this.validateField("date");

  const r = {
    id: crypto.randomUUID(),
    description: desc.value,
    amount: Math.abs(Number(amount.value)),
    category: cat.value,
    date: date.value,
    type: type.value,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const err = validate(r);
  if (err) return;

  State.records.push(r);
  save(State.records);
  this.render();

  desc.value   = "";
  amount.value = "";
  type.value   = "expense";
  cat.value    = "";
  date.value   = "";

  ["desc","amount","cat","date"].forEach(id => {
    const el = document.getElementById(id);
    const er = document.getElementById(`${id}-error`);
    if (el) { el.classList.remove("valid","invalid"); }
    if (er) { er.textContent = ""; }
  });
},

deleteRecord(id) {
  State.records = State.records.filter(r => r.id !== id);
  save(State.records);
  this.render();
},

saveEdit(id) {
  const record = State.records.find(r => r.id === id);
  if (!record) return;

  const row = document.getElementById(`edit-${id}`);
  if (!row) return;

  const description = row.querySelector(".edit-desc").value.trim();
  const amount      = row.querySelector(".edit-amount").value;
  const type        = row.querySelector(".edit-type").value;
  const category    = row.querySelector(".edit-cat").value.trim();
  const date        = row.querySelector(".edit-date").value;

  if (!description || !amount || !category || !date) {
    return this.showError("Please fill all fields");
  }

  record.description = description;
  record.amount      = Math.abs(Number(amount));
  record.type        = type;
  record.category    = category;
  record.date        = date;
  record.updatedAt   = new Date().toISOString();

  save(State.records);
  this.render();
},

render(q = "") {
  const list = document.querySelector("#list");
  list.innerHTML = "";

  const data = q ? search(q) : State.records;

  if (data.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = q
      ? "No records match your search."
      : "No records yet. Add your first record above.";
    list.appendChild(empty);
  }

  let income   = 0;
  let expenses = 0;
  const catTotals = {};

  data.forEach(r => {
    const amt = Number(r.amount);

    if (r.type === "income") {
      income += amt;
    } else {
      expenses += amt;
    }

    const cat = r.category || "Uncategorised";
    catTotals[cat] = (catTotals[cat] || 0) + amt;

    const div = document.createElement("div");
    div.className = "item";

    const info = document.createElement("div");
    info.innerHTML = `
      <b>${r.description}</b><br>
      <small>${r.category} | ${r.date} | ${r.type} | ${r.amount}</small>
    `;

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn_group";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => this.deleteRecord(r.id));

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      const existing = document.getElementById(`edit-${r.id}`);
      if (existing) { existing.remove(); return; }
      document.querySelectorAll(".edit-form").forEach(f => f.remove());

      const form = document.createElement("div");
      form.className = "edit-form";
      form.id = `edit-${r.id}`;

      form.innerHTML = `
        <label>Description</label>
        <input class="edit-desc" type="text" value="${r.description}">
        <label>Amount</label>
        <input class="edit-amount" type="number" value="${r.amount}">
        <label>Type</label>
        <select class="edit-type">
          <option value="expense" ${r.type === "expense" ? "selected" : ""}>Expense</option>
          <option value="income"  ${r.type === "income"  ? "selected" : ""}>Income</option>
        </select>
        <label>Category</label>
        <input class="edit-cat" type="text" value="${r.category}">
        <label>Date</label>
        <input class="edit-date" type="date" value="${r.date}">
      `;

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.addEventListener("click", () => this.saveEdit(r.id));

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.className = "cancel-btn";
      cancelBtn.addEventListener("click", () => form.remove());

      form.append(saveBtn, cancelBtn);
      div.insertAdjacentElement("afterend", form);
    });

    btnGroup.append(delBtn, editBtn);
    div.append(info, btnGroup);
    list.appendChild(div);
  });

  const balance   = income - expenses;
  const budget    = Number(localStorage.getItem("budgetTarget")) || 0;
  const remaining = budget - expenses;

  const topEntry = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const topCat   = topEntry ? `${topEntry[0]} (${topEntry[1].toFixed(2)})` : "—";

  document.querySelector("#stats").innerHTML = `
    <p>Total Records: <strong>${State.records.length}</strong></p>
    <p>Income: <strong>${income.toFixed(2)}</strong></p>
    <p>Expenses: <strong>${expenses.toFixed(2)}</strong></p>
    <p>Balance: <strong>${balance.toFixed(2)}</strong></p>
    <p>Top Category: <strong>${topCat}</strong></p>
  `;

  const targetBox = document.querySelector("#targetStats");
  if (targetBox) {
    targetBox.innerHTML = budget
      ? `<p>Budget: ${budget.toFixed(2)}</p>
         <p>Spent: ${expenses.toFixed(2)}</p>
         <p>Remaining: ${remaining.toFixed(2)}</p>`
      : "No target set";
  }

  const alertBox = document.getElementById("budgetAlert");
  if (alertBox) {
    if (budget && remaining < 0) {
      alertBox.setAttribute("aria-live", "assertive");
      alertBox.style.color = "#c0392b";
      alertBox.textContent = `⚠️ Budget exceeded by ${Math.abs(remaining).toFixed(2)}!`;
    } else if (budget) {
      alertBox.setAttribute("aria-live", "polite");
      alertBox.style.color = "#27ae60";
      alertBox.textContent = `✅ ${remaining.toFixed(2)} remaining of your ${budget.toFixed(2)} budget.`;
    } else {
      alertBox.textContent = "";
    }
  }

  this.renderChart();
},

renderChart() {
  const container = document.getElementById("chart");
  if (!container) return;

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key   = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const total = State.records
      .filter(r => r.date === key && r.type === "expense")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    days.push({ label, total });
  }

  const max = Math.max(...days.map(d => d.total), 1);
  container.innerHTML = "";

  days.forEach(({ label, total }) => {
    const heightPct = ((total / max) * 100).toFixed(1);

    const col = document.createElement("div");
    col.className = "bar-col";

    const val = document.createElement("span");
    val.className = "bar-val";
    val.textContent = total > 0 ? total.toFixed(0) : "";

    const bar = document.createElement("div");
    bar.className = "bar-fill";
    bar.style.height    = total > 0 ? `${heightPct}%` : "0";
    bar.style.minHeight = total > 0 ? "4px" : "0";
    bar.setAttribute("aria-label", `${label}: ${total.toFixed(2)} spent`);

    const lbl = document.createElement("span");
    lbl.className = "bar-label";
    lbl.textContent = label;

    col.append(val, bar, lbl);
    container.appendChild(col);
  });
}

};

UI.init().then(() => {
  window.UI = UI;
});