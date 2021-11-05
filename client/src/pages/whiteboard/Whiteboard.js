import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import Board from "../../components/board/Board";
import './style.css';

function Whiteboard() {
  const room = useParams();
  const [listOfPosts, setListOfPosts] = useState([]);
  let history = useHistory();
  useEffect(() => {
    if(!localStorage.getItem("accessToken")){
      history.push(`/login/${room.id}`)
    }
  }, []);

  return (
    <div className ="container">
        <div className="color-picker-container">
            <input type="color"/>
        </div>
        <div class="board-container">
            <Board roomId = {room.id}></Board>
        </div>
    </div>
  );
}

export default Whiteboard;
