import { State } from "./state.js";
import { compileRegex, highlight } from "./app.js";

export function search(q){
  const re = compileRegex(q);

  return State.records.map(r=>({
    ...r,
    description: highlight(r.description,re)
  }));
}