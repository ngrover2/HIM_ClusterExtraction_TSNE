import React from 'react';
import { Input, Checkbox, Button, Label, Grid, Icon, Popup, Divider } from 'semantic-ui-react';


class TopicWord extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
        this.state = {
            "origWord": this.props.word,
            "alternativeWords":new Set(),
            "inputText":"",
            "origWordRemoved":false,
            "selectedAsSubTopic":false,
            "removeButtonText":"Remove"
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleAddClick = this.handleAddClick.bind(this);
        this.handleAlternateWordClick = this.handleAlternateWordClick.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleRemoveClick = this.handleRemoveClick.bind(this);
    };  

    handleAddClick(e, data) {
        const value = this.state.inputText
        if ((value != "") && (value != null) && (value != undefined)){
            this.setState((state)=>  {
                return {
                    alternativeWords:state.alternativeWords.add(value),
                    inputText:""
                }
            }
            , () => this.props.addWordToTopicWords(value)
            );
        }
    };

    handleInputChange(e, data) {
        this.setState((state)=> {
            return {
                "inputText": data.value
            }
        })
    }

    handleAlternateWordClick(event, data) {
        
        if (data.word != ("" && null && undefined)){
            this.setState((state)=>  {
                    state.alternativeWords.delete(data.word);
                    return {
                        alternativeWords:state.alternativeWords,
                    }
            }, 
                () => {
                    this.props.deleteWordFromTopicWords(data.word);
                    this.props.deleteWordFromSubTopics(data.word);
                }
            );
        }
    }

    handleAlternateWordCheckboxChange(event, word){
        var checked = event.target.checked;
        if (checked) this.props.addWordToSubTopics(word);
        else this.props.deleteWordFromSubTopics(word);
    }

    handleCheckboxChange(event, word){
        let checked = event.target.checked;
        if (!this.state.origWordRemoved){
            if (checked){
                this.props.addWordToSubTopics(word);
                this.setState({selectedAsSubTopic:true})
            }else{
                this.props.deleteWordFromSubTopics(word);
                this.setState({selectedAsSubTopic:false})
            }
        }
    }


    handleRemoveClick(event, data){
        // origWordRemoved = false means word is not removed, i.e. it is a part of the list and a click on `Remove` is received
        if (!this.state.origWordRemoved){
            this.props.deleteWordFromTopicWords(this.props.word);
            this.props.deleteWordFromSubTopics(this.props.word);
            this.setState((state)=>{
                return {
                    origWordRemoved:!state.origWordRemoved,
                    removeButtonText:"Undo"
                }
            });
        }else{
            // origWordRemoved = true means word is removed, i.e. it is not a part of the list and a click on `Undo` is received
            this.props.addWordToTopicWords(this.props.word)
            if (this.state.selectedAsSubTopic){
                this.props.addWordToSubTopics(this.props.word)
            }
            this.setState((state)=>{
                return {
                    origWordRemoved:!state.origWordRemoved,
                    removeButtonText:"Remove"
                }
            });
        }
    }

    render(){
        let labels = Array.from(this.state.alternativeWords).map( (word, i) => 
                        <div style={{ "margin": "5px 5px 0px 0px", display:"inline"  }} key={`word-${i}`}>
                            <Label
                                style={{ "margin": "inherit" }}
                                image
                                color={"teal"}
                                id={i}>
                                <img/>
                                <Popup content={`Check to consider \"${word}\" as a topic itself`} 
                                    trigger={
                                        <Checkbox 
                                            as='div'
                                            id={`cb-asTopic-${word}`}
                                            style = {{ "verticalAlign":"middle", "margin": "5px 5px" }}
                                            style={{ verticalAlign:"text-bottom", marginLeft:"5px", marginRight:"5px" }}
                                            onClick={(event,data) => this.handleAlternateWordCheckboxChange(event, word)}
                                        />
                                    }
                                >
                                </Popup>
                                <Label
                                    style={{ minWidth:"4rem", textAlign:"center",backgroundColor:"unset",fontSize:"1rem", color:"white" }}
                                >{word}</Label>
                                <Popup content={`Click to delete \"${word}\" as an alternate word for ${this.state.origWord}`} 
                                    trigger={
                                        <Icon 
                                            word={word} 
                                            name='delete'
                                            onClick={(event, data)=> this.handleAlternateWordClick(event, data)} 
                                            id={i}
                                            style={{ verticalAlign:"text-bottom" }}/>
                                    }
                                />
                            </Label>
                            
                        </div>
            );
        
        return (<Grid stackable={true}>
            <Grid.Row key={`row-${this.props.word}}`} > {/* The row that holds the checkbox and topic word*/}
                <Grid.Column width={1} style = {{ "textAlign":"left" }}> {/* The columns for checkbox*/}
                    <Popup content={`Check to consider \"${this.props.word}\" as a topic itself`} trigger={<Checkbox as='div'
                        id={`cb-${this.state.origWord}`}
                        style = {{ "verticalAlign":"middle", "margin": "5px 5px 0px 0px" }} 
                        onClick={(event,data) => this.handleCheckboxChange(event, this.props.word)}/>
                    }>
                    </Popup>
                </Grid.Column>
                <Grid.Column width={12} style = {{ "textAlign":"left" }}> {/* The columns for topic word*/}
                    {(!this.state.origWordRemoved && 
                        <h3 style={{ width:"100%!important", "color":"grey", overflow:"hidden", textOverflow:"ellipsis" }}> {this.state.origWord} </h3>)
                         || 
                    (this.state.origWordRemoved && 
                            <h3 style={{ width:"100%!important", "color":"grey", overflow:"hidden", textOverflow:"ellipsis", textDecoration:"line-through", textDecorationColor:"black", textDecorationStyle:"double" }}> {`${this.state.origWord}`}</h3>)
                    }    
                </Grid.Column>
                <Grid.Column width={3} style = {{ }}> {/* The column for remove (original word) button*/}
                    <Popup 
                        content={`Click to remove ${this.state.origWord} from the list of words describing the topic`} 
                        trigger={
                            <Button onClick={this.handleRemoveClick}>
                                    {this.state.removeButtonText}
                            </Button>
                        }
                    />
                </Grid.Column>
            </Grid.Row>

            <Grid.Row> {/* The row that holds the input and add button */}
                <Grid.Column width={16}>
                        <Input 
                            id={`inp-${this.state.origWord}`}
                            placeholder={`Another name for ${this.state.origWord}`}
                            onChange={this.handleInputChange}
                            action
                            ref={this.inputRef}
                            fluid={true}
                            value={this.state.inputText}>
                            <input />
                            <Popup 
                                content={`Type an alternate name for ${this.state.origWord} in the textbox and add it to the list of words describing the topic`} 
                                trigger={
                                    <Button
                                        onClick={this.handleAddClick}>
                                            {"Add"}
                                    </Button>
                                }
                            />
                        </Input>    
                </Grid.Column>
            </Grid.Row>
            <Grid.Row key={`row-2}`} style = {{ "paddingTop":"0rem", "paddingBottom":"2rem" }}>
                <Grid.Column width={16}>
                    <div>
                    {labels}
                    </div>
                </Grid.Column>
            </Grid.Row>
            <Divider/>
        </Grid>
        )
    };
}

export default TopicWord;