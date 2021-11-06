import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import axios from 'axios';
import {useHistory } from "react-router-dom";
import {io} from 'socket.io-client';
import Control from '../control/Control';
import Chat from '../chat/Chat';
import './style.css';

const Board = (props) => {
  const roomId = props.roomId;
  console.log(props);
  const history = useHistory();

  const canvasRef = useRef(null);
  const spreadCanvasRef = useRef(null);
  const socketRef = useRef();
  const tool = useRef('pencil');
  const color = useRef('black');
  const size = useRef(1);
  const timeout = useRef();
  const previous = useRef([]);

  //function update state
  const onColorUpdate = (e) => {
    color.current = e.target.id;
  };
  const onColorUpdateField = (e) => {
    color.current = e.target.value;
  }
  const onToolUpdate = (e) => {
    tool.current = e.target.id;
  };
  const onSizeUpdate = (e) =>{
    size.current = e.target.value;  
  };
 
  // store data board to db
  const updateBoard = (blob) => {
    const data = {room: roomId, dataUrl: blob}
    axios.put("http://localhost:8080/boards/updateboard/", data, {
      headers: { accessToken: localStorage.getItem("accessToken")},
    })
    .then((res) => {
      if(res.data.error) {
        alert(res.data.error);
      }
    })
  }

  
  const username = "Thanh Vi";

  useEffect(() => {
    socketRef.current = io("http://localhost:8080");
    socketRef.current.emit('joinRoom', {roomId, username});
    socketRef.current.on('error', (data) => {
      console.log(data);
      history.push('/overload');
    })
  },[]);

  useEffect(() => {
    // retrive data board when access
    const getBoard = (roomId) => {
      axios.get(`http://localhost:8080/boards/${roomId}`,{ 
        headers: { accessToken: localStorage.getItem("accessToken")},
      })
      .then((response) => {
        onDrawingEvent(response.data);
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
    const emitCanvas = () => {
      if(timeout.current != undefined) clearTimeout(timeout.current)
          timeout.current = setTimeout(function() {
            let base64ImageData = canvas.toDataURL("image/png");
            socketRef.current.emit("canvas-data", {roomId,base64ImageData});
            console.log(base64ImageData.length);
            updateBoard(base64ImageData);
          }, 200);
    }
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
          ctx.strokeStyle = 'white';
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
          spreadctx.strokeStyle = color.current;
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
            ctx.strokeStyle = color.current;
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
          spreadctx.strokeStyle = color.current;
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
            ctx.strokeStyle = color.current;
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
          spreadctx.strokeStyle = color.current;
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
            ctx.strokeStyle = color.current;
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
      }
    }

    // ---------------- mouse movement --------------------------------------

    const onMouseDown = (e) => {
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseMove = (e) => {
      if (!drawing) { return; }
      let data = {
        x0: current.x,
        y0: current.y,
        x1: e.clientX || e.touches[0].clientX,
        y1: e.clientY || e.touches[0].clientY,
        color: color.current,
        size: size.current,
        emit: true,
      }
      tools[tool.current].draw(data);
      // drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, color.current, size.current, true);
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseUp = (e) => {
      if (!drawing) { return; }
      drawing = false;
      let data = {
        x0: current.x,
        y0: current.y,
        x1: e.clientX || e.touches[0].clientX,
        y1: e.clientY || e.touches[0].clientY,
        color: color.current,
        size: size.current,
        emit: true,
      }
      tools[tool.current].draw(data);
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

    // ----------------------- socket.io connection ----------------------------
    const onDrawingEvent = (data) => {
      let image = new Image();
      image.onload = function(){
        ctx.drawImage(image, 0, 0);
      };
      image.src = data;
    };

    socketRef.current.on('canvas-data', onDrawingEvent);
    socketRef.current.on('share-data', emitCanvas)
    // onDrawingEvent(getBoard(roomId));
  }, []);

  // ------------- The Canvas and color elements --------------------------

  return (
    <div>
      <canvas ref={canvasRef} className="board" />
      <canvas ref= {spreadCanvasRef} className = "spreadboard" />
      <Control onColorUpdate = {onColorUpdate} onColorUpdateField = {onColorUpdateField} onSizeUpdate = {onSizeUpdate} onToolUpdate = {onToolUpdate}/>
      <Chat socket={socketRef.current} roomId={roomId}/>
    </div>
  );
};

export default Board;