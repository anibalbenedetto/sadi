var map, featureList, lat500Search = [], et500Search = [], theaterSearch = [], museumSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

$(document).on("mouseover", ".feature-row", function(e) {
  highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
});

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#featureModal").on("hidden.bs.modal", function () {
	highlight.clearLayers();
});

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(lat500.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  //var layer = markerClusters.getLayer(id);
  var layer = map._layers[id];
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through theaters layer and add only features which are in the map bounds */
  et500.eachLayer(function (layer) {
    if (map.hasLayer(et500Layer) && et500.options.is_active) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/et500.png"></td><td class="feature-name">' + layer.feature.properties.Nombre + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["otile1", "otile2", "otile3", "otile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

var lat500 = L.geoJson(null, {
  style: function (feature) {
    return {
		color: "#FF0000",
		weight: 3,		
        opacity: 1,
		clickable: true
    };
  },
  onEachFeature: function (feature, layer) {
    lat500Search.push({
      name: layer.feature.properties.Nombre,
      source: "lat500",
      id: L.stamp(layer),
      bounds: layer.getBounds()
    });
	if (feature.properties) {
		var content = "<table class='table table-striped table-bordered table-condensed'>";
		for(var field in feature.properties) {
		   // propertyName is what you want
		   // you can get the value like this: feature.properties[field]
		   content += "<tr><th>"+field+"</th><td>" + feature.properties[field] + "</td></tr>";
		}
      content += "</table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Nombre);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
    }
	layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#00FFFF",
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
		showToolTip(e.originalEvent, e.target.feature);
      },
      mouseout: function (e) {
        lat500.resetStyle(e.target);
		closeToolTip();
      }
    });
  }
});
/*
var mm = $('link[rel="lat500"]')
$.getJSON($('link[rel="lat500"]').attr("href"), function (data) {
  lat500.addData(data);
});
*/
lat500.addData(lat500_src);

function showToolTip(mouseevent, feature){
	$("#tooltip_feature").text( feature.properties.Nombre );
	$("#tooltip_feature").css({top: mouseevent.pageY, left: mouseevent.pageX});
	$("#tooltip_feature").show();
}

function closeToolTip(){
	$("#tooltip_feature").text( "" );
	$("#tooltip_feature").hide();
}

var et500Layer = L.geoJson(null);
var et500 = L.geoJson(null, {
	is_active:true,
  style: function (feature) {
    return {
		color: "#FF0000",		
		weight: 3,		
        opacity: 1,
		radius: 5,
		clickable: true
    };
  },
  pointToLayer: function(feature, latlng) {
	  if( et_files && et_files[feature.properties["id"]]) 
		return new L.CircleMarker(latlng, {fillColor: "#FFFFFF",fillOpacity: 1,});
	  else
		return new L.CircleMarker(latlng, {fillColor: "#FFFF00",fillOpacity: 1,});
	},
  onEachFeature: function (feature, layer) {
	  et500Search.push({
      name: layer.feature.properties.Nombre,
      source: "et500",
      id: L.stamp(layer),
      lat: layer.feature.geometry.coordinates[1],
	  lng: layer.feature.geometry.coordinates[0]
    });
    if (feature.properties) {
		var content = "<table class='table table-striped table-bordered table-condensed'>";
		for(var field in feature.properties) {
		   // propertyName is what you want
		   // you can get the value like this: feature.properties[field]
		   content += "<tr><th>"+field+"</th><td>" + feature.properties[field] + "</td></tr>";			
		}
		if(et_files && et_files[feature.properties["id"]]){			
			for (var index = 0; index < et_files[feature.properties["id"]].length; ++index) {
				
				var path = et_files[feature.properties["id"]][index]["path"];
				var extension = path.substring(path.length-4,path.length);
				var icon = "file_icon.png";
				switch(extension){
					case ".pdf":
						icon = "pdf_icon.png";
						break;
					case ".doc":
						icon = "doc_icon.png";
						break;
					case ".jpg":
					case ".png":
					case ".tif":
						icon = "jpg_icon.png";
						break;
				}
				link = '<a href="data/files/'+et_files[feature.properties["id"]][index]["path"]+'" target="_blank"><img src="assets/img/'+icon+'" width="25" height="25"></a>';
				content += "<tr><th>"+et_files[feature.properties["id"]][index]["name"]+"</th><td>" + link + "</td></tr>";
			}
				
		}
      content += "</table>";	  
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Nombre);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
			highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
    }
	layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#00FFFF",
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        et500.resetStyle(e.target);
      }
    });
  }
});

/*
var mm = $('link[rel="lat500"]')
$.getJSON($('link[rel="lat500"]').attr("href"), function (data) {
  lat500.addData(data);
});
*/
et500.addData(et500_src);
et500.on("load",function() { 
	map.addLayer(et500Layer);
	alert("et500layers added!")	
});


map = L.map("map", {
  zoom: 10,
  center: [-62.24954572740068, -38.785317763951717],
  layers: [mapquestOSM, lat500, et500, highlight, et500Layer],
  zoomControl: true,
  attributionControl: true
});




/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": mapquestOSM,
  "Aerial Imagery": mapquestOAM,
  "Imagery with Streets": mapquestHYB
};

var groupedOverlays = {
  "Reference": {
    "Lineas 500": lat500,
	"Estaciones 500Kv": et500,
    //"Subway Lines": subwayLines
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed,
  autoZIndex: true
}).addTo(map);

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === et500) {
	  e.layer.options.is_active=true;
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === et500) {
	  e.layer.options.is_active=false;
	syncSidebar();
  }
});

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).ready(function() {
//$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();
  /* Fit map to lat500 bounds */
  map.fitBounds(lat500.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var lat500BH = new Bloodhound({
    name: "Lineas 500",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: lat500Search,
    limit: 10
  });
  
  var et500BH = new Bloodhound({
    name: "Estaciones 500",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: et500Search,
    limit: 10
  });

  var theatersBH = new Bloodhound({
    name: "Theaters",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: theaterSearch,
    limit: 10
  });

  var museumsBH = new Bloodhound({
    name: "Museums",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: museumSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  lat500BH.initialize();
  et500BH.initialize();
  //theatersBH.initialize();
  //museumsBH.initialize();
  //geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "lat500",
    displayKey: "name",
    source: lat500BH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Lineas 500</h4>"
    }
  }, {
    name: "et500",
    displayKey: "name",
    source: et500BH.ttAdapter(),
    templates: {
		header: "<h4 class='typeahead-header'><img src='assets/img/et500.png' width='14' height='14'>&nbsp;Estaciones 500KV</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "lat500") {
      map.fitBounds(datum.bounds);
    }
    if (datum.source === "et500") {
      if (!map.hasLayer(et500Layer)) {
        map.addLayer(et500Layer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Theaters") {
      if (!map.hasLayer(theaterLayer)) {
        map.addLayer(theaterLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Museums") {
      if (!map.hasLayer(museumLayer)) {
        map.addLayer(museumLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
