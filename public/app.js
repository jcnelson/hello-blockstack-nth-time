document.addEventListener("DOMContentLoaded", function(event) { 
  document.getElementById('signin-button').addEventListener('click', function() {
    var authRequest = blockstack.makeAuthRequest(null, window.location.origin)
    blockstack.redirectUserToSignIn(authRequest)
  })
  document.getElementById('signout-button').addEventListener('click', function() {
    blockstack.signUserOut(window.location.origin)
  })

  function showError(errorMessage) {
    document.getElementById('section-3').style.display = 'block'
    document.getElementById('error-message').innerHTML = errorMessage
  }

  function getLoginCount(privkey_hex, session_token, device_id) {
    // get or create datastore...
    return blockstack_storage.datastore_get_or_create("localhost:6270", privkey_hex, session_token, device_id, [device_id], ['disk']).then(
    (datastore_ctx) => {

       // get the counts file...
       return blockstack_storage.getfile(datastore_ctx, "/counts.txt").then(
       (count_txt) => {

          var count = 0;
          if( count_txt.error && count_txt.errno == 2 ) {
             // does not exist
             count = 1;
          }
          else if( count_txt.error ) {
             // some other error 
             showError("Failed to get /counts.txt: " + count_txt.error);
          }
          else if( count_txt ) {
             // exists!
             count = parseInt(count_txt);
             if( !count ) {
                throw new Error("Failed to parse " + count_txt);
             }
          }
          else {
             throw new Error("Unknown count value");
          }

          var new_counts_txt = (count + 1) + "";
          
          // update the counts file...
          return blockstack_storage.putfile(datastore_ctx, "/counts.txt", new_counts_txt).then(
             (success) => {
                showError("");
                return count + 1;
             },
             (error) => {
                showError("Failed to update /counts.txt: " + error);
                return {'error': 'Failed to update /counts.txt: ' + error};
             });

       },
       (error) => {
          showError("Failed to get /counts.txt: " + error);
          return {'error': 'Failed to get /counts.txt'};
       });
    },
    (error) => {
       showError("Failed to connect to datastore: " + error);
       return {'error': 'Failed to get /counts.txt'};
    });
  }

  function showProfile(profile) {
    // load the person's datastore 
    var privkey_hex = "TODO: fill in";
    var session_token = "TODO: fill in";
    var device_id = "5a726553-237c-4d96-b5e4-bc143b5c1014";

    getLoginCount(privkey_hex, session_token, device_id).then(
    (count) => {
       var person = new blockstack.Person(profile)
       document.getElementById('heading-name').innerHTML = person.name() + ' (login count: ' + JSON.stringify(count) + ')'
       document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
       document.getElementById('section-1').style.display = 'none'
       document.getElementById('section-2').style.display = 'block'
       document.getElementById('section-3').style.display = 'none'
    },
    (error) => {
       showError("Failed to get login count: " + error);
    });
  }

  document.getElementById('section-3').style.display = 'none'
  if (blockstack.isUserSignedIn()) {
    blockstack.loadUserData(function(userData) {
      showProfile(userData.profile)
    })
  } else if (blockstack.isSignInPending()) {
    blockstack.signUserIn(function(userData) {
      window.location = window.location.origin
    })
  }
})
