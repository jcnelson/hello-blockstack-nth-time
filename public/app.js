document.addEventListener("DOMContentLoaded", function(event) { 
  document.getElementById('signin-button').addEventListener('click', function() {

    // ephemeral private key (used to sign the auth request)
    var privkey_hex = '0be113bd33b0c6d0c7167d3ebf3752531a1358dd44b5883a88d11335f8e13ca3';

    // application's origin
    var app_origin = window.location.origin;

    // URL to the app's manifest file
    var manifest_url = app_origin + "/manifest.json";

    // URL to the app's successful login endpoint
    var redirect_url = app_origin + "/login";

    // capabilities requested
    // (we want to be able to write to this app's datastore)
    var scopes = ['store_write'];

    // make auth request
    var authRequest = blockstack.makeAuthRequest(privkey_hex, app_origin, manifest_url, redirect_url, ['store_write']);

    // prompt the user to sign-in
    blockstack.redirectUserToSignIn(authRequest)
  })

  document.getElementById('signout-button').addEventListener('click', function() {
    blockstack.signUserOut(window.location.origin)
  })

  function showError(errorMessage) {
    if (!errorMessage) {
       document.getElementById('section-3').style.display = 'none';
    }
    else {
       document.getElementById('section-3').style.display = 'block'
       document.getElementById('error-message').innerHTML = errorMessage
    }
  }

  function updateLoginCount(profile) {
    // get the counts file...
    return blockstack_storage.getFile("/settings.json")
    .then((settings_txt) => {
       var settings = null;
       if (settings_txt === null) {
          // does not exist 
          settings = {'count': 1};
       }
       else {
          // increment 
          settings = JSON.parse(settings_txt);
          settings.count += 1;
       }

       // render login count 
       var person = new blockstack.Person(profile)
       document.getElementById('heading-name').innerHTML = person.name() + ' (login count: ' + JSON.stringify(settings.count) + ')'
       document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
       document.getElementById('section-1').style.display = 'none'
       document.getElementById('section-2').style.display = 'block'
       document.getElementById('section-3').style.display = 'none'

       var startSaveTime = new Date().getTime();

       // save login count
       return blockstack_storage.putFile("/settings.json", JSON.stringify(settings))
       .then(() => {
          // success!
          showError(null);

          var endSaveTime = new Date().getTime();
          var totalTime = (endSaveTime - startSaveTime) / 1000.0;

          console.log("Saved! Took " + totalTime + " seconds");
          return settings.count;
       })
       .catch((error) => {
          showError("Failed to update /settings.json: " + error);
          throw error;
       });
    })
    .catch((error) => {
       showError("Failed to load /settings.json: " + error);
       throw error;
    });
  }

  function showProfile(profile) {
    // load the person's datastore 
    updateLoginCount(profile)
    .then((count) => {
       /*
       var person = new blockstack.Person(profile)
       document.getElementById('heading-name').innerHTML = person.name() + ' (login count: ' + JSON.stringify(count) + ')'
       document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
       document.getElementById('section-1').style.display = 'none'
       document.getElementById('section-2').style.display = 'block'
       document.getElementById('section-3').style.display = 'none'
       */
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
