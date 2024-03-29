/**
 * @author Marco Alionso Ramirez, marco@onemarco.com
 * @url http://onemarco.com
 * @version 1.0
 * This code is public domain
 */

/**
 * The Tooltip class is an addon designed for the Google Maps GMarker class. 
 * @constructor
 * @param {GMarker} marker
 * @param {String} text
 * @param {Number} padding
 */
function Tooltip1(marker, text, padding){
	this.marker_ = marker;
	this.text_ = text;
	this.padding_ = padding;
}

Tooltip.prototype = new GOverlay();

Tooltip.prototype.initialize = function(map){
	var div = document.createElement("div");
	div.appendChild(document.createTextNode(this.text_));
	div.className = 'tooltip';
	div.style.position = 'absolute';
	div.style.background = 'white';
	div.style.visibility = 'hidden';
	div.style.padding = '1px';
	div.style.fontFamily = 'Helvetica';
	div.style.fontSize = 'smaller';
  div.style.letterSpacing='0.15em';
	div.style.textAlign = 'left';
	map.getPane(G_MAP_FLOAT_PANE).appendChild(div);
	this.map_ = map;
	this.div_ = div;
}

Tooltip.prototype.remove = function(){
	this.div_.parentNode.removeChild(this.div_);
}

Tooltip.prototype.copy = function(){
	return new Tooltip(this.marker_,this.text_,this.padding_);
}

Tooltip.prototype.redraw = function(force){
	if (!force) return;
	var markerPos = this.map_.fromLatLngToDivPixel(this.marker_.getPoint());
	var iconAnchor = this.marker_.getIcon().iconAnchor;
	var xPos = Math.round(markerPos.x - this.div_.clientWidth / 2);
	var yPos = markerPos.y - iconAnchor.y - this.div_.clientHeight - this.padding_;
	this.div_.style.top = yPos + 'px';
	this.div_.style.left = xPos + 'px';
}

Tooltip.prototype.show = function(){
	this.div_.style.visibility = 'visible';
}

Tooltip.prototype.hide = function(){
	this.div_.style.visibility = 'hidden';
}