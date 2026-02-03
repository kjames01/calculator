'use client'

import { useState } from 'react'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<string | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

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
      className={`text-2xl font-semibold rounded-xl transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  )

  return (
    <div className="bg-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-xs">
      <div className="bg-slate-700 rounded-2xl p-4 mb-4">
        <div className="text-right text-4xl font-light text-white truncate">
          {display}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Button
          onClick={clear}
          className="col-span-2 bg-red-500 hover:bg-red-600 text-white py-4"
        >
          AC
        </Button>
        <Button
          onClick={() => performOperation('÷')}
          className="bg-amber-500 hover:bg-amber-600 text-white py-4"
        >
          ÷
        </Button>
        <Button
          onClick={() => performOperation('×')}
          className="bg-amber-500 hover:bg-amber-600 text-white py-4"
        >
          ×
        </Button>

        <Button
          onClick={() => inputDigit('7')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          7
        </Button>
        <Button
          onClick={() => inputDigit('8')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          8
        </Button>
        <Button
          onClick={() => inputDigit('9')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          9
        </Button>
        <Button
          onClick={() => performOperation('-')}
          className="bg-amber-500 hover:bg-amber-600 text-white py-4"
        >
          -
        </Button>

        <Button
          onClick={() => inputDigit('4')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          4
        </Button>
        <Button
          onClick={() => inputDigit('5')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          5
        </Button>
        <Button
          onClick={() => inputDigit('6')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          6
        </Button>
        <Button
          onClick={() => performOperation('+')}
          className="bg-amber-500 hover:bg-amber-600 text-white py-4"
        >
          +
        </Button>

        <Button
          onClick={() => inputDigit('1')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          1
        </Button>
        <Button
          onClick={() => inputDigit('2')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          2
        </Button>
        <Button
          onClick={() => inputDigit('3')}
          className="bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          3
        </Button>
        <Button
          onClick={calculate}
          className="row-span-2 bg-green-500 hover:bg-green-600 text-white py-4"
        >
          =
        </Button>

        <Button
          onClick={() => inputDigit('0')}
          className="col-span-2 bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          0
        </Button>
        <Button
          onClick={inputDecimal}
          className="bg-slate-600 hover:bg-slate-500 text-white py-4"
        >
          .
        </Button>
      </div>
    </div>
  )
}
