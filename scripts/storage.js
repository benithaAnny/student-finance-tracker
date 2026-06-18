import { State } from "./state.js";

const KEY = "finance_app";

export function save() {
  localStorage.setItem(KEY, JSON.stringify(State.records));
}

export async function seed() {
  const saved = localStorage.getItem(KEY);

  if (saved) {
    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      State.records = parsed;
      return;
    }
  }

  const res = await fetch("./seed.json");
  const data = await res.json();

  State.records = data;
  save();
}