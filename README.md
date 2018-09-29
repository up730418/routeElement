# Route Element
A google directions API based route annalysing custom element

## How to use 

Firstly you'll need to change the APIKey variable to the Key you have generated. Instructions on how to do that can be found at: https://developers.google.com/maps/documentation/directions/get-api-key

Next simply open the routeElement.html file and check all is working.

### Input Parameters:

- showEachStep - Add markers that describes each turn/direction change that needs to be made.
  - Default: false
- lat- The latitude to center the m,ap on when no route is displayed 
  - Default: 51.214737
- long- The longditude to  center the map on when no route is displayed
  - Default: -1.508964
- routeStart- The starting point of your journey
  - Default: null
- routeWaypoint- Waypoints to be visited on a journey. This can take upto 20 waypoints eachseperated by a comma
  - Default: null
- routeEnd- The end point of your journey.
  - Default: null
- showRouteTiming- Show a description that tells you the length of each leg and the start/end points 
  - Default: true
- showRouteInputs- Show input boxes so that a user can enter there own routes.
  - Default: true
- showRouteMap- Show the Google maps layer that shows your route on a map 
  - Default: true
- optimizeRouteWaypoints- Choose whether or not Google should decide wich waypoint to visit first
  - Default: true
- routeTravelMode- Choose between any of googles transit modes:`['BICYCLING','DRIVING','TRANSIT','WALKING']`
  - Default: DRIVING
