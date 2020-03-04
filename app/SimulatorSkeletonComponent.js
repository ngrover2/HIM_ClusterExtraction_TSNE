import React from 'react';
import { default as TSNESimulator } from "./TSNESimulator";
import { default as TopicModeller } from "./TopicModellerComponent";
import { default as ExtractModal } from './ExtractClusterModal';
import { Button, Input, Grid, GridColumn } from 'semantic-ui-react';
import TopicWord from './TopicWord.js';
import GetDataFile from './FilePickerComponent';
import { default as ChooseFileModalComponent } from "./ChooseFileModalComponent";
import { default as ExtractTopicsModalComponent } from "./ExtractTopicsModalComponent";

class ReactButton extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
    }

    render(){
        return (<Button {...this.props} >{this.props.value}</Button>);
    }
}

const LosePropsComponent = (props) => {
        return (<div>{props.children}</div>);
}

class SimulatorSkeleton extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
        this.extractAllButton = React.createRef();
        this.startTSNEClickHandler = this.startTSNEClickHandler.bind(this);
        this.pauseTSNEClickHandler = this.pauseTSNEClickHandler.bind(this);
        this.resetTSNEClickHandler = this.resetTSNEClickHandler.bind(this);
        this.chooseFileClickHandler = this.chooseFileClickHandler.bind(this);
        this.transferSelectedNodesToDetailView = this.transferSelectedNodesToDetailView.bind(this);
        this.clearClickHandler = this.clearClickHandler.bind(this);
        this.setTopicsForInspection = this.setTopicsForInspection.bind(this);
        this.setModeForce = this.setModeForce.bind(this);
        this.setModeRemove = this.setModeRemove.bind(this);
        this.setModeSelectCenter = this.setModeSelectCenter.bind(this);
        this.setModeSelectChildren = this.setModeSelectChildren.bind(this);
        this.arrangeTopicsRadially = this.arrangeTopicsRadially.bind(this);
        this.resetClickHandler = this.resetClickHandler.bind(this);
        this.pauseClickHandler = this.pauseClickHandler.bind(this);
        this.resetChildrenClickHandler = this.resetChildrenClickHandler.bind(this);
        this.scatterClickHandler = this.scatterClickHandler.bind(this);
        this.keepSelectedHandler = this.keepSelectedHandler.bind(this);
        this.removeSelectedHandler = this.removeSelectedHandler.bind(this);
        this.passMarkedItems = this.passMarkedItems.bind(this);
        this.passUnMarkedItems = this.passUnMarkedItems.bind(this);
        this.passAllItems = this.passAllItems.bind(this);
        this.passRemovedItems = this.passRemovedItems.bind(this);
        this.extractUnMarkedItems = this.extractUnMarkedItems.bind(this);
        this.extractMarkedItems = this.extractMarkedItems.bind(this);
        this.extractAllItems = this.extractAllItems.bind(this);
        this.extractItemsOfType = this.extractItemsOfType.bind(this);
        this.loadItemsInModal = this.loadItemsInModal.bind(this);
        this.saveTopicWords = this.saveTopicWords.bind(this);
        this.saveRemovedWords = this.saveRemovedWords.bind(this);
        this.getExtractedItemsOfType = this.getExtractedItemsOfType.bind(this);
        this.loadData = this.loadData.bind(this);
        this.tsneSimulatorProps = Object.assign({},{
            dataLoadError: props.dataLoadError,
            collectFromLasso: this.transferSelectedNodesToDetailView,
            clearClickHandler: this.clearClickHandler,
        });
        this.topicModellerProps = Object.assign({},{
            passTopicsforInspection: this.setTopicsForInspection,
            hideTSNENodes:this.hideTSNENodesHandler,
            passMarkedItems: this.passMarkedItems,
            passUnMarkedItems: this.passUnMarkedItems,
            passAllItems: this.passAllItems,
            passRemovedItems: this.passRemovedItems
        });
        this.chooseAnotherFileRef = React.createRef();
        this.state = {
            selectedNodes: [],
            tsneData: props.data,
            tsneDataUpdateId:0,
            extractedItems:[],
            extractedItemsType:"marked",
            removedItems:[],
            selfUpdateId:0,
            selectedNodesUpdateId:0,
            extractedItemsUpdateId:0,
            extractTopicModalOpen:false,
            chooseFileModalOpen:false,
            extractModalActionValue: "Save Topic Words",
            extractModalOnActionClick: () => console.log("No Action defined for this button click. Make sure that this.state's(in SimulatorSkeletonComponent.js) `extractModalOnActionClick` property is set to this.<correct method> for executing desired action ")
        }
    }

    transferSelectedNodesToDetailView(values){
        this.setState((state)=>{
            return {
                selectedNodes: values,
                selectedNodesUpdateId: ++(state.selectedNodesUpdateId)
            }
        });
    }

    hideTSNENodesHandler(ids){
        this.tsneSimulator.hideNodes(ids);
    }

    startTSNEClickHandler(){
        this.tsneSimulator.startTSNE();
    }

    pauseTSNEClickHandler(){
        this.tsneSimulator.pauseTSNE();
    }

    resetTSNEClickHandler(){
        this.tsneSimulator.resetTSNE();
    }
    
    chooseFileClickHandler(){

    }

    clearClickHandler(){
        this.topicModeller.clearForceCluster();
    }

    setTopicsForInspection(topics){
        this.setState({
            topics: topics
        });
    }

    setModeForce(){
        this.topicModeller.setModeAsForce();
    }
    setModeSelectChildren(){
        this.topicModeller.setModeAsSelectChildren();
    }
    setModeSelectCenter(){
        this.topicModeller.setModeAsSelectCenter();
    }
    setModeRemove(){
        this.topicModeller.setModeAsRemove();
    }
    arrangeTopicsRadially(){
        this.topicModeller.arrangeRadial();
    }
    resetClickHandler(){
        this.topicModeller.resetForceCluster();
    }
    pauseClickHandler(){
        this.topicModeller.pauseClusterForce();
    }
    resetChildrenClickHandler(){
        this.topicModeller.unselectChildren();
    }
    scatterClickHandler(){
        this.topicModeller.scatterNodes();
    }
    keepSelectedHandler(){
        this.topicModeller.keepSelectedChildren();
    }
    removeSelectedHandler(){
        this.topicModeller.purgeSelectedChildren();
    }

    passMarkedItems(items){
        this.setState((state)=>{return {
            extractedItems: items,
            extractItemsType: "marked",
            extractTopicModalOpen:true,
            extractedItemsUpdateId:++state.extractedItemsUpdateId,
            extractModalOnActionClick:this.saveTopicWords,
            extractModalActionValue:"Save Topic Words"
        }}, ()=> {
            document.getElementById("openExtractTopicsModal").click();
        });
    }

    passUnMarkedItems(items){
        this.setState((state)=>{return {
            extractedItems: items,
            extractItemsType: "unmarked",
            extractTopicModalOpen:true,
            extractedItemsUpdateId:++state.extractedItemsUpdateId,
            extractModalOnActionClick:this.saveTopicWords,
            extractModalActionValue:"Save Topic Words"
        }}, ()=> {
            document.getElementById("openExtractTopicsModal").click();
        });

    }

    passAllItems(items){
        this.setState((state)=>{return {
            extractedItems: items,
            extractItemsType: "all",
            extractTopicModalOpen:true,
            extractedItemsUpdateId:++state.extractedItemsUpdateId,
            extractModalOnActionClick:this.saveTopicWords,
            extractModalActionValue:"Save Topic Words"
        }}, ()=> {
            document.getElementById("openExtractTopicsModal").click();
        });
    }

    passRemovedItems(items){
        this.setState((state)=>{return {
            extractedItems: items,
            extractTopicModalOpen:true,
            extractedItemsUpdateId:++state.extractedItemsUpdateId,
            extractModalActionValue:"Save Stop Words",
            extractModalOnActionClick:this.saveRemovedWords
        }}, ()=> {
            document.getElementById("openExtractTopicsModal").click();
        });
    }

    getExtractedItemsOfType(type){
        (type != (undefined || null)) ? this.extractItemsOfType(type) : console.log("getExtractedItemsOfType receieved type: undefined/null");
    }

    extractMarkedItems(){
        this.topicModeller.passMarkedItemsForInspection();
    }

    extractUnMarkedItems(){
        this.topicModeller.passUnMarkedItemsForInspection();
    }

    extractAllItems(){
        this.topicModeller.passAllItemsForInspection();
    }

    extractStopWordsItems(){
        this.topicModeller.passRemovedItemsForInspection();
    }

    extractItemsOfType(type){
        switch(type){
            case "marked":{
                this.extractMarkedItems();
                break;
            }
            case "unmarked":{
                this.extractUnMarkedItems();
                break;
            }
            case "all": {
                this.extractAllItems();
                break;
            }
            case "remove": {
                this.extractStopWordsItems();
                break;
            }
            default:{break;}
        }
    }
    
    saveTopicWords(topicWordsSet, subTopicsSet, topicName){
        var topicWords = Array.from(topicWordsSet);
        var subTopics = Array.from(subTopicsSet);
        if (!Array.isArray(topicWords) || !Array.isArray(subTopics) || typeof(topicName) != 'string' || topicName.length == 0 || (topicWords.length < 1 && subTopics.length < 1)){
            return
        }
        var post_body = {
            index_name: "topics",
            topic_name: topicName,
            topic_words_list: topicWords,
            subtopics_list: subTopics
        }
        
        const response = fetch('http://localhost:3000/addWordsToTopic',{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            redirect: 'follow',
            body: JSON.stringify(post_body) // body data type must match "Content-Type" header
        });
    
        response.then((res)=>{
                        this.setState({extractTopicModalOpen:false});
                    },(err)=>{
                        this.setState({extractTopicModalOpen:false});
                    }
                );
    }

    saveRemovedWords(twords){
        var stopWords = Array.from(twords);
        if (!Array.isArray(stopWords) || (stopWords.length < 1)){
            return
        }
        var post_body
        const response = fetch('http://localhost:3000/addStopWords',{
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
              'Content-Type': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
            body: JSON.stringify(post_body) // body data type must match "Content-Type" header
        });
        const myJson = response.then((res)=> {
                        return Promise.resolve(res)
                    },(err)=>{
                        return Promise.resolve(err)
                    }
                )
                .then(
                    (s) => Promise.resolve(s.json())
                )
                .catch(
                    (e) => Promise.resolve("Error Occurred")
                )
                .finally((f) => { this.setState({extractTopicModalOpen:false});return f} );
        this.setState({extractTopicModalOpen:false});
    }

    loadData(fileName){
        return new Promise((resolve, reject) => {
            d3.json(fileName,
                function(data) {
                    resolve(data);
                }, function(error){
                    console.log(`Error reading from file`);
                    reject(error);
                }
            );
        });
    };

    loadItemsInModal(){
        if (this.state.extractedItems.length > 0){
            let items = [...this.state.extractedItems].map((item)=>{
                let props = {"word":item, "topic":"Technology"}
                return (
                        <TopicWord key={`div-${item}`} {...props}/>
                );
            });
            return items;
        }else{
            return <LosePropsComponent>No Words to Show</LosePropsComponent>
        }
    }
    
    

    render(){
        if (this.props.data != undefined){
            return (
                <div className="mainContainer">
                    <div className="tsneContainer" id = "viz1">
                        <div className="tsneElementsContainer">
                            <Grid columns={16}>
                                <GridColumn width={16}>
                                    <div id="TSNEcontrols" className="controls">
                                        <ReactButton id="start" onClick={this.startTSNEClickHandler} value="Start TSNE"/>
                                        <ReactButton id="pause" onClick={this.pauseTSNEClickHandler} value="Pause TSNE"/>
                                        <ReactButton id="reset" onClick={(event)=>this.resetTSNEClickHandler()} value="Reset TSNE"/>
                                        <ChooseFileModalComponent 
                                            triggerElement={<ReactButton id="chooseFileButton" className="chooseFileButtonClass" value="Choose Another File" onClick={()=>this.setState({chooseFileModalOpen:true})}></ReactButton>}
                                            headerText="Choose File"
                                            showActionButton={false}
                                            headerStyle={{textAlign:"center"}}
                                            open={this.state.chooseFileModalOpen}
                                            >
                                                {
                                                    <GetDataFile ref={this.chooseAnotherFileRef}
                                                        passFileName={function getFileName(fileObj){
                                                            let fileUrl = "";
                                                            if (fileObj != (undefined || null)){
                                                                fileUrl = window.URL.createObjectURL(fileObj)
                                                            }

                                                            this.setState({chooseFileModalOpen:false});

                                                            this.loadData(fileUrl)
                                                                .then((data) => {
                                                                        if (data.length > 0){
                                                                            this.setState( (state)=>{
                                                                                return {
                                                                                    tsneData:data,
                                                                                    tsneDataUpdateId: ++state.tsneDataUpdateId
                                                                                }
                                                                            }, () =>{
                                                                                console.log("new tsneData data loaded.")
                                                                            });
                                                                        }else{
                                                                            console.log("NO new tsneData to load.")
                                                                        }
                                                                    }, (error) => 
                                                                    {
                                                                        console.log("Error: ", error)
                                                                    })
                                                                .catch(err => {throw err});
                                                        }.bind(this)
                                                    }/>
                                                }
                                        </ChooseFileModalComponent>
                                    </div>
                                </GridColumn>
                            </Grid>
                            <TSNESimulator {...this.tsneSimulatorProps} data={this.state.tsneData} tsneDataUpdateId={this.state.tsneDataUpdateId} ref={(node) => this.tsneSimulator = node }/>
                        </div>
                    </div>
                    <div className = "clusterForceContainer" id = "viz2">
                        <div className="clusterForceElementsContainer">
                            <div id="ClusterForceControls" className="controls" >
                                <div className="forceRowOne">
                                    <div className="table width100 height100">
                                        <div className="table-cell vertical-align-middle text-align-centre actionButtonGroupLabel">Select Mode</div>
                                    </div>
                                    <div>
                                        <Button.Group attached="bottom" style={{width:"100%"}}>
                                                {/* In the code FORCE mode refers to NORMAL mode */}
                                            <Button id="forceModeViz2" onClick={this.setModeForce}>NORMAL</Button> 
                                            <Button id="removeNodeModeViz2" onClick={this.setModeRemove}>REMOVE</Button>
                                            <Button id="childrenSelectionModeViz2" onClick={this.setModeSelectChildren}>MARK</Button>
                                            <Button id="centerSelectionModeViz2" onClick={this.setModeSelectCenter}>CHOOSE CENTER</Button>
                                        </Button.Group>
                                    </div>
                                </div>
                                <div className="forceRowTwo">
                                    <div className="table width100 height100">
                                        <div className="table-cell vertical-align-middle text-align-centre actionButtonGroupLabel">Choose Action</div>
                                    </div>
                                    <Button.Group attached="bottom" style={{maxWidth:"100%"}}>
                                        <Button id="pauseViz2Force" onClick={this.pauseClickHandler}>Pause Force</Button>
                                        <Button id="clearViz2Force" onClick={this.clearClickHandler}>Clear All</Button>
                                        <Button id="resetViz2Force" onClick={this.resetClickHandler}>Reset State</Button>
                                        <Button id="radialArrangeViz2" onClick={this.arrangeTopicsRadially}>Arrange Radial</Button>
                                    </Button.Group>
                                    <Button.Group attached="bottom" style={{maxWidth:"100%"}}>
                                        <Button id="unselectChildrenViz2" onClick={this.resetChildrenClickHandler} style={{fontSize:"1rem"}}>Clear Marked</Button>
                                        <Button id="scatterNodesButtonID" onClick={this.scatterClickHandler}>Scatter</Button>
                                        <Button id="selectAllAsChildrenButtonID" onClick={this.keepSelectedHandler}>Hide Unmarked</Button>
                                        <Button id="purgeSelectedChildrenButtonID" onClick={this.removeSelectedHandler}>Hide Marked</Button>
                                    </Button.Group>
                                </div>
                                <div className="forceRowThree">
                                    <div className="table width100 height100">
                                        <div className="table-cell vertical-align-middle text-align-centre actionButtonGroupLabel">Choose token type to extract</div>
                                    </div>
                                    <Button.Group attached="bottom" style={{width:"100%"}}>
                                        <Button id="extractMarkedItemsButton" onClick={(event)=>this.getExtractedItemsOfType("marked")}>Extract Marked</Button>
                                        <Button id="extractUnMarkedItemsButton" onClick={(event)=>this.getExtractedItemsOfType("unmarked")}>Extract UnMarked</Button>
                                        <Button id="extractAllItemsButton" onClick={(event)=>this.getExtractedItemsOfType("all")}>Extract All</Button>
                                        <Button id="extractStopWordsButton" onClick={(event)=>this.getExtractedItemsOfType("remove")}>Extract Removed</Button>
                                    </Button.Group>
                                    <ExtractTopicsModalComponent
                                        triggerElement={<ReactButton value="Modal Button" id="openExtractTopicsModal" style={{display:"None"}} ></ReactButton>}
                                        headerText="Pick words/phrases for Technology"
                                        actionButtonValue={this.state.extractModalActionValue}
                                        closeButtonValue="Cancel"
                                        showActionButton={true}
                                        open={this.state.extractTopicModalOpen}
                                        actionButtonClick={this.state.extractModalOnActionClick}
                                        closeButtonClick={() => this.setState({extractTopicModalOpen:false})}
                                        extractedItemsUpdateId={this.state.extractedItemsUpdateId}
                                        extractedItems={this.state.extractedItems}>
                                        {
                                            this.loadItemsInModal()
                                        }
                                    </ExtractTopicsModalComponent>
                                </div>
                            </div>
                            <TopicModeller {...this.topicModellerProps} selectedNodesUpdateId={this.state.selectedNodesUpdateId} selectedNodes={this.state.selectedNodes} ref={(node) => this.topicModeller = node }/>
                        </div>
                    </div>
                </div>
            );
        }else{
            return <div>LOADING DATA...</div>
        }
    };
}

export default SimulatorSkeleton;