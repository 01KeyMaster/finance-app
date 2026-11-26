import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'

export default function BottomNav() {
  return (
    <nav className="nav">
      <NavLink to="/" end className="nav-item">
        <Icon name="home" />
        <span>Главная</span>
      </NavLink>
      <NavLink to="/forecast" className="nav-item">
        <Icon name="chart" />
        <span>Прогноз</span>
      </NavLink>
      <NavLink to="/rates" className="nav-item">
        <Icon name="globe" />
        <span>Курс</span>
      </NavLink>
    </nav>
  )
}
