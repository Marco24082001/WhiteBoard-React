import React from 'react'
import { useRef, useEffect } from 'react';
import './style.css'
// import { ReactComponent as LogIcon } from '../../icons/circle.svg';
import pencil from '../../icons/pencil.svg';
import eraser from '../../icons/eraser.svg';
import line from '../../icons/line.svg';
import rectangle from '../../icons/rectangle.svg';
import circle from '../../icons/circle.svg';
// rfce
function Control({onColorUpdate, onColorUpdateField, onSizeUpdate, onToolUpdate}) {
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
            }, false);
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
                e.target.classList.add('selected');
            }, false)
        }
    })
    return (
        <div id='controls'>
            <p>Tools</p>
            <div id='tools'>
                <button className='tool_button selected' id='pencil' style={{
                    backgroundImage: `url(${pencil})`,
                }}></button>
                <button className='tool_button' id='eraser' style={{
                    backgroundImage: `url(${eraser})`,
                }}></button>
                <button className='tool_button' id='line' style={{
                    backgroundImage: `url(${line})`,
                }}></button>
                <button className='tool_button' id='rectangle' style={{
                    backgroundImage: `url(${rectangle})`,
                }}></button>
                <button className='tool_button' id='circle' style={{
                    backgroundImage: `url(${circle})`,
                }}></button>
            </div>
            <hr />
            <p id='size_label'>Size: 5</p>
            <div id='size'>
                <input type='range' onInput={(e) => {document.getElementById('size_label').innerText = 'Size: ' + e.target.value; onSizeUpdate(e)}} min='1' max='100' class='slider' step='0.1' id='size_slider' />
            </div>
            <hr />
            <p>Colour</p>
            <div id='colours'>
                <button className='colour_button selected' id='black'></button>
                <button className='colour_button' id='crimson'></button>
                <button className='colour_button' id='orange'></button>
                <button className='colour_button' id='yellow'></button>
                <button className='colour_button' id='springgreen'></button>
                <button className='colour_button' id='dodgerblue'></button>
                <button className='colour_button' id='midnightblue'></button>
                <input id='colourfield' onInput={onColorUpdateField} type="color" />
            </div>
            
        </div>
    )
}

export default Control
