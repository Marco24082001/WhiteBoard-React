import React from 'react'
import './style.css';
import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../helpers/AuthContext';
import user from '../../images/question.png';
import {io} from 'socket.io-client';

function Navbar(props) {
  let history = useHistory();
  const { authState, setAuthState } = useContext(AuthContext);
  const logout = () => {
    localStorage.removeItem('accessToken')
    history.push('/login')
    setAuthState((previousState) => {
      return {...previousState, status: false};
    })
  }

  useEffect(() => {

  },[]);

  return (
    <>
      <div className='user-setting'>
        <h2>User settings</h2>
        <div className='setting-form'>
          <div className='form-group'>
            <label>display name</label>
            <input type='text'placeholder='input your name'/>
          </div>
          <div className='form-group'>
            <label>avatar</label>
            <div className='avartar'>
              <img src=''></img>
              <input type='file' id='file' accept='image/x-png,image/jpeg' hidden/>
              <label for='file' id='uploadbtn'>Choose photo</label>
            </div>
            
          </div>
          <div className='button-group'>
            <button type='submit' id='setting-save'>Save</button>
            <button type='button' id='setting-cancel'>Cancel</button>
          </div>
        </div>
      </div>
      <div className='nav-bar'>
        <div className='logo'>TingTy</div>
        <ul>
          <li><img className='user_photo' src={user}></img></li>
          {/* <li>
            <a href='#'>Feature</a>
            <ul>
              <li><a href='#'>Pages</a></li>
              <li><a href='#'>Elements</a></li>
              <li><a href='#'>Icons</a></li>
            </ul>
          </li> */}
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
          <li><a href='' onClick={logout}>Sign out</a></li>
        </ul>
      </div>
    </>
  );
}

export default Navbar;



