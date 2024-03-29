import React from 'react'
import './style.css';
import axios from 'axios';
import { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../helpers/AuthContext';
import {toast} from 'react-toastify';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API}/users/`
})

function Navbar() {
  // const [validationMsg, setValidationMsg] = useState('');
  const [username, setUsername] = useState('');
  const [image, setImage] = useState('');
  const [url, setUrl] = useState('');
  const count = useRef(0);
  let history = useHistory();
  const { setAuthState } = useContext(AuthContext);

  const diffToast = (msg) => {
    toast(msg);
  }
  const logout = () => {
    localStorage.removeItem('accessToken')
    history.push('/login')
    setAuthState((previousState) => {
      return {...previousState, status: false};
    })
  }

  const openSetting = () => {
    const user_setting = document.getElementById('user-setting');
    user_setting.classList.add('active');
  }

  const closeSetting =() => {
    const user_setting = document.getElementById('user-setting');
    user_setting.classList.remove('active');
  }

  const changeImage = (e) => {
    const ChooseFile = e.target.files[0];
    if(validateImage(ChooseFile)) {
      setImage(e.target.files[0]);
      const img = document.getElementById('photo');
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        img.src = reader.result;
      })

      reader.readAsDataURL(ChooseFile);
    }
  }

  const validateImage = (file) => {
    const size = parseFloat(file.size / (1024)).toFixed(2);
    if(size > 500) {
      toast('Please select size less than 500 KB');
      return false;
    }
    return true;
  } 

  const validateSetting = () => {
    if(username === ''){
      diffToast('Please input username !');
      return false;
    }
    return true;
  }

  const settingInfo = () => {
    console.log('sdfsdf');
    if(validateSetting()){
      const user_setting = document.getElementById('user-setting');
      if(image !== ''){
        const data = new FormData();
        data.append('file', image);
        data.append('upload_preset', 'white-board');
        data.append('cloud_name', 'h-b-ch-khoa');;
        fetch(process.env.REACT_APP_UPLOAD_URL, {
          method: 'post',
          body: data
        })
        .then(res => res.json())
        .then(data => {
          setUrl(data.url);
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          setImage('');
          user_setting.classList.remove('active');
        });
      }
      else {
        console.log('vao roi');
        const data = {username: username, photo: url};
        console.log(username);
        api.put('setting-info/', data, { 
          headers: { accessToken: localStorage.getItem("accessToken")},
        })
        .then(res => {
          if (res.data.error) diffToast(res.data.error);
          else {
            
            document.getElementById('user_photo').src = url;
            document.getElementById('photo').src = url;
            localStorage.setItem('accessToken', res.data); 
          }
          })
        .catch(err => diffToast(err));  setUrl(url);
        user_setting.classList.remove('active');
      }
    }
  }

  useEffect(() => {
    console.log("effect")
    api.get('auth', {
      headers: {accessToken: localStorage.getItem('accessToken')}
      }).then((res) => {
        console.log('sdfsddsfsd')
        if(!res.data.error){
          document.getElementById('username').value = res.data.username;
          setUsername(res.data.username);
        }
    });

    api.get('photo', {
      headers: { accessToken: localStorage.getItem("accessToken")},
    }).then(res => {
      if(res.data.error) diffToast(res.data.error);
      else {
        console.log(res.data.photo);
        setUrl(res.data.photo);
      }
    })
  },[]);



  useEffect(() => {
    if(url !== '') {
      console.log('vao roi');
      const data = {username: username, photo: url};
      console.log(username);
      api.put('setting-info/', data, { 
        headers: { accessToken: localStorage.getItem("accessToken")},
      })
      .then(res => {
        if (res.data.error) diffToast(res.data.error);
        else {
          
          document.getElementById('user_photo').src = url;
          document.getElementById('photo').src = url;
          localStorage.setItem('accessToken', res.data); 
        }
      })
      .catch(err => diffToast(err));      
    }
    count.current++;
  },[url]);

  return (
    <>
      <div id='user-setting'>
        <h2>User settings</h2>
        <div className='setting-form'>
          <div className='form-group'>
            <label>display name</label>
            <input id='username'
             type='text'
             placeholder='input your name'
             onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label>avatar</label>

            <div className='avartar'>
              <img id='photo' src=''></img>
              <input 
                type='file' id='file' 
                accept='image/x-png,image/jpeg' 
                onChange={changeImage}
              hidden/>
              <label for='file' id='uploadbtn'>Choose photo</label>
            </div>
          </div>
          <div className='button-group'>
            <button type='submit' id='setting-save' onClick={settingInfo}>Save</button>
            <button type='button'id='setting-cancel' onClick={closeSetting}>Cancel</button>
          </div>
        </div>
      </div>
      <div className='nav-bar'>
        <div className='logo'>TingTy</div>
        <ul>
          <li><img id='user_photo' onClick={openSetting} src=''></img></li>
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



