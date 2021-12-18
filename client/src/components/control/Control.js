import React from 'react'
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useContext, useRef } from 'react';
import { SketchPicker } from 'react-color';
import {FaChevronLeft, FaBan, FaRegEye} from 'react-icons/fa';
import {BiEdit} from 'react-icons/bi';
import {MdOutlineAdminPanelSettings, MdAdminPanelSettings} from 'react-icons/md';
import {RiUserSharedFill, RiUserStarFill} from 'react-icons/ri';
import axios from 'axios';
import {toast} from 'react-toastify';
import { AuthContext } from '../../helpers/AuthContext';
import {io} from 'socket.io-client';
import './style.css'

const URL = `${process.env.REACT_APP_CLIENT}/board`;
const apiBoard = axios.create({
    baseURL: `${process.env.REACT_APP_API}/boards/`
})
  
const apiParticipations = axios.create({
    baseURL: `${process.env.REACT_APP_API}/participations/`,
});


const apiUser = axios.create({
    baseURL: `${process.env.REACT_APP_API}/users/`
})
  
// import { ReactComponent as LogIcon } from '../../icons/circle.svg';
// rfce
function Control({onColorUpdate, onSizeUpdate, onToolUpdate, download, refresh, uploadImage, undoBoard, redoBoard, roomId}) {
    const [color, setColor] = useState('lightblue');
    const [cursorX, setCursorX] = useState();
    const [cursorY, setCursorY] = useState();
    const [listOfUsers, setListOfUsers] = useState([]);
    const [size, setSize] = useState(10);
    const [photo, setPhoto] = useState('');
    const control = useRef();
    let history = useHistory();
    const user = useRef();
    const [username, setUsername] = useState('Me');
    const roleId = useRef();
    const boardId = useRef();
    const linkURL = `${URL}/${roomId}`
    const { authState, setAuthState } = useContext(AuthContext);

    // alert
    const diffToast = (msg) => {
        toast(msg);
    }

    const onSizeCursorUpdate = (e) => {
        setSize(e.target.value);
    }

    // share link
    const shareLink = () => {
        let copyTextarea = document.createElement('textarea');
        copyTextarea.style.position = 'fixed';
        copyTextarea.style.opacity = '0';
        copyTextarea.textContent = linkURL;
        document.body.appendChild(copyTextarea);
        copyTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(copyTextarea);
        let shareButton = document.querySelector('.share-button');
        shareButton.classList.add('active');
        setTimeout(() => {
            shareButton.classList.remove('active');
        },2500);
    }

    const closeColor = (e) => {
        let color_container = document.querySelector('.color-container');
        if(color_container.classList.contains('active')){
            color_container.classList.remove('active');
            e.currentTarget.classList.remove('active');
        }else {
            color_container.classList.add('active');
            e.currentTarget.classList.add('active');
        }
        console.log(authState.status)
    }

    const returnHome = () => {
      authState.socket.disconnect();
      history.push('/');
    }

    const redirectBlock = () => {
        authState.socket.disconnect();
        setAuthState((previousState) => {
            return {...previousState, socket: io(URL)}
        })
        history.push('/block');
    }

    const kickfromRoom = (user_id) => {
        const data = {userId: user_id, boardId: boardId.current, role_id: 5}
        apiParticipations.put('updateRole', data, {
            headers: {  accessToken: localStorage.getItem('accessToken')},
        }).then((res) => {
            if(res.data.error) {
                diffToast(res.data.error);
            }
            else {
                authState.socket.emit('roleStatus', {userId: user_id, roomId: roomId, role_id: 5});
            }
        })
    }

    const setAdmin = (user_id) => {
        const data = {userId: user_id, boardId: boardId.current, role_id: 2}
        apiParticipations.put('updateRole', data, {
            headers: {  accessToken: localStorage.getItem('accessToken')},
        }).then((res) => {
            if(res.data.error) {
                diffToast(res.data.error);
            }
            else {
                authState.socket.emit('roleStatus', {userId: user_id, roomId: roomId, role_id: 2});
            }
        })
    }

    const cancelAdmin = (userId) => {
        const data = {userId: userId, boardId: boardId.current, role_id: 3}
        apiParticipations.put('updateRole', data, {
            headers: {  accessToken: localStorage.getItem('accessToken')},
        }).then((res) => {
            if(res.data.error) {
                diffToast(res.data.error);
            }
            else {
                authState.socket.emit('roleStatus', {userId: userId, roomId: roomId, role_id: 3});
            }
        })
    }

    const onlySee = (userId) => {
        const data = {userId: userId, boardId: boardId.current, role_id: 4} //4: onlysee
        apiParticipations.put('updateRole', data, {
            headers: {  accessToken: localStorage.getItem('accessToken')},
        }).then((res) => {
            if(res.data.error) {
                diffToast(res.data.error);
            }
            else {
                authState.socket.emit('roleStatus', {userId: userId, roomId: roomId, role_id: 4});
            }
        })
    }

    const setEditor = (userId) => {
        const data = {userId: userId, boardId: boardId.current, role_id: 3} //3: editor
        apiParticipations.put('updateRole', data, {
            headers: {  accessToken: localStorage.getItem('accessToken')},
        }).then((res) => {
            if(res.data.error) {
                diffToast(res.data.error);
            }
            else {
                authState.socket.emit('roleStatus', {userId: userId, roomId: roomId, role_id: 3});
            }
        })
    }

    const updateRoleRef = async () => {
        apiParticipations.get(`/isParticipant/${boardId.current}`, {
            headers: {accessToken: localStorage.getItem('accessToken')},
            })
            .then((res) => {
                roleId.current = res.data.role_id;
                if(roleId.current === 5) { // kicked: 5
                    redirectBlock();
                }
            })
    }

    
    const toggleGuide = (role_id, id) => {
        if(roleId.current === 1 ){
            switch (role_id){
                case 1: return (
                        <>
                            <div className='guild'>
                                <span className=''><MdAdminPanelSettings /></span>
                                Owner
                            </div>
                        </>
                        
                    )
                    break;
                case 2: return (
                        <>
                            <button className='kick-btn' onClick={() => {kickfromRoom(id)}}><span><FaBan></FaBan></span>Kick from room</button>
                            <button className= 'cancelAdmin-btn' onClick={() => {cancelAdmin(id)}}><span><RiUserSharedFill></RiUserSharedFill></span>Cancel admin</button>
                            <button className= 'setOnlysee-btn' onClick={() => {onlySee(id)}}><span><FaRegEye /></span>Set only see</button>
                            <div className='guild'>
                                <span className=''><MdOutlineAdminPanelSettings /></span>
                                Admin
                            </div>
                        </>
                        
                    )
                    break;
                case 3: return (
                        <>
                            <button className='kick-btn' onClick={() => kickfromRoom(id)}><span><FaBan></FaBan></span>Kick from room</button>
                            <button className='setAdmin-btn' onClick={() => {setAdmin(id);}}><span><RiUserStarFill></RiUserStarFill></span>Set admin</button>
                            <button className='setOnlysee-btn' onClick={() => {onlySee(id)}}><span><FaRegEye /></span>Set only see</button>
                            <div className='guild'>
                                <span className=''><BiEdit /></span>
                                Edited
                            </div>
                        </>
                        
                    )
                    break;
                case 4: return (
                    <>
                            <button className='kick-btn' onClick={() => kickfromRoom(id)}><span><FaBan></FaBan></span>Kick from room</button>
                            <button className='setAdmin-btn' onClick={() => {setAdmin(id);}}><span><RiUserStarFill></RiUserStarFill></span>Set admin</button>
                            <button className='setEditor-btn' onClick={() => {setEditor(id);}}><span><BiEdit></BiEdit></span>Set Editor</button>
                            <div className='guild'>
                                <span className=''><FaRegEye /></span>
                                Only see
                            </div>
                        </>
                )
                break;
            }
        }else if(roleId.current === 2) {
            switch (role_id){
                case 1: return (
                        <>
                            <div className='guild'>
                                <span className=''><MdAdminPanelSettings /></span>
                                Owner
                            </div>
                        </>
                        
                    )
                    break;
                case 2: return (
                        <>
                            <div className='guild'>
                                <span className=''><MdOutlineAdminPanelSettings /></span>
                                Admin
                            </div>
                        </>
                        
                    )
                    break;
                case 3: return (
                        <>
                            <button className='kick-btn' onClick={() => kickfromRoom(id)}><span><FaBan></FaBan></span>Kick from room</button>
                            <button className='setOnlysee-btn' onClick={() => {onlySee(id)}}><span><FaRegEye /></span>Set only see</button>
                            <div className='guild'>
                                <span className=''><BiEdit /></span>
                                Edited
                            </div>
                        </>
                        
                    )
                    break;
                case 4: return (
                    <>
                            <button className='kick-btn' onClick={() => kickfromRoom(id)}><span><FaBan></FaBan></span>Kick from room</button>
                            <button className='setEditor-btn' onClick={() => {setEditor(id);}}><span><BiEdit></BiEdit></span>Set Editor</button>
                            <div className='guild'>
                                <span className=''><FaRegEye /></span>
                                Only see
                            </div>
                        </>
                )
                break;
            }
        }else{
            switch (role_id){
                case 1: return (
                        <>
                            <div className='guild'>
                                <span className=''><MdAdminPanelSettings /></span>
                                Owner
                            </div>
                        </>
                        
                    )
                    break;
                case 2: return (
                        <>
                            <div className='guild'>
                                <span className=''><MdOutlineAdminPanelSettings /></span>
                                Admin
                            </div>
                        </>
                        
                    )
                    break;
                case 3: return (
                        <>
                            <div className='guild'>
                                <span className=''><BiEdit /></span>
                                Edited
                            </div>
                        </>
                        
                    )
                    break;
                case 4: return (
                        <>
                            <div className='guild'>
                                <span className=''><FaRegEye /></span>
                                Only see
                            </div>
                        </>
                )
                break;
            }
        }
        
    }

    

    const joinRoom = () => {
        if(localStorage.getItem('accessToken')){
            apiUser.get('auth', {
                headers: {accessToken: localStorage.getItem('accessToken')}
                }).then((res) => {
                user.current = res.data;
                setUsername(res.data.username);
                setPhoto(res.data.photo);
                const _user = res.data;
                _user.role_id = roleId.current;

                authState.socket.emit('joinRoom', {roomId, _user});
            });
        }
    }
    
    useEffect(() => {
        window.addEventListener('mousemove', (e) => {
            setCursorX(e.clientX);
            setCursorY(e.clientY);
        })
        const colors = document.getElementsByClassName('colour_button');
        for(let i = 0; i < colors.length; i++){
            colors[i].addEventListener('click', (e) => {
                onColorUpdate(e);
                let color = document.getElementsByClassName('colour_button selected');
                if(color){
                    for(let i=0; i < color.length; i++) {
                        color[i].classList.remove('selected');
                    }
                }
                e.target.classList.add('selected');
            }, true);
        }

        const tools = document.getElementsByClassName('tool_button');
        for(let i = 0; i < tools.length - 1; i++) {
            tools[i].addEventListener('click', (e) => {
                onToolUpdate(e);
                let tool = document.getElementsByClassName('tool_button selected');
                if(tool) {
                    for(let i = 0; i < tool.length; i++){
                        tool[i].classList.remove('selected');
                    }
                }
                e.currentTarget.classList.add('selected');
                e.stopPropagation();
            }, true)
        }

        

        // get list adminId of board
        // check can you participate this room
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
                    
                    roleId.current = res.data.role_id;
                    
                    if(roleId.current === 5) { // kicked: 5
                        redirectBlock();
                    }
                    else {
                        joinRoom();
                    }
                })
            }
          })

        // on socket 
        // get listOfUsers
        authState.socket.on('listOfUsers', listOfUsers => { 
            setListOfUsers(listOfUsers);
        });
        // 
        authState.socket.on('error', (data) => {
            history.push('/overload');
        });

        authState.socket.on('roleStatus', (data) => {
            updateRoleRef();
        });
    }, [])
    return (
        <>
            <div id='controls' ref={control}>
                <div id='services'>
                    {/* <div className='logo'>CodingNepal</div> */}
                    <ul>
                    <li><a href=''onClick={returnHome}>Home</a></li>
                    <li>
                        <a>Tool</a>
                        <ul>
                        {/* <li><a>New</a></li> */}
                        <li>
                            <a>Export</a>
                            <ul>
                                <li><a id='jpeg' onClick={download}>JPEG</a></li>
                                <li><a id='png' onClick={download}>PNG</a></li>
                            </ul>
                        </li>
                        <li><a onClick={() => {document.getElementById('my_file').click();}}>Import</a> <input onInput={uploadImage} onClick={function(e) {e.currentTarget.value = null;}} type='file' id='my_file' accept='image/x-png,image/jpeg' hidden/></li>
                        <li><a onClick={shareLink}>Share</a></li>
                        <li><a onClick={refresh}>Refresh</a></li>
                        </ul>
                    </li>
                    {/* <li>
                        <a href='#'>Services</a>
                        <ul>
                        <li><a href='#'>Web Design</a></li>
                        <li><a href='#'>App Design</a></li>
                        <li>
                            <a href='#'>More</a>
                            <ul>
                            <li><a href='#'>Submenu-1</a></li>
                            <li><a href='#'>Submenu-2</a></li>
                            <li><a href='#'>Submenu-3</a></li>
                            </ul>
                        </li>
                        </ul>
                    </li>
                    <li><a href='#'>Portfolio</a></li>
                    <li><a href='#'>Sign out</a></li> */}
                    </ul>
                    
                    <div>
                    <a className='share-button' onClick={shareLink}>Invite</a>
                    </div>
                    <ul id='listboxuser'>
                        {
                            listOfUsers.map((value, key) => {
                                if(user.current.id !== value.id) {
                                    return (
                                        <li key={key}>
                                            <img src={value.photo}></img>
                                            <div className= 'control-user'>
                                            <div className='name'>{value.username}<span>{value.socketId}</span></div>
                                                {
                                                    toggleGuide(value.role_id, value.id)
                                                }
                                            </div>
                                        </li>
                                    );
                                }
                            })
                        }
                        <li>
                            <img src={photo}></img>
                            <div className= 'control-user'>
                                <div className='name'>You</div>
                                {
                                    toggleGuide(roleId.current)
                                }
                            </div>
                            <span className='user-name'>{username}</span>
                        </li>
                    </ul>
                    
                </div>
                <div id='tools'>
                    {/* <button className='tool_button' id='drag'><svg width='24' height='24' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'><path d='M 535 50C 535 50 650 165 650 165C 665 180 668 202 661 219C 654 236 636 250 615 250C 615 250 550 250 550 250C 550 250 550 450 550 450C 550 450 750 450 750 450C 750 450 750 385 750 385C 750 364 764 346 781 339C 787 337 794 335 802 336C 814 336 826 341 835 350C 835 350 950 465 950 465C 969 484 969 516 950 535C 950 535 835 650 835 650C 820 665 798 668 781 661C 764 654 750 636 750 615C 750 615 750 550 750 550C 750 550 550 550 550 550C 550 550 550 750 550 750C 550 750 615 750 615 750C 636 750 654 764 661 781C 668 798 665 820 650 835C 650 835 535 950 535 950C 516 969 484 969 465 950C 465 950 350 835 350 835C 335 820 332 798 339 781C 346 764 364 750 385 750C 385 750 450 750 450 750C 450 750 450 550 450 550C 450 550 250 550 250 550C 250 550 250 615 250 615C 250 636 236 654 219 661C 202 668 180 665 165 650C 165 650 50 535 50 535C 31 516 31 484 50 465C 50 465 165 350 165 350C 174 341 186 336 198 336C 206 335 213 337 219 339C 236 346 250 364 250 385C 250 385 250 450 250 450C 250 450 450 450 450 450C 450 450 450 250 450 250C 450 250 385 250 385 250C 364 250 346 236 339 219C 332 202 335 180 350 165C 350 165 465 50 465 50C 474 40 487 36 500 36C 513 36 526 40 535 50C 535 50 535 50 535 50'/></svg></button> */}
                    <button className='tool_button' id='text'>A</button>
                    <button className='tool_button selected' id='pencil'><svg width='24' height='24' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'><path d='M 895 208C 908 221 908 244 895 258C 895 258 843 309 843 309C 843 309 691 156 691 156C 691 156 742 106 742 106C 755 91 778 91 793 106C 793 106 895 208 895 208M 793 361C 793 361 360 792 360 792C 360 792 207 640 207 640C 207 640 640 208 640 208C 640 208 793 361 793 361M 309 843C 309 843 283 868 283 868C 279 874 272 877 266 879C 266 879 138 904 138 904C 114 909 91 887 96 861C 96 861 122 735 122 735C 122 727 127 722 131 716C 131 716 157 690 157 690C 157 690 309 843 309 843'/></svg></button>
                    <button className='tool_button' id='eraser'><svg width='26' height='26' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'><path d='M 667 202C 667 202 844 379 844 379C 878 413 878 469 844 503C 844 503 625 722 625 722C 625 722 845 722 845 722C 845 722 846 797 846 797C 846 797 323 797 323 797C 313 797 303 793 296 786C 296 786 190 680 190 680C 156 646 156 590 190 556C 190 556 544 202 544 202C 561 186 583 177 605 177C 628 177 650 186 667 202C 667 202 667 202 667 202M 597 255C 597 255 411 441 411 441C 411 441 605 636 605 636C 605 636 791 450 791 450C 796 445 796 438 791 432C 791 432 614 255 614 255C 612 253 609 251 605 251C 602 251 599 253 597 255C 597 255 597 255 597 255'/></svg></button>
                    <button className='tool_button' id='line' ><svg width='26' height='26' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'><path d='M 184 750C 184 750 184 750 184 750C 171 737 171 716 184 703C 184 703 703 184 703 184C 716 171 737 171 750 184C 750 184 816 250 816 250C 829 263 829 284 816 297C 816 297 297 816 297 816C 284 829 263 829 250 816C 250 816 184 750 184 750'/></svg></button>
                    <button className='tool_button' id='rectangle'><svg width='20' height='20' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'><path d='M 50 0C 22 0 0 22 0 50C 0 50 0 950 0 950C 0 978 22 1000 50 1000C 50 1000 950 1000 950 1000C 978 1000 1000 978 1000 950C 1000 950 1000 50 1000 50C 1000 22 978 0 950 0C 950 0 50 0 50 0C 50 0 50 0 50 0M 0,0'/></svg></button>
                    <button className='tool_button' id='circle'><svg width='20' height='20' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'><path d='M 500 0C 224 0 0 224 0 500C 0 776 224 1000 500 1000C 776 1000 1000 776 1000 500C 1000 224 776 0 500 0C 500 0 500 0 500 0M 0,0'/></svg></button>
                    <button className='tool_button' id='undo' onClick={undoBoard}><svg width="24" height="24" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M 563 75C 563 75 563 118 563 118C 755 149 897 321 887 518C 877 728 702 891 493 887C 283 883 115 713 113 504C 112 483 129 466 150 465C 171 465 188 482 188 503C 189 673 325 809 494 812C 664 816 804 684 812 515C 820 359 712 224 563 194C 563 194 563 225 563 225C 562 240 553 254 539 260C 525 265 509 262 498 252C 498 252 423 177 423 177C 409 162 409 138 423 123C 423 123 498 48 498 48C 505 42 514 38 524 38C 545 37 562 54 563 75C 563 75 563 75 563 75"/></svg></button>
                    <div id='size'>
                        <input type='range' onInput={(e) => {onSizeUpdate(e); onSizeCursorUpdate(e);}} min='1' max='100' class='slider'  id='size_slider' />
                    </div>
                    
                </div>
                <hr />
                <div className='color-container'>
                    <span className='slide-color' onClick={closeColor}><FaChevronLeft/></span>
                    <SketchPicker className = 'color_picker'
                        color={color} onChange={(updateColor) => {setColor(updateColor.hex); onColorUpdate(updateColor.hex);}}
                    />
                </div>
                
                {/* <p id='size_label' style={{color: 'red'}}>Size: 5</p> */}
                </div>
                <div className='cursor'
                    style={{
                        left:cursorX - size/2 + 'px',
                        top: cursorY - size/2 + 'px',
                        width: size + 'px',
                        height: size + 'px',
                    }}
                >
                </div>
        </>
    )
}

export default Control
