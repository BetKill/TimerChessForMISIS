import React, { useReducer, useEffect, useState, useRef } from "react";
import StartMenu from '../components/StartMenu.jsx'; // Компонент начального меню
import ResultMenu from '../components/ResultMenu.jsx'; // Компонент меню результатов
import styles from '../styles/Index.module.css'; // Стили для приложения
import {
  AssistantAppState,
  AssistantClientCommand,
  createAssistant,
  createSmartappDebugger,
  CharacterId
} from '@salutejs/client'; // Импорт библиотеки для взаимодействия с виртуальным ассистентом

// Инициализация начального состояния таймера
const initialState = {
  topTimer: 0, // Время верхнего таймера в секундах
  bottomTimer: 00, // Время нижнего таймера в секундах
  isTopTimerRunning: false, // Флаг, указывающий, работает ли верхний таймер
  isBottomTimerRunning: false, // Флаг, указывающий, работает ли нижний таймер
  startMenu: true, // Флаг отображения начального меню
  winner: null, // Переменная для хранения результата игры
  screen: 'Start' // Текущий экран приложения
};

// Компонент таймера (Timer)
const Timer = (props: any) => {
  const { timerName, time, isMirrored, handleStart, color } = props;

  // Функция форматирования времени (часы:минуты:секунды)
  const formatTime = (time: any) => {
    const hours = Math.floor(time / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return hours === "00" ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
  };

  // Стиль для кнопки таймера
  const timerStyle = {
    transform: isMirrored ? "rotate(180deg)" : "none",
    width: "100%",
    fontSize: "50px",
    fontWeight: "bold",
    backgroundColor: `${color}`,
    color: color === "#FFFFFF" ? "black" : "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  // Центрирование таймера
  const divStyle = {
    display: "flex",
    justifyContent: "center",
    height: "100%",
  };

  return (
      <div style={divStyle}>
        <button style={timerStyle} onClick={() => handleStart(timerName)}>
          {formatTime(time)}
        </button>
      </div>
  );
};

// Главный компонент приложения (ChessTimer)
const ChessTimer = () => {
  // Редьюсер для управления состоянием приложения
  const reducer = (state: any, action: any) => {
    switch (action.type) {
      case "SETTIME": // Установка времени для обоих таймеров
        if (state.screen === 'Start') {
          return {
            ...state,
            topTimer: action.time,
            bottomTimer: action.time,
            startMenu: false,
            screen: 'Middle'
          };
        }
        return state;

      case "START": // Запуск таймера
        return action.timer === "top"
            ? { ...state, isBottomTimerRunning: true, isTopTimerRunning: false }
            : { ...state, isTopTimerRunning: true, isBottomTimerRunning: false };

      case "RESET": // Сброс состояния
        return { ...initialState };

      case "TICK": // Отсчёт времени
        if (state.isTopTimerRunning) {
          return {
            ...state,
            topTimer: state.topTimer > 0 ? state.topTimer - 1 : 0,
          };
        } else if (state.isBottomTimerRunning) {
          return {
            ...state,
            bottomTimer: state.bottomTimer > 0 ? state.bottomTimer - 1 : 0,
          };
        }
        return state;

      case "RESULT": // Определение победителя
        if (state.topTimer === 0 || state.bottomTimer === 0) {
          assistantRef.current?.sendAction({
            type: "result",
            payload: { "winner": state.topTimer === 0 ? 'Победили белые' : 'Победили черные' }
          });
          return {
            ...state,
            resultMenu: true,
            isTopTimerRunning: false,
            isBottomTimerRunning: false,
            winner: action.winner,
            screen: "END"
          };
        }
        return state;

      case "HELP": // Запрос помощи
        assistantRef.current?.sendAction({ type: "help", payload: { "screen": state.screen } });
        return state;

      case "MOVE": // Переключение хода
        return state.isBottomTimerRunning
            ? { ...state, isBottomTimerRunning: false, isTopTimerRunning: true }
            : { ...state, isBottomTimerRunning: true, isTopTimerRunning: false };

      default:
        return state;
    }
  };

  // Состояния и ссылки
  const [character, setCharacter] = useState('sber' as CharacterId);
  const assistantStateRef = useRef<AssistantAppState>({});
  const assistantRef = useRef<ReturnType<typeof createAssistant>>();
  const [portrait, setIsPortrait] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  // Инициализация ассистента
  useEffect(() => {
    const initializeAssistant = () => {
      checkOrientation();
      return createAssistant({
        getState: () => assistantStateRef.current,
      });
    };

    const assistant = initializeAssistant();
    assistant.on('data', (command: AssistantClientCommand) => {
      if (command.type === 'smart_app_data') {
        dispatch(command.smart_app_data);
      } else if (command.type === 'character') {
        setCharacter(command.character.id);
      }
    });
    assistantRef.current = assistant;
  }, []);

  // Таймеры для обновления времени
  useEffect(() => {
    let timer: any;
    if (state.isTopTimerRunning || state.isBottomTimerRunning) {
      timer = setInterval(() => dispatch({ type: "TICK" }), 1000);
    }
    return () => clearInterval(timer);
  }, [state.isTopTimerRunning, state.isBottomTimerRunning]);

  // Проверка окончания игры
  useEffect(() => {
    if (state.topTimer === 0 || state.bottomTimer === 0) {
      const winner = state.topTimer === 0 ? 'Победили белые' : 'Победили черные';
      dispatch({ type: "RESULT", winner });
    }
  }, [state.topTimer, state.bottomTimer]);

  // Проверка ориентации экрана
  const checkOrientation = () => {
    setIsPortrait(!window.matchMedia("(orientation: landscape)").matches);
  };

  useEffect(() => {
    window.addEventListener("resize", checkOrientation, false);
  }, []);

  // Обработчики действий
  const handleStart = (timer: any) => dispatch({ type: "START", timer });
  const handleReset = () => assistantRef.current?.sendAction({ type: "restart" });
  const hanleSetTime = (time: any) => dispatch({ type: "SETTIME", time });
  const handleHelp = () => assistantRef.current?.sendAction({ type: "help", payload: { "screen": state.screen } });

  // Рендер приложения
  return (
      <div className={styles.container}>
        {state.startMenu && <StartMenu hanleSetTime={hanleSetTime} />}
        {state.winner && <ResultMenu handleReset={handleReset} winner={state.winner} />}
        <div className={styles['timer-wrapper']}>
          <Timer timerName="top" time={state.topTimer} isMirrored={portrait} handleStart={handleStart} color={"#000000"} />
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={handleReset} className={styles.resetButton}>
            <img className={styles.icon} src="./restart.svg" alt="Restart" />
          </button>
          <button onClick={handleHelp} className={styles.resetButton}>
            <img className={styles.icon} src="./question.svg" alt="Help" />
          </button>
        </div>
        <div className={styles['timer-wrapper']}>
          <Timer timerName="bottom" time={state.bottomTimer} handleStart={handleStart} color={"#FFFFFF"} />
        </div>
      </div>
  );
};

export default ChessTimer;
