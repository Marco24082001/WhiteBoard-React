import React from 'react';
import axios from 'axios';
import { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
// import { AuthContext } from '../../helpers/AuthContext';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {FaTrashAlt,FaEdit} from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import generate from 'shortid';
import crypto from 'crypto';
import './style.css';
const apiRoom = axios.create({
  baseURL: `${process.env.REACT_APP_API}/rooms/`,
})

const apiParticipations = axios.create({
  baseURL: `${process.env.REACT_APP_API}/participations/`,
})

function Home() {
  const [listOfRooms, setListOfRooms] = useState([]);
  // const { authState } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState('');
  let history = useHistory();
  
  // Const 
  const diffToast = (msg) => {
    toast(msg);
  }

  // add role admin
  const addRoleAdmin = (roomId, role_id)=> {
    let owner = {roomId: roomId, role_id: role_id}
    apiParticipations
      .post('create', owner, {  headers: {
        accessToken: localStorage.getItem('accessToken')
      }})
      .then((res) => {
        if(res.data.error) {
          alert(res.data.error);
        }
      });
  }

  const createRoom = () =>{
    // create board
    let roomId = crypto.randomBytes(30).toString("hex");
    const newRoom = {title:'Untitled', roomId: roomId};
    apiRoom
      .post('create', newRoom, {  headers: {
        accessToken: localStorage.getItem('accessToken')
    }})
      .then((res) => {
        if(res.data.error){
          alert(res.data.error);
        }else{
          // add admin
          let id  = res.data.id;
          if(id !== null) {
            addRoleAdmin(id, 1);
            history.push(`room/${res.data.roomId}`);
          }
        }
      })
  }
  
  const deleteRoom = (roomId) => {
    apiRoom.delete(`delete/${roomId}`, {  headers: {
      accessToken: localStorage.getItem('accessToken')
  }}).then((res) => {
      if(res.data.error){
        diffToast(res.data.error);
      }else{
        diffToast('deleta success');
        window.location.reload(false);
      }
    })
  }

  const enableTitle = (roomId) => {
    let boxtitle = document.getElementById('id01');
    boxtitle.style.display = 'block';
    setRoomId(roomId);
  }

  const unableTitle = (e) => {
    let boxtitle = document.getElementById('id01');
    boxtitle.style.display = 'none';
  }

  const editTitle = () => {
    const data = {roomId: roomId, title: title};
    apiRoom
      .put('updatetitle', data, { headers: {
        accessToken: localStorage.getItem('accessToken')
    }})
      .then((res) => {
        if(res.data.error){
          diffToast(res.data.error);
        }else{
          window.location.reload(false);
        }
      })
  }

  const handleKeypress_save = e => {
    // console.log(authState.socket);
    if(e.charCode === 13) {
      editTitle();
    }
  }
  useEffect(async () => {
    // window.location.reload(false);
    if(!localStorage.getItem('accessToken')){
      history.push('/login')
    }else{
      apiRoom.get('all', {  headers: {
        accessToken: localStorage.getItem('accessToken')
    }}).then((res) => {
        if(!res.data.error) {
          setListOfRooms(res.data);
        }
        else {
          console.log(res.data.error);
        }
        
      })
    }
  }, []);

  return (
    <>
      <div className='homeContainer'>
        <Navbar/>
        <div id='id01' className='editTitleForm'>
          <span>While board title</span>
          <input id='title' type='text' placeholder='Input title' onChange={(e) => {console.log(e.target.value); setTitle(e.target.value)}} onKeyPress={handleKeypress_save}/>
          <button id='editbtn_save' class='editbtn' onClick={editTitle}>Save</button>
          <button id='editbtn_cancel' class='editbtn' onClick={unableTitle}>Cancel</button>
        </div>
        <div className='box createButton' onClick={createRoom}>
          <div className='newBoardButtonPlusOutside shadowDefault' aria-hidden='true'>
            <div className='newBoardButtonPlusInside'>
              <svg className='addIcon' xmlns='http://www.w3.org/2000/svg' focusable='false'>
                <g><path d='M16,7.49219v1H8.5v7.5h-1v-7.5H0v-1H7.5v-7.5h1v7.5Z'></path></g>
              </svg>
            </div>
          </div>
          <div class='fontBody newBoardButtonCaption' aria-hidden='true'>Create new Whiteboard</div>
        </div>
        {listOfRooms.map((value, key) => {
          return (
            <div
              key={key}
              className='box boards'
              onClick={(e) => {
                if(e.srcElement == this)  history.push(`/room/${value.roomId}`);
              }}
              // style={{backgroundImage: `url(../../images/tl.webp)`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: '300px 300px'}}
            > 
              <div className='footer' onClick= {(e) => {
                e.stopPropagation();
                enableTitle(value.roomId);
              }}>
                <div className='editCaption' onClick={(e) => {enableTitle(value.roomId);}}><FaEdit style={{'width' : '30px', 'verticalAlign' : 'center'}}/>{
                  <span>{value.title}</span>
                }</div>
                <div className='dropdowns'>
                  <span className='dropdownbtn' onClick={(e) => {
                    e.stopPropagation();
                    deleteRoom(value.roomId);
                  }}><FaTrashAlt/></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Home;
