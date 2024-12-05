import React, { useState } from 'react';
import styles from '../styles/StartMenu.module.css';

export default function StartMenu({ handleSetTime }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(1);

  const handleInputChange = (event, setter) => {
    const value = parseInt(event.target.value) || 0;
    setter(value >= 0 ? value : 0); // Устанавливаем значение только для неотрицательных чисел
  };

  const handleSubmit = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds > 0) {
      handleSetTime(totalSeconds);
    } else {
      alert('Укажите значение больше нуля!');
    }
  };

  return (
    <div className={styles['modal-container']}>
      <div className={styles['modal-content']}>
        <h2>Установите таймер</h2>
        <form onSubmit={(e) => e.preventDefault()} className={styles['time-form']}>
          <label>
            Часы:
            <input
              type="number"
              placeholder="0"
              min="0"
              value={hours}
              onChange={(e) => handleInputChange(e, setHours)}
            />
          </label>
          <br />
          <label>
            Минуты:
            <input
              type="number"
              placeholder="0"
              min="0"
              value={minutes}
              onChange={(e) => handleInputChange(e, setMinutes)}
            />
          </label>
          <br />
          <label>
            Секунды:
            <input
              type="number"
              placeholder="0"
              min="1"
              value={seconds}
              onChange={(e) => handleInputChange(e, setSeconds)}
            />
          </label>
          <br />
          <button type="button" onClick={handleSubmit}>
            Установить
          </button>
        </form>
      </div>
    </div>
  );
}
