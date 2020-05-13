
var firstPageUrl = "index.html";
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {   
        // store main api ur in localstorage
        window.localStorage.setItem('API_URL','https://kshitijskincare.com/sweeperapi');
        // get uuid and store it in localstorage
        window.localStorage.setItem("uuid",device.uuid);
        // get lat long and store it in localstorage
        navigator.geolocation.getCurrentPosition(function(position){
          // store lat in localstorage
          window.localStorage.setItem('sweeperlat',position.coords.latitude);
          // store lng in localstorage
          window.localStorage.setItem('sweeperlng',position.coords.longitude);
          // get the zones from api
        },function(){

        },{enableHighAccuracy: true });

        // notification subscription
        // onesignal notifications
        var notificationOpenedCallback = function(jsonData) {
            console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
        };
        
        window.plugins.OneSignal
            .startInit("e8dbd8b6-5723-4729-bffe-c21e846d55be")
            .handleNotificationOpened(notificationOpenedCallback)
            .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
            .endInit();
    },
    
  };
var api_url = window.localStorage.getItem('API_URL');
// function is to login user
function login(){
  // login user
  auth = loginSweeper();
  if(auth == 'empty'){
    appAlert('Please fill all the fields','Warning!!','Ok');
  }else if(auth == 'adhaar_limit'){
    appAlert('Invalid adhaar no','Warning!!','Ok');
  }else if(typeof(auth) == 'object'){
    $('#loading-gif').css("display","flex");
    // first get uuid from localstorage
    var uuid = window.localStorage.getItem('uuid');
    if(uuid == 'null'){
      uuid = Math.random();
    }
    // send post request to login the user
    $.post(api_url+'/api/sweeper/verify.php',{
      uuid: uuid,
      adhaar: auth.adhaar,
      hashkey: auth.hashkey
    },function(data,status){
      if(data.status == 404){
        $('#loading-gif').css("display","none");        
        appAlert(data.message,'warning','Ok');        
      }else{
        // check if uuid is diffrent then store uuid from db
        if(window.localStorage.getItem('uuid')!=data.uuid){
          window.localStorage.setItem('uuid',data.uuid);
        }
        // get rid of spinner
        $('#loading-gif').css("display","none");
        // set login == 1 in localstorage 
        window.localStorage.setItem("login","1");
        // call function to register notificant
        window.plugins.OneSignal.getPermissionSubscriptionState(function(status) {
          $.get(api_url+'/api/notification_auth/register.php',{
            notifier: 'sweeper',
            uuid: window.localStorage.getItem('uuid'),
            notification_id: status.subscriptionStatus.userId
          },function(data){
              if(data.status == 204){   
                  console.log(status.subscriptionStatus.userId);                          
                  conosle.log(data.message);                
              }else{
                  conosle.log(status.subscriptionStatus.userId);
                  conosle.log(data.message);
              }
              window.localStorage.setItem('notification_id',status.subscriptionStatus.userId);
          }).fail(function(error){   
              alert('something went wrong please clear data and login again');    
          });
        });
        // redirect to the main page  
        window.location.href="main.html";
      }
    })
    .fail(function(error){
      // get rid of spinner
      $('#loading-gif').css("display","none");
      appAlert('something went wrong!! please check internet connection','Failed','Ok');
    });
  }
}

// function for going to signup page
function gotoLogin($url){
  window.location.href = $url;
}
app.initialize();
