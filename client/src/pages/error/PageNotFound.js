import React, { useRef, useEffect } from 'react';
import { Link, useHistory } from "react-router-dom";
import './style.css';
function PageNotFound() {
    const container = useRef(null);
    useEffect(() => {
        container.current.addEventListener('mousemove', (e) => {
            const x = -e.clientX/5,
                  y = -e.clientY/5;
            container.current.style.backgroundPositionX = x + 'px';
            container.current.style.backgroundPositionY = y + 'px';
        }, true)
    },[]);
    return (
        <div ref={container} id="pnf_container">
            <div className="content">
                <h2>404</h2>
                <h4>Opps! Page not found</h4>
                <p>The page you were looking for doesn't exist. You may have mistyped
                    address or the page may have moved.
                </p>
                <a><Link to={'/'}>Back To Home</Link></a>
            </div>
        </div>
    )
}

export default PageNotFound
