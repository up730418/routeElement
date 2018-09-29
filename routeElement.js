try {
class RouteChecker extends HTMLElement {
     static get observedAttributes() {
         return ['showEachStep', 'lat', 'long', 'routeStart', 'routeWaypoint', 'routeEnd', 'showRouteTiming', 'showRouteInputs', 'showRouteMap', 'optimizeRouteWaypoints', 'routeTravelMode'];
     }

    constructor() {

        super()
   
        let markerArray;
        let directionsService;
        let map; 
        let directionsDisplay;
        let stepDisplay;
        let showEachStep;
        let lat;
        let routeStart;
        let routeEnd;
        let routeWaypoint;
        let showRouteTiming;
        let showRouteInputs;
        let optimizeRouteWaypoints; 
        let routeTravelMode; 
       

        //check if maps library have been loaded yet.
        //If not wait till it is, Then load the component.
        if(typeof google == "undefined") {
           this.loadMapsScript();
           window.addEventListener("googleMapLaoded", () => {this.initComponent()});
        } else {
            this.initComponent();
        }
    }
        
   initComponent(){
   		//Setup some defaaults
   		
        this.showEachStep = false;
        this.lat = 51.214737;
        this.long =-1.508964;
        this.showRouteTiming = true;
        this.showRouteInputs = true;
        this.showRouteMap = true;
        this.optimizeRouteWaypoints = true;
        this.routeTravelMode = 'DRIVING';

        let shadow = this.attachShadow({
            mode: 'open'
        });

        let wraper = document.createElement('section');
        let routeResults = document.createElement('div');
        routeResults.setAttribute('id', 'routeResultsDiv');
        
        /* Start Loaction Input */
        let routeStartInput = document.createElement('input');
        routeStartInput.setAttribute('type', 'text');
        routeStartInput.setAttribute('placeHolder', 'Start Location');
        routeStartInput.setAttribute('id', 'routeStartLocation');
        routeStartInput.setAttribute('class', 'routeInput');
        routeStartInput.setAttribute('style', 'margin:0.5em;');

        /* End Location Input */
        let routeEndInput = document.createElement('input');
        routeEndInput.setAttribute('type', 'text');
        routeEndInput.setAttribute('placeHolder', 'End Location');
        routeEndInput.setAttribute('id', 'routeEndLocation');
        routeEndInput.setAttribute('class', 'routeInput');
        routeEndInput.setAttribute('style', 'margin:0.5em;');

        /* Waypoints Input*/
        let routeWaypointInput = document.createElement('input');
        routeWaypointInput.setAttribute('type', 'text');
        routeWaypointInput.setAttribute('placeHolder', 'Waypoints');
        routeWaypointInput.setAttribute('id', 'routeWaypoints');
        routeWaypointInput.setAttribute('class', 'routeInput');
        routeWaypointInput.setAttribute('style', 'margin:0.5em;');
        
        /* Search button */
        let routSearchInput = document.createElement('button');
        routSearchInput.setAttribute('id', "searchBestRoutes");
        routSearchInput.setAttribute('class', 'buttontext');
        routSearchInput.innerText = "Check Best Route";

        /* Map display */
        let routeMapElement = document.createElement('div');
        routeMapElement.setAttribute('id', "routeMapDiv");
        routeMapElement.setAttribute('class', 'routeMap');
        routeMapElement.setAttribute('style', 'width:50vh;height:50vh;margin:0 auto;');


        //If element has been created with variables change them
        if (this.hasAttribute('lat') && this.getAttribute("lat") !== "") {
            this.lat = parseFloat(this.getAttribute("lat"));
        }
        if (this.hasAttribute('long') && this.getAttribute("long") !== "") {
            this.long = parseFloat(this.getAttribute("long"));
        }
        if (this.hasAttribute('showEachStep')) {
            this.showEachStep = ((this.getAttribute("showEachStep") == 'true'));
        }
        if (this.hasAttribute('routeStart') && this.getAttribute("routeStart") !== "") {
            this.routeStart = this.getAttribute("routeStart");
            routeStartInput.value = this.routeStart
        }
        if (this.hasAttribute('routeEnd') && this.getAttribute("routeEnd") !== "") {
            this.routeEnd = this.getAttribute("routeEnd");
            routeEndInput.value = this.routeEnd
        }
        if (this.hasAttribute('routeWaypoint')) {
            this.routeWaypoint = this.getAttribute("routeWaypoint");
            routeWaypointInput.value = this.routeWaypoint
        }

        if (this.hasAttribute('showRouteInputs')) {
            this.showRouteInputs = ((this.getAttribute("showRouteInputs") == 'true'));
        }

        if (this.hasAttribute('showRouteTiming')) {
            this.showRouteTiming = ((this.getAttribute("showRouteTiming") == 'true'));
        }

        if (this.hasAttribute('showRouteMap')) {
            this.showRouteMap = ((this.getAttribute("showRouteMap") == 'true'));
        }
        if (this.hasAttribute('optimizeRouteWaypoints')) {
            this.optimizeRouteWaypoints = ((this.getAttribute("optimizeRouteWaypoints") == 'true'));
        }

        if (this.hasAttribute('routeTravelMode')) {
        	/** Ensure the travel mode is one of the acceptable forms 
        		Otherwise we keep the default of driving**/
        	let travelTypes = ['BICYCLING','DRIVING','TRANSIT','WALKING'];

            if(travelTypes.includes(this.getAttribute("routeTravelMode")) ){
            	this.routeTravelMode = this.getAttribute("routeTravelMode"); 	
            }
        }

        /** Check what HTML elements to add in*/
        /* Show route inputs */
        if(this.showRouteInputs) {
	        wraper.appendChild(routeStartInput);
	        wraper.appendChild(routeEndInput);
	        wraper.appendChild(routeWaypointInput);
	        wraper.appendChild(routSearchInput);
        }
        /* Show the description of the journey */
        if(this.showRouteTiming) {
        	wraper.appendChild(routeResults);
        }

        /* show the map */
        if(this.showRouteMap) { 
        	wraper.appendChild(routeMapElement);
        }

        /* Add html to screen */
        shadow.appendChild(wraper);

        if(this.showRouteInputs){
        	/* Listen for click on route search button */
	        routSearchInput.addEventListener("click", ()=> {
	            this.calculateAndDisplayRoute(routeStartInput.value, routeEndInput.value, routeWaypointInput.value, routeResults);
	        });
        }

        /************* Initiate google maps stuff ********/
        this.markerArray = [];
        this.stepDisplay = new google.maps.InfoWindow;
        // Instantiate a directions service.
        this.directionsService = new google.maps.DirectionsService;

        //Only setup a map if its needed
        if(this.showRouteMap) { 
	        // Create a map and center it on Stannah.
	        this.map = new google.maps.Map(routeMapElement, {
	          zoom: 13,
	          center: {lat: this.lat, lng: this.long}
	        });
	        // Create a renderer for directions and bind it to the map.
	        this.directionsDisplay = new google.maps.DirectionsRenderer({map: this.map});
	    }
        if(this.routeStart && this.routeEnd) {
            this.routeWaypoint = this.routeWaypoint? this.routeWaypoint : "";
            this.calculateAndDisplayRoute(this.routeStart, this.routeEnd, this.routeWaypoint, routeResults);
        }
        /******* End nitiate google maps stuff *******/
        
    }
    // Adds instructions to markers on the map
    attachInstructionText(marker, text) {
        google.maps.event.addListener(marker, 'click', () => {
          // Open an info window when the marker is clicked on, containing the text
          // of the step.
          this.stepDisplay.setContent(text);
          this.stepDisplay.open(this.map, marker);
        });
      }

    showSteps(directionResult) {
        // For each step, place a marker, and add the text to the marker's infowindow.
        // Also attach the marker to an array so we can keep track of it and remove it
        // when calculating new routes.

        for (let i = 0; i < this.markerArray.length; i++) {
          this.markerArray[i].setMap(null);
        }

        let myRoute = directionResult.routes[0].legs[0];
        for (let i = 0; i < myRoute.steps.length; i++) {
          let marker = this.markerArray[i] = this.markerArray[i] || new google.maps.Marker;
          marker.setMap(this.map);
          marker.setPosition(myRoute.steps[i].start_location);
          this.attachInstructionText(marker, myRoute.steps[i].instructions);
        }
    }
    // Get route details and show them on the map/text results
    calculateAndDisplayRoute(start, end, waypoint, displayArea) {
        let wps = [];
        //Create Waypoints
        if(waypoint!== "") {
            waypoint = waypoint.split(",").forEach((wp) => {
                wps.push({location: wp, stopover: true});
            });      
        }
        // Find the route
        this.directionsService.route({
          origin: start,
          destination: end,
          waypoints: wps? wps : null,
          travelMode: this.routeTravelMode,
          optimizeWaypoints: this.optimizeRouteWaypoints,
        }, (response, status) => {
          if (status === 'OK') {

          	//Show text about the route
            displayArea.innerHTML = "";
            for(let leg of response.routes[0].legs) {
                displayArea.innerHTML += '<p> Leg Start Address:' + leg.start_address + '<br> Leg Duration:' + leg.duration.text + '<br> Leg end addreess: ' + leg.end_address + '</p>';
            }           
            // Show route on map
            this.directionsDisplay.setDirections(response);
            // Show markers/steps on map
            if(this.showEachStep && this.showRouteMap){
                this.showSteps(response);
            }
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
    }
    //Checks if google maps is present if not load it in
    loadMapsScript() {
    	//MYour Maps API KEY
    	 let APIKey= 'YourApiKey';
	    // Find all scripts loaded into page
	    let scripts = Array
	        .from(document.querySelectorAll('script'))
	        .map(scr => scr.src);
	    
	    //Check if the maps script are present    
	    let mapsPresent = scripts.find(a => { return a.indexOf("maps-api") !== -1 })

	    //If no maps present load them in
	    if(mapsPresent == undefined) {
	        let tag = document.createElement('script');
	        tag.src = 'https://maps.googleapis.com/maps/api/js?key='+ APIKey + '&callback=googleMapLoaded';
	        document.getElementsByTagName('body')[0].appendChild(tag);
	    }
	}
    
}

window.customElements.define('route-checker', RouteChecker);
window.RouteChecker = RouteChecker;

/* Lets us know when google has entered the building */
function googleMapLoaded() {
    let googleLoadedEvent = new Event('googleMapLaoded');
    window.dispatchEvent(googleLoadedEvent);
}

} catch(e) {
    console.error(e)
}


