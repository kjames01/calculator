'use client'

import { useState } from 'react'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<string | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [isDegrees, setIsDegrees] = useState(true)

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }

  const toRadians = (degrees: number) => degrees * (Math.PI / 180)

  const applyTrigFunction = (func: 'sin' | 'cos' | 'tan') => {
    const value = parseFloat(display)
    const angle = isDegrees ? toRadians(value) : value
    let result: number

    switch (func) {
      case 'sin':
        result = Math.sin(angle)
        break
      case 'cos':
        result = Math.cos(angle)
        break
      case 'tan':
        result = Math.tan(angle)
        break
    }

    // Round to avoid floating point errors like sin(180) = 1.2e-16
    result = Math.abs(result) < 1e-10 ? 0 : result
    setDisplay(String(result))
    setWaitingForOperand(true)
  }

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(display)
    } else if (operator) {
      const currentValue = parseFloat(previousValue)
      let result: number

      switch (operator) {
        case '+':
          result = currentValue + inputValue
          break
        case '-':
          result = currentValue - inputValue
          break
        case '×':
          result = currentValue * inputValue
          break
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 0
          break
        default:
          result = inputValue
      }

      setDisplay(String(result))
      setPreviousValue(String(result))
    }

    setWaitingForOperand(true)
    setOperator(nextOperator)
  }

  const calculate = () => {
    if (!operator || previousValue === null) return

    const inputValue = parseFloat(display)
    const currentValue = parseFloat(previousValue)
    let result: number

    switch (operator) {
      case '+':
        result = currentValue + inputValue
        break
      case '-':
        result = currentValue - inputValue
        break
      case '×':
        result = currentValue * inputValue
        break
      case '÷':
        result = inputValue !== 0 ? currentValue / inputValue : 0
        break
      default:
        result = inputValue
    }

    setDisplay(String(result))
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }

  const Button = ({
    children,
    onClick,
    className = ''
  }: {
    children: React.ReactNode
    onClick: () => void
    className?: string
  }) => (
    <button
      onClick={onClick}
      className={`text-xl font-semibold rounded-xl transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  )

  return (
    <div className="bg-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm">
      <div className="bg-slate-700 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setIsDegrees(!isDegrees)}
            className="text-xs px-2 py-1 rounded bg-slate-600 text-slate-300 hover:bg-slate-500"
          >
            {isDegrees ? 'DEG' : 'RAD'}
          </button>
        </div>
        <div className="text-right text-4xl font-light text-white truncate">
          {display}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {/* Row 1: Trig functions + AC + operators */}
        <Button
          onClick={() => applyTrigFunction('sin')}
          className="bg-purple-500 hover:bg-purple-600 text-white py-3"
        >
          sin
        </Button>
        <Button
          onClick={() => applyTrigFunction('cos')}
          className="bg-purple-500 hover:bg-purple-600 text-white py-3"
        >
          cos
        </Button>
        <Button
          onClick={() => applyTrigFunction('tan')}
          className="bg-purple-500 hover:bg-purple-600 text-white py-3"
        >
          tan
        </Button>
        <Button
          onClick={clear}
          className="bg-red-500 hover:bg-red-600 text-white py-3"
        >
          AC
        </Button>
        <Button
          onClick={() => performOperation('÷')}
          className="bg-amber-500 hover:bg-amber-600 text-white py-3"
        >
          ÷
        </Button>

        {/* Row 2: 7 8 9 × */}
        <Button
          onClick={() => inputDigit('7')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          7
        </Button>
        <Button
          onClick={() => inputDigit('8')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          8
        </Button>
        <Button
          onClick={() => inputDigit('9')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          9
        </Button>
        <Button
          onClick={() => performOperation('×')}
          className="col-span-2 bg-amber-500 hover:bg-amber-600 text-white py-3"
        >
          ×
        </Button>

        {/* Row 3: 4 5 6 - */}
        <Button
          onClick={() => inputDigit('4')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          4
        </Button>
        <Button
          onClick={() => inputDigit('5')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          5
        </Button>
        <Button
          onClick={() => inputDigit('6')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          6
        </Button>
        <Button
          onClick={() => performOperation('-')}
          className="col-span-2 bg-amber-500 hover:bg-amber-600 text-white py-3"
        >
          -
        </Button>

        {/* Row 4: 1 2 3 + */}
        <Button
          onClick={() => inputDigit('1')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          1
        </Button>
        <Button
          onClick={() => inputDigit('2')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          2
        </Button>
        <Button
          onClick={() => inputDigit('3')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          3
        </Button>
        <Button
          onClick={() => performOperation('+')}
          className="col-span-2 bg-amber-500 hover:bg-amber-600 text-white py-3"
        >
          +
        </Button>

        {/* Row 5: 0 . = */}
        <Button
          onClick={() => inputDigit('0')}
          className="col-span-2 bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          0
        </Button>
        <Button
          onClick={inputDecimal}
          className="bg-slate-600 hover:bg-slate-500 text-white py-3"
        >
          .
        </Button>
        <Button
          onClick={calculate}
          className="col-span-2 bg-green-500 hover:bg-green-600 text-white py-3"
        >
          =
        </Button>
      </div>
    </div>
  )
}
