```javascript
/**
 * Vertical Math Explainer Engine for Grade 2 (108 Curriculum)
 * Core Vertical Operations Scaffold (直式微步階鷹架)
 *
 * Scope:
 * 1. 2-digit Addition (no carry, units carry, double carry)
 * 2. 2-digit Subtraction (no borrow, borrow from tens)
 * 3. 3-digit Addition (carry)
 * 4. 3-digit Subtraction (single borrow from tens only; NO double borrow)
 * 5. Multiplication via Repeated Addition (e.g., 3x4 = 3+3+3+3)
 *
 * Data Structure:
 * - step_type: 'add_vertical' | 'sub_vertical' | 'mul_repeated_add'
 * - steps: Array of step objects
 *   - step_index: number
 *   - description: string (Chinese)
 *   - current_digit: 'units' | 'tens' | 'hundreds'
 *   - carry_flag: boolean
 *   - borrow_flag: boolean
 *   - ollie_guidance: string (encouraging hint for students)
 */

// Helper: Convert number to array of digits [units, tens, hundreds]
function toDigitArray(num) {
  const digits = [];
  let n = num;
  while (n > 0) {
    digits.push(n % 10);
    n = Math.floor(n / 10);
  }
  // Pad to ensure consistent length based on max digits needed
  return digits;
}

// Helper: Pad digit arrays to same length
function padDigits(arr, length) {
  const padded = [...arr];
  while (padded.length < length) {
    padded.push(0);
  }
  return padded;
}

// Helper: Format number with leading zeros for display
function formatNumber(num, digits) {
  return digits.map(d => d.toString()).join('');
}

// Helper: Generate Chinese description for addition step
function addStepDescription(stepIndex, digitPosition, digit1, digit2, carryIn, resultDigit, carryOut) {
  const posName = { units: '個位', tens: '十位', hundreds: '百位' }[digitPosition];
  const carryInStr = carryIn ? `加上進位 ${carryIn}` : '';
  const carryOutStr = carryOut ? `，向${posName === '個位' ? '十位' : '百位'}進位 ${carryOut}` : '';
  return `第${stepIndex}步：${posName}計算 ${digit1} + ${digit2} ${carryInStr} = ${resultDigit}${carryOutStr}`;
}

// Helper: Generate Chinese description for subtraction step
function subStepDescription(stepIndex, digitPosition, digit1, digit2, borrowIn, resultDigit, borrowOut) {
  const posName = { units: '個位', tens: '十位', hundreds: '百位' }[digitPosition];
  const borrowInStr = borrowIn ? `先向${posName === '個位' ? '十位' : '百位'}借1（即10）` : '';
  const borrowOutStr = borrowOut ? `，向${posName === '個位' ? '十位' : '百位'}借1` : '';
  return `第${stepIndex}步：${posName}計算 ${digit1} - ${digit2} ${borrowInStr} = ${resultDigit}${borrowOutStr}`;
}

// Helper: Generate Ollie guidance for addition
function addOllieGuidance(stepIndex, digitPosition, carryOut) {
  const posName = { units: '個位', tens: '十位', hundreds: '百位' }[digitPosition];
  if (carryOut) {
    return `小鷹提醒：${posName}的和超過10，要記得進位到下一位哦！`;
  } else {
    return `小鷹提醒：${posName}計算很順利，繼續加油！`;
  }
}

// Helper: Generate Ollie guidance for subtraction
function subOllieGuidance(stepIndex, digitPosition, borrowOut) {
  const posName = { units: '個位', tens: '十位', hundreds: '百位' }[digitPosition];
  if (borrowOut) {
    return `小鷹提醒：${posName}不夠減，要向高位借1，借來的是10！`;
  } else {
    return `小鷹提醒：${posName}計算很順利，繼續加油！`;
  }
}

// Helper: Generate Ollie guidance for multiplication via repeated addition
function mulOllieGuidance(stepIndex, multiplier, addend) {
  return `小鷹提醒：第${stepIndex}次加 ${addend}，已經加了${stepIndex}次，共 ${multiplier * addend}！`;
}

/**
 * Generate vertical addition steps for 2-digit or 3-digit numbers
 * Supports carry propagation
 */
function generateAddVerticalSteps(num1, num2) {
  const steps = [];
  const maxDigits = Math.max(toDigitArray(num1).length, toDigitArray(num2).length);
  const d1 = padDigits(toDigitArray(num1), maxDigits);
  const d2 = padDigits(toDigitArray(num2), maxDigits);

  let carry = 0;
  let stepIndex = 1;

  for (let i = 0; i < maxDigits; i++) {
    const digitPosition = i === 0 ? 'units' : i === 1 ? 'tens' : 'hundreds';
    const digit1 = d1[i];
    const digit2 = d2[i];
    const sum = digit1 + digit2 + carry;
    const resultDigit = sum % 10;
    const carryOut = Math.floor(sum / 10);

    const description = addStepDescription(stepIndex, digitPosition, digit1, digit2, carry, resultDigit, carryOut);
    const ollieGuidance = addOllieGuidance(stepIndex, digitPosition, carryOut);

    steps.push({
      step_index: stepIndex,
      description: description,
      current_digit: digitPosition,
      carry_flag: carryOut > 0,
      borrow_flag: false,
      ollie_guidance: ollieGuidance
    });

    carry = carryOut;
    stepIndex++;
  }

  // If there's a final carry, add an extra step for the new digit
  if (carry > 0) {
    const digitPosition = maxDigits === 2 ? 'hundreds' : 'thousands';
    const description = `第${stepIndex}步：進位產生新的${digitPosition === 'hundreds' ? '百位' : '千位'}數字 ${carry}`;
    const ollieGuidance = `小鷹提醒：最後的進位要寫在最高位！`;

    steps.push({
      step_index: stepIndex,
      description: description,
      current_digit: digitPosition,
      carry_flag: true,
      borrow_flag: false,
      ollie_guidance: ollieGuidance
    });
  }

  return steps;
}

/**
 * Generate vertical subtraction steps for 2-digit or 3-digit numbers
 * Supports single borrow from tens only (no double borrow)
 * Constraint: No double borrow (e.g., 100 - 25 is NOT allowed in this engine)
 */
function generateSubVerticalSteps(num1, num2) {
  const steps = [];
  const maxDigits = Math.max(toDigitArray(num1).length, toDigitArray(num2).length);
  const d1 = padDigits(toDigitArray(num1), maxDigits);
  const d2 = padDigits(toDigitArray(num2), maxDigits);

  let borrow = 0;
  let stepIndex = 1;

  for (let i = 0; i < maxDigits; i++) {
    const digitPosition = i === 0 ? 'units' : i === 1 ? 'tens' : 'hundreds';
    const digit1 = d1[i];
    const digit2 = d2[i];

    // Check for double borrow constraint: if digit1 < digit2 + borrow, we need to borrow
    // But we must ensure we don't have double borrow (borrow from hundreds when tens already borrowed)
    let effectiveDigit1 = digit1;
    let borrowOut = false;

    if (effectiveDigit1 < digit2 + borrow) {
      // Need to borrow from next higher position
      // Check if next position is available and not already borrowed from
      if (i < maxDigits - 1) {
        // Single borrow allowed
        effectiveDigit1 += 10;
        borrowOut = true;
      } else {
        // Cannot borrow from beyond highest digit - invalid for grade 2 constraints
        // This case should not occur in valid grade 2 problems
        throw new Error('Double borrow detected - not allowed in grade 2 vertical subtraction');
      }
    }

    const resultDigit = effectiveDigit1 - digit2 - borrow;
    const description = subStepDescription(stepIndex, digitPosition, digit1, digit2, borrow, resultDigit, borrowOut);
    const ollieGuidance = subOllieGuidance(stepIndex, digitPosition, borrowOut);

    steps.push({
      step_index: stepIndex,
      description: description,
      current_digit: digitPosition,
      carry_flag: false,
      borrow_flag: borrowOut,
      ollie_guidance: ollie_guidance
    });

    borrow = borrowOut ? 1 : 0;
    stepIndex++;
  }

  return steps;
}

/**
 * Generate multiplication via repeated addition steps
 * Example: 3x4 = 3+3+3+3
 */
function generateMulRepeatedAddSteps(multiplier, multiplicand) {
  const steps = [];
  let stepIndex = 1;
  let total = 0;

  for (let i = 0; i < multiplier; i++) {
    total += multiplicand;
    const description = `第${stepIndex}步：加 ${multiplicand}，目前總和 = ${total}`;
    const ollieGuidance = mulOllieGuidance(stepIndex, multiplier, multiplicand);

    steps.push({
      step_index: stepIndex,
      description: description,
      current_digit: 'units', // Repeated addition doesn't have positional digits in the same way
      carry_flag: false,
      borrow_flag: false,
      ollie_guidance: ollie_guidance
    });

    stepIndex++;
  }

  return steps;
}

/**
 * Main engine function: Generate steps for a given operation
 * @param {string} step_type - 'add_vertical' | 'sub_vertical' | 'mul_repeated_add'
 * @param {number} num1 - First number
 * @param {number} num2 - Second number
 * @returns {object} - { step_type