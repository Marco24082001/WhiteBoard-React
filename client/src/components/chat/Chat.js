import React, { useRef, useEffect, useContext } from 'react';
import { SocketContext } from '../../helpers/SocketContext';
import { AuthContext } from "../../helpers/AuthContext";
import {FaComment, FaComments, FaChevronDown} from "react-icons/fa";
import {} from "react-icons/fa"
import { Socket } from 'socket.io-client';
import './style.css';
function Chat(props) {
    const {authState} = useContext(AuthContext);
    const roomId = props.roomId;
    const send_msg = e =>{
        e.preventDefault();
        // Get message
        const msg = e.target.elements.msg.value;
        outputMessage({user: 'me', msg: e.target.elements.msg.value});
        // console.log(socket);
        // Emit message to server
        authState.socket.emit('chatMessage', {roomId, msg});
        console.log(roomId)
        e.target.elements.msg.value = '';
        e.target.elements.msg.focus();
    }

    const outputMessage = (data) => {
        if(data.user === 'me'){
            const p = document.createElement('p');
            p.classList.add('message');
            p.innerText = `${data.msg}`;
            const chatMessage = document.querySelector('.chat-box-message');
            chatMessage.appendChild(p);
            chatMessage.scrollTop = chatMessage.scrollHeight;
        }
        else {
            const p = document.createElement('p');
            p.classList.add('message','user_message');
            p.innerText = `${data.msg}`;
            const chatMessage = document.querySelector('.chat-box-message');
            chatMessage.appendChild(p);
            chatMessage.scrollTop = chatMessage.scrollHeight;
        }
    }

    const hideMessage = (e) => {
        const chatbox = document.getElementsByClassName('chat-box');
        chatbox[0].classList.remove('hidden');
    }
    const showMessage = (e) => {
        const chatbox = document.getElementsByClassName('chat-box');
        chatbox[0].classList.add('hidden');
    }

    useEffect(() => {
        console.log(authState.socket);
        authState.socket.on('message', msg => {
            console.log(authState.socket);
            
            outputMessage(msg);
        });        
      },[authState.socket]);

    return (
        <div id="chat-container">
            
            <button id="show-chat" onClick={hideMessage}>
                <span className="toggleMessage"><FaComment/></span>
            </button>
            <div className="chat-box hidden">
                <div className="chat-box-header">
                    <button className="close"><span><FaComments/></span></button>
                    <span onClick={showMessage}><FaChevronDown/></span>
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
        </div>
    )
}

export default Chat
