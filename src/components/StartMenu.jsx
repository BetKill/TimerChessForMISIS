import React, { useState } from 'react';
import styles from '../styles/StartMenu.module.css'

export default function StartMenu({ hanleSetTime }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(1);

  const handleHoursChange = (event) => {
    setHours(parseInt(event.target.value))
  };

  const handleMinutesChange = (event) => {
    setMinutes(parseInt(event.target.value))

  };

  const handleSecondsChange = (event) => {
    setSeconds(parseInt(event.target.value))
  };

  const handleCheck = () => {
    const s = hours * 60 * 60 + minutes * 60 + seconds;
    if (s > 0) {
      hanleSetTime(s)
    }
  }

  return (
    <div className={styles['modal-container']}>
      <div className={styles['modal-content']}>
        <div>
          <h2>Установите таймер</h2>
          <label>
            Часы:
            <input type="number"
              placeholder='0'
              min='0'
              onChange={handleHoursChange}
            ></input>
          </label>
          <br />
          <label>
            Минуты:
            <input type="number"
              placeholder='0'
              min='0'
              onChange={handleMinutesChange}
            ></input>
          </label>
          <br />
          <label>
            Секунды:
            <input type="number"
              min='0'
              value={seconds}
              onChange={handleSecondsChange}
            ></input>
          </label>
          <br />
          <button onClick={() => handleCheck()}>Установить</button>
        </div>
      </div>
    </div>
  );
}
