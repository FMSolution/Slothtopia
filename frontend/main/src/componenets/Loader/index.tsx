import React,{useState} from 'react'
import './styles.css'
function Loader({ isLoading } : {isLoading:boolean}) {
  const loading = useState<boolean>(isLoading)
  return(
  
    loading ?
      <div className="loader-holder" id="main-loading">
        <div className="sk-folding-cube">
          <div className="sk-cube1 sk-cube"></div>
          <div className="sk-cube2 sk-cube"></div>
          <div className="sk-cube4 sk-cube"></div>
          <div className="sk-cube3 sk-cube"></div>
        </div>
        <div id="load">
          <div>A</div>
          <div>I</div>
          <div>P</div>
          <div>O</div>
          <div>T</div>
          <div>H</div>
          <div>T</div>
          <div>O</div>
          <div>L</div>
          <div>S</div>
        </div>
    </div>
    :
    <></>
  
  );
}


export default Loader;