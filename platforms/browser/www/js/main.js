var app = new Framework7({
    // root
    root: '#mainapp',
    on: {
        init: function(){
            // initial tab name;
            document.getElementById('s-navbar-title').innerHTML="Incoming Complaints";
            // remove all previous localstorage variables of data selected
            window.localStorage.removeItem('selectedlng');
            window.localStorage.removeItem('selectedlat');
            window.localStorage.removeItem('selectedaddress');
            window.localStorage.removeItem('selectedimage');
            
            // load incoming complaint on page load
            // api to get all incoming complaints
            $.get(API_URL+'/api/complaint/getunderprocesscomplaint.php',{
                sweeper_uuid: window.localStorage.getItem('uuid')
            },function(data,status){
                if(data.status == 204){
                    setIncomingComplaintsError(data.message);
                }else{
                    // first set all the incoming complaints popups
                    addIncomingComplaintPopups(data,data.count);
                    // pass data to set incoming complaints method and also pass the count
                    setIncomingComplaints(data,data.count);
                }
                console.log(data);
            }).fail(function(error){
                appAlert('Something went wrong!! please check your internet connection','Failed','Ok');
            });

            // fetch pending complaint on initial load
            $.get(API_URL+'/api/complaint/getworkingcomplaint.php',{
                sweeper_uuid: window.localStorage.getItem('uuid')
            },function(data,status){

                if(data.status == 204){
                    // if status is 204 then 
                    setPendingComplaintError(data.message);
                }else{
                    // pass the data to set pending complaint
                    setPendingComplaint(data);
                }
                console.log(data);
            }).fail(function(){
                appAlert('Something went wrong!! please check your internet connection','Failed','Ok');                
            });

            // fetch finished complaints data on initial load
            $.get(API_URL+'/api/complaint/getfinishedcomplaints.php',{
                sweeper_uuid: window.localStorage.getItem('uuid')
            },function(data,status){

                if(data.status == 204){
                    // if status is 204 then 
                    setFinishedComplaintsError(data.message);
                }else{
                    // first set all the finished complaints popups
                    addFinishedComplaintPopups(data,data.count);
                    // pass the data to set finished complaint
                    setFinishedComplaints(data,data.count);
                }
                console.log(data);
            }).fail(function(){
                appAlert('Something went wrong!! please check your internet connection','Failed','Ok');                
            });

            // get swepper info and store it in localstorage
            $.get(API_URL+'/api/sweeper/read.php',{
                uuid: window.localStorage.getItem('uuid')
            },function(data){
                // set zone,name,address,email,adhaar in localstorage
                sweeper_info = {
                    name: data.data[0].name,
                    email: data.data[0].email,
                    adhaar: data.data[0].adhaar,
                    address: data.data[0].address,
                    zone: data.data[0].zone
                }
                // set sweeper info object
                window.localStorage.setItem('sweeperinfo',JSON.stringify(sweeper_info));
            });

            // get admin info by zone and store it in localstorage
            $.post('https://sweepadmin.000webhostapp.com/sweeper-admin/api/admin/read-by-zone.php',{
                zone: JSON.parse(window.localStorage.getItem('sweeperinfo')).zone
            },function(data){
                // set name,email,id,zone in localstorage
                admin_info={
                    id: data.data.id,
                    name: data.data.uname,
                    email: data.data.email,
                    zone: data.data.zone
                }
                // set admin info object
                window.localStorage.setItem('admininfo',JSON.stringify(admin_info));                
            });

        },
        pageInit: function(){
            
        }
    }
});

// set interval to fetch the incoming complaints every 30 seconds
window.setInterval(function(){
    $.get(API_URL+'/api/complaint/getunderprocesscomplaint.php',{
        sweeper_uuid: window.localStorage.getItem('uuid')
    },function(data,status){
        if(data.status == 204){
            
            setIncomingComplaintsError(data.message);
        }else{
            // first set all the incoming complaints popups
            addIncomingComplaintPopups(data,data.count);
            // pass data to set incoming complaints method and also pass the count
            setIncomingComplaints(data,data.count);
        }
        console.log(data);
    }).fail(function(error){
        appAlert('Something went wrong!! please check your internet connection','Failed','Ok');
    });
},30000);

// set interval to fetch the pending complaint i.e. accepted complaint by sweeper
window.setInterval(function(){
    $.get(API_URL+'/api/complaint/getworkingcomplaint.php',{
        sweeper_uuid: window.localStorage.getItem('uuid')
    },function(data,status){

        if(data.status == 204){
            // if status is 204 then 
            setPendingComplaintError(data.message);
        }else{
            // pass the data to set pending complaint
            setPendingComplaint(data);
        }
        console.log(data);
    }).fail(function(){
        appAlert('Something went wrong!! please check your internet connection','Failed','Ok');                
    });

},30000);

// set interval to fetch the finished complaints 
window.setInterval(function(){
    $.get(API_URL+'/api/complaint/getfinishedcomplaints.php',{
        sweeper_uuid: window.localStorage.getItem('uuid')
    },function(data,status){

        if(data.status == 204){
            // if status is 204 then 
            setFinishedComplaintsError(data.message);
        }else{
            // first set all the finished complaints popups
            addFinishedComplaintPopups(data,data.count);
            // pass the data to set finished complaint
            setFinishedComplaints(data,data.count);
        }
        console.log(data);
    }).fail(function(){
        appAlert('Something went wrong!! please check your internet connection','Failed','Ok');                
    });
},30000)

// set interval to get the notifications constantly
window.setInterval(function(){
    // call an method 
    getNotifications(window.localStorage.getItem('uuid'));
},20000);
// this is to get the confirmation to close the app
document.addEventListener("backbutton", function(e){
    navigator.notification.confirm("Are you sure you want to exit the application?",exitSweeperApp,"Warning!!","Ok,Cancel"); // u can change the button names in the place of ok,cancel.
}, false); 

function exitSweeperApp(button) {
    if(button == 1) {
        navigator.app.exitApp();
    } else {
        return;
    }                     
 }

//  click to open notification menu
$(document).ready(function(){
    // click to open menu 
    $('body').click(function(event){
        var notification_btn_id = event.target.id;    
        console.log(notification_btn_id)     
        if(notification_btn_id == "notification-menu-btn"){
            $('#notification-context-menu').toggle('slide');
            $('#notification-context-menu').css("display","flex");                                
        }else if(notification_btn_id == "notification-context-menu" || notification_btn_id == "notification-transperent-body"){
            // do nothing
        }else{
            $('#notification-context-menu').css("display","none");       
        }
    })
});

// this function is to change the navbar title when clicked on tab 
function navbarNameChanger(name){
    document.getElementById('s-navbar-title').innerHTML=name;
} 
