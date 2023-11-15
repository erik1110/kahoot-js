import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import styles from "./waitingRoom.module.css"

function WaitingRoom({ pin, socket }) {
  const [playerList, setPlayerList] = useState([])
  const [numPlayers, setNumPlayers] = useState(0);
  const isLanguageEnglish = useSelector((state) => state.language.isEnglish)

  useEffect(() => {
    const handlePlayerAdded = (player) => {
      setPlayerList((prevPlayerList) => [...prevPlayerList, player]);
      setNumPlayers((prevNumPlayers) => prevNumPlayers + 1);
    };
    socket.on("player-added", handlePlayerAdded);
    return () => {
      socket.off("player-added", handlePlayerAdded);
    };
  }, [socket]);

  const handleKickPlayer = (userName) => {
    // Emit a "kick-player" event to the server
    socket.emit("kick-player", {"userName": userName, "socketId": socket.id, "pin": pin});
    setPlayerList((prevPlayerList) =>
      prevPlayerList.filter((player) => player.userName !== userName)
    );
    setNumPlayers((prevNumPlayers) => prevNumPlayers - 1);
  };


  return (
    <div className={styles["waiting-room"]}>
      <h1 className={styles["title"]}>
        {isLanguageEnglish ? "Waiting room" : "等候廳"}
      </h1>
      <h2 className={styles["header"]}>
        {isLanguageEnglish
          ? "Show PIN to your students"
          : "請將 PIN 秀給學生"}
        : {pin}
      </h2>
      <div className={styles["players-list"]}>
        <div className={styles["leaderboard"]}>
          <h1 className={styles["leaderboard-title"]}>
            {isLanguageEnglish ? "Player List" : "玩家列表"}
          </h1>
          <p>{isLanguageEnglish ? "Current Players: " : "目前玩家人數："}{numPlayers}</p>
          {playerList.length > 0 ? (
            <ol>
              {playerList.map((player) => (
                <li key={player.playerId}>
                  <mark>{player.userName}</mark>
                  <small>{isLanguageEnglish ? "Student" : "學生"}</small>
                  <button key={`kick-${player.playerId}`} onClick={() => handleKickPlayer(player.userName)}>
                    {isLanguageEnglish ? "Kick" : "踢除"}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <h1 className={styles["leaderboard-title"]}>
              {isLanguageEnglish
                ? "No players yet"
                : "沒有學生"}
            </h1>
          )}
        </div>
      </div>
    </div>
  )
}

export default WaitingRoom
