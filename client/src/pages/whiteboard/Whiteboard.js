import React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import Board from "../../components/board/Board";
import './style.css';

function Whiteboard() {
  const room = useParams();
  let history = useHistory();
  useEffect(() => {
    if(!localStorage.getItem("accessToken")){
      history.push(`/login/${room.id}`)
    }
  }, []);

  return (
        <div class="board-container">
            <Board roomId = {room.id}></Board>
        </div>
  );
}

export default Whiteboard;
