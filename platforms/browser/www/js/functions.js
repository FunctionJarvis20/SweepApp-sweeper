/* this file contains all the functions that are required for authentication and data fetching from db

*/
// variables
var zones = [];
const API_URL = window.localStorage.getItem('API_URL');
// function is to validate the email
function validateEmail(email){
    var validate = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return validate.test(email);
}

// this function is to validate password for following conditions
// 1. length
// 2. it should not be email
// 3. it should not be adhaar number
// 4. it should not be mobile number
// 5. at least one letter one number 
function validatePassword(password,email,adhaar,mobile,fullname){
    var validate = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(password == email || password == adhaar || password == mobile || password == fullname){
        return 'previous_info';
    }else if(!validate.test(password)){
        return 'validation';
    }else{
        return 'validated';
    }
}


// this funcion is to login the user
function loginSweeper(){
    // first get all login parameters
    adhaar = document.getElementById('loginadhaar').value;
    hashkey = document.getElementById('loginkey').value;
    if(adhaar=="" || hashkey==""){
        // first check if all empty or not
        return 'empty';
    }else if(adhaar.length < 12 || adhaar.length > 12){
        // checking email id with regex
        return 'adhaar_limit';
    }else{
        credentialObject = {
            adhaar: adhaar,
            hashkey: hashkey
        } ;
        return credentialObject;
    }
}

// this function is to get the formatable date
function formatDate(date){
    var mydate = new Date(date);
    var day = mydate.getDate();
    var month = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"][mydate.getMonth()];
    var formatedDate = month + ' '+day+',' + mydate.getFullYear();
    return formatedDate;
}

// this function is to get the formatable time
function formatTime(time){
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}

// function remove html tags
function removeTags(str)
{
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
    return str.replace( /(<([^>]+)>)/ig, '');
}



// this function is to set all complaints tab 
function setIncomingComplaints(data,count){
    // build a html string to insert in all complaints tab
    var set_incoming_complaints = '';
    
    for (let index = 0; index < count; index++) {
        // get data 
        complaintid = data.data[index].id;
        description = data.data[index].placename;
        complaintdate = formatDate(data.data[index].complaint_date);
        complainttime = formatTime(data.data[index].complaint_time);
        complaintlat = data.data[index].lat;
        complaintlng = data.data[index].lng;

        // concatinate string html
        set_incoming_complaints = set_incoming_complaints + `
            <div class="card demo-card-header-pic"> 
                <div class="card-content card-content-padding">
                <p class="date"><b>Requested On : </b> ${complaintdate} / ${complainttime}</p>
                <p><b>Description :</b></p>                     
                <p>${description}</p>      
                </div>
                <div class="card-footer">
                    <a class="button button-fill popup-open" href="#" data-popup=".popup-incoming-complaints-id-${complaintid}">View More</a>
                    <a class="button button-fill" href="#" onclick="showDirections('${complaintlat}','${complaintlng}')" >Directions</a>                                               
                    <a class="button button-fill color-green" onclick="acceptComplaint('${window.localStorage.getItem('uuid')}','${complaintid}')" href="#" >Accept</a>     
                </div>
            </div>
        `;
        
    }
    // set incoming complaints to incoming complaint tab
    document.getElementById('incoming-complaints-content').innerHTML = set_incoming_complaints;    

    // remove margin from top
    document.getElementById('incoming-complaints-tab').style.marginTop = "0%";
    
}

// this function is to set error on page of working complaint
function setIncomingComplaintsError(message){
    var set_working_complaint_error = `
        <div id="incoming-complaints-error">
            <p style="text-align: center;">${message}</p>
        </div>
    `;
    // set the incoming complaints error in div
    document.getElementById('incoming-complaints-content').innerHTML = set_working_complaint_error;
    // set margin from top
    document.getElementById('incoming-complaints-tab').style.marginTop = "50%";
    
}

// this function is to set the modal content based on button click from imcoming complaint page
function addIncomingComplaintPopups(data,count){
    var add_incoming_complaint_popups = '';
    
    for (let index = 0; index < count; index++) {
        // get data 
        complaintid = data.data[index].id;
        imageurl = data.data[index].image_url;
        description = data.data[index].placename;
        zone = data.data[index].zone;
        address = data.data[index].address;
        complaintdate = formatDate(data.data[index].complaint_date);
        complainttime = formatTime(data.data[index].complaint_time);

        // concatinate string html
        add_incoming_complaint_popups = add_incoming_complaint_popups + `
            <div class="popup popup-incoming-complaints-id-${complaintid}" style="overflow-y: scroll">
                <div class="block">
                    <p style="display: flex;justify-content: flex-end;margin: 0;"><a class="link popup-close" href="#"><img src="../img/icons/close.png" alt=""></a></p>
                    <h2 style="margin-top: 0;">More Info</h2>
                    <div class="card demo-card-header-pic" style="box-shadow: none">
                        <div style="background-image:url(${API_URL}/api/complaint/uploads/${imageurl})" onclick="openImageInPhotoLibrary('${API_URL}/api/complaint/uploads/${imageurl}')" class="card-header align-items-flex-end pb-standalone-captions">Area Image (click to enlarge)</div>
                        <div class="card-content card-content-padding" style="padding: 0px; padding-top: 20px; padding-bottom: 10px;">
                            <p class="date"><b>Requested On : </b> ${complaintdate} / ${complainttime} </p>           
                            <p><b>Description :</b></p>                     
                            <p>${description}</p>
                            <p><b>Address :</b></p>                     
                            <p>${address}</p>
                            <div class="extra-info-working-complaint">
                            <p><b>Zone : </b>${zone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    }
    // set incoming complaints to incoming complaints popup div
    document.getElementById('single-incoming-complaint-popups').innerHTML = add_incoming_complaint_popups;
}

// this function is to set pending complaint tab 
function setPendingComplaint(data){
    // build a html string to insert in pending complaint tab
    var set_pending_complaint = '';
    // get data 
    complaintid = data.id; 
    imageurl = data.image_url;
    description = data.place_name;
    zone = data.zone;
    address = data.address;
    complaintdate = formatDate(data.complaint_date);
    complainttime = formatTime(data.complaint_time);
    // first get the location parameter from data and the split it by comma(,)
    var latlng = data.location.split(',');
    complaintlat = latlng[0];
    complaintlng = latlng[1];
    // concatinate string html
    set_pending_complaint =`
        <div class="card demo-card-header-pic" style="box-shadow: none">
            <div style="background-image:url(${API_URL}/api/complaint/uploads/${imageurl})" onclick="openImageInPhotoLibrary('${API_URL}/api/complaint/uploads/${imageurl}')" class="card-header align-items-flex-end pb-standalone-captions">Area Image (click to enlarge)</div>
            <div class="card-content card-content-padding" style="padding: 0px; padding-top: 20px; padding-bottom: 10px;">
                <p class="date"><b>Requested On : </b> ${complaintdate} / ${complainttime} </p>           
                <p><b>Description :</b></p>                     
                <p>${description}</p>
                <p><b>Address :</b></p>                     
                <p>${address}</p>
                <div class="extra-info-working-complaint">
                <p><b>Zone : </b>${zone}</p>
                </div>
            </div>
            <div class="card-footer" style="padding: 0;">
                <a class="button button-fill color-green" onclick="finishComplaint('${window.localStorage.getItem('uuid')}','${complaintid}')" href="#" >Finish Complaint</a>     
                <a class="button button-fill" onclick="showDirections('${complaintlat}','${complaintlng}')"" href="#">Directions</a>                                               
            </div>
        </div>
    `;
        
    // set incoming complaints to pending complaint tab
    document.getElementById('pending-complaint-content').innerHTML = set_pending_complaint;    

    // remove margin from top
    document.getElementById('pending-complaint-tab').style.marginTop = "0%";
    
}

// this function is to set the error when no pending complaint found
function setPendingComplaintError(message){
    var set_pending_complaint_error = `
        <div id="pending-complaint-error">
            <p style="text-align: center;">${message}</p>
        </div>
    `;
    // set the pending complaint error in div
    document.getElementById('pending-complaint-content').innerHTML = set_pending_complaint_error;
    // set margin from top
    document.getElementById('pending-complaint-tab').style.marginTop = "50%";
}

// this function is to set the finished complaints 
function setFinishedComplaints(data,count){
     // build a html string to insert in finished complaints tab
     var set_finished_complaints = '';
     for (let index = 0; index < count; index++) {
         // get data 
         complaintid = data.data[index].complaint_id;
         description = data.data[index].placename;
         complaintdate = formatDate(data.data[index].complaint_date);
         complainttime = formatTime(data.data[index].complaint_time);
         complaintfinisheddate = formatDate(data.data[index].complaint_finish_date);
         complaintfinishedtime = formatTime(data.data[index].complaint_finish_time);
         timetaken = getTimeTaken(data.data[index].complaint_date,data.data[index].complaint_time,data.data[index].complaint_finish_date,data.data[index].complaint_finish_time);
         // concatinate string html
         set_finished_complaints = set_finished_complaints + `
             <div class="card demo-card-header-pic"> 
                 <div class="card-content card-content-padding">
                 <p class="date"><b>Requested On : </b> ${complaintdate} / ${complainttime}</p>
                 <p class="date"><b>Finished On : </b> ${complaintfinisheddate} / ${complaintfinishedtime}</p>
                 <p class="date"><b>Total Time Taken : </b> ${timetaken}</p>                 
                 <p><b>Description :</b></p>                     
                 <p>${description}</p>      
                 </div>
                 <div class="card-footer" style="display:flex;justify-content:flex-end;">
                     <a class="button button-fill popup-open" href="#" data-popup=".popup-finished-complaints-id-${complaintid}">View More Info</a>
                 </div>
             </div>
         `;
         
     }
     // set finished complaints to finished complaint tab
     document.getElementById('finished-complaints-content').innerHTML = set_finished_complaints;    
 
     // remove margin from top
     document.getElementById('finished-complaints-tab').style.marginTop = "0%";
}

// this function is to set the finished copmplaints error
function setFinishedComplaintsError(message){
    var set_finished_complaints_error = `
        <div id="finished-complaints-error">
            <p style="text-align: center;">${message}</p>
        </div>
    `;
    // set the finished complaints error in div
    document.getElementById('finished-complaints-content').innerHTML = set_finished_complaints_error;
    // set margin from top
    document.getElementById('finished-complaints-tab').style.marginTop = "50%";
}

// this function is to set the modal content based on button click from finished complaint page
function addFinishedComplaintPopups(data,count){
    var add_finished_complaint_popups = '';
    
    for (let index = 0; index < count; index++) {
        // get data 
        complaintid = data.data[index].complaint_id;
        imageurl = data.data[index].image_url;
        description = data.data[index].placename;
        zone = data.data[index].zone;
        address = data.data[index].address;
        complaintdate = formatDate(data.data[index].complaint_date);
        complainttime = formatTime(data.data[index].complaint_time);
        complaintfinisheddate = formatDate(data.data[index].complaint_finish_date);
        complaintfinishedtime = formatTime(data.data[index].complaint_finish_time);
        timetaken = getTimeTaken(data.data[index].complaint_date,data.data[index].complaint_time,data.data[index].complaint_finish_date,data.data[index].complaint_finish_time);
        // get feedback 
        getUserFeedbackByComplaintId(complaintid);
        // concatinate string html
        add_finished_complaint_popups = add_finished_complaint_popups + `
            <div class="popup popup-finished-complaints-id-${complaintid}" style="overflow-y: scroll">
                <div class="block">
                    <p style="display: flex;justify-content: flex-end;margin: 0;"><a class="link popup-close" href="#"><img src="../img/icons/close.png" alt=""></a></p>
                    <h2 style="margin-top: 0;">More Info</h2>
                    <div class="card demo-card-header-pic" style="box-shadow: none">
                        <div style="background-image:url(${API_URL}/api/complaint/uploads/${imageurl})" onclick="openImageInPhotoLibrary('${API_URL}/api/complaint/uploads/${imageurl}')" class="card-header align-items-flex-end pb-standalone-captions">Area Image (click to enlarge)</div>
                        <div class="card-content card-content-padding" style="padding: 0px; padding-top: 20px; padding-bottom: 10px;">
                            <p class="date"><b>Requested On : </b> ${complaintdate} / ${complainttime} </p>
                            <p class="date"><b>Finished On : </b> ${complaintfinisheddate} / ${complaintfinishedtime}</p>
                            <p class="date"><b>Total Time Taken : </b> ${timetaken}</p>            
                            <p><b>Description :</b></p>                     
                            <p>${description}</p>
                            <p><b>Address :</b></p>                     
                            <p>${address}</p>
                            <div class="extra-info-working-complaint">
                                <p><b>Zone : </b>${zone}</p>
                            </div>
                            <p><b>Feedback By Complainer :</b></p>                     
                            ${window.localStorage.getItem('feedback'+complaintid)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    }
    // set finished complaints to finished complaints popup div
    document.getElementById('single-finished-complaint-popups').innerHTML = add_finished_complaint_popups;
}

// this function is to get the user feedback if available using complaint id
function getUserFeedbackByComplaintId(complaintid){
    var feedback_html = "";
    $.get(API_URL+'/api/feedback/read.php',{
        complaint_id: complaintid
    },function(data,status){  
        if(data.status == 204){
            feedback_html = feedback_html + `
                <div id="feedback-error">
                    <p style="text-align: center;">${data.message}</p>
                </div>
            `;
            window.localStorage.setItem('feedback'+complaintid,feedback_html);
        }else{
            var createdat = "- Given On : "+formatDate(data.date_created)+" / "+formatTime(data.time_created);
            feedback_html = feedback_html +`
                <div id="feedback-message" style="padding: 5px;background: #d0e4d0;">
                    <p style="text-align: center;">${data.feedback}</p>
                    <p class="date" style="text-align: right;color: gray;">${createdat}</p>
                </div>
            `;
            window.localStorage.setItem('feedback'+complaintid,feedback_html);
        }
    }).fail(function(error){
        console.log(error);
    })
}

// this function is to calculate the time taken by sweeper to clear the area
function getTimeTaken(startdate,starttime,enddate,endtime){
    // get total seconds between the times
    var delta = Math.abs(new Date(startdate+" "+starttime) - new Date(enddate+" "+endtime)) / 1000;

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;

    if(days == 0){
        return hours+" hrs"
    }else{
        return days+" days / "+hours+" hrs";
    }
}

// this function is to open the image in photolibrary
function openImageInPhotoLibrary(url){
    previewImageHolder = app.photoBrowser.create({
        photos : [url],
        theme: 'light'
    });
    previewImageHolder.open();
}

// function to show the directions in google maps
function showDirections(complaintlat,complaintlng){
    var sweeperlat;
    var sweeperlng;
    // first get users current location coordinates
     navigator.geolocation.getCurrentPosition(function(position){
        // store lat in localstorage
        window.localStorage.setItem('sweeperlat',position.coords.latitude);
        // store lng in localstorage
        window.localStorage.setItem('sweeperlng',position.coords.longitude);
        // make google mpas url to redirect to the maps using these coordinates 
        var URL = `https://www.google.co.in/maps/dir/${position.coords.latitude},${position.coords.longitude}/${complaintlat},${complaintlng}/`;
        console.log(URL);
        // redirect to map url
        window.location = URL;
    },function(){

    },{enableHighAccuracy: true });
}

// this function is to accept the complaint by passing sweeperuuid and complaintid
function acceptComplaint(sweeperuuid,complaintid){
    // call to an api
    $('#loading-gif').css("display","flex");    
    $.get(API_URL+'/api/complaint/acceptcomplaint.php',{
        uuid: sweeperuuid,
        complaint_id: complaintid
    },function(data){
        if(data.status == 204){
            $('#loading-gif').css("display","none");            
            appAlert(data.message,'Warning!!','Ok');                    
        }else{
            $('#loading-gif').css("display","none");
            // create notification for admin
            createNotificationForAdmin(JSON.parse(window.localStorage.getItem('admininfo')).id,complaintid,sweeperuuid,'cacc');
            appAlert('You have accepted complaint successfully. take a look at pending complaint section to know more!!','Successfully Accepted','Ok');
        }
    }).fail(function(error){
        $('#loading-gif').css("display","none");        
        appAlert('Something went wrong!! please check your internet connection','Failed','Ok');        
    });
}

// this function is to finish the complaint by passing sweeperuuid and complaintid
function finishComplaint(sweeperuuid,complaintid){
    // call to an api
    $('#loading-gif').css("display","flex");    
    $.get(API_URL+'/api/complaint/finishcomplaint.php',{
        sweeper_uuid: sweeperuuid,
        complaint_id: complaintid
    },function(data){
        if(data.status == 204){
            $('#loading-gif').css("display","none");            
            appAlert(data.message,'Warning!!','Ok');                    
        }else{
            $('#loading-gif').css("display","none");
            // get user data to create notification
            user_uuid = data.user_uuid;
            feedback_link = data.feedback_url;
            // create notification for admin that complaint has been resolved
            createNotificationForAdmin(JSON.parse(window.localStorage.getItem('admininfo')).id,complaintid,sweeperuuid,'cr');
            // create notification for user that complaint has been resolved
            createNotificationForUser(user_uuid,complaintid,feedback_link,'cr');
            appAlert('Finished complaint successfully!!','Successfully Finished','Ok');
        }
    }).fail(function(error){
        $('#loading-gif').css("display","none");        
        appAlert('Something went wrong!! please check your internet connection','Failed','Ok');        
    });
}

// function to create notification for admin
function createNotificationForAdmin(admin_id,complaint_id,sweeper_uuid,message){
    // call an api to create notification
    $.post('https://sweepadmin.000webhostapp.com/sweeper-admin/api/notification/create.php',{
        notificant: 'admin',
        admin_id: admin_id,
        complaint_id: complaint_id,
        sweeper_id: sweeper_uuid,
        message: message
    },function(data){
        console.log(data);
    });  
}

// function to create notification for user
function createNotificationForUser(user_uuid,complaint_id,feedback_link,message){
    // call an api to create notification
    $.post('https://sweepadmin.000webhostapp.com/sweeper-admin/api/notification/create.php',{
        notificant: 'user',
        user_id: user_uuid,
        complaint_id: complaint_id,
        feedback_link: feedback_link,
        message: message
    },function(data){
        console.log(data);
    });  
}

// function to read all notifications from table
function getNotifications(sweeper_uuid){
    // call an api to get all notifications
    $.post('https://sweepadmin.000webhostapp.com/sweeper-admin/api/notification/read.php',{
        notificant: 'sweeper',
        sweeper_id: sweeper_uuid
    },function(data){
        console.log(data);
        // set notification based on if available
        if(data.status == 404){
            // set error in notification block
            setNotificationError(data.message);
        }else{
            // set all notifications
            setNotification(data.data,data.count);
        }
    });
}

// function to set notifications
function setNotification(data,count){
    set_notification_in_div  = '';
    // loop over notification
    for (let index = 0; index < count; index++) {
        set_notification_in_div += `
            <div class="notification-item" id="notification-ccontent-id-1">               
                <span class="notification-timestamp">
                <b style="color: gray;">May 6 2020 16:28:30 PM &nbsp;&nbsp;<span class="badge color-red">New</span></b>
                </span>
                <div class="notification-body">
                <h5>You have new incoming complaint!!</h5>
                </div>
            </div>
        `;
    }

}

// function is to set notification error
function setNotificationError(message){

}

// this function is to get the alert
function appAlert(message,title,button){
    navigator.notification.alert(message,function(){},title,button);
}
