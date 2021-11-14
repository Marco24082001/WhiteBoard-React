import React from 'react';
import axios from 'axios';
import { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../helpers/AuthContext';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {FaTrashAlt,FaEdit} from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import generate from 'shortid';
import './style.css';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API}/boards/`,
})

function Home() {
  const [listOfBoards, setListOfBoards] = useState([]);
  const { authState } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [boardId, setBoardId] = useState('');
  let history = useHistory();
  
  // Const 
  const diffToast = (msg) => {
    toast(msg);
  }

  const createBoard = () =>{
    const newBoard = {title:'Untitled', room: generate(), postText:'...'};
    api
      .post('create', newBoard, {  headers: {
        accessToken: localStorage.getItem('accessToken')
    }})
      .then((response) => {
        if(response.data.error){
          alert(response.data.error);
        }else{
          history.push(`board/${response.data.room}`);
        }
      })
  }
  
  const deleteBoard = (boardId) => {
    api.delete(`delete/${boardId}`, {  headers: {
      accessToken: localStorage.getItem('accessToken')
  }}).then((response) => {
      if(response.data.error){
        diffToast(response.data.error);
      }else{
        diffToast('deleta success');
        window.location.reload(false);
      }
    })
  }

  const enableTitle = (boardId) => {
    let boxtitle = document.getElementById('id01');
    boxtitle.style.display = 'block';
    setBoardId(boardId);
  }

  const unableTitle = (e) => {
    let boxtitle = document.getElementById('id01');
    boxtitle.style.display = 'none';
  }

  const editTitle = () => {
    const data = {boardId: boardId, title: title};
    api
      .put('updatetitle', {  headers: {
        accessToken: localStorage.getItem('accessToken')
    }}, data)
      .then((response) => {
        if(response.data.error){
          diffToast(response.data.error);
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
      api.get('all', {  headers: {
        accessToken: localStorage.getItem('accessToken')
    }}).then((response) => {
        if(!response.data.error) {
          setListOfBoards(response.data);
        }
        else {
          console.log(response.data.error);
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
        <div className='box createButton' onClick={createBoard}>
          <div className='newBoardButtonPlusOutside shadowDefault' aria-hidden='true'>
            <div className='newBoardButtonPlusInside'>
              <svg className='addIcon' xmlns='http://www.w3.org/2000/svg' focusable='false'>
                <g><path d='M16,7.49219v1H8.5v7.5h-1v-7.5H0v-1H7.5v-7.5h1v7.5Z'></path></g>
              </svg>
            </div>
          </div>
          <div class='fontBody newBoardButtonCaption' aria-hidden='true'>Create new Whiteboard</div>
        </div>
        {listOfBoards.map((value, key) => {
          return (
            <div
              key={key}
              className='box boards'
              onClick={(e) => {
                if(e.srcElement == this)  history.push(`/board/${value.room}`);
              }}
              style={{backgroundImage: `url(${value.dataUrl})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: '300px 300px'}}
            > 
              <div className='footer' onClick= {(e) => {
                e.stopPropagation();
                enableTitle(value.id);
              }}>
                <div className='editCaption' onClick={(e) => {enableTitle(value.id);}}><FaEdit style={{'width' : '30px', 'verticalAlign' : 'center'}}/>{
                  <span>{value.title}</span>
                }</div>
                <div className='dropdowns'>
                  <span className='dropdownbtn' onClick={(e) => {
                    e.stopPropagation();
                    deleteBoard(value.id);
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
