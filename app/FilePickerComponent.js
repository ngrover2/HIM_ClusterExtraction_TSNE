import React from 'react';
import { useState, useEffect } from 'react';
import { Form, Input, Label, Button, Segment, Header, Grid, Divider } from 'semantic-ui-react';

window.logFileName = function(name) {
    console.log(`Selected: ${name}`)
}

const GetDataFile = React.forwardRef((props, ref) => {
    
    // use react useState hooks because this is a function component
    const [file, setFile] = useState(null)
    var [currentSelection, setCurrentSelection] = useState("Selected file name will appear here.")

    const [ sampleDataReqId, setSampleDataReqId] = useState(0);
    const [ defaultDataLoaded, setDefaultDataLoaded] = useState(false);
    const [ dataDownloading, setDataDownloading ] = useState(false);
    const [ loaderStateMessage, setLoaderStateMessage ] = useState("Downloading Sample Data..");
    const [ showLoader, setShowLoader] = useState(false);

    function loadScript(url){
        setDataDownloading(true)
        setLoaderStateMessage("Downloading...")
        let script = document.createElement("script")
        script.type = "application/javascript";
    
        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                    script.onreadystatechange = null;
                    setLoaderStateMessage("Downloaded.")
                    setDefaultDataLoaded(true);
                    setShowLoader(false);
                    props.loadDefaultData();
                }
            };
        } else {  //Others
            script.onload = function(){
                setLoaderStateMessage("Downloaded.")
                setDefaultDataLoaded(true);
                setShowLoader(false);
                props.loadDefaultData()
            };
        }
    
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    useEffect(() => {
        if (window.defaultDataLoaded){
            console.log("Data loaded.")
        }else{
            console.log("Data NOT loaded yet.")
        }
    },[window.defaultDataLoaded])
    
    useEffect(() => {
        if (sampleDataReqId < 1) { return () => 1}
        var url = "data/Technology_sorted_top500words_Pairwise_Dists.jsonp?callback=parseResponse"
        loadScript(url);
    },[sampleDataReqId])


    // use react useEffect hooks. These will run if the passed array of state fields change
    useEffect(() => {
        if (!(file == null)){
            window.currentlyUploadedFile = file.name
            window['logFileName'](file.name);
        }
    }, [file]);
    
    const inputFileRef = React.createRef();

    function setFileName(e,d){
        if (e.target.files.length > 0){
            setFile(e.target.files[0]);
            setCurrentSelection(`You selected: ${e.target.files[0].name}`);
        }else{
            console.log("No files selected.")
            setFile({name:""})
            setCurrentSelection("Selected file name will appear here.")
        }
    }
    
    return (
        <Grid stackable={true} centered={true} divided verticalAlign={"middle"} style={{ width:"inherit", height:"inherit" }}>
            <Grid.Row centered={true}>
                <Grid.Column computer={6} largeScreen={6} mobile={12} tablet={6}>
                    <div style={{ display:"flex" }}>
                        <Segment circular={true} color='red' size={"massive"} style={{ marginLeft:"auto" }}>
                            <Header>
                                Choose the file for pairwise distances
                            </Header>
                            <Form>
                                <Form.Field>
                                    <input type='file' hidden ref={inputFileRef} onChange={setFileName}></input>
                                </Form.Field>
                                <Form.Field inline>
                                    <Button ref={ref} htmlFor='file' id="chooseFileButton" onClick={() => inputFileRef.current.click()}>Choose File</Button>
                                </Form.Field>
                                <Form.Field>
                                    <Label>{currentSelection}</Label>
                                </Form.Field>
                                <Divider/>
                                <Form.Field inline>
                                    <Button id="goCustomFile" onClick={() => props.passFileName(file)}>Go</Button>
                                </Form.Field>
                            </Form>
                        </Segment>
                    </div>
                </Grid.Column>
                <Grid.Column computer={1} largeScreen={1} mobile={12} tablet={1} size={"massive"} textAlign={"center"}>
                    <Header>
                        OR
                    </Header>
                </Grid.Column>
                <Grid.Column computer={6} largeScreen={6} mobile={12} tablet={6} textAlign={"left"}>
                    <div style={{ display:"flex" }}>
                        <Segment circular={true} color='green' size={"massive"} style={{ marginRight:"auto"}}>
                            <Header>
                                Download sample data and run demo
                            </Header>
                        <Form>
                            <Form.Field>
                                <input type='file' hidden ref={inputFileRef} onChange={setFileName}></input>
                            </Form.Field>
                            <Form.Field>
                                <Label>{(dataDownloading || defaultDataLoaded) ? loaderStateMessage : ""}</Label>
                            </Form.Field>
                            <Divider/>
                            <Form.Field inline>
                                <Button style={{minWidth:"3rem"}} loading={showLoader} id="goCustomFile" onClick={() => {setShowLoader(true); setSampleDataReqId(sampleDataReqId+1)}}>Go</Button>
                            </Form.Field>
                        </Form>
                        </Segment>
                    </div>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
});

export default GetDataFile;