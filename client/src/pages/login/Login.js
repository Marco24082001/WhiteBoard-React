import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {toast} from 'react-toastify';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../../helpers/AuthContext';
import isEmpty from 'validator/lib/isEmpty';
import isEmail from 'validator/lib/isEmail';
import logodut from '../../images/logodut.png';
import './style.css';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API}/users/`,
})

function Login() {
  const room = useParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat_password, setRepeat_password] = useState('');
  const [validationMsg, setValidationMsg] = useState('');
  const [check, setCheck] = useState('checked');
  const { setAuthState } = useContext(AuthContext);
  const diffToast = (msg) => {
    toast(msg);
  }
  let history = useHistory();

  const handleCheck = () => {
    setCheck(!check);
  }
  
  const validateLg = () => {
    const msg = {};
    if(isEmpty(email)) {
      msg.email = 'Please input your email';
    }

    if(isEmpty(password)){
      msg.password = 'Please input your password';
    }

    setValidationMsg(msg);
    if(Object.keys(msg).length > 0) return false;
    return true;
  }

  const validateRg = () => {
    const msg = {};
    
    if(isEmpty(username)) {
      msg.username = 'Please input your email';
    }

    if(isEmpty(password)){
      msg.password = 'Please input your password';
    }

    if(password !== repeat_password){
      msg.repeat_password = 'Please re-enter a correct password';
    }

    if(isEmpty(repeat_password)){
      msg.repeat_password = 'Please repeat your password';
    }

    if(!isEmail(email)){
      msg.email = 'Please re-enter a valid email address';
      console.log(isEmail(email))
    }

    if(isEmpty(email)){
      msg.email = 'Please in put your email';
    }


    setValidationMsg(msg);
    if(Object.keys(msg).length > 0) return false;
    return true;
  }

  const login = async () => {
    const isValid = validateLg();
    if(!isValid) return;
    const data = { email: email, password: password };
    api.post('login', data).then((res) => {
      if (res.data.error) {
        diffToast(res.data.error);
        // alert(res.data.error);
      } else {
        localStorage.setItem('accessToken', res.data); 
        // setAuthState((previousState) => {
        //   return {...previousState, status: true}
        // });
        if(room.id !== undefined) history.push(`board/${room.id}`)
        else history.push('/');
      }
    });
  };



  const register = () =>{
    const isValid = validateRg();
    if(!isValid) return;
    const data = { username: username, email: email, password: password, photo: 'https://res.cloudinary.com/h-b-ch-khoa/image/upload/v1636871977/question_xfpegi.png'};
    console.log(data);
    api.post('', data).then((res) => {
      if (res.data.error) {
        diffToast(res.data.error);
      } else {
        localStorage.setItem('accessToken', res.data);
        setAuthState((previousState) => {
          return {...previousState, status: true};
        });
        history.push('/');
      }
    });
  }

  const handleKeypress_lg = e => {
    if(e.charCode === 13) {
      login();
    }
  }

  const handleKeypress_rg = e => {
    if(e.charCode === 13) {
      register();
    }
  }

  return (
    <>
      <div className='login-container'>
        <div className='about-wrap'>
          <div className='about-html'>
            <h1 className='about-title'>
              <div id='abouttlt'>
                TingTy.io
              </div>
              <div id='descriptiontlt'>A collaboration painting application by DUT
                <img src={logodut}/>
              </div>
              <div id='about-btn'>
                <button>Start drawing</button>
              </div>
            </h1>
          </div>
        </div>
        <div className='login-wrap'>
          <div className='login-html'>
            <input id='tab-1' type='radio' name='tab' className='sign-in' checked={check} onClick={handleCheck}/><label for='tab-1' className='tab'>Sign In</label>
            <input id='tab-2' type='radio' name='tab' className='sign-up' onClick={handleCheck}/><label for='tab-2' className='tab'>Sign Up</label>
            <div className='login-form'>
              <div className='sign-in-htm'>
                <div className='group'>
                  <label for='email' className='label'>Email</label>
                  <input id='email' type='email' className='input' onChange={(event) => {setEmail(event.target.value)}} onKeyPress={handleKeypress_lg}/>
                  <p className='error-text'>{validationMsg.email}</p>
                </div>
                <div className='group'>
                  <label for='pass' className='label'>Password</label>
                  <input id='pass' type='password' className='input' data-type='password' onChange={(event) => {setPassword(event.target.value)}} onKeyPress={handleKeypress_lg}/>
                  <p className='error-text'>{validationMsg.password}</p>
                </div>
                <div className='group'>
                  <input id='check' type='checkbox' className='check' checked/>
                  <label for='check'><span className='icon'></span> Keep me Signed in</label>
                </div>
                <div className='group'>
                  <input type='submit' className='button' value='Sign In' onClick={login}/>
                </div>
                <div className='hr'></div>
                <div className='foot-lnk'>
                  <a><Link to={'/reset'}>Forgot Password?</Link></a>
                </div>
              </div>
              <div className='sign-up-htm'>
                <div className='group'>
                  <label for='user' className='label'>Username</label>
                  <input id='user' type='text' className='input' onChange={(event) => {setUsername(event.target.value)}} onKeyPress={handleKeypress_rg}/>
                  <p className='error-text'>{validationMsg.username}</p>
                </div>
                <div className='group'>
                  <label for='pass' className='label'>Password</label>
                  <input id='pass' type='password' className='input' data-type='password' onChange={(event) => {setPassword(event.target.value)}} onKeyPress={handleKeypress_rg}/>
                  <p className='error-text'>{validationMsg.password}</p>
                </div>
                <div className='group'>
                  <label for='pass' className='label'>Repeat Password</label>
                  <input id='pass' type='password' className='input' data-type='password' onChange={(event) => {setRepeat_password(event.target.value)}} onKeyPress={handleKeypress_rg}/>
                  <p className='error-text'>{validationMsg.repeat_password}</p>
                </div>
                <div className='group'>
                  <label for='pass' className='label'>Email Address</label>
                  <input id='pass' type='text' className='input' onChange={(event) => {setEmail(event.target.value)}} onKeyPress={handleKeypress_rg}/>
                  <p className='error-text'>{validationMsg.email}</p>
                </div>
                <div className='group'>
                  <input type='submit' className='button' value='Sign Up' onClick={register}/>
                </div>
                <div className='hr'></div>
                <div className='foot-lnk'>
                  <label for='tab-1'>Already Member?</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;

