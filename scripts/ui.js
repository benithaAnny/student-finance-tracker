import { State } from "./state.js";
import { save, seed } from "./storage.js";
import { validate } from "./validator.js";
import { search } from "./search.js";

export const UI = {

async init(){
  await seed();
  this.render();

  
  document.querySelector("#search")
  .addEventListener("input",(e)=>{
    this.render(e.target.value);
  });
},

addRecord(){

  
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  
  const err = validate(r);
  if(err) return alert(err);

  
  if(!r.description || !r.amount || !r.category || !r.date){
    return alert("Please fill all fields");
  }

  
  State.records.push(r);
  save(State.records);

  this.render();

  
  const status = document.querySelector("#status");
  if(status){
    status.textContent = "✅ Record added successfully!";
    setTimeout(()=> status.textContent = "", 3000);
  }

  
  desc.value = "";
  amount.value = "";
  cat.value = "";
  date.value = "";
},

deleteRecord(id){
  State.records = State.records.filter(r => r.id !== id);
  save(State.records);
  this.render();
},

render(q=""){

  const list = document.querySelector("#list");
  list.innerHTML = "";

  const data = q ? search(q) : State.records;

  let total = 0;

  data.forEach(r => {
    total += Number(r.amount);

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

  document.querySelector("#stats").innerHTML = `
    Total Records: ${State.records.length}<br>
    Total Amount: ${total}
  `;
}
};

UI.init();
window.UI = UI;