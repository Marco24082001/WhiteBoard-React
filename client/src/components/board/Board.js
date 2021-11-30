import React, { useRef, useEffect, useContext } from 'react';
import axios from 'axios';
// import {useHistory } from "react-router-dom";
import { AuthContext } from "../../helpers/AuthContext";
import {toast} from 'react-toastify';
import Control from '../control/Control';
import Chat from '../chat/Chat';
import './style.css';

const apiBoard = axios.create({
  baseURL: `${process.env.REACT_APP_API}/boards/`
})

const apiParticipations = axios.create({
  baseURL: `${process.env.REACT_APP_API}/participations/`,
});


// const apiUser = axios.create({
//   baseURL: `${process.env.REACT_APP_API}/users/`
// })

const Board = (props) => {
  const roomId = props.roomId;
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
  const dragimg = useRef(null);
  const status = useRef(true);
  const boardId = useRef(null);
  const index = useRef(-1);
  
  const diffToast = (msg) => {
    toast(msg);
    toast.clearWaitingQueue();
  }
  // emit data
  const emitCanvas = () => {
    if(timeout.current !== undefined) clearTimeout(timeout.current)
        timeout.current = setTimeout(() => {
          let base64ImageData = canvasRef.current.toDataURL("image/png");
          previousBoard.current.push(base64ImageData)
          authState.socket.emit("canvas-data", {roomId,base64ImageData});
          updateBoard(base64ImageData);
        }, 200);
  }

  // update cursor
  const updateCursor = (cursor) => {
    switch(cursor) {
      case 'drag':
        spreadCanvasRef.current.style.cursor = 'move';
        break;
      case 'pencil':
        spreadCanvasRef.current.style.cursor = 'none';
        break;
      default:
        spreadCanvasRef.current.style.cursor = 'none';
    }
  }

  //function update state
  const onColorUpdate = (colour) => {
    color.current = colour;
  };

  const onToolUpdate = (e) => {
    //Check have any dragimg, draw to maincavas and remove dragimg
    if(e.currentTarget.id !== 'undo' && e.currentTarget.id !== 'redo') {
      if(dragimg.current !== null) {
        const ctx = canvasRef.current.getContext('2d');
        const spreadctx = spreadCanvasRef.current.getContext('2d');
        const delX = previous.current[1].x - previous.current[0].x;
        const delY = previous.current[1].y - previous.current[0].y;
        const img = new Image();
        img.src = dragimg.current;
        img.onload = () => {
          ctx.drawImage(img, delX + canvasRef.current.width/2, delY + canvasRef.current.height/2);
        }
        dragimg.current = null;
        previous.current = [];
        spreadctx.clearRect(0,0, spreadCanvasRef.current.width, spreadCanvasRef.current.height);
        emitCanvas();
      }
      tool.current = e.currentTarget.id;
      // update cursor
      updateCursor(e.currentTarget.id);
    }else {
      if(dragimg.current !== null) {
        const spreadctx = spreadCanvasRef.current.getContext('2d');
        dragimg.current = null;
        previous.current = [];
        updateCursor('pencil');
        spreadctx.clearRect(0,0, spreadCanvasRef.current.width, spreadCanvasRef.current.height);
      }
    }
    
    if(e.currentTarget.id !== 'undo' || e.currentTarget.id !== 'redo'){
      tool.current = e.currentTarget.id;
    // update cursor
      updateCursor(e.currentTarget.id);
    }
    
  };

  const onSizeUpdate = (e) =>{
    size.current = e.target.value;  
  };
  
  // store data board to db
  const updateBoard = (blob) => {
    const data = {room: roomId, dataUrl: blob}
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
    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    authState.socket.emit("refresh", {roomId});
  }

  const drawImg = (data) => {
    const context = canvasRef.current.getContext('2d');
    let image = new Image();
    image.onload = function(){
      context.drawImage(image, 0, 0);
    };
    image.src = data;
  }

  // undo board
  const undoBoard = () => {
    if(previousBoard.current.length > 1) {
      let data = previousBoard.current.slice(-2)[0];
      previousBoard.current.splice(-2, 2);
      drawImg(data);      
      emitCanvas();
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
    const reader = new FileReader();
    const img = new Image();
    const ctx = spreadCanvasRef.current.getContext('2d');
    reader.onload = () => {
      img.onload = () => {
        ctx.drawImage(img, spreadCanvasRef.current.width/2, spreadCanvasRef.current.height/2);
      };
      img.src = reader.result;
      dragimg.current = reader.result;
      
    };
    reader.readAsDataURL(e.currentTarget.files[0]);
    document.getElementById('drag').click();
  }

  const updateRoleRef = async () => {
    apiParticipations.get(`/isParticipant/${boardId.current}`, {
        headers: {accessToken: localStorage.getItem('accessToken')},
        })
        .then((res) => {
            if(res.data.role_id === 4) { // kicked: 5
                status.current = false;
                console.log('sdfsfd');
            }else{
              status.current = true;
            }
        })
}

  useEffect(() => {
    apiBoard.get(`/${roomId}`,{ 
      headers: { accessToken: localStorage.getItem('accessToken')},
    })
    .then((res) => {
      if(res.data.id !== null){
          boardId.current = res.data.id;
          apiParticipations.get(`/isParticipant/${boardId.current}`, {
          headers: {accessToken: localStorage.getItem('accessToken')},
          })
          .then((res) => {
              if(res.data.role_id === 4) { // kicked: 5
                  status.current = false;
                  console.log('vl')
              }else {
                status.current = true;
              }
          })
      }
    })
    
    // retrive data board when access
    const getBoard = (roomId) => {
      console.log('ngoc')
      apiBoard.get(`/${roomId}`,{ 
        headers: { accessToken: localStorage.getItem("accessToken")},
      })
      .then((res) => {
        if(res.data.dataUrl !== null){
          onDrawingEvent(res.data.dataUrl);
          title.current = res.data.title;
        }
        else {
          const ctx = canvasRef.current.getContext('2d');
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      })
    }
    getBoard(roomId);
  
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
          ctx.beginPath();
          ctx.moveTo(data.x0, data.y0);
          ctx.lineTo(data.x1, data.y1);
          ctx.strokeStyle = data.color;
          ctx.lineWidth = data.size;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
          ctx.closePath();
          if (!data.emit) { return; }
          emitCanvas();
        } 
      },

      'eraser': {
        draw: (data) => {
          ctx.beginPath();
          ctx.moveTo(data.x0, data.y0);
          ctx.lineTo(data.x1, data.y1);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = data.size;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
          ctx.closePath();

          if (!data.emit) { return; }
          emitCanvas();
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
          }
          if (!data.emit) { return; }
          emitCanvas();
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
          spreadctx.arc(previous.current[0].x, previous.current[0].y, radius, 0, 2 * Math.PI);
          spreadctx.strokeStyle = data.color;
          spreadctx.lineWidth = data.size;
          spreadctx.lineCap = "round";
          spreadctx.lineJoin = "round";
          spreadctx.stroke();
          spreadctx.closePath();

          if(!drawing) {
            // draw to main canvas if mouseup
            spreadctx.clearRect(0, 0, spreadCanvas.width, spreadCanvas.height);
            ctx.beginPath();
            ctx.arc(previous.current[0].x, previous.current[0].y, radius, 0, 2 * Math.PI);
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

      'drag': {
        draw: (data) => {
          if(dragimg.current !== null){
            if(previous.current.length === 0) {
              previous.current.push({x: data.x0, y: data.y0}, {x: data.x0, y: data.y0});
            }else{
              const index = previous.current.length - 1;
              const copyPrevious = [...previous.current];
              copyPrevious[index] = {x: data.x1, y: data.y1};
              previous.current = copyPrevious;
            }
  
            const delX = previous.current[1].x - previous.current[0].x;
            const delY = previous.current[1].y - previous.current[0].y;
            const img = new Image();
            img.src = dragimg.current;
            img.onload = () => {
              setTimeout(() => {
                spreadctx.clearRect(0, 0, spreadCanvas.width, spreadCanvas.height);
                spreadctx.drawImage(img, delX + spreadCanvas.width/2, delY + spreadCanvas.height/2);
              }, 200);
            }
          }
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
      getBoard(roomId);
    };

    window.addEventListener('resize', onResize, false);
    onResize();

    // ----------------------- authState.socket.io connection ----------------------------
    const onDrawingEvent = (data) => {
      let image = new Image();
      image.onload = function(){
        ctx.drawImage(image, 0, 0);
      };
      image.src = data;
      previousBoard.current.push(data);
    };

    authState.socket.on('canvas-data', onDrawingEvent);
    authState.socket.on('share-data', emitCanvas);
    authState.socket.on('refresh', () => {
      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.fillStyle = "white";
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });
    authState.socket.on('roleStatus', (data) => {
      updateRoleRef();
  });
  }, []);

  // ------------- The Canvas and color elements --------------------------

  return (
    <div id="whiteboard-container">
      <canvas ref={canvasRef} className="board" />
      <canvas ref= {spreadCanvasRef} className = "spreadboard" />
      <Control onColorUpdate = {onColorUpdate} onSizeUpdate = {onSizeUpdate} onToolUpdate = {onToolUpdate} download={download} refresh={refresh} uploadImage={uploadImage} undoBoard={undoBoard} redoBoard={redoBoard} roomId = {roomId}/>
      <Chat roomId={roomId}/>
    </div>
  );
};

export default Board;