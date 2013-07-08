jQuery(document).ready(function() {

//init the map
      var currentLatlng = currentLatlng || [36.1539, -95.9925];   
      var options = {
         center: currentLatlng,
         zoomLevel: 18,
         mapElement: $('#map_content')[0]
      };
      var ttown = ttown || openMap;
      ttown.map(options);
      ttown.addMapListeners();
// init search data
    var search_data = search_data || new search_db();

// load layer panel
    search_data.layers.each(function(layer){
        $('#layer_list').append( 
           "<li class='viewLayer' data-layer_id="+layer.layer_id+">\
               <a  data-role='button' data-rel='dialog'>\
                   <i class='icon-copy' ></i>&nbsp;"+layer.name+"</a>\
           </li>"           
        )})
        .done(function(){
            $("#layer_list").listview('refresh').trigger("create");
            $("li.viewLayer").on('click',function(){
                $( "#layer_panel" ).panel( "close" );
                layer_id=$(this).data('layer_id')
                // search_data.display_searches(ttown,{layer_id:layer_id});
                addLayer(layer_id);
            });
        });

    function addLayer(layer_id){
        search_data.places.each({layer_id:layer_id},function(p){
            var search_loc = [p.latitude, p.longitude];
            ttown.searches[p.place_id] = ttown.addSearch(search_loc,p.place_id,p.extra);                
        })
        .done(function(){
            $('a#viewSearches').trigger('click');
        });
    }

//init socket
    var socket = io.connect('http://206.214.164.229');
    socket.on('message', function (data) {
      console.log(data);
      $.event.trigger(data.message.eventType,data.message.payload);      
    });  

//socket events
    $(document).on("newSearch", function(e,response){
        var search_loc = new google.maps.LatLng(response.latitude,response.longitude);
        ttown.searches[response.place_id]=ttown.addSearch(search_loc,response.place_id,response.extra);
    });
      
    $(document).on("endSearch", function(e,response){
        marker=ttown.searches[response.place_id];
        marker.icon.url="./img/search_end.svg";
        // force icon to re-render
        marker.setMap(ttown);
        marker.search_window.setSearchWindowContent(response.extra)        
    });
    
    $(document).on("moveSearch", function(e,response){
        marker=ttown.searches[response.place_id];
        var search_loc = new google.maps.LatLng(response.latitude,response.longitude);
        marker.setPosition(search_loc);
    });

//client events

    $(document).on("endSearch_click", function(e,marker_key){
        search_data.post(
            'place/update/'+marker_key,
            {extra: {end_time:Date()}},
            function(response, error){
                if(!error){
                    $.event.trigger("endSearch",response);
                    socket.emit('message',{eventType: 'endSearch', payload: response});                        
                }
        });        
    });        

    $(document).on("markerMove", function(e,marker_key){
        marker=ttown.searches[marker_key];
        search_data.post(
            'place/update/'+marker_key,
            {latitude:  marker.position.lat(),
             longitude: marker.position.lng()},
            function(response, error){
                if(!error){
                    socket.emit('message',{eventType: 'moveSearch', payload: response});                        
                }
        });        
    });

//panel menu choices
    $("#addSearch").on('click',function(){
        $( "#menu_panel" ).panel( "close" );
            ttown.setCursor('http://s3.amazonaws.com/besport.com_images/status-pin.png');

            ttown.addEventListenerOnce('click', function(e){
               ttown.setCursor('');
               response=search_data.newSearch(ttown,e.latLng.lat(), e.latLng.lng())
               socket.emit('message', {eventType: 'newSearch', payload: response});
            });
    
    });
    
    $('a#viewSearches').click(function(){
        $( "#menu_panel" ).panel( "close" );
        ttown.fitBounds(ttown.searchBounds());
    });    

    $('a#viewUser').click(function(){
         $( "#menu_panel" ).panel( "close" );
         ttown.setZoom(22);
         ttown.user.setAnimation(google.maps.Animation.DROP);
    });    

    $('a#clearLayers').click(function(){
        ttown= new search_map(document.getElementById("map_content"));
        ttown.searches={};
    });    

    $('a#groups').click(function(){
        var dfd = search_data.groups.all();
        dfd.done(function(response){
            console.log(response);
        }); 
    });

    $('button#createGroup').click(function(){
       var dfd = search_data.groups.createGroup();
       dfd.done(function(response){
           console.log(response);
        });        
    });

//authentication

    $('button#signin').click(function(){
      var auth={}; auth.username = $('input#email').val(),
          auth.password = $('input#password').val();
          search_data.login(auth);
    });    

    search_data.onAuthorize = function(response, error){
      console.log("You are a user!");
      $.mobile.changePage('#mapPage');
    };
    
    search_data.onLoginError = function(error){
      console.log("You are not a user!");
      $('#linkDialog').click();
    }

//watch position init 
/*    var userPositionChange = function(pos) {
        var crd = pos.coords;
        currentLatlng = new google.maps.LatLng(crd.latitude, crd.longitude);          
        ttown.user.setPosition(currentLatlng);
        ttown.user_accuracy=crd.accuracy;
        // ttown.panTo(ttown.user.position);
        
    };

     var errorPositionChange = function (err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    };
    
    posOptions = {enableHighAccuracy: true}; 
        
    distWatchID = navigator.geolocation.watchPosition(userPositionChange, errorPositionChange, posOptions);       
*/
    $("#mapPage").on("pageshow",function(){
        //google.maps.event.trigger(ttown, 'resize');
    });
 
    $('#mapPage').trigger('pageshow');
   
    $('#btnToggleMap').click(function(){
       openMap.toggleMap();   
   });
});

