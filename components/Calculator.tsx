'use client'

import { useReducer, useEffect, useCallback, memo } from 'react'

// --- Types ---

type Operator = '+' | '-' | '×' | '÷'
type TrigFunc = 'sin' | 'cos' | 'tan'

interface CalculatorState {
  display: string
  previousValue: string | null
  operator: Operator | null
  waitingForOperand: boolean
  isDegrees: boolean
}

type CalculatorAction =
  | { type: 'INPUT_DIGIT'; digit: string }
  | { type: 'INPUT_DECIMAL' }
  | { type: 'CLEAR' }
  | { type: 'PERFORM_OPERATION'; operator: Operator }
  | { type: 'CALCULATE' }
  | { type: 'APPLY_TRIG'; func: TrigFunc }
  | { type: 'TOGGLE_DEGREES' }
  | { type: 'BACKSPACE' }

// --- Pure helpers (outside component) ---

const toRadians = (degrees: number) => degrees * (Math.PI / 180)

function computeResult(left: number, op: Operator, right: number): number {
  switch (op) {
    case '+': return left + right
    case '-': return left - right
    case '×': return left * right
    case '÷': return right !== 0 ? left / right : NaN
  }
}

function formatResult(num: number): string {
  if (!isFinite(num) || isNaN(num)) return 'Error'
  return String(parseFloat(num.toPrecision(12)))
}

// --- Reducer ---

const initialState: CalculatorState = {
  display: '0',
  previousValue: null,
  operator: null,
  waitingForOperand: false,
  isDegrees: true,
}

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'INPUT_DIGIT': {
      if (state.display === 'Error') return { ...state, display: action.digit, waitingForOperand: false }
      if (state.waitingForOperand) {
        return { ...state, display: action.digit, waitingForOperand: false }
      }
      return { ...state, display: state.display === '0' ? action.digit : state.display + action.digit }
    }

    case 'INPUT_DECIMAL': {
      if (state.display === 'Error') return { ...state, display: '0.', waitingForOperand: false }
      if (state.waitingForOperand) {
        return { ...state, display: '0.', waitingForOperand: false }
      }
      if (!state.display.includes('.')) {
        return { ...state, display: state.display + '.' }
      }
      return state
    }

    case 'CLEAR':
      return initialState

    case 'PERFORM_OPERATION': {
      if (state.display === 'Error') return state
      const inputValue = parseFloat(state.display)

      if (state.previousValue === null) {
        return {
          ...state,
          previousValue: state.display,
          waitingForOperand: true,
          operator: action.operator,
        }
      }

      if (state.operator) {
        const currentValue = parseFloat(state.previousValue)
        const result = computeResult(currentValue, state.operator, inputValue)
        const resultStr = formatResult(result)
        return {
          ...state,
          display: resultStr,
          previousValue: resultStr === 'Error' ? null : resultStr,
          operator: resultStr === 'Error' ? null : action.operator,
          waitingForOperand: true,
        }
      }

      return {
        ...state,
        waitingForOperand: true,
        operator: action.operator,
      }
    }

    case 'CALCULATE': {
      if (!state.operator || state.previousValue === null || state.display === 'Error') return state
      const inputValue = parseFloat(state.display)
      const currentValue = parseFloat(state.previousValue)
      const result = computeResult(currentValue, state.operator, inputValue)
      return {
        ...state,
        display: formatResult(result),
        previousValue: null,
        operator: null,
        waitingForOperand: true,
      }
    }

    case 'APPLY_TRIG': {
      if (state.display === 'Error') return state
      const value = parseFloat(state.display)
      const angle = state.isDegrees ? toRadians(value) : value
      let result: number

      switch (action.func) {
        case 'sin': result = Math.sin(angle); break
        case 'cos': result = Math.cos(angle); break
        case 'tan': result = Math.tan(angle); break
      }

      if (Math.abs(result) < 1e-10) result = 0
      if (Math.abs(result) > 1e10) {
        return { ...state, display: 'Error', waitingForOperand: true }
      }

      return { ...state, display: formatResult(result), waitingForOperand: true }
    }

    case 'TOGGLE_DEGREES':
      return { ...state, isDegrees: !state.isDegrees }

    case 'BACKSPACE': {
      if (state.display === 'Error' || state.waitingForOperand) return state
      const newDisplay = state.display.slice(0, -1)
      if (newDisplay === '' || newDisplay === '-') {
        return { ...state, display: '0' }
      }
      return { ...state, display: newDisplay }
    }

    default:
      return state
  }
}

// --- Button component (outside Calculator, memoized) ---

const btnStyles = {
  digit: 'bg-slate-600 hover:bg-slate-500 text-white py-3',
  operator: 'bg-amber-700 hover:bg-amber-800 text-white py-3',
  operatorActive: 'bg-white text-amber-700 py-3 ring-2 ring-amber-400',
  trig: 'bg-purple-600 hover:bg-purple-700 text-white py-3',
  clear: 'bg-red-700 hover:bg-red-800 text-white py-3',
  equals: 'bg-green-700 hover:bg-green-800 text-white py-3',
}

const Button = memo(function Button({
  children,
  onClick,
  className = '',
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`text-xl font-semibold rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 ${className}`}
    >
      {children}
    </button>
  )
})

// --- Calculator component ---

export default function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState)
  const { display, operator, isDegrees } = state

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key

    if (/^[0-9]$/.test(key)) {
      e.preventDefault()
      dispatch({ type: 'INPUT_DIGIT', digit: key })
      return
    }
    if (key === '.' || key === 'Decimal') {
      e.preventDefault()
      dispatch({ type: 'INPUT_DECIMAL' })
      return
    }
    if (key === '+' || key === 'Add') {
      e.preventDefault()
      dispatch({ type: 'PERFORM_OPERATION', operator: '+' })
      return
    }
    if (key === '-' || key === 'Subtract') {
      e.preventDefault()
      dispatch({ type: 'PERFORM_OPERATION', operator: '-' })
      return
    }
    if (key === '*' || key === 'Multiply') {
      e.preventDefault()
      dispatch({ type: 'PERFORM_OPERATION', operator: '×' })
      return
    }
    if (key === '/' || key === 'Divide') {
      e.preventDefault()
      dispatch({ type: 'PERFORM_OPERATION', operator: '÷' })
      return
    }
    if (key === 'Enter' || key === '=') {
      e.preventDefault()
      dispatch({ type: 'CALCULATE' })
      return
    }
    if (key === 'Escape' || key === 'Delete') {
      e.preventDefault()
      dispatch({ type: 'CLEAR' })
      return
    }
    if (key === 'Backspace') {
      e.preventDefault()
      dispatch({ type: 'BACKSPACE' })
      return
    }
    if (key === 's') {
      e.preventDefault()
      dispatch({ type: 'APPLY_TRIG', func: 'sin' })
      return
    }
    if (key === 'c') {
      e.preventDefault()
      dispatch({ type: 'APPLY_TRIG', func: 'cos' })
      return
    }
    if (key === 't') {
      e.preventDefault()
      dispatch({ type: 'APPLY_TRIG', func: 'tan' })
      return
    }
    if (key === 'd') {
      e.preventDefault()
      dispatch({ type: 'TOGGLE_DEGREES' })
      return
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="bg-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm" role="application" aria-label="Calculator">
      <div className="bg-slate-700 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_DEGREES' })}
            role="switch"
            aria-checked={isDegrees}
            aria-label={isDegrees ? 'Angle mode: degrees. Press to switch to radians' : 'Angle mode: radians. Press to switch to degrees'}
            className="text-xs px-2 py-1 rounded bg-slate-600 text-slate-300 hover:bg-slate-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700"
          >
            {isDegrees ? 'DEG' : 'RAD'}
          </button>
        </div>
        <output
          aria-live="polite"
          aria-label="Calculator display"
          className="block text-right text-2xl sm:text-4xl font-light text-white truncate"
        >
          {display}
        </output>
      </div>
      <div className="grid grid-cols-5 gap-2" role="group" aria-label="Calculator buttons">
        {/* Row 1: Trig functions + AC + ÷ */}
        <Button onClick={() => dispatch({ type: 'APPLY_TRIG', func: 'sin' })} className={btnStyles.trig} ariaLabel="sine">
          sin
        </Button>
        <Button onClick={() => dispatch({ type: 'APPLY_TRIG', func: 'cos' })} className={btnStyles.trig} ariaLabel="cosine">
          cos
        </Button>
        <Button onClick={() => dispatch({ type: 'APPLY_TRIG', func: 'tan' })} className={btnStyles.trig} ariaLabel="tangent">
          tan
        </Button>
        <Button onClick={() => dispatch({ type: 'CLEAR' })} className={btnStyles.clear} ariaLabel="All clear">
          AC
        </Button>
        <Button
          onClick={() => dispatch({ type: 'PERFORM_OPERATION', operator: '÷' })}
          className={operator === '÷' ? btnStyles.operatorActive : btnStyles.operator}
          ariaLabel="divide"
        >
          ÷
        </Button>

        {/* Row 2: 7 8 9 × */}
        <Button onClick={() => dispatch({ type: 'INPUT_DIGIT', digit: '7' })} className={btnStyles.digit}>7</Button>
        <Button onClick={() => dispatch({ type: 'INPUT_DIGIT', digit: '8' })} className={btnStyles.digit}>8</Button>
        <Button onClick={() => dispatch({ type: 'INPUT_DIGIT', digit: '9' })} className={btnStyles.digit}>9</Button>
        <Button
          onClick={() => dispatch({ type: 'PERFORM_OPERATION', operator: '×' })}
          className={`col-span-2 ${operator === '×' ? btnStyles.operatorActive : btnStyles.operator}`}
          ariaLabel="multiply"
        >
          ×
        </Button>

        {/* Row 3: 4 5 6 - */}
        <Button onClick={() => dispatch({ type: 'INPUT_DIGIT', digit: '4' })} className={btnStyles.digit}>4</Button>
        <Button onClick={() => dispatch({ type: 'INPUT_DIGIT', digit: '5' })} className={btnStyles.digit}>5</Button>
        <Button onClick={() => dispatch({ type: 'INPUT_DIGIT', digit: '6' })} className={btnStyles.digit}>6</Button>
        <Button
          onClick={() => dispatch({ type: 'PERFORM_OPERATION', operator: '-' })}
          className={`col-span-2 ${operator === '-' ? btnStyles.operatorActive : btnStyles.operator}`}
          ariaLabel="subtract"
        >
          -
        </Button>

        {/* Row 4: 1 2 3 + */}
        <Button onClick={() => dispatch({ type: 'INPUT_DIGIT', digit: '1' })} className={btnStyles.digit}>1</Button>
        <Button onClick={() => dispatch({ type: 'INPUT_DIGIT', digit: '2' })} className={btnStyles.digit}>2</Button>
        <Button onClick={() => dispatch({ type: 'INPUT_DIGIT', digit: '3' })} className={btnStyles.digit}>3</Button>
        <Button
          onClick={() => dispatch({ type: 'PERFORM_OPERATION', operator: '+' })}
          className={`col-span-2 ${operator === '+' ? btnStyles.operatorActive : btnStyles.operator}`}
          ariaLabel="add"
        >
          +
        </Button>

        {/* Row 5: 0 . = */}
        <Button onClick={() => dispatch({ type: 'INPUT_DIGIT', digit: '0' })} className={`col-span-2 ${btnStyles.digit}`}>0</Button>
        <Button onClick={() => dispatch({ type: 'INPUT_DECIMAL' })} className={btnStyles.digit} ariaLabel="decimal point">.</Button>
        <Button onClick={() => dispatch({ type: 'CALCULATE' })} className={`col-span-2 ${btnStyles.equals}`} ariaLabel="equals">
          =
        </Button>
      </div>
    </div>
  )
}
