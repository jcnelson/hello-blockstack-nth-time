document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('signin-button').addEventListener('click', function() {
    // prompt the user to sign-in
    blockstack.redirectToSignIn()
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
    return blockstack.getFile("/settings.json")
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
       return blockstack.putFile("/settings.json", JSON.stringify(settings))
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
    console.log('already signed in')
    showProfile(blockstack.loadUserData())
  } else if (blockstack.isSignInPending()) {
    console.log('sign in pending')
    blockstack.handlePendingSignIn()
    .then((userData) => {
      console.log('signed in')
      window.location = window.location.origin
    }, () => {
      console.log('sign in failed')
    })
  }
})
