import React, { useReducer, useEffect, useState, useRef } from "react";
import StartMenu from '../components/StartMenu.jsx';
import ResultMenu from '../components/ResultMenu.jsx';
import styles from '../styles/Index.module.css'
import {
  AssistantAppState,
  AssistantClientCommand,
  createAssistant,
  createSmartappDebugger,
  CharacterId
} from '@salutejs/client'


const initialState = {
  topTimer: 10,
  bottomTimer: 10,
  isTopTimerRunning: false,
  isBottomTimerRunning: false,
  startMenu: true,
  winner: null,
  screen: 'Start'
};


const Timer = (props: any) => {
  const { timerName, time, isMirrored, handleStart, color } = props;
  const formatTime = (time: any) => {
    const hours = Math.floor(time / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    if (hours === "00") {
      return `${minutes}:${seconds}`
    }
    else
      return `${hours}:${minutes}:${seconds}`;
  };


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

  const divStyle = {
    display: "flex",
    justifyContent: "center",
    height: "100%",
  }

  return (
    <div style={divStyle}>
      <button style={timerStyle} onClick={() => handleStart(timerName)}>{formatTime(time)}</button>
    </div>
  );
};

const ChessTimer = () => {

  const reducer = (state: any, action: any) => {
    switch (action.type) {
      case "SETTIME":
        if (state.screen === 'Start') {
          return {
            ...state,
            topTimer: action.time,
            bottomTimer: action.time,
            startMenu: false,
            screen: 'Middle'
          }
        }
        else {
          return state;
        }
      case "START":
        if (action.timer === "top") {
          return { ...state, isBottomTimerRunning: true, isTopTimerRunning: false };
        } else {
          return { ...state, isTopTimerRunning: true, isBottomTimerRunning: false };
        }
      case "RESET":
        return { ...initialState };
      case "TICK":
        if (state.isTopTimerRunning > 0) {
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
      case 'RESULT':
        if (state.topTimer === 0 || state.bottomTimer === 0) {
          assistantRef.current?.sendAction({ type: "result", payload: { "winner": state.topTimer === 0 ? 'Победили белые' : 'Победили черные' } })
          return {
            ...state,
            resultMenu: true,
            isTopTimerRunning: false,
            isBottomTimerRunning: false,
            winner: action.winner,
            screen: "END"
          }
        }
        return state;
      case 'HELP':
        assistantRef.current?.sendAction({ type: "help", payload: { "screen": state.screen } })
        return state;
      case 'MOVE':
        if (state.isBottomTimerRunning) {
          return {
            ...state,
            isBottomTimerRunning: false,
            isTopTimerRunning: true,
          }
        }
        else {
          return {
            ...state,
            isBottomTimerRunning: true,
            isTopTimerRunning: false,
          }
        }
      default:
        return state;
    }
  };

  const [character, setCharacter] = useState('sber' as CharacterId);
  const assistantStateRef = useRef<AssistantAppState>({});
  const assistantRef = useRef<ReturnType<typeof createAssistant>>();
  const [portrait, setIsPortrait] = useState(false)
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initializeAssistant = () => {
      checkOrientation()
      return createAssistant({
        getState: () => assistantStateRef.current,
      });
      // return createSmartappDebugger({
      //   token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJjNTYzMTc4Zi0xZGJhLTRiMDMtODNmYi1hMjI2NjkxNWI3MDciLCJzdWIiOiI0ZjQ2MzcyZDQ5MzAxZTkyOTU4ZTAwMDUyZmU5YmFkYjQyNjI4MjJjMDgxZGVkZGFjMmUzNWU3YzYwZmZiOWRhNTM5YmU5MjcwMDQyNjI5OCIsImlzcyI6IktFWU1BU1RFUiIsImV4cCI6MTY4NjIxNzc3NywiYXVkIjoiVlBTIiwiaWF0IjoxNjg2MTMxMzY3LCJ0eXBlIjoiQmVhcmVyIiwic2lkIjoiNWUxYmE2MDgtY2UzZS00ODIxLWIwOTctZDM1NzI2YWEwMWJkIn0.mWrMCtT4N1FFpoZwFoY0ouoQLRCZnSSCYYRys90atAGsgS6uyZTS21QUBm0Z20Hjd2iI_q0QQyML-W2-Y4h1OO_Jk2DZyECT-XDgThIMfpZd4gqJcVW9P1GdPkXTvLtfYzcMQqT29MXNlZBDR1FyfCd6bq-yNNI7buwaz3O-4TukNtu1h2yZR1qUvFmXNWVjNTQa-53GSJAap6-Uv1OQhopwat0jCWsLmravfN_0taktt06xHZ8ME6c0qfP5WxTjJA4MsgoxYS2KSPrd5rGM1XusTWoZChFCoSagw6XeiDXYXREahK7qfbv5NgIFYKCAolqF4RK-79pVCAB9jnv7RDuEIU5MP2tP0F7wZR2hsivjK0zMKOfnpjyNxQUtSaKugkKVaOIPDTqqDBB1KlRhEvsHid593XEVGKULNo1fN6AK1DBi89FE7WmD9MlcrNcxpYNnDQfBYGtG02UcbodON-SHIDliIx-qaG8RPT7Fx9YaQdv7gLBpxcaHzlIZ8JO_U3wZ7rLoWx6sIYCdK7x9P4ofj79u9unukzGA3jUCWc1zMDhtgXLZ6w1OIQaKYaEs0kGSVTuteO5jW0bDSgVUwFE4RbZJ991dspc59RHlbXFAJbrdZ5OKTC2F93au3XP_wN4jsyfiKKUpsKfXnGRt7cooyp3yqUkVPzFK-2JsXxI',
      //   initPhrase: 'Запусти Таймер для шахмат',
      //   getState: () => assistantStateRef.current,
      //   surface: "STARGATE"
      // });
    };

    const assistant = initializeAssistant();
    assistant.on('data', (command: AssistantClientCommand) => {
      switch (command.type) {
        case 'smart_app_data':
          dispatch(command.smart_app_data)
          break;
        case 'character':
          setCharacter(command.character.id);
          break;
        default:
          break;
      }
    });
    assistantRef.current = assistant;
  }, []);

  useEffect(() => {
    let timer: any;
    if (state.isTopTimerRunning || state.isBottomTimerRunning) {
      timer = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [state.isTopTimerRunning, state.isBottomTimerRunning]);

  useEffect(() => {
    if (state.topTimer === 0 || state.bottomTimer === 0) {
      const winner = state.topTimer === 0 ? 'Победили белые' : 'Победили черные'
      dispatch({ type: "RESULT", winner: winner })
    }
  }, [state.topTimer, state.bottomTimer])

  const checkOrientation = () => {
    if (window.matchMedia("(orientation: landscape)").matches) {
      setIsPortrait(false)
    }
    else {
      setIsPortrait(true)
    }
  };

  useEffect(() => {
    window.addEventListener("resize", checkOrientation, false);
  }, []);

  const handleStart = (timer: any) => {
    dispatch({ type: "START", timer: timer });
  };

  const handleReset = () => {
    assistantRef.current?.sendAction({ type: "restart" })
  };

  const hanleSetTime = (time: any) => {
    dispatch({ type: "SETTIME", time: time });
  }

  const handleHelp = () => {
    assistantRef.current?.sendAction({ type: "help", payload: { "screen": state.screen } })
  }

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
