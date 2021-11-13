import React from 'react'
import { useHistory } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { SketchPicker } from 'react-color';
import {FaChevronLeft} from 'react-icons/fa';
import { AuthContext } from "../../helpers/AuthContext";
import {io} from 'socket.io-client';
import './style.css'

const URL = `http://localhost:3000`;
// import { ReactComponent as LogIcon } from '../../icons/circle.svg';
// rfce
function Control({onColorUpdate, onSizeUpdate, onToolUpdate, roomId, download, refresh, uploadImage}) {
    const [color, setColor] = useState("lightblue");
    let history = useHistory();
    const linkURL = `${URL}/${roomId}`
    const { authState, setAuthState } = useContext(AuthContext);

    // share link
    const shareLink = () => {
        let copyTextarea = document.createElement("textarea");
        copyTextarea.style.position = "fixed";
        copyTextarea.style.opacity = "0";
        copyTextarea.textContent = linkURL;
        document.body.appendChild(copyTextarea);
        copyTextarea.select();
        document.execCommand("copy");
        document.body.removeChild(copyTextarea);
        let shareButton = document.querySelector(".share-button");
        shareButton.classList.add("active");
        setTimeout(() => {
            shareButton.classList.remove("active");
        },2500);
    }

    const closeColor = (e) => {
        let color_container = document.querySelector(".color-container");
        if(color_container.classList.contains('active')){
            color_container.classList.remove('active');
            e.currentTarget.classList.remove('active');
        }else {
            color_container.classList.add('active');
            e.currentTarget.classList.add('active');
        }
        
    }

    const returnHome = () => {
      authState.socket.disconnect();
      setAuthState((previousState) => {
        return {...previousState, socket: io(URL)}
      })
      history.push('/');
    }

    useEffect(() => {
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
        for(let i = 0; i < tools.length; i++) {
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
    })
    return (
        
        <div id='controls'>
            <div id='services'>
                {/* <div className='logo'>CodingNepal</div> */}
                <ul>
                <li><a href=''onClick={returnHome}>Home</a></li>
                <li>
                    <a>File</a>
                    <ul>
                    <li><a>New</a></li>
                    <li>
                        <a>Export</a>
                        <ul>
                            <li><a id='jpeg' onClick={download}>JPEG</a></li>
                            <li><a id='png' onClick={download}>PNG</a></li>
                        </ul>
                    </li>
                    <li><a onClick={() => {document.getElementById('my_file').click();}}>Import</a> <input onChange={uploadImage} type="file" id="my_file" accept="image/x-png,image/jpeg" hidden/></li>
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
                </li> */}
                {/* <li><a href='#'>Portfolio</a></li>
                <li><a href='#'>Sign out</a></li> */}
                </ul>
                <div>
                <a className='share-button' onClick={shareLink}>Invite</a>
                </div>
                
            </div>
            <div id='tools'>
            <button className='tool_button' id='drag'><svg width="24" height="24" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M 535 50C 535 50 650 165 650 165C 665 180 668 202 661 219C 654 236 636 250 615 250C 615 250 550 250 550 250C 550 250 550 450 550 450C 550 450 750 450 750 450C 750 450 750 385 750 385C 750 364 764 346 781 339C 787 337 794 335 802 336C 814 336 826 341 835 350C 835 350 950 465 950 465C 969 484 969 516 950 535C 950 535 835 650 835 650C 820 665 798 668 781 661C 764 654 750 636 750 615C 750 615 750 550 750 550C 750 550 550 550 550 550C 550 550 550 750 550 750C 550 750 615 750 615 750C 636 750 654 764 661 781C 668 798 665 820 650 835C 650 835 535 950 535 950C 516 969 484 969 465 950C 465 950 350 835 350 835C 335 820 332 798 339 781C 346 764 364 750 385 750C 385 750 450 750 450 750C 450 750 450 550 450 550C 450 550 250 550 250 550C 250 550 250 615 250 615C 250 636 236 654 219 661C 202 668 180 665 165 650C 165 650 50 535 50 535C 31 516 31 484 50 465C 50 465 165 350 165 350C 174 341 186 336 198 336C 206 335 213 337 219 339C 236 346 250 364 250 385C 250 385 250 450 250 450C 250 450 450 450 450 450C 450 450 450 250 450 250C 450 250 385 250 385 250C 364 250 346 236 339 219C 332 202 335 180 350 165C 350 165 465 50 465 50C 474 40 487 36 500 36C 513 36 526 40 535 50C 535 50 535 50 535 50"/></svg></button>
                <button className='tool_button selected' id='pencil'><svg width="24" height="24" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M 895 208C 908 221 908 244 895 258C 895 258 843 309 843 309C 843 309 691 156 691 156C 691 156 742 106 742 106C 755 91 778 91 793 106C 793 106 895 208 895 208M 793 361C 793 361 360 792 360 792C 360 792 207 640 207 640C 207 640 640 208 640 208C 640 208 793 361 793 361M 309 843C 309 843 283 868 283 868C 279 874 272 877 266 879C 266 879 138 904 138 904C 114 909 91 887 96 861C 96 861 122 735 122 735C 122 727 127 722 131 716C 131 716 157 690 157 690C 157 690 309 843 309 843"/></svg></button>
                <button className='tool_button' id='eraser'><svg width="26" height="26" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M 667 202C 667 202 844 379 844 379C 878 413 878 469 844 503C 844 503 625 722 625 722C 625 722 845 722 845 722C 845 722 846 797 846 797C 846 797 323 797 323 797C 313 797 303 793 296 786C 296 786 190 680 190 680C 156 646 156 590 190 556C 190 556 544 202 544 202C 561 186 583 177 605 177C 628 177 650 186 667 202C 667 202 667 202 667 202M 597 255C 597 255 411 441 411 441C 411 441 605 636 605 636C 605 636 791 450 791 450C 796 445 796 438 791 432C 791 432 614 255 614 255C 612 253 609 251 605 251C 602 251 599 253 597 255C 597 255 597 255 597 255"/></svg></button>
                <button className='tool_button' id='line' ><svg width="26" height="26" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M 184 750C 184 750 184 750 184 750C 171 737 171 716 184 703C 184 703 703 184 703 184C 716 171 737 171 750 184C 750 184 816 250 816 250C 829 263 829 284 816 297C 816 297 297 816 297 816C 284 829 263 829 250 816C 250 816 184 750 184 750"/></svg></button>
                <button className='tool_button' id='rectangle'><svg width="20" height="20" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M 50 0C 22 0 0 22 0 50C 0 50 0 950 0 950C 0 978 22 1000 50 1000C 50 1000 950 1000 950 1000C 978 1000 1000 978 1000 950C 1000 950 1000 50 1000 50C 1000 22 978 0 950 0C 950 0 50 0 50 0C 50 0 50 0 50 0M 0,0"/></svg></button>
                <button className='tool_button' id='circle'><svg width="20" height="20" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M 500 0C 224 0 0 224 0 500C 0 776 224 1000 500 1000C 776 1000 1000 776 1000 500C 1000 224 776 0 500 0C 500 0 500 0 500 0M 0,0"/></svg></button>
                {/* <button className='' */}
                <div id='size'>
                    <input type='range' onInput={(e) => {onSizeUpdate(e)}} min='1' max='100' class='slider'  id='size_slider' />
                </div>
                
            </div>
            <hr />
            <div className='color-container'>
                <span className='slide-color' onClick={closeColor}><FaChevronLeft/></span>
                <SketchPicker className = 'color_picker'
                    color={color} onChange={(updateColor) => {setColor(updateColor.hex); onColorUpdate(updateColor.hex);}}
                />
            </div>
            
            {/* <p id='size_label' style={{color: "red"}}>Size: 5</p> */}
            
            
        </div>
    )
}

export default Control
