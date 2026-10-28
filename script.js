const screen = document.querySelector('.screen');
const buttons = document.querySelector('.buttons');
let expression = '';
let justCalculated = false;

function toRpn(input) {
  const tokens = input.match(/\d*\.?\d+|[()+\-*/]/g) || [];
  const output = [];
  const operators = [];
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, 'u-': 3 };
  let previous = 'start';

  for (const token of tokens) {
    // если токен число то сразу в output
    if (/^\d/.test(token) || token.startsWith('.')) {
      output.push(token);
      previous = 'number';
    } 
    
    // если ( в стек
    else if (token === '(') {
      operators.push(token);
      previous = '(';
    } 
    
    // если )
    //  Пока стек не пустой и наверху нет (, 
    // оператор снимается из стека и добавляется в output
    //  Затем снимается сама (  в выход она не попадает.
    else if (token === ')') {
      while (operators.length && operators.at(-1) !== '(') output.push(operators.pop());
      operators.pop();
      previous = ')';
    } else {
      let op = token;
      if (op === '-' && (previous === 'start' || previous === 'operator' || previous === '(')) op = 'u-';
      while (operators.length && operators.at(-1) !== '(' &&
        (precedence[operators.at(-1)] > precedence[op] ||
          (precedence[operators.at(-1)] === precedence[op] && op !== 'u-'))) {
        output.push(operators.pop());
      }
      operators.push(op);
      previous = 'operator';
    }
  }
  while (operators.length) output.push(operators.pop());
  return output;
}

function evaluate(rpn) {
  const stack = [];
  for (const token of rpn) {
    if (token === 'u-') {
      stack.push(-stack.pop());
    } else if (['+', '-', '*', '/'].includes(token)) {
      const right = stack.pop();
      const left = stack.pop();
      stack.push(token === '+' ? left + right : token === '-' ? left - right : token === '*' ? left * right : left / right);
    } else {
      stack.push(Number(token));
    }
  }
  return stack[0];
}


buttons.addEventListener('click', (event) => {
  
  const button = event.target.closest('button');

  if (!button) 
    return;

  
  if (button.classList.contains('clear')) {
    expression = '';
    justCalculated = false;
    screen.textContent = '0';
    return;
  }

  
  if (button.classList.contains('result')) {
    
    if (!expression)
      return;
    const value = evaluate(toRpn(expression));

    
    expression = String(Number(value.toFixed(2)));
    screen.textContent = expression;
    justCalculated = true;
    return;
  }

  // считываем текст кнопки 
  const value = button.textContent.trim();
  
  // стираем старый результат
  if (justCalculated && (button.classList.contains('digit') || value === '(')) 
    expression = '';

  // новое выражение
  justCalculated = false;
  
  const normalized = value === '×' ? '*' : value === '÷' ? '/' : value === '−' ? '-' : value;
  
  expression += normalized;
  screen.textContent = expression;
});
