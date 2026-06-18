import { regexRules } from "./app.js";

export function validate(r){
  if(!r.description || r.description.trim().length < 3)
    return "Description must be at least 3 characters";

  if(regexRules.duplicate.test(r.description))
    return "Description has duplicate words";

  if(!regexRules.number.test(r.amount))
    return "Amount must be a positive number (e.g. 10 or 10.50)";

  if(!regexRules.date.test(r.date))
    return "Date must be in YYYY-MM-DD format";

  if(!regexRules.category.test(r.category))
    return "Category must be letters only (e.g. Food or Food-Drink)";

  return null;
}