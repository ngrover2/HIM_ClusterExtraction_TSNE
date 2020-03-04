import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { Form, Input, Label, Button, Segment, Header, Grid, Divider } from 'semantic-ui-react';
import {  default as lasso} from "./d3v4-lasso"

class TSNESimulator extends React.Component{
    constructor(props){
        super(props);
        this.props = props;
        this.startSimulation = this.startSimulation.bind(this);
        this.state = {
            tsneDataPoints: props.data ? [...props.data] : []
        }
        document.addEventListener("DOMContentLoaded", this.ready);
    }

    areEqualShallow(_curr, _new) {
        if ( _curr && _new && (_curr.length == 0) && (_new.length == 0)) return true;
        if (!_new || !_curr || (_curr.length == 0) || (_new.length == 0)) return false;
        let _currSet = new Set();
        let _newSet = new Set();
        _curr.map((v,i)=> {_currSet.add(v.word)});
        _new.map((v,i)=> {_newSet.add(v.word)});
        return (
            Boolean([..._currSet].filter((v,i)=>{return !_newSet.has(v)}).length==0) && 
            Boolean([..._newSet].filter((v,i)=>{return !_currSet.has(v)}).length==0)
        );
    };

    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.tsneDataUpdateId != (undefined || null) 
            && (nextProps.tsneDataUpdateId == this.props.tsneDataUpdateId)) {
                return false; 
            }
        if (this.areEqualShallow(this.props.data, nextProps.data)){
            return false;
        }else{
            this.resetTSNE();
            return true;
        }
    }

    componentDidMount(){
        if (this.props.data){
            this.startSimulation();
        }
    }

    componentDidUpdate(prevProps){
        this.resetTSNE();
    }

    startSimulation(){
        var tsneDataPoints = this.props.data ? [...this.props.data] : [];
        if (d3 !== undefined){
            function getd3ElementBbox(el) {
                return el.node().getBoundingClientRect();
            }
        
            if (true){
                var tsnePauseAlpha = null;
                var clusterForcePauseAlpha = null;
                var TSNE_PAUSED = false;
                var CLUSTER_FORCE_PAUSED = false;
                var solutions = [];
                var tsneSelectedInLasso = [];
                var tsnePointsPlaceHolders = null;
                var tsnePoints = null;
                var tsneNodes = [];
                var forcetsne = null;
                var tsneLasso = null;
                var tsneWidth = 600;
                var tsneHeight = 500;
                var tsneMargin = null;
                var tsneCenterx = null;
                var tsneCentery = null;
                var tsneModel = null;
                var tsneCircles = null;
                var tsneLabels = null;
                var tsneData = null;
                var tsneWords = [];
                var freq_range = [12,14];
                var dists = [];
                var newClusterForceNodes = [];
                var clusterLabels = {};
                var child2ParentMapping = {};
            }
            
            tsneWidth = d3.select(this.tsneSvgRef)._groups[0][0].clientWidth;
            tsneHeight =  d3.select(this.tsneSvgRef)._groups[0][0].clientWidth;
            
            this.tsneSvgContainer = d3.select(this.tsneSvgRef);
            var tsneLasso_area = this.tsneSvgContainer.append('rect').attr("class", "lassoContainer").attr("width",1200).attr("height",800).style("opacity",0);
            
            var tsneLasso_start = function() {
                tsneLasso.items().each(function(d) {
                    if (d3.select(this).classed("selectedbefore")){
                        d3.select(this).classed("colored",true);
                    }
                });
                    tsneLasso.items()
                    .attr("r",5) // reset size
                    .classed("not_possible",true)
                    .classed("selected",false);
            };
            var tsneLasso_draw = function() {
                
                    // Style the possible dots
                    tsneLasso.possibleItems()
                        .classed("not_possible",false)
                        .classed("possible",true);
        
                    // Style the not possible dot
                    tsneLasso.notPossibleItems()
                        .classed("not_possible",true)
                        .classed("possible",false);
            };
            var tsneLasso_end = function() {
                    // Reset the color of all dots
                    tsneLasso.items()
                        .classed("not_possible",false)
                        .classed("possible",false);
        
                    // Style the selected dots
                    tsneLasso.selectedItems()
                        .classed("selected",true)
                        .attr("r",7);
                    tsneSelectedInLasso = null;
                    tsneSelectedInLasso = tsneLasso.selectedItems().data();
        
                    freq_range = d3.extent(tsneSelectedInLasso,(d) => d.freq);
                    var computeColor = d3.scaleLinear()
                                    .domain(freq_range)
                                    .range(["brown", "steelblue"]);
        
                    // get indices of selected words from all words
                    newClusterForceNodes = [];
                    tsneSelectedInLasso.map(function(sel_obj){
                        // sel_word is a selected object which contains the word
                        var tmp_object = Object.assign(
                                            {},
                                            sel_obj,
                                            {c:computeColor(sel_obj.freq)}
                                        );
                        newClusterForceNodes.push(tmp_object);
                    });
                    if (newClusterForceNodes.length>0){
                        this.props.collectFromLasso(newClusterForceNodes);
                    }
                    
                    /* before new nodes are chosen to be shown in Vis2(right), 
                    mark any of the previous ones that weren't chosen as children as undecided and 
                    put it back into TSNE view as unmarked 
                    so they can be differentiated from the ones that have been processed.*/

        
                    // Reset the style of the not selected dots
                    tsneLasso.notSelectedItems()
                        .attr("r",5);
                    tsneLasso.selectedItems().each(function(d){
                        d3.select(this).classed("selectedbefore",true);
                    });
            };
        
            function loadTSNEData(data){
                function getRandomInt(max) {
                    return Math.floor(Math.random() * Math.floor(max));
                }

                try{
                    tsneData = data;
                    tsneMargin = 40;
                    tsneCenterx = d3.scaleLinear().range([tsneWidth / 2 - tsneHeight / 2 + tsneMargin, tsneWidth / 2 + tsneHeight / 2 - tsneMargin]);
                    tsneCentery = d3.scaleLinear().range([tsneMargin, tsneHeight - tsneMargin]);
                    var show_n = 100;
                    tsneNodes = [];
                    data.map(function(d,i){
                        tsneNodes.push({"word":d.word || i, "freq":d.freq, "x": getRandomInt(tsneWidth - tsneMargin), "y":getRandomInt(tsneHeight - tsneMargin), "color":d3.color("steelblue"), "r":5, "id":i});
                        tsneWords.push(d.word);
                    });
                    // set options for computing T-SNE from original embeddings
                    tsneModel = null;
                    tsneModel = new tsnejs.tSNE({
                        dim: 2,
                        perplexity: 30,
                    });

                    // Load precomputed pair-wise distances between words
                    dists = data.map(function(d,i)  {
                        return d.dists
                    });

                    setTSNE();
                }catch(err){
                    console.log(err);
                }
            }
        
            function setTSNE(){
                // Load data to visualise in TSNE
                    
                drawTSNENodes(tsneNodes);
                
                // Initialise the T-SNE tsneModel
                tsneModel.initDataDist(dists);
            }

            function startTSNE(){
                // if (forcetsne == (null || undefined)){
                if(true){
                    forcetsne = d3.forceSimulation(tsneNodes)
                    .alphaDecay(0.005)
                    .alpha(0.1)
                    .force('tsne', function (alpha) {
                            
                        // every time you call this, solution gets better
                        tsneModel.step();
        
                        // Y is an array of 2-D tsnePoints that you can plot
                        let pos = tsneModel.getSolution();
                        tsneCenterx.domain(d3.extent(pos.map(d => d[0])));
                        tsneCentery.domain(d3.extent(pos.map(d => d[1])));
                        tsneNodes.map((d, i) => {
                            d.x = tsneCenterx(pos[i][0]);
                            d.y = tsneCentery(pos[i][1]);
                        });
                        
                        if (TSNE_PAUSED == true){
                            tsnePauseAlpha = alpha;
                        }
                    })
                    .on('tick', function (alpha) {
                        if (TSNE_PAUSED == true){
                            forcetsne.stop();
                        }else{
                            tsnePoints.selectAll("circle").attr("cx",(d) => d.x).attr("cy",(d) => d.y);
                            tsnePoints.selectAll("text").attr("x",(d) => d.x).attr("y",(d) => d.y);
                            tsnePoints.selectAll("rect").attr("x",(d) => d.x - 20).attr("y",(d) => d.y - 18).attr("width", (d) => d.word.length * 20);
                        }
                    })
                    .on('end', function() { 
                        return;
                        // TODO: Save to file (code below from Stack Overflow)
                        // var solution = tsneModel.getSolution();
                        // for (let i = 0; i < solution.length; i++){
                        //     solutions.push({'word':data[i].word || 'Unknown','pos':solution[i]});
                        // }
                        // var jstr = JSON.stringify(solutions);
                        // var ref = URL.createObjectURL( new Blob([jstr], { type:`text/json` }) );
                        // function downloadTextFile(text, fileName) {
                        //   const a = document.createElement('a');
                        //   ref = URL.createObjectURL( new Blob([text], { type:`text/json` }) );
                        //   a.href = ref;
                        //   a.download = fileName;
                        //   a.click();
                        // }
                        // downloadTextFile(JSON.stringify(jstr), 'words.json');
                    });
                }
            }
            this.startTSNE = startTSNE;
        
            function drawTSNENodes(tsneNodes) {
                this.tsneSvgContainer.selectAll("*").remove();
                tsneLasso_area = this.tsneSvgContainer.append('rect').attr("class", "lassoContainer").attr("width",tsneWidth).attr("height",tsneHeight).style("opacity",0);
                tsnePointsPlaceHolders = this.tsneSvgContainer
                                    .selectAll('g.labelledPoint')
                                    .data(tsneNodes, function(d){
                                        return d.word;
                                    });// returns  placeholders for g elements with class=`labelledPoint`
                
                // Exit
                tsnePointsPlaceHolders.exit().remove();
    
                tsnePoints = tsnePointsPlaceHolders.enter().append("g").attr("class","labelledPoint")
                    .on("mouseover", function(d){
                        d3.select(this).raise().selectAll('.pointLabel').classed("invisible", false);
                        d3.select(this).raise().select('.pointSVG').classed("hovered", true);
                    })
                    .on("mouseout", function(d){
                        d3.select(this).selectAll('.pointLabel').classed("invisible", true)
                        d3.select(this).select('.pointSVG').classed("hovered", false);
                    });//.merge(tsnePointsPlaceHolders);
    
                // Add point
                var circles = tsnePoints
                            .append("circle").attr("class", "pointSVG")
                            .attr("id",(d) => "point_" + d.word)
                            .attr("cx",(d) => d.x)
                            .attr("cy",(d) => d.y)
                            .attr("r",(d) => d.r)
    
                // Add pointLabel_background rectangle
                var label_rects = tsnePoints
                                .append("rect")
                                .attr("class", "pointLabel")
                                .attr("x", (d) => d.x - 20)
                                .attr("y", (d) => d.y - 18)
                                .attr("width", (d) => d.word.length * 20)
                                .attr("height",25)
                                .style("background","black")
                                .classed("invisible",true);
                
                // Add pointLabel
                var labels = tsnePoints
                                .append('text')
                                .attr("class", "pointLabel")
                                .attr("id",(d) => "label_" + d.word)
                                .attr("x", (d) => d.x)
                                .attr("y", (d) => d.y)
                                .text((d) => d.word)
                                .classed("invisible",true);
    
                // Define the tsneLasso
                tsneLasso = lasso()
                                .closePathSelect(true)
                                .closePathDistance(100)
                                .items(tsnePoints.selectAll("circle"))
                                .targetArea(tsneLasso_area)
                                .on("start",tsneLasso_start)
                                .on("draw",tsneLasso_draw)
                                .on("end",tsneLasso_end);
            
                this.tsneSvgContainer.call(tsneLasso);
            }

            function pauseTSNE(){
                if (forcetsne!=null){
                    TSNE_PAUSED =  !TSNE_PAUSED;
                    if ((tsnePauseAlpha != null) && (TSNE_PAUSED === false)){
                        forcetsne.restart();
                        forcetsne.alpha(tsnePauseAlpha);
                    }
                }else{
                    TSNE_PAUSED = false;
                }
            }
        
            function resetTSNE(){
                forcetsne && forcetsne.stop();
                TSNE_PAUSED = false;
                loadTSNEData(this.props.data);
            }

            function hideNodes(ids){
                tsnePoints
                    .each(function(data) {
                        if (ids.includes(data.id)) d3.select(this).classed("removed", true);
                    });
            }
            this.hideNodes = hideNodes;
            
            drawTSNENodes = drawTSNENodes.bind(this);
            tsneLasso_end = tsneLasso_end.bind(this);
            this.pauseTSNE = pauseTSNE;
            this.resetTSNE = resetTSNE;
            if (this.props.data != undefined && this.state.tsneDataPoints && this.state.tsneDataPoints.length > 0){
                loadTSNEData(this.state.tsneDataPoints);
            }
        }else{
            console.log("d3 is undefined");
        }
    }

    pauseTSNE(){
        this.pauseTSNE = !this.pauseTSNE;
    }

    render(){
        return <svg id="tsneSvg" style={ { width:"100%", height:"100%"} } ref={ (node) => this.tsneSvgRef = node } />;
    }
}

export default TSNESimulator;