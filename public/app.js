document.addEventListener('DOMContentLoaded', function(event) { 
  document.getElementById('signin-button').addEventListener('click', function() {
    var authRequest = blockstack.makeAuthRequest(null, window.location.origin)
    blockstack.redirectUserToSignIn(authRequest)
  })
  document.getElementById('signout-button').addEventListener('click', function() {
    blockstack.signUserOut(window.location.origin)
  })

  function getLoginCount() {
    return new Promise((resolve, reject) => {
      blockstack.getFile('settings.json', "{}").then((data) => {
        var settings = JSON.parse(data)
        settings.count = settings.count + 1
        blockstack.putFile('settings.json', settings).then((success) => {
          resolve(settings.count)
        }).catch((error) => {
          reject('Failed to update "settings.json"')
        })
      }).catch((error) => {
        reject('Failed to get "settings.json"')
      })
    })
  }

  function showProfile(profile) {
    getLoginCount().then((count) => {
       var person = new blockstack.Person(profile)
       document.getElementById('heading-name').innerHTML = person.name() + ' (login count: ' + JSON.stringify(count) + ')'
       document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
       document.getElementById('section-1').style.display = 'none'
       document.getElementById('section-2').style.display = 'block'
       document.getElementById('error-message').innerHTML = ''
    }).catch((error) => {
      document.getElementById('error-message').innerHTML = error
    })
  }

  if (blockstack.isUserSignedIn()) {
    blockstack.loadUserData(function(userData) {
      showProfile(userData.profile)
    })
  } else if (blockstack.isSignInPending()) {
    // signUserIn should store the session token and private key, while the device ID should not be of concern to the app
    blockstack.signUserIn(function(userData) {
      window.location = window.location.origin
    })
  }
})