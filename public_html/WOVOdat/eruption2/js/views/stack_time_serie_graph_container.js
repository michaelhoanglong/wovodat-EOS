define(function(require) {
  'use strict';
  var $ = require('jquery'),
      Backbone = require('backbone'),
      _ = require('underscore'),
  // Serie = require('models/serie'),
  // TimeSerieGraph = require('views/time_serie_graph'),
      StackGraph =  require('views/stack_time_serie'),
      TimeRange = require('models/time_range');


  return Backbone.View.extend({
    el: '',
    events: {
      //. 'click .select_time_range': 'updateSelectingTimeRange',
      'click .gen-pdf' : 'generatePDF',

    },
    initialize: function(options) {
      /** Variable declaration **/
      this.overviewSelectingTimeRange = new TimeRange();

      this.observer = options.observer;
      this.overviewSelectingTimeSeries = options.selectingTimeSeries;
      this.stackGraph = options.stackGraph;
      this.graphs = [];
    },

    /*
    Add graph
     */
    addGraph : function( filters,displayXAxis) {

      var stackGraph = new StackGraph( {
        // timeRange : this.timeRange,
        filters : filters,
        isXaxis : displayXAxis,
        //data: data,
        eruptionTimeRange: this.eruptionTimeRange,
        serieGraphTimeRange: this.timeRange,
        eruptions : this.eruptions,
     //   eruptionData : eruptionData,
      });
      this.graphs.push(stackGraph);

    },
    /*
     Generate PDF
     */
    generatePDF :function(){

      var obj = document.getElementsByTagName("body")[0].innerHTML;
      var head = document.getElementsByTagName("head")[0].innerHTML;
      var imgDatas = []
      var time_series =  document.getElementsByClassName("stack-graph-container")[0];
      var canvases = time_series.getElementsByTagName("canvas")
      for (var i = 0 ; i < canvases.length; i++){
        var c  = canvases[i];
        var ctx = c.getContext("2d");
        var imgData = ctx.getImageData(0, 0, 1240, 400);
        imgDatas.push(imgData);

      }

      /*
       Write css file to head
       */
      var url = location.protocol + '//' + location.host + location.pathname;
      head = head.split('src=\"').join('src=\"'+url);
      head = head.split('href=\"').join('href=\"'+url);
      head = head.split('eruption2//').join('');



      var w = window.open();
      var t,i,j;
      w.document.head.innerHTML = head;
      w.document.body.innerHTML = obj;

      /*
       remove redundant part
       */
      w.document.getElementsByClassName("mgt20")[0].innerHTML = "";
      w.document.getElementsByClassName("mgt15")[0].innerHTML = "";
      w.document.getElementsByClassName("overview-graph-container")[0].style.display = "none";
      w.document.getElementsByClassName("time-series-graph-container")[0].style.display = "none";

      var btns = w.document.getElementsByClassName("btn");
      for (var t = 0 ; t < btns.length; t++){
        btns[t].style.display = "none";
      }
      var time_serie2 = w.document.getElementsByClassName("stack-graph-container")[0];
      var canvases2 = time_serie2.getElementsByTagName("canvas")
      for (var i = 0 ; i < canvases2.length; i++){
        var c  = canvases2[i];
        var ctx = c.getContext("2d");
        ctx.putImageData(imgDatas[i],0,0);


      }
      w.window.print();


    },
    //hide overview graph from page
    hide: function(){
      this.$el.html("");
      this.$el.addClass("stack-graph-container card-panel");

      this.$el.append("<div id = \"stack-title\" style = \"padding-left: 50px; margin-bottom:30px; margin-top:10px;\">" +
          "<a style = \" font-weight: bold; color : black;\">Stack Graph.</a> <br>" +
          "</div>");

      (document.getElementsByClassName("stack-graph-container")[0]).style.display = "none";
      document.getElementById('stack-title').style.visibility = "collapse";

      //this.trigger('hide');
    },

    //show overview graph on page
    show: function(){
      //console.log("STACK");
      this.graphs = [];
      if (this.filters != undefined) {
        for (var i = 0; i < this.filters.length; i++) {
          this.addGraph(this.filters[i], i==this.filters.length-1);
        }

      }

      //if (this.data != undefined){


      //this.stackGraph.data = this.data;
      //this.stackGraph.timeRange = this.timeRange;
      this.hide();
      for (var i = 0; i < this.graphs.length; i++) {
        this.$el.append(this.graphs[i].$el);
        if (this.data != undefined){
          var data2 = [];
          data2.push(this.data[i*2]);
          data2.push(this.data[1]);
          this.graphs[i].data = data2;
          this.graphs[i].width = this.width;

        }

        this.graphs[i].show();
      }

      this.render();
      //if (this.data == undefined || this.data.length == 0) this.hide();


    },
    update : function(){
      this.show();
    },
    selectingFiltersChanged: function(selectingFilters) {

      this.data = undefined;
      this.selectingFilters = selectingFilters;
      if (this.selectingFilters.empty) {
        this.hide();
      }else{

        this.show();
      }
    },
    invi : function (){
      (document.getElementsByClassName("stack-graph-container")[0]).style.display = "none";
    },
    render: function() {
      (document.getElementsByClassName("stack-graph-container")[0]).style.display = "block";
      document.getElementById('stack-title').style.visibility = "visible";

      var button = "<a > <input style = \"margin-top: 50px; margin-left:50px;pading:2px 10px 2px 10px;right:0px; \" class = \"waves-effect waves-light btn gen-pdf\"  type=\"button\" value = \"Print PDF\"/> <label ></label> </a>";
      if (this.data == undefined) (document.getElementsByClassName("stack-graph-container")[0]).style.display = "none";
     this.$el.append(button);
      //var button = "<a style = \"right:0px; \"> <input class = \"waves-effect waves-light btn\"  type=\"button\" id=\"\"  value = \"Print PDF\"/> <label for=\"\"></label> </a>";
      //this.$el.append(button);
    }
  });
});