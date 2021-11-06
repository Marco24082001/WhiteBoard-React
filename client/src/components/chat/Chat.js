import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import {FaComment, FaComments, FaChevronDown} from "react-icons/fa";
import { Socket } from 'socket.io-client';
import './style.css';
function Chat({socket, roomId}) {
    const socketRef = useRef();
    socketRef.current = socket;
    const send_msg = e =>{
        e.preventDefault();
        // Get message
        const msg = e.target.elements.msg.value;
        // console.log(socket);
        // Emit message to server
        socket.emit('chatMessage', {roomId, msg});
        e.target.elements.msg.value = '';
        e.target.elements.msg.focus();
    }
    const outputMessage = (msg) => {
        const p = document.createElement('p');
        p.classList.add('message');
        p.innerText = `${msg}`;
        const chatMessage = document.querySelector('.chat-box-message');
        chatMessage.appendChild(p);
        chatMessage.scrollTop = chatMessage.scrollHeight;
    }


    useEffect(() => {
        setTimeout(() => {
            // Message from server
            socketRef.current.on('message', msg => {
                console.log(msg);
                outputMessage(msg);
            });
        },3000);        
      },[]);

    return (

        <div id="chat-box">
            <div className="chat-box-header">
                <button className="close"><span><FaComments/></span></button>
                <span><FaChevronDown/></span>
            </div>
            <div className="chat-box-message">
                <p className="message">Hello</p>
                <p className="message user_message">Hi</p>
            </div>
            <div className="chat-box-footer">
                <form onSubmit={send_msg}>
                    <input type="text" id="msg" placeholder="Write a message">
                    </input>
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    )
}

export default Chat
