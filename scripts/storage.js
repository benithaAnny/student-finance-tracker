import { State } from "./state.js";

const KEY = "finance_app";

export function save(){
  localStorage.setItem(KEY, JSON.stringify(State.records));
}

export function load(){
  const d = localStorage.getItem(KEY);
  if(d) State.records = JSON.parse(d);
}

export async function seed(){
  const existing = localStorage.getItem("finance_app");

  if(existing) return;

  const res = await fetch("../seed.json");
  const data = await res.json();

  State.records = data;
  save();
}