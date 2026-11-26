import Icon from './Icon.jsx'

const keys = [
  { label: 'C', action: 'clear' },
  { label: '÷', action: 'op', value: '÷' },
  { label: '×', action: 'op', value: '×' },
  { label: 'back', action: 'back' },
  { label: '7', action: 'digit', value: '7' },
  { label: '8', action: 'digit', value: '8' },
  { label: '9', action: 'digit', value: '9' },
  { label: '−', action: 'op', value: '−' },
  { label: '4', action: 'digit', value: '4' },
  { label: '5', action: 'digit', value: '5' },
  { label: '6', action: 'digit', value: '6' },
  { label: '+', action: 'op', value: '+' },
  { label: '1', action: 'digit', value: '1' },
  { label: '2', action: 'digit', value: '2' },
  { label: '3', action: 'digit', value: '3' },
  { label: '=', action: 'equals' },
  { label: '0', action: 'digit', value: '0' },
  { label: '.', action: 'dot' }
]

export default function Keypad({ onKey }) {
  return (
    <div className="keypad">
      {keys.map((k) => {
        const cls =
          k.action === 'op' || k.action === 'equals'
            ? 'key key-op'
            : k.action === 'clear' || k.action === 'back'
              ? 'key key-soft'
              : 'key'
        const wide = k.label === '0' ? 'key-wide' : ''
        return (
          <button
            key={k.label}
            type="button"
            className={`${cls} ${wide}`}
            onClick={() => onKey(k)}
            aria-label={k.label === 'back' ? 'Стереть' : k.label}
          >
            {k.label === 'back' ? <Icon name="backspace" size={20} /> : k.label}
          </button>
        )
      })}
    </div>
  )
}
