export function compileRegex(input){
  try { return new RegExp(input,"i"); }
  catch { return null; }
}

export function highlight(text,re){
  if(!re) return text;
  return text.replace(re,m=>`<mark>${m}</mark>`);
}

export const regexRules = {
  duplicate:/\b(\w+)\s+\1\b/i,
  number:/^(0|[1-9]\d*)(\.\d{1,2})?$/,
  date:/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  category:/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
};