import React from 'react';
import ReactDOM from 'react-dom';
import { default as SimulatorSkeleton } from "./SimulatorSkeletonComponent";
import { default as GetDataFile } from "./FilePickerComponent";

window.loadReact = function(){
    try{
        let uploadRef = React.createRef();
        ReactDOM.render(<GetDataFile passFileName={getFileName} loadDefaultData={loadDefaultData} ref={uploadRef}/>, document.getElementById('tsne-simulator-container'));
        
        function getFileName(fileObj){
            let fileUrl = null;
            if (fileObj != undefined && fileObj != null){
                console.log(`Loading data from ${fileObj.name}`);
                uploadRef.current.value = "LOADING";
                fileUrl = window.URL.createObjectURL(fileObj);

                loadData(fileUrl)
                .then((data) => {
                        if (data.length > 0){
                            ReactDOM.render(<SimulatorSkeleton {...{data:data}}/>, document.getElementById("tsne-simulator-container"))
                        }
                    }, (error) => {console.log("Error: ", error)}
                )
                .catch(err => {
                    alert("file not in currect format");
                    throw err
                });
            }
            else{
                console("file Object is null")
            }
        }
        
        function loadDefaultData(data){
            if (window.defaultDataLoaded){
                data = window.demoDefaultData
                ReactDOM.render(<SimulatorSkeleton {...{data:data}}/>, document.getElementById("tsne-simulator-container"))
            }else{
                console.log(`data is not correct`)
            }
        }

    }catch(err){
        // Ask node to exit
        console.log(err)
    }
};

function loadData(fileName){
    return new Promise((resolve, reject) => {
        d3.json(fileName,
            function(data) {
                console.log(`${data.length} rows read from sampleData.json`);
                resolve(data);
            }, function(error){
                console.log(`Error reading from sampleData.json`);
                reject(error);
            }
        );
    });
};

const checkScriptsReady = () => {
    if (window.scriptsLoaded == true){
        console.log("Loading react app..");
        window.loadReact();
        return true
    }
    else console.log("Waiting for scripts to load..");
    return false
}

const executeApp = (maxTries) => {
    setTimeout(function () {
        var ready = checkScriptsReady();
        if (!ready){
            if (--maxTries) executeApp(maxTries) 
            else {
                console.log("Could not load scripts")     //  decrement i and call executeApp again if i > 0       
            }
        }else{
            return
        }
    }, 1000)
 };
const LoadingMessage = (props) => <div id={props.id}>{props.message}</div>
ReactDOM.render(<LoadingMessage message={"Loading Scripts"} id={"loading-message"}/>, document.getElementById('tsne-simulator-container'));
executeApp(10); // 10 referes to num of tries. (corresponds to waiting 10 secs for scripts to load, checking every sec if they have loaded)