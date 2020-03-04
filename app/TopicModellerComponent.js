import React from 'react';
import { Form, Input, Label, Button, Segment, Header, Grid, Divider } from 'semantic-ui-react';

class TopicModeller extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
        this.markedItems = new Set();
        this.unMarkedItems = new Set();
        this.removedItems = new Set();
        this.initiateModeller = this.initiateModeller.bind(this);
        this.clearForceCluster = this.clearForceCluster.bind(this);
        this.passMarkedItemsForInspection = this.passMarkedItemsForInspection.bind(this);
        this.passUnMarkedItemsForInspection = this.passUnMarkedItemsForInspection.bind(this);
        this.passAllItemsForInspection = this.passAllItemsForInspection.bind(this);
        this.passRemovedItemsForInspection = this.passRemovedItemsForInspection.bind(this);
        this.CLUSTER_FORCE_PAUSED = false;
        this.nodes_container = null;
        this.clusterForceSimulation = null;
        this.state = {
            selectedNodes:props.selectedNodes
        };
    }

    componentDidMount(){
        this.clusterForceSvg = d3.select(this.clusterForceSvgRef);
        if (this.clusterForceSvgRef != undefined){
            if (this.props.selectedNodes !=undefined && this.props.selectedNodes.length > 0){
                this.setState((state,props)=>{
                    selectedNodes: this.props.selectedNodes
                }, this.initiateModeller(this.props.selectedNodes));
            }else{
                // TODO: Error handling and feedback handling
            }
        }else{
            console.log("this.clusterForceSvgRef is undefined in TopicModeller componentDidMount");
        }
    }

    areEqualShallow(_curr, _new) {
        // both should not be empty, if they are they are equal
        if ( _curr && _new && (_curr.length == 0) && (_new.length == 0)) return true;
        if (!_new || !_curr || (_curr.length == 0) || (_new.length == 0)) return false;
        let _currSet = new Set();
        let _newSet = new Set();
        _curr.map((v,i)=> {_currSet.add(v.word)});
        _new.map((v,i)=> {_newSet.add(v.word)});
        console.log("Current nodes in TopicModeller");
        console.log(_curr.filter((v,i)=> i<=10?true:false));
        console.log("New nodes in TopicModeller:")
        console.log(_new.filter((v,i)=> i<=10?true:false));
        return (
            Boolean([..._currSet].filter((v,i)=>{return !_newSet.has(v)}).length==0) && 
            Boolean([..._newSet].filter((v,i)=>{return !_currSet.has(v)}).length==0)
        );
    };

    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.selectedNodesUpdateId != (undefined || null) 
            && (nextProps.selectedNodesUpdateId == this.props.selectedNodesUpdateId)) {
                console.log("TopicModeller Component WILL NOT update as data did not change")
                return false; 
            }
        // console.log("CURRENT PROPS.SELECTED NODES")
        // console.log(this.props.selectedNodes);
        // console.log("NEW PROPS.SELECTED NODES")
        // console.log(nextProps.selectedNodes);
        if (this.areEqualShallow(this.props.selectedNodes, nextProps.selectedNodes)){
            console.log("TopicModeller Component WILL NOT update")
            return false;
        }else{
            console.log("TopicModeller Component WILL UPDATE")
            this.clearForceCluster();
            this.markedItems = new Set();
            this.unMarkedItems = new Set();
            return true;
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        console.log("TopicModeller componentDidUpdate called");
        if (this.clusterForceSvgRef != undefined){
            if (this.props.selectedNodes != undefined && this.props.selectedNodes.length > 0){
                    this.initiateModeller(this.props.selectedNodes);                    
            }else{
                // TODO: Error handling and feedback handling
                console.log("Empty selectedNodes received");
            }
        }
    }

    passMarkedItemsForInspection(){
        this.props.passMarkedItems(Array.from(this.markedItems));
    };
    passUnMarkedItemsForInspection(){
        this.props.passUnMarkedItems(Array.from(this.unMarkedItems));
    };
    passAllItemsForInspection(){
        let allItems = [...Array.from(this.markedItems),...Array.from(this.unMarkedItems)]
        this.props.passAllItems(allItems);
    };

    passRemovedItemsForInspection(){
        let removedItems = Array.from(this.removedItems);
        this.props.passRemovedItems(removedItems);
    }

    initiateModeller(nodes){
        function getD3ElementBbox(el) {
            return el.node().getBoundingClientRect();
        }
        
        var clusterForceBbox = getD3ElementBbox(this.clusterForceSvg);
        var clusterForceLayoutWidth = clusterForceBbox.width;
        var clusterForceLayoutHeight = clusterForceBbox.height;
        var clusterCircles = null;
        var clusterTexts = null;
        var clusterForceTickcounter = 0;
        var clusterForcePauseAlpha = null;
        var clusterForceNodes = nodes;
        var clusterNode_svgs = null;

        const MODES = {
            "REMOVE": 'Remove Node(s)',
            "DRAG": 'Normal',
            "FORCE": 'Force',
            "SELECTCENTER": 'Select Centre Node(s)',
            "SELECTCHILDREN": 'Select Child Node(s)'
        }
        const FORCE_MODES = {
            "RADIAL":"Radial Force",
            "SCATTER": "Collision Force"
        }
        var currentForceMode = FORCE_MODES.SCATTER;

        var current_mode = MODES.FORCE;
        var lastMode = MODES.FORCE;
        
        var drag = d3.drag()
                    .on("start", forceDragstart)
                    .on("drag", forceDragged)
                    .on("end", forceDragend);


        this.nodes_container = this.clusterForceSvg.append("g")
                .attr("class", "clusterForceNodes");// returns new `g` node with class=`clusterForceNodes`

        function drawClusterForceNodes(keep_positions){
            //Join
            this.nodes_container.selectAll("*").remove();
            var clusterNodes_data_placeholders = this.nodes_container.selectAll("g.labelledNode")
                            .data(clusterForceNodes,function(d) {
                                d.fx = null;
                                d.fy = null;
                                return d.word
                            }); // returns  placeholders for g elements with class=`labelledNode`

            // Exit
            clusterNodes_data_placeholders.exit().remove();

            clusterNode_svgs = clusterNodes_data_placeholders.enter()
                                                .append("g")
                                                .attr("class","labelledNode")
                                                .append("svg");
                                                // .merge(clusterNodes_data_placeholders);

            // Enter and Update
            clusterNode_svgs.selectAll("circle").remove();
            clusterCircles = clusterNode_svgs.append("circle").raise()
                        .attr("class", "notIdentifiedAsChildren")
                        .attr("r", (d) => 15)
                        .attr("cx", function(d){
                            if (keep_positions){
                                return d.cx
                            }else{
                                return clusterForceLayoutWidth/2
                            }
                        })
                        .attr("cy", function(d){
                            if (keep_positions){
                                return d.cy
                            }else{
                                return clusterForceLayoutHeight/2
                            }   
                        })
                        .on("click", removeNode)
                        .on("dblclick", dblclick).call(drag);
            
            clusterNode_svgs.selectAll(".notIdentifiedAsChildren").each((d)=>{
                this.unMarkedItems.add(d.word);
            });
            
            clusterNode_svgs.selectAll("text").remove();
            clusterTexts = clusterNode_svgs.append("text")
                        .attr("class", "nodeLabel")
                        .attr("x",(d) => clusterForceLayoutWidth/2 + 10)
                        .attr("y",(d) => clusterForceLayoutHeight/2 + 10)
                        .text((d) => d.word).call(drag);
                try{
                    clusterCircles.each((d) => d3.select(this).raise());
                }catch(e){
                    console.log(e)
                }
        }
        drawClusterForceNodes = drawClusterForceNodes.bind(this);

        function runForceSimulationNodesOnly(){
            clusterForceTickcounter = 0;
            const forceX = d3.forceX(clusterForceLayoutWidth / 2).strength(.5)
            const forceY = d3.forceY(clusterForceLayoutHeight / 2).strength(.5)
            this.clusterForceSimulation = d3.forceSimulation(clusterForceNodes)
            .alphaDecay(0.2)
            .force('trackAlpha',function(alpha){
                if (this.CLUSTER_FORCE_PAUSED === true){
                    clusterForcePauseAlpha = alpha;
                }
            }.bind(this))
            .force('x', forceX)
            .force('y', forceY)
            .force('collision', d3.forceCollide().radius((d) => 15.5 * 2).strength(1))
            .on('tick', function(){
                if (this.CLUSTER_FORCE_PAUSED === false){
                    clusterForceTickcounter++;
                    try{
                        clusterCircles
                        .attr("cx", function(d){
                        return d.x;
                        })
                        .attr("cy", function(d) {
                        return d.y
                        });
                
                        clusterTexts
                            .attr("x", (d) => d.x)
                            .attr("y", (d) => d.y);
                            
                    }catch(err){
                        throw err;
                    }finally{
                        // TODO
                    }
                }else{
                    this.clusterForceSimulation.stop();
                }
            }.bind(this));
        }
        runForceSimulationNodesOnly = runForceSimulationNodesOnly.bind(this);

        function removeNode(datum,index,nodeElements){
            if (current_mode === MODES.REMOVE){
                d3.select(this.parentNode).selectAll("*").classed("removed",true);
                d3.select(this).classed("identifiedAsChildren", false);
                d3.select(this).classed("notIdentifiedAsChildren", false);
                // delete datum.word from marked and unmarked list
                deleteItemFromMarkedAndMarkedItems(datum.word);
                addToRemovedItems(datum.word);
                
                if (this.clusterForceSimulation){
                    this.clusterForceSimulation.stop();
                    this.clusterForceSimulation = null;
                }

                // Uncomment the following line if reset should not bring back, into visibility, the removed nodes
                
            }else if(current_mode === MODES.SELECTCENTER){
                d3.selectAll(".identifiedAsRadialCentre").classed("identifiedAsRadialCentre", false);
                if (datum.idparent != null){ 
                    d3.select(this).classed("identifiedAsRadialCentre",!d3.select(this).classed("identifiedAsRadialCentre"));
                }else{
                    datum.idparent = true;
                    d3.select(this).classed("identifiedAsRadialCentre",datum.idparent);
                    d3.select(this).classed("fixed",false);
                    datum.fx = null;
                    datum.fy = null;
                }
            }else if(current_mode === MODES.SELECTCHILDREN){
                if (datum.idchild === null){
                    actionOnMarkedItems.add(datum.word, "add");
                    d3.select(this)
                        .classed("identifiedAsChildren", true);
                    d3.select(this)
                        .classed("notIdentifiedAsChildren", false);
                }else{
                    datum.idchild = !datum.idchild;
                    d3.select(this).classed("identifiedAsChildren") ? actionOnMarkedItems(datum.word, "delete") : actionOnMarkedItems(datum.word, "add");
                    d3.select(this)
                        .classed("identifiedAsChildren", datum.idchild);
                    d3.select(this)
                        .classed("notIdentifiedAsChildren", !datum.idchild);
                }
            }else{

            }
        }

        var actionOnMarkedItems = (function(word, action){
            action == "add" ? this.markedItems.add(word) : this.markedItems.delete(word);
            action == "add" ? this.unMarkedItems.delete(word) : this.unMarkedItems.add(word);
        }).bind(this);

        var deleteItemFromMarkedAndMarkedItems = (function(word){
            this.markedItems.delete(word);
            this.unMarkedItems.delete(word);
        }).bind(this);

        var addToRemovedItems = (function(word){
            (word != undefined && word != null) && this.removedItems.add(word);
        }).bind(this);

        (function actionOnUnMarkedItems(word, action){
            action == "add" ? this.unMarkedItems.add(word) : this.unMarkedItems.delete(word);
        }).bind(this);

        function pauseClusterForce(){
            this.CLUSTER_FORCE_PAUSED =  !this.CLUSTER_FORCE_PAUSED;
            if ((clusterForcePauseAlpha != null) && (this.CLUSTER_FORCE_PAUSED === false)){
                this.clusterForceSimulation.restart();
                this.clusterForceSimulation.alpha(clusterForcePauseAlpha);
            }else{
                if (this.CLUSTER_FORCE_PAUSED === false){
                    // TODO
                }
            }
        }
        pauseClusterForce = pauseClusterForce.bind(this);
        this.pauseClusterForce = pauseClusterForce

        function dblclick(d) {
            d3.select(this).classed("fixed", d.fixed = false);
            d.fx = null;
            d.fy = null;
            restartSimulation(0.1);
        }

        function forceDragstart(d) {
            d3.select(this).classed("fixed", d.fixed = true);
            d.fx = d.x;
            d.fy = d.y;
        }

        function forceDragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
        restartSimulation(0.005);
        }

        function forceDragend(d) {
            restartSimulation(0.005);
        }

        var restartSimulation = (function restartSimulationWithAlpha(alpha){
            this.clusterForceSimulation.restart(alpha);
        }).bind(this);

        function clearForceCluster(){
            if (this.clusterForceSimulation){
                this.clusterForceSimulation.alphaDecay(1);
            }

            if (this.nodes_container){
                this.nodes_container.selectAll("*").remove();
            }
        }
        clearForceCluster = clearForceCluster.bind(this);
        this.clearForceCluster = clearForceCluster;

        function resetForceCluster(){
            clearForceCluster();
            this.clusterForceSimulation.stop();
            this.clusterForceSimulation = null;
            this.markedItems = new Set();
            this.unMarkedItems = new Set();
            this.removedItems = new Set();
            drawClusterForceNodes();
            runForceSimulationNodesOnly();
        }
        resetForceCluster = resetForceCluster.bind(this);
        this.resetForceCluster = resetForceCluster;

        function setModeAsRemove(){
            if (current_mode === MODES.REMOVE){
                current_mode = lastMode;
                d3.select("#removeNodeModeViz2").classed("active",false);
            }else{
                lastMode = current_mode;
                current_mode = MODES.REMOVE;
                d3.selectAll(".modeButton").classed("active",false);
                d3.select("#removeNodeModeViz2").classed("active",true);
            }
        }

        setModeAsRemove = setModeAsRemove.bind(this);
        this.setModeAsRemove = setModeAsRemove;

        function unselectChildren(){
            d3.selectAll(".identifiedAsChildren").classed("notIdentifiedAsChildren", true);
            d3.selectAll(".identifiedAsChildren").classed("identifiedAsChildren", false);
            this.markedItems = new Set();
        }

        unselectChildren = unselectChildren.bind(this);
        this.unselectChildren = unselectChildren;

        function setModeAsSelectCenter(){
            if (current_mode === MODES.SELECTCENTER){
                current_mode = lastMode;
                d3.select("#centerSelectionModeViz2").classed("active",false);
            }else{
                lastMode = current_mode;
                current_mode = MODES.SELECTCENTER;
                d3.selectAll(".modeButton").classed("active",false);
                d3.select("#centerSelectionModeViz2").classed("active",true);
            }
        }
        setModeAsSelectCenter = setModeAsSelectCenter.bind(this);
        this.setModeAsSelectCenter = setModeAsSelectCenter;

        function setModeAsForce(){
            if (current_mode === MODES.FORCE){
                current_mode = lastMode;
                d3.select("#forceModeViz2").classed("active",false);
            }else{
                lastMode = current_mode;
                current_mode = MODES.FORCE;
                d3.selectAll(".modeButton").classed("active",false);
                d3.select("#forceModeViz2").classed("active",true);
            }
        }
        setModeAsForce = setModeAsForce.bind(this);
        this.setModeAsForce = setModeAsForce;

        function setModeAsSelectChildren(){
            if (current_mode === MODES.SELECTCHILDREN){
                current_mode = lastMode;
                d3.select("#childrenSelectionModeViz2").classed("active",false);
            }else{
                lastMode = current_mode;
                current_mode = MODES.SELECTCHILDREN;
                d3.selectAll(".modeButton").classed("active",false);
                d3.select("#childrenSelectionModeViz2").classed("active",true);
            }
        }
        setModeAsSelectChildren = setModeAsSelectChildren.bind(this);
        this.setModeAsSelectChildren = setModeAsSelectChildren;

        function changeModeLabel(){
            d3.select("#currentModeLabel").select("*").remove();
            d3.select("#currentModeLabel").text("");
            d3.select("#currentModeLabel")
                .append("span")
                .attr("class","labelPrefix")
                .text("Current Mode: ")
                .style("font-weight","bold");
            d3.select("#currentModeLabel")
                .append("text")
                .text(current_mode);
        }
        changeModeLabel = changeModeLabel.bind(this);

        function setClusterForceNodes(nodes, links){
            if (nodes != (null || [])){
                clusterForceNodes = nodes.slice(0,nodes.length);
            }
        }
        setClusterForceNodes = setClusterForceNodes.bind(this);

        function runRadialForceSimulation(root){
            clusterForceTickcounter = 0;
            var node_count = 0;
            if (clusterForceNodes){
                node_count = clusterForceNodes.length;
            }

            this.clusterForceSimulation = d3.forceSimulation(clusterForceNodes)
            .alphaDecay(0.1)
            .force('radial', d3.forceRadial(function(d,i){
                    if (i < 32){
                        return 150;
                    }else{
                        return 250;
                    }
                }
                , clusterForceLayoutWidth /2 , clusterForceLayoutHeight /2 ).strength(1))
            .force('charge', d3.forceManyBody())
            .force('collide', d3.forceCollide(10).strength(0.7))
            .on('tick', function(){
                if (this.CLUSTER_FORCE_PAUSED === false){
                    clusterForceTickcounter++;
                    try{
                        clusterCircles
                        .attr("cx", function(d){
                        return d.x;
                        })
                        .attr("cy", function(d) {
                        return d.y
                        });
                
                        clusterTexts
                            .attr("x", (d) => d.x)
                            .attr("y", (d) => d.y);
                    
                    }catch(err){
                        throw err;
                    }finally{
                        // TODO
                    }
                }else{
                    this.clusterForceSimulation.stop();
                }
            }.bind(this));
        }
        runRadialForceSimulation = runRadialForceSimulation.bind(this);

        function arrangeRadial(){
            var root_word = null;
            var root_index = null;
            d3.selectAll(".identifiedAsRadialCentre").each(function(d){
                root_word = d.word;
                root_index = d.index;
            });
            if (root_word!=null && root_index!=null){
                d3.select("#clusterForceSvg").selectAll("g.labelledNode").each(function(d){
                    if (d.word == root_word){
                        d.fx = clusterForceLayoutWidth / 2;
                        d.fy = clusterForceLayoutHeight / 2;
                    }else{
                        d.fx = null;
                        d.fy = null;
                    }
                });
            }
            this.clusterForceSimulation.stop();
            runRadialForceSimulation(root_word);
            currentForceMode = FORCE_MODES.RADIAL
        }
        arrangeRadial = arrangeRadial.bind(this);
        this.arrangeRadial = arrangeRadial;

        function scatterNodes(){
            this.clusterForceSimulation.stop();
            runForceSimulationNodesOnly();
        }
        scatterNodes = scatterNodes.bind(this);
        this.scatterNodes = scatterNodes;

        function purgeSelectedChildren(){
            clusterNode_svgs.selectAll(".identifiedAsChildren").each(function(d){
                d3.select(this.parentNode).selectAll("*").classed("removed", !d3.select(this).classed("removed"));
            });
        }
        purgeSelectedChildren.bind(this);
        this.purgeSelectedChildren = purgeSelectedChildren;

        function keepSelectedChildren(){
            clusterNode_svgs.selectAll(".notIdentifiedAsChildren").each(function(d){
                d3.select(this.parentNode).selectAll("*").classed("removed", !d3.select(this).classed("removed"));
            });
        }
        keepSelectedChildren.bind(this);
        this.keepSelectedChildren = keepSelectedChildren;

        if (clusterForceNodes != null && clusterForceNodes.length > 0){
            drawClusterForceNodes();
            runForceSimulationNodesOnly();
        }else{
            // TODO
            console.log("clusterForceNodes is null, cant start simulation")
        }
    }
    
    clearForceCluster(){
        if (this.clusterForceSimulation){
            this.clusterForceSimulation.alphaDecay(1);
        }

        if (this.nodes_container){
            this.nodes_container.selectAll("*").remove();
        }
    }

    render(){
        return (
            <svg id="clusterForceSvg" style={ { width:"100%", height:"100%"} } ref={(node) => this.clusterForceSvgRef = node}></svg>
        );
    }
}

export default TopicModeller;