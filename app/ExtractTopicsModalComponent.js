import React from 'react';
import { default as ExtractModal } from "./ExtractClusterModal";
import { Input, Label } from 'semantic-ui-react';

class ExtractTopicsModalComponent extends React.Component{
    constructor(props){
        super(props)
        this.props = props
        this.topicInput = React.createRef();
        this.state = {
            selectedTopicWords: new Set([...props.extractedItems]),
            selectedSubTopics: new Set(),
            prevExtractedItemsUpdateId:props.extractedItemsUpdateId,
            stateUpdatedId:props.extractedItemsUpdateId,
            topicName:""
        }
        this.handleActionButtonClickFromModal = this.handleActionButtonClickFromModal.bind(this);
        this.handleCloseButtonClickFromModal = this.handleCloseButtonClickFromModal.bind(this);
        this.onTopicNameChanged = this.onTopicNameChanged.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState){
        if ((nextProps.extractedItems != undefined) && (nextProps.extractedItems != null)){
            if ((nextProps.extractedItems.length != this.props.extractedItems.length) || (nextProps.open != this.props.open) ){
                return true;
            }
            else{
                return false;
            }
        }
        return false;
    }

    static getDerivedStateFromProps(props, state){
        if (props.open == false){
            return null;
        }
        if (props.extractedItemsUpdateId != state.prevExtractedItemsUpdateId){
            return {
                selectedTopicWords: new Set([...props.extractedItems]),
                selectedSubTopics: new Set(),
                topicName:"",
                stateUpdatedId:0,
                prevExtractedItemsUpdateId:props.extractedItemsUpdateId
            }
        }
        return null;
    }

    addToSelectedTopicWords(tword){
        this.setState((state) => {
            return {
                selectedTopicWords:state.selectedTopicWords.add(tword),
                stateUpdatedId:state.stateUpdatedId + 1
            }
        });
    }

    deleteFromSelectedTopicWords(tword){
        this.setState((state)=>{
            state.selectedTopicWords.delete(tword);
            return {
                selectedTopicWords:state.selectedTopicWords,
                stateUpdatedId:state.stateUpdatedId + 1
            }
        });
    }

    addToSelectedSubTopics(topic){
        this.setState((state) => {
            return {
                selectedSubTopics:state.selectedSubTopics.add(topic),
                stateUpdatedId:state.stateUpdatedId + 1
            }
        });
    }

    deleteFromSelectedSubTopics(topic){
        this.setState((state)=>{
            state.selectedSubTopics.delete(topic);
            return {
                selectedSubTopics:state.selectedSubTopics,
                stateUpdatedId:state.stateUpdatedId + 1
            }
        })
    }

    onTopicNameChanged(name){
        this.setState({topicName:name});
    }

    handleActionButtonClickFromModal(){
        this.props.actionButtonClick(this.state.selectedTopicWords, this.state.selectedSubTopics, this.state.topicName);
    }
    
    handleCloseButtonClickFromModal(){
        this.props.closeButtonClick();
    }

    render(){
        const additionalProps= {
            addWordToTopicWords: (word) => this.addToSelectedTopicWords(word),
            deleteWordFromTopicWords: (word) => this.deleteFromSelectedTopicWords(word),
            addWordToSubTopics: (word) => this.addToSelectedSubTopics(word),
            deleteWordFromSubTopics: (word) => this.deleteFromSelectedSubTopics(word)
        }

        const children = React.Children.map(
                this.props.children,
                child => React.cloneElement(
                    child,
                    {...additionalProps}
                )
            );
        
        const TopicNameTextbox = React.forwardRef((props, ref) => {
            return (
                <div>
                    <Input
                        icon='tag'
                        ref={ref}
                        iconPosition='left'
                        label={{ tag: true, content: 'Topic Name' }}
                        labelPosition='right'
                        placeholder='Enter Topic Name'
                        focus
                        onChange={(event, data) => props.onTopicNameChanged(event.target.value)}
                    />
                </div>
            );
        });
        
        return (
            <ExtractModal
                headerText="Pick words/phrases for the Topic"
                triggerElement={this.props.triggerElement}
                actionButtonValue={this.props.actionButtonValue}
                closeButtonValue={this.props.closeButtonValue}
                showActionButton={this.props.showActionButton}
                open={this.props.open}
                onActionButtonClick={this.handleActionButtonClickFromModal}
                onCloseButtonClick={this.handleCloseButtonClickFromModal}
                selectedTopicWords={this.state.selectedTopicWords}
                selectedSubTopics={this.state.selectedSubTopics}
                topicName={this.state.topicName}
                headerExtra={<TopicNameTextbox {...{onTopicNameChanged:this.onTopicNameChanged}} ref={(node) => this.topicInput = node}></TopicNameTextbox>}
            >
                {
                    children
                }
            </ExtractModal>
        );
    }
}

export default ExtractTopicsModalComponent;