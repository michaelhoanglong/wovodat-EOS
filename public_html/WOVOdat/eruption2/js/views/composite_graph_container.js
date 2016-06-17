define(function(require) {
  'use strict';
  var $ = require('jquery'),
      Backbone = require('backbone'),
      _ = require('underscore'),
  // Serie = require('models/serie'),
  // TimeSerieGraph = require('views/time_serie_graph'),

      TimeRange = require('models/time_range'),
      Eruption = require('models/eruption'),
      Eruptions = require('collections/eruptions'),
      EruptionSelect = require('views/eruption_select');


  return Backbone.View.extend({
    el: '',

    initialize: function(options) {
      /** Variable declaration **/
      this.overviewSelectingTimeRange = new TimeRange();

      this.observer = options.observer;
      this.overviewSelectingTimeSeries = options.selectingTimeSeries;
      this.compositeGraph = options.graph;
    },
    //hide overview graph from page
    hide: function(){
      this.$el.html("");
      this.$el.addClass("composite-graph-container card-panel");
      this.$el.append("<div id = \"composite-title\" style = \"padding-left: 50px;display:none;\">" +
          "<a style = \" font-weight: bold; color : black;\">Composite Graph.</a> <br>" +
          "</div>");
      this.trigger('hide');
    },

    //show overview graph on page
    show: function(){
      this.render();
    },
    selectingFiltersChanged: function(data) {
      this.data = data;
      this.compositeGraph.data = data;
      // console.log("DEBUG " + this.selectingFilters.);
      if (this.data.empty) {
        this.hide();
      }else{
        this.show();
      }
    },

    render: function() {
      //console.log(this.overviewGraph);
      this.compositeGraph.update();
      this.compositeGraph.$el.appendTo(this.$el);
    }
  });
});