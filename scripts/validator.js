import { regexRules } from "./app.js";

export function validate(r){
  if(!regexRules.number.test(r.amount)) return "Invalid amount";
  if(!regexRules.date.test(r.date)) return "Invalid date";
  if(!regexRules.category.test(r.category)) return "Invalid category";
  if(r.description.trim().length===0) return "Invalid description";
  return null;
}