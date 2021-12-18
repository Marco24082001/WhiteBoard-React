import React from "react";
import { useEffect, useContext} from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../helpers/AuthContext";
import Board from "../../components/board/Board";
import './style.css';


function Whiteboard() {
  const room = useParams();
  let history = useHistory();
  const {authState, setAuthState} = useContext(AuthContext);
  useEffect(() => {
    if(!localStorage.getItem("accessToken")){
      console.log(authState)
      history.push(`/login/${room.id}`)
    }
  }, []);

  return (
    <>
      <div class="board-container">
        <Board roomId = {room.id}></Board>
      </div>
    </>
    
  );
}

export default Whiteboard;
