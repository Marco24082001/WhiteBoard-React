import React, { useRef, useState, useEffect, useContext } from 'react';
import axios from 'axios';
// import {useHistory } from "react-router-dom";
import { AuthContext } from "../../helpers/AuthContext";
import {toast} from 'react-toastify';
import Control from '../control/Control';
import Chat from '../chat/Chat';
import {IoMdTrash} from 'react-icons/io';
import {AiTwotoneLock} from 'react-icons/ai';

import './style.css';

const apiRoom = axios.create({
  baseURL: `${process.env.REACT_APP_API}/rooms/`
});

const apiBoard = axios.create({
  baseURL: `${process.env.REACT_APP_API}/boards/`
});

const apiParticipations = axios.create({
  baseURL: `${process.env.REACT_APP_API}/participations/`,
});


// const apiUser = axios.create({
//   baseURL: `${process.env.REACT_APP_API}/users/`
// })

const Board = (props) => {
  // const roomId = props.roomId;
  const room = useRef(props.roomId);
  const [listOfBoards, setListOfBoards] = useState([]);
  const {authState} = useContext(AuthContext);
  const canvasRef = useRef(null);
  const spreadCanvasRef = useRef(null);
  const previousBoard = useRef([])
  const tool = useRef('pencil');
  const color = useRef('#00000');
  const size = useRef(10);
  const timeout = useRef();
  const previous = useRef([]);
  const title = useRef();
  const status = useRef(true);
  const boardId = useRef(null);
  const index = useRef(-1);
  const [boardid, setBoardid] = useState(null);
  
  const diffToast = (msg) => {
    toast(msg);
    toast.clearWaitingQueue();
  }
  
  // emit data
  const emitCanvas = () => {
    if(timeout.current !== undefined) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
          let base64ImageData = canvasRef.current.toDataURL("image/png");
          let roomId = room.current;
          previousBoard.current.push(base64ImageData)
          authState.socket.emit("canvas-data", {roomId, boardid,base64ImageData});
          updateBoard(base64ImageData);
        }, 0);
  }

  const emitUndoCanvas = () => {
    if(timeout.current !== undefined) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
          let base64ImageData = canvasRef.current.toDataURL("image/png");
          let roomId = room.current;
          previousBoard.current.push(base64ImageData)
          authState.socket.emit("undoBoard", {roomId, boardid,base64ImageData});
          updateBoard(base64ImageData);
        }, 0);
  }
  // update cursor
  const updateCursor = (cursor) => {
    const cs = document.querySelector('.cursor');
    switch(cursor) {
      case 'text':
        spreadCanvasRef.current.style.cursor = 'move';
        cs.style.display = 'none';
        break;
      case 'pencil':
        spreadCanvasRef.current.style.cursor = 'none';
        cs.style.display = 'block';
        break;
      default:
        spreadCanvasRef.current.style.cursor = 'none';
        cs.style.display = 'block';
    }
  }

  //function update state
  const onColorUpdate = (colour) => {
    color.current = colour;
  };

  const drawImageProp = (ctx, img, x, y, w, h, offsetX, offsetY) => {
    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w) ar = w / nw;                             
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

      // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
  }

  const lockimg = () => {
    if(status.current) {
      const dragImg = document.querySelector('.item');
      const img = new Image();
      let bg = dragImg.style.backgroundImage;
      bg = bg.replace('url(','').replace(')','').replace('"','').replace('"','');
      const ctx = canvasRef.current.getContext('2d');
      img.onload = () => {
        drawImageProp(ctx, img, parseFloat(dragImg.style.left), parseFloat(dragImg.style.top), parseFloat(dragImg.style.width), parseFloat(dragImg.style.height), 0.5, 0.5)
        // ctx.drawImage(img,parseFloat(dragImg.style.left), parseFloat(dragImg.style.top), parseFloat(dragImg.style.width), parseFloat(dragImg.style.height));
      }
      img.src = bg;
      dragImg.style.display = 'none';
      dragImg.replaceWith(dragImg.cloneNode(true));
      emitCanvas();
    }else {
      diffToast('Only see !')
    }
  }

  const locktxt = () => {
    if(status.current) {
      const textboxEle = document.getElementById('textbox');
      const textctn = document.querySelector('.text-container');
      // textctn.style.display = 'none';
      const ctx = canvasRef.current.getContext('2d');
      ctx.font = "15px Comic";
      // ctx.fontSize = '20';
      ctx.fontFamily = textboxEle.style.fontFamily;
      ctx.fillStyle = color.current;
      // ctx.textAlign = "center";
      let rect = textboxEle.getBoundingClientRect();
      ctx.fillText(textboxEle.value, parseFloat(rect.left) + 2, parseFloat(rect.top) + parseFloat(rect.height)/2 + 2);
      textctn.style.display = 'none';
      emitCanvas();
    }else{
      diffToast('Only See !');
    }
    
  }

  const removeimg = () => {
    const dragImg = document.querySelector('.item');
    dragImg.style.display = 'none';
    // dragImg.replaceWith(dragImg.cloneNode(true));
  }

  const removetxt = () => {
    const textctn = document.querySelector('.text-container');
    textctn.style.display = 'none';
  }

  const drawGrid = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.fillStyle = "white";
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for(let i = 10; i <= canvasRef.current.width - 10; i = i + 10)
    {
      ctx.moveTo(i, 10);
      ctx.lineTo(i, canvasRef.current.height - 10);
      ctx.strokeStyle = '#f0f0f0';
      ctx.stroke();
    }
    for(let i = 10; i <= canvasRef.current.height - 10; i = i + 10){
      ctx.moveTo(10, i);
      ctx.lineTo(canvasRef.current.width - 10, i);
      ctx.stroke();
    }

    ctx.beginPath();
    for(let i = 10; i <= canvasRef.current.width - 10; i = i + 50)
    {
      ctx.moveTo(i, 10);
      ctx.lineTo(i, canvasRef.current.height - 10);
      ctx.strokeStyle = '#c0c0c0';
      ctx.stroke();
    }
    for(let i = 10; i <= canvasRef.current.height - 10; i = i + 50){
      ctx.moveTo(10, i);
      ctx.lineTo(canvasRef.current.width - 10, i);
      ctx.stroke();
    }
    ctx.strokeStyle = 'black';
    ctx.closePath();
  }

  const onToolUpdate = (e) => {
    if(e.currentTarget.id !== 'undo') {
      tool.current = e.currentTarget.id;
      updateCursor(e.currentTarget.id);
    } 
  };

  const onSizeUpdate = (e) =>{
    size.current = e.target.value;  
  };
  
  // store data board to db
  const updateBoard = (blob) => {
    // const roomId = room.current;
    const data = {boardId: boardid, dataUrl: blob}
    apiBoard.put("updateboard/", data, {
      headers: { accessToken: localStorage.getItem("accessToken")},
    })
    .then((res) => {
      if(res.data.error) {
        alert(res.data.error);
      }
    })
  }

  // refresh canvas
  const refresh = () => {
    if(status.current) {
      let roomId = room.current;
      // drawGrid();
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      authState.socket.emit("refresh", {roomId, boardid});
    }else{
      diffToast('Only See !');
    }
  }

  const drawImg = (data) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
    let image = new Image();
    image.onload = function(){
      ctx.drawImage(image, 0, 0);
    };
    image.src = data;
  }

  // undo board
  const undoBoard = () => {
    if(status.current) {
      if(previousBoard.current.length > 1) {    
        let data = previousBoard.current.slice(-2)[0];
        previousBoard.current.splice(-2, 2);
        drawImg(data);      
        emitUndoCanvas();
      }
    }else {
      diffToast('Only See !');
    }
    
  }

  const redoBoard = () => {
    if(index.current !== -1) {
      index.current = index.current + 1;
      let data = previousBoard.current.slice(index.current)[0];
      drawImg(data);
      emitCanvas();
    }
  }

  // download canvas
  const download = (e) => {
    if(window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(canvasRef.current.msToBlob(), `${title.current}.png`)
    }
    else {
      if(e.currentTarget.id === 'jpeg'){
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = canvasRef.current.toDataURL("image/jpeg", 0.2);
        a.download = `${title.current}.jpg`;
        a.click();
        document.body.removeChild(a);
      }else {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = canvasRef.current.toDataURL();
        a.download = `${title.current}.png`;
        a.click();
        document.body.removeChild(a);
      }
    }
  }

  // upload image 
  const uploadImage = (e) => {
    document.querySelector('#lockimg').addEventListener('click', lockimg);
    document.querySelector('#removeimg').addEventListener('click', removeimg);
    const reader = new FileReader();
    const img = new Image();
    const dragImg = document.querySelector('.item');
    dragImg.style.display = 'block';
    let isResizing = false;
    dragImg.addEventListener('mousedown', mousedown);
    function mousedown(e) {
      dragImg.ondragstart = function () {return false};
      window.addEventListener('mousemove', mousemove);
      window.addEventListener('mouseup', mouseup);
      
      let prevX = e.clientX;
      let prevY = e.clientY;

      function mousemove(e) {
        if(!isResizing){
          let newX = prevX - e.clientX;
          let newY = prevY - e.clientY;
  
          const rect = dragImg.getBoundingClientRect();
          dragImg.style.left = rect.left - newX + 'px';
          dragImg.style.top = rect.top - newY + 'px';
  
          prevX = e.clientX;
          prevY = e.clientY;
        }
        
      }

      function mouseup() {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);
      }
    }

    const resizers = document.querySelectorAll('.resizer');
    let currentResize;
    for(let resizer of resizers){
      // resizer.replaceWith(resizer.cloneNode(true));
      resizer.addEventListener('mousedown', mousedown);
      function mousedown(e) {
        currentResize = e.target;
        isResizing = true;

        let prevX = e.clientX;
        let prevY = e.clientY;

        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);

        function mousemove(e) {
          const rect = dragImg.getBoundingClientRect();
          if(currentResize.classList.contains('se')){
            dragImg.style.width = rect.width - (prevX - e.clientX) + 'px';
            dragImg.style.height = rect.height - (prevY - e.clientY) + 'px';
          }else if(currentResize.classList.contains('sw')){
            dragImg.style.width = rect.width + (prevX - e.clientX) + 'px';
            dragImg.style.height = rect.height - (prevY - e.clientY) + 'px';
            dragImg.style.left = rect.left - (prevX - e.clientX) + 'px';
          }else if(currentResize.classList.contains('ne')){
            dragImg.style.width = rect.width - (prevX - e.clientX) + 'px';
            dragImg.style.height = rect.height + (prevY - e.clientY) + 'px';
            dragImg.style.top = rect.top - (prevY - e.clientY) + 'px';
          }
          else {
            dragImg.style.width = rect.width + (prevX - e.clientX) + 'px';
            dragImg.style.height = rect.height + (prevY - e.clientY) + 'px';
            dragImg.style.top = rect.top - (prevY - e.clientY) + 'px';
            dragImg.style.left = rect.left - (prevX - e.clientX) + 'px';
          }

          prevX = e.clientX;
          prevY = e.clientY;
        }

        function mouseup() {
          window.removeEventListener('mousemove', mousemove);
          window.removeEventListener('mouseup', mouseup);
          isResizing = false;
        }
      }
    }
    // const ctx = spreadCanvasRef.current.getContext('2d');
    reader.onload = () => {
      img.onload = function() {
        dragImg.style.backgroundImage = `url('${reader.result}')`
        dragImg.style.left = spreadCanvasRef.current.width/2 - this.width/2 + 'px';
        dragImg.style.top = spreadCanvasRef.current.height/2 - this.height/2 + 'px';
        dragImg.style.width = this.width + 'px';
        dragImg.style.height = this.height + 'px';
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(e.currentTarget.files[0]);
  }

  const updateRoleRef = async () => {
    apiParticipations.get(`/isParticipant/${room.current}`, {
        headers: {accessToken: localStorage.getItem('accessToken')},
        })
        .then((res) => {
            if(res.data.role_id === 4) { // kicked: 5
                status.current = false;
            }else{
              status.current = true;
            }
        })
  }

  const createBoard = () => {
    if(status.current) {
      const newBoard = {roomId: room.current};
      apiBoard
      .post('create', newBoard, {  headers: {
        accessToken: localStorage.getItem('accessToken')
      }})
      .then((res) => {
        if(res.data.error){
          alert(res.data.error);
        }else{
          boardId.current = res.data.id;
          setBoardid(res.data.id);
          resetListOfBoards();
          const roomId = room.current;
          authState.socket.emit("changeListOfBoards", {roomId, boardid});
        }
      })
    }
  }

  const deleteBoard = (id) => {
    if(status.current){
      if(listOfBoards.length > 1) {
        apiBoard.delete(`delete/${id}`, { headers: {
          accessToken: localStorage.getItem('accessToken')
        }})
        .then((res) => {
          if(res.data.error) {
            alert(res.data.error);
          }else {
            // boardId.current
            const index = listOfBoards.findIndex(board => board.id === id);
            const idx = index?(index - 1):(index + 1);
            setBoardid(listOfBoards[idx].id);
            resetListOfBoards();
            const roomId = room.current;
            authState.socket.emit("refresh", {roomId, boardid});
          }
        })
      }
    }
  }

  const switchBoard = (id) => {
    boardId.current = id;
    setBoardid(id);
  }

  const resetListOfBoards = () => {
    apiBoard.get(`all/${room.current}`, {  headers: {
      accessToken: localStorage.getItem('accessToken')
    }}).then((res) => {
      if(!res.data.error) {
        if(res.data.length !== 0){
          setListOfBoards(res.data);
        }
      }
      else {
        console.log(res.data.error);
      }
    })
  }

  useEffect(() => {
    updateRoleRef();

    apiBoard.get(`all/${room.current}`, {  headers: {
      accessToken: localStorage.getItem('accessToken')
    }}).then((res) => {
      if(!res.data.error) {
        if(res.data.length !== 0){
          setListOfBoards(res.data);
          boardId.current = res.data[0].id;
          setBoardid(res.data[0].id);
        }
        else {
          createBoard();
        }
      }
      else {
        console.log(res.data.error);
      }
    })
  }, [])

  useEffect(() => {
    // retrive data board when access
    if(boardid !== null){
        const getBoard = (boardId) => {
          apiBoard.get(`/${boardId}`,{ 
            headers: { accessToken: localStorage.getItem("accessToken")},
          })
          .then((res) => {
            if(res.data !== null) {
              if(res.data.dataUrl !== null){
                onDrawingEvent(res.data.dataUrl);
                title.current = res.data.title;
              }
              else {
                // drawGrid();
                let base64ImageData = canvasRef.current.toDataURL("image/png");
                previousBoard.current.push(base64ImageData)
              }
            }
          })
        }
        getBoard(boardid);
      
        const canvas = canvasRef.current;
        const spreadCanvas = spreadCanvasRef.current;
        const spreadctx = spreadCanvas.getContext('2d');
        const ctx = canvas.getContext('2d');
    
        // store clientx y
        const current = {};
    
        let drawing = false;
        // ------------------------------- create the drawing ----------------------------
    
        const tools = {
    
          'pencil': {
            draw: (data) => {
              spreadctx.beginPath();
              spreadctx.moveTo(data.x0, data.y0);
              spreadctx.lineTo(data.x1, data.y1);
              spreadctx.strokeStyle = data.color;
              spreadctx.lineWidth = data.size;
              spreadctx.lineCap = "round";
              spreadctx.lineJoin = "round";
              spreadctx.stroke();
              spreadctx.closePath();
              if(!drawing) {
                let base64ImageData = spreadCanvasRef.current.toDataURL("image/png");
                let image = new Image();
                image.onload = function(){
                  ctx.drawImage(image, 0, 0);
                };
                image.src = base64ImageData;
                spreadctx.clearRect(0,0,spreadCanvas.width, spreadCanvas.height);
                
                if (!data.emit) { return; }
                emitCanvas();
              }              
            } 
          },
    
          'eraser': {
            draw: (data) => {

              ctx.beginPath();
              ctx.save();
              ctx.arc(data.x1, data.y1, data.size/2, 0, 2 * Math.PI, false);
              ctx.clip();
              ctx.clearRect(data.x1 - data.size/2 - 1, data.y1 - data.size/2 - 1,
                data.size + 2, data.size + 2);
              ctx.restore();
              // ctx.restore();
              // spreadctx.closePath();
              // spreadctx.beginPath();
              // spreadctx.moveTo(data.x0, data.y0);
              // spreadctx.lineTo(data.x1, data.y1);
              // spreadctx.strokeStyle = '#ffffff';
              // spreadctx.lineWidth = data.size;
              // spreadctx.lineCap = "round";
              // spreadctx.lineJoin = "round";
              // spreadctx.stroke();
              // spreadctx.closePath();

              if(!drawing) {
                let base64ImageData = spreadCanvasRef.current.toDataURL("image/png");
                let image = new Image();
                image.onload = function(){
                  ctx.drawImage(image, 0, 0);
                };
                image.src = base64ImageData;
                spreadctx.clearRect(0,0,spreadCanvas.width, spreadCanvas.height);
                if (!data.emit) { return; }
                emitCanvas();
              }
              
            } 
          },
    
          'line': {
            draw: (data) => {
              if(previous.current.length === 0) {
                previous.current.push({x: data.x0, y: data.y0}, {x: data.x0, y: data.y0});
              }else{
                const index = previous.current.length - 1;
                const copyPrevious = [...previous.current];
                copyPrevious[index] = {x: data.x1, y: data.y1};
                previous.current = copyPrevious;
              }
              spreadctx.clearRect(0,0,spreadCanvas.width, spreadCanvas.height);
              spreadctx.beginPath();
              spreadctx.moveTo(previous.current[0].x, previous.current[0].y);
              spreadctx.lineTo(previous.current[1].x, previous.current[1].y);
              spreadctx.strokeStyle = data.color;
              spreadctx.lineWidth = data.size;
              spreadctx.lineCap = "round";
              spreadctx.lineJoin = "round";
              spreadctx.stroke();
              spreadctx.closePath();
    
              if(!drawing) {
                spreadctx.clearRect(0,0,spreadCanvas.width, spreadCanvas.height);
                ctx.beginPath();
                ctx.moveTo(previous.current[0].x, previous.current[0].y);
                ctx.lineTo(previous.current[1].x, previous.current[1].y);
                ctx.strokeStyle = data.color;
                ctx.lineWidth = data.size;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.stroke();
                ctx.closePath();
                previous.current = [];
                if (!data.emit) { return; }
                emitCanvas();
              }
            }
          },
    
          'rectangle': {
            draw: (data) => {
              if(previous.current.length === 0) {
                previous.current.push({x: data.x0, y: data.y0}, {x: data.x0, y: data.y0});
              }else{
                const index = previous.current.length - 1;
                const copyPrevious = [...previous.current];
                copyPrevious[index] = {x: data.x1, y: data.y1};
                previous.current = copyPrevious;
              }
              // handle data x y width height
              let width = Math.abs(previous.current[0].x - previous.current[1].x);
              let height = Math.abs(previous.current[0].y - previous.current[1].y);
              let x, y;
              if(previous.current[0].x < previous.current[1].x) {
                if(previous.current[0].y < previous.current[1].y ) { x = previous.current[0].x; y = previous.current[0].y }
                else { x = previous.current[0].x; y = previous.current[0].y - height}
              }
              else {
                if(previous.current[0].y < previous.current[1].y) { x = previous.current[0].x - width; y = previous.current[0].y }
                else { x = previous.current[0].x - width; y = previous.current[0].y - height }
              };
              // draw to spread canvas
              spreadctx.clearRect(0,0,spreadCanvas.width, spreadCanvas.height);
              spreadctx.beginPath();
              spreadctx.rect(x, y, width, height);
              spreadctx.strokeStyle = data.color;
              spreadctx.lineWidth = data.size;
              spreadctx.lineCap = "round";
              spreadctx.lineJoin = "round";
              spreadctx.stroke();
              spreadctx.closePath();
              
              if(!drawing) {
                // draw main canvas if mouseup
                spreadctx.clearRect(0,0,spreadCanvas.width, spreadCanvas.height);
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.strokeStyle = data.color;
                ctx.lineWidth = data.size;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.stroke();
                ctx.closePath();
                previous.current = [];
                if (!data.emit) { return; }
                emitCanvas();
              }
            },
          },
    
          'circle': {
            draw: (data) => {
              if(previous.current.length === 0) {
                previous.current.push({x: data.x0, y: data.y0}, {x: data.x0, y: data.y0});
              }else{
                const index = previous.current.length - 1;
                const copyPrevious = [...previous.current];
                copyPrevious[index] = {x: data.x1, y: data.y1};
                previous.current = copyPrevious;
              }
              // handle data x y width height
              const radius = Math.abs(previous.current[0].x - previous.current[1].x);
    
              // draw to spread canvas
              spreadctx.clearRect(0, 0, spreadCanvas.width, spreadCanvas.height);
              spreadctx.beginPath();
              spreadctx.moveTo(previous.current[0].x, previous.current[0].y + (previous.current[1].y - previous.current[0].y) / 2);
              spreadctx.bezierCurveTo(previous.current[0].x, previous.current[0].y, previous.current[1].x, previous.current[0].y, previous.current[1].x, previous.current[0].y + (previous.current[1].y - previous.current[0].y) / 2);
              spreadctx.bezierCurveTo(previous.current[1].x, previous.current[1].y, previous.current[0].x, previous.current[1].y, previous.current[0].x, previous.current[0].y + (previous.current[1].y - previous.current[0].y) / 2);
              spreadctx.strokeStyle = data.color;
              spreadctx.lineWidth = data.size;
              spreadctx.lineCap = "round";
              spreadctx.lineJoin = "round";
              spreadctx.closePath();
              spreadctx.stroke();
    
              if(!drawing) {
                // draw to main canvas if mouseup
                ctx.beginPath();
                ctx.moveTo(previous.current[0].x, previous.current[0].y + (previous.current[1].y - previous.current[0].y) / 2);
                ctx.bezierCurveTo(previous.current[0].x, previous.current[0].y, previous.current[1].x, previous.current[0].y, previous.current[1].x, previous.current[0].y + (previous.current[1].y - previous.current[0].y) / 2);
                ctx.bezierCurveTo(previous.current[1].x, previous.current[1].y, previous.current[0].x, previous.current[1].y, previous.current[0].x, previous.current[0].y + (previous.current[1].y - previous.current[0].y) / 2);
                ctx.strokeStyle = data.color;
                ctx.lineWidth = data.size;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.closePath();
                ctx.stroke();
                spreadctx.clearRect(0, 0, spreadCanvas.width, spreadCanvas.height);
                previous.current = [];
                if (!data.emit) { return; }
                emitCanvas();
              }
            }
          },
    
          'text': {
            draw: (data) => {
              const fakeEle = document.createElement('div');
              // Hide it completely
              fakeEle.style.position = 'absolute';
              fakeEle.style.top = '0';
              fakeEle.style.left = '-9999px';
              fakeEle.style.overflow = 'hidden';
              fakeEle.style.visibility = 'hidden';
              fakeEle.style.whiteSpace = 'nowrap';
              fakeEle.style.height = '0';
              fakeEle.style.padding = '5px';
    
              // We copy some styles from the textbox that effect the width
              const textboxEle = document.getElementById('textbox');
              const textctn = document.querySelector('.text-container');
              textboxEle.value = '';
    
              // Get the styles
              const styles = window.getComputedStyle(textboxEle);
    
              // Copy font styles from the textbox
              fakeEle.style.fontFamily = styles.fontFamily;
              fakeEle.style.fontSize = styles.fontSize;
              fakeEle.style.fontStyle = styles.fontStyle;
              fakeEle.style.fontWeight = styles.fontWeight;
              fakeEle.style.letterSpacing = styles.letterSpacing;
              fakeEle.style.textTransform = styles.textTransform;
              
              fakeEle.style.borderLeftWidth = styles.borderLeftWidth;
              fakeEle.style.borderRightWidth = styles.borderRightWidth;
              fakeEle.style.paddingLeft = styles.paddingLeft;
              fakeEle.style.paddingRight = styles.paddingRight;
    
              // Append the fake element to `body`
              document.body.appendChild(fakeEle);
              const setWidth = function () {
                const string = textboxEle.value || textboxEle.getAttribute('placeholder') || '';
                fakeEle.innerHTML = string.replace(/\s/g, '&' + 'nbsp;');
                const fakeEleStyles = window.getComputedStyle(fakeEle);
                textboxEle.style.width = parseFloat(fakeEleStyles.width) + 10 + 'px';
                textctn.style.width = textboxEle.style.width
                // textctn.style.height = textboxEle.style.fontSize;
              };
              setWidth();
              textctn.style.display = 'block';
              textctn.style.left= data.x0 - parseFloat(textboxEle.style.width)/2 + 'px';
              textctn.style.top = data.y0 - 25/2 + 'px';
              textboxEle.addEventListener('input', function (e) {
                setWidth();
              });
            }
          }
        }
    
        // ---------------- mouse movement --------------------------------------
    
        const onMouseDown = (e) => {
          drawing = true;
          current.x = e.clientX || e.touches.clientX;
          current.y = e.clientY || e.touches.clientY;
        };
    
        const onMouseMove = (e) => {
          if (!drawing) { return; }
          let data = {
            x0: current.x,
            y0: current.y,
            x1: e.clientX || e.touches.clientX,
            y1: e.clientY || e.touches.clientY,
            color: color.current,
            size: size.current,
            emit: true,
          }
          if(status.current) {
            tools[tool.current].draw(data);
          }else {
            diffToast('Only see !')
          }
          // drawLine(current.x, current.y, e.clientX || e.touches.clientX, e.clientY || e.touches.clientY, color.current, size.current, true);
          current.x = e.clientX || e.touches.clientX;
          current.y = e.clientY || e.touches.clientY;
        };
    
        const onMouseUp = (e) => {
          if (!drawing) { return; }
          drawing = false;
          let data = {
            x0: current.x,
            y0: current.y,
            x1: e.clientX || e.touches.clientX,
            y1: e.clientY || e.touches.clientY,
            color: color.current,
            size: size.current,
            emit: true,
          }
          if(status.current) {
            tools[tool.current].draw(data);
          }else {
            diffToast('Only see !')
          }
        };
    
        // ----------- limit the number of events per second -----------------------
    
        const throttle = (callback, delay) => {
          let previousCall = new Date().getTime();
          return function() {
            const time = new Date().getTime();
    
            if ((time - previousCall) >= delay) {
              previousCall = time;
              callback.apply(null, arguments);
            }
          };
        };
    
        // -----------------add event listeners to our canvas ----------------------
    
        spreadCanvas.addEventListener('mousedown', onMouseDown, false);
        spreadCanvas.addEventListener('mouseup', onMouseUp, false);
        spreadCanvas.addEventListener('mouseout', onMouseUp, false);
        spreadCanvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
    
        // Touch support for mobile devices
        spreadCanvas.addEventListener('touchstart', onMouseDown, false);
        spreadCanvas.addEventListener('touchend', onMouseUp, false);
        spreadCanvas.addEventListener('touchcancel', onMouseUp, false);
        spreadCanvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);
    
        // -------------- make the canvas fill its parent component -----------------
    
        const onResize = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
    
          spreadCanvas.width = window.innerWidth;
          spreadCanvas.height = window.innerHeight;
          // const roomId = room.current;
          getBoard(boardid);
        };
    
        window.addEventListener('resize', onResize, false);
        onResize();
    
        // ----------------------- authState.socket.io connection ----------------------------
        const onDrawingEvent = (base64ImageData) => {
          // const ctx = canvasRef.current.getContext('2d');
          // ctx.beginPath();
          // ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          let image = new Image();
          image.onload = function(){
            ctx.drawImage(image, 0, 0);
          };
          image.src = base64ImageData;
          previousBoard.current.push(base64ImageData);
        };        
    }
    
  }, [boardid]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const onDrawingEvent = (base64ImageData) => {
      // ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      let image = new Image();
      image.onload = function(){
        ctx.drawImage(image, 0, 0);
      };
      image.src = base64ImageData;
      previousBoard.current.push(base64ImageData);
    };  

    const onRefreshEvent = (data) => {
      if(boardId.current === data.boardid) {
        // drawGrid();
        ctx.beginPath();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    const onUndoBoard = (data) => {
      console.log('thanh vi');
      if(boardId.current === data.boardid) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        onDrawingEvent(data.base64ImageData);
      }
    }

    authState.socket.on('canvas-data', (data) => {
      if(boardId.current === data.boardid){
        onDrawingEvent(data.base64ImageData);
        }     
      });
      authState.socket.on('share-data', emitCanvas);
      authState.socket.on('refresh', onRefreshEvent);
      authState.socket.on('undoBoard', onUndoBoard);
      authState.socket.on('roleStatus', (data) => {
        updateRoleRef();
      });
      authState.socket.on('changeListOfBoards', resetListOfBoards);
  }, [])

  return (
    
    <div id="whiteboard-container">
      <div className='text-container'>
        <input type='text' id= 'textbox' placeholder= 'Enter text'/>
        <div className='tool_text'>
          <span onClick={locktxt}><AiTwotoneLock/></span>   
          <span onClick={removetxt}><IoMdTrash/></span>   
        </div>
      </div>
      
      <div className='item'>
        <div className='resizer ne'></div>
        <div className='resizer nw'></div>
        <div className='resizer sw'></div>
        <div className='resizer se'></div>
        <div className='tool_drag'>
          <span id = 'lockimg' onClick={lockimg}><AiTwotoneLock/></span>   
          <span id = 'removeimg' onClick={removeimg}><IoMdTrash/></span>   
        </div>
      </div>

      <div></div> 
      <canvas ref={canvasRef} className="board" />
      <canvas ref= {spreadCanvasRef} className = "spreadboard" />
      <Control onColorUpdate = {onColorUpdate} onSizeUpdate = {onSizeUpdate} onToolUpdate = {onToolUpdate} download={download} refresh={refresh} uploadImage={uploadImage} undoBoard={undoBoard} redoBoard={redoBoard} roomId = {room.current} boardId = {boardid} createBoard = {createBoard} listOfBoards = {listOfBoards} switchBoard = {switchBoard} deleteBoard = {deleteBoard}/>
      <Chat roomId={room.current}/>
    </div>
  );
};

export default Board;