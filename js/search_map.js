


//  map object 
var tulsa_map= function (element) {    
    // 'tulsa 36.1539,-95.9925'
        
        var this_map,
        search_overlay,
        map_element = null,
        tulsaLatlng =  tulsaLatlng ||  new google.maps.LatLng(36.1539,-95.9925),
        dispatchMapOptions = {
            visualRefresh:true,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center:tulsaLatlng,
            panControl: false,
            scaleControl: false,
            overviewMapControl: false,

            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER,
            },

            mapTypeControl: true,
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM,
            },

            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
                position: google.maps.ControlPosition.RIGHT_CENTER,
            },
        };

        var createMarker = function (position){
                  var marker = new google.maps.Marker({
                        draggable:true,
                        map: this_map,
                        position: position,
                        visible:true,
                        icon:{
                            anchor: new google.maps.Point(32, 32),
                            scaledSize: new google.maps.Size(50,50,'px','px'),
                            url:"./img/search_end.svg"
                        }
                    });
                    
                    
               // this_map.panTo(marker.getPosition());               
    };



    if (element !== map_element){
        map_element = element;
        google.maps.visualRefresh=true;
        this.map = new google.maps.Map(element, dispatchMapOptions); 
    }
    
    this.map.createMarker = createMarker;      
    this_map=this.map;
    return this.map;
};