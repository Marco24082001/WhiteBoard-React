import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../helpers/AuthContext';
import {toast} from 'react-toastify';
import isEmpty from 'validator/lib/isEmpty';
import isEmail from 'validator/lib/isEmail';
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API}/auth/`
})

function Forgot() {
  const [email, setEmail] = useState('');
  const { setAuthState } = useContext(AuthContext);
  const [validationMsg, setValidationMsg] = useState('');
  let history = useHistory();

  const diffToast = (msg) => {
    toast(msg);
  }

  const validateEmail = () => {
    const msg = {};
    if(!isEmail(email)){
      msg.email = 'Please re-enter a valid email address';
      console.log(isEmail(email))
    }

    if(isEmpty(email)) {
      msg.email = 'Please input your new email';
    }
    setValidationMsg(msg);
    if(Object.keys(msg).length > 0) return false;
    return true;
  }
  const send = () => {
    const isValid = validateEmail();
    if(!isValid) return;
    const data = { email: email };
    api.post('reset-password', data).then((res) => {
      if (res.data.error) {
        diffToast(res.data.error);
      } else {
        diffToast(res.data.message);
        history.push('/login');
      }
    });
  };

  return (
    <div className='login-container'>
      <div className='login-wrap'>
        <div className='login-html'>
          <input id='tab-1' type='radio' name='tab' className='sign-in' checked /><label for='tab-1' className='tab'>Forgot Password</label>
          <input id='tab-2' type='radio' name='tab' className='sign-up'/><label for='tab-2' className='tab'></label>
          <div className='login-form'>
            <div className='sign-in-htm'>
              <div className='group'>
                <label for='user' className='label'>Email</label>
                <input id='user' type='text' className='input' onChange={(event) => {setEmail(event.target.value)}}/>
                <p className='error-text'>{validationMsg.email}</p>
              </div>
              <div className='group'>
                <input type='submit' className='button' value='Submit' onClick={send}/>
              </div>
              <div className='hr'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    
  );
}

export default Forgot;

