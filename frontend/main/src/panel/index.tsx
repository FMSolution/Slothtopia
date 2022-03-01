import React, { useEffect, useState } from "react";
import './styles.css';


const DND = () => {

 
    const [uFiles, setUFiles] = useState<any>([]);
    const [fData, setFData] = useState<string[]>([])
    useEffect(() => {
        getData()    
        console.log(uFiles[0])    
    },[uFiles,fData])
   

    const transferData = async () => {
        let formData = new FormData();
        formData.append('u_Files', uFiles)
    
        await fetch('https://localhost:3000/', {
          credentials:'include',
            method:'POST',
            body:formData
          }).then(async function (res){
            if(res.status === 200){
                console.log("Data Fetched to server!")
            }else{
            }
          })
          .catch((err) => {
              console.log(err)
          })
    };

    const getData = async () => {
        await fetch('http://localhost:3000',{'credentials':'include'})
        .then(res => { 
            if (res.status === 200)
            {
                return res.json()
            }})
        .then(jRes => {
            setFData(jRes)
        })
        .catch(err => 
            console.log(err)    
        );
    };


        

    return(
        <div className="dnd">
            <div className="d-box">
                <h2>Drop your files here</h2>
                <input type="file" id="sfs" multiple onChange={(e) => {setUFiles(e.target.files);transferData()}}/>
                <label htmlFor="sfs" > Import files <img src="https://img.icons8.com/wired/64/000000/import.png"/></label>
            </div>
            <div className="r_panel">
                <h3>Uploaded Files</h3>
                {fData.map((f:any) => 
                    <p><span>1.</span>{f.name} <button onClick={() => setFData(fData.filter(item => item !== f.name))}> &#x26D4;</button></p>
                )}
            </div>
        </div>
    )
};

export default DND;