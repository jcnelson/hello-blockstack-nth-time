document.addEventListener("DOMContentLoaded", function(event) { 
  document.getElementById('signin-button').addEventListener('click', function() {

    // ephemeral private key
    var privkey_hex = '0be113bd33b0c6d0c7167d3ebf3752531a1358dd44b5883a88d11335f8e13ca3';
    var domain_name = window.location.origin;
    var manifest_url = domain_name + "/manifest.json";
    var redirect_url = domain_name + "/login";
    var authRequest = blockstack.makeAuthRequest(privkey_hex, domain_name, manifest_url, redirect_url, ['store_write']);

    blockstack.redirectUserToSignIn(authRequest)
  })
  document.getElementById('signout-button').addEventListener('click', function() {
    blockstack.signUserOut(window.location.origin)
  })

  function showError(errorMessage) {
    document.getElementById('section-3').style.display = 'block'
    document.getElementById('error-message').innerHTML = errorMessage
  }

  function getLoginCount() {
    // get the counts file...
    return blockstack_storage.getFile("/counts.txt")
    .then((count_txt) => {

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
       return blockstack_storage.putFile("/counts.txt", new_counts_txt)
       .then((success) => {
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
  }

  function showProfile(profile) {
    // load the person's datastore 
    getLoginCount()
    .then((count) => {
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
