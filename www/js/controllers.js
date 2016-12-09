function init() {
  window.initGapi(); // Calls the init function defined on the window
}

var app = angular.module('revolution.controllers', ['firebase', 'ngCordova', 'ngMap', 'ngResource']);

app.controller('AppCtrl', function($scope, $rootScope, $timeout, $state, $ionicLoading, $ionicSideMenuDelegate, $ionicHistory, FirebaseUser, $firebaseAuth, $firebaseObject) {

  // side menu open/closed - changing navigation icons
  $scope.$watch(function () {
      return $ionicSideMenuDelegate.getOpenRatio();
    },
    function (ratio) {
      if (ratio === 1 || ratio === -1){
        $scope.isActive= true;
      } else{
        $scope.isActive = false;
      }
    });


  // go back button
  $scope.back = function() {
    $ionicHistory.goBack();
  }

  $scope.getUserStatus = function() {
    // get firebase user
    var user = FirebaseUser.status();
    if(user) {
      $rootScope.user = user.email;
      $rootScope.userUid = user.uid;
    } else {
      $rootScope.user = 'Anonymous';
      $rootScope.userUid = 0;
    }
  }

  $scope.$watch(
    function( $scope ) {
      return( $scope.getUserStatus() );
    },
    function( newValue ) {
    }
  );

  $scope.logout = function() {
    $firebaseAuth().$signOut();
    $timeout(function() {
      $scope.getUserStatus();
      $state.go('app.login');
    }, 100)
  }


  // USER PROFILE
  $scope.getUserProfile = function(uid) {
    var refArray = firebase.database().ref().child("users").child($rootScope.userUid);
    $scope.userProfile = $firebaseObject(refArray);
    $state.go('app.profile');
  }


// RIGHT SIDE MENU NOTIFICATIONS

  $scope.data = {
    showDelete: false
  };

  $scope.edit = function(item) {
    alert('Edit Item: ' + item.id);
  };
  $scope.share = function(item) {
    alert('Share Item: ' + item.id);
  };

  $scope.moveItem = function(item, fromIndex, toIndex) {
    $scope.notifications.splice(fromIndex, 1);
    $scope.notifications.splice(toIndex, 0, item);
  };

  $scope.onItemDelete = function(item) {
    $scope.notifications.splice($scope.notifications.indexOf(item), 1);
  };

  $scope.notifications = [{
    id: 1,
    user: 'Janice Burke',
    text: 'Lorem ipsum dolor sit amet, per veri petentium iudicabit in.',
    img: '1.jpg'
  },{
    id: 2,
    user: 'Raymond Powell',
    text: 'Per tale expetendis signiferumque eu, mea partem causae vocent id.',
    img: '2.jpg'
  },{
    id: 3,
    user: 'Danielle Beck',
    text: 'Velit malorum eos ne, his ut probo possit contentiones.',
    img: '3.jpg'
  },{
    id: 4,
    user: 'Ronald Hall',
    text: 'Posse petentium imperdiet nec ex, ea sed detraxit molestiae.',
    img: '4.jpg'
  },{
    id: 5,
    user: 'Catherine Hunt',
    text: 'Semper urbanitas ullamcorper ut eam. Sint summo consequuntur ad nam, vix cu mucius alienum detracto, et eum zril labores abhorreant.',
    img: '5.jpg'
  }]


})

app.controller('UserCtrl', function($scope, $rootScope, $state, $ionicLoading, $ionicSideMenuDelegate, $firebaseObject, $firebaseAuth) {

  $ionicSideMenuDelegate.canDragContent(false);

  $scope.start = function() {
    $state.go('app.home');
  };

  $scope.authObj = $firebaseAuth();


  // firebase register
  $scope.register = function(email, password, phone) {
    $scope.authObj.$createUserWithEmailAndPassword(email, password)
      .then(function(firebaseUser) {

        // create 'user' array same id - to store user profile
        var refArray = firebase.database().ref().child("users").child(firebaseUser.uid);
        var users = $firebaseObject(refArray);
        users.email = firebaseUser.email;
        users.phone = phone;
        users.$save().then(function(ref) {

        }, function(error) {
          console.log("Error:", error);
        });

        alert('User created! You are signed in.');
        $state.go('app.home');
      }).catch(function(error) {
        console.error("Error: ", error);
      });
  };


  // firebase login
  $scope.login = function(email, password) {
    $scope.authObj.$signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
      //alert("Signed in!");
      $scope.getUserStatus();
      console.log($rootScope.user);
      // redirect to home screen
      $state.go('app.home');
    }).catch(function(error) {
      console.error("Authentication failed:", error);
    });
  }


  // reset password
  $scope.reset = function(email) {
    $scope.authObj.$sendPasswordResetEmail(email).then(function() {
      alert("Password reset email sent successfully!");
      $state.go('app.login');
    }).catch(function(error) {
      console.error("Error: ", error);
    });

  }



})

app.controller('NewsCtrl', function($scope, $ionicLoading, FeedSources, FeedList) {

  $ionicLoading.show({
    template: 'Loading news...'
  });

  // NEWS SOURCES - from services
  $scope.categories = FeedSources;

  $ionicLoading.hide();

});

app.controller('NewslistCtrl', function($scope, $ionicLoading, $stateParams, FeedSources, FeedList) {

  // NEWS SELECTED SOURCE INFORMATION
  $scope.source = FeedSources[$stateParams.id];

  // NEWS FEED
  var getNews = function(num) {

      $scope.news = [];
      FeedList.get($scope.source.url, num).then(function(feeddata){
        var data = feeddata[0].entries;
        for(x=0;x<data.length;x++) {
          $scope.news = data;
        }
        $ionicLoading.hide();
        })

    }
    getNews(10);

    $scope.openUrl = function(link) {
      window.open(link, '_system', 'location=yes');
      return false;
    }


})

app.controller('HomeCtrl', function($scope, $ionicLoading, $ionicSideMenuDelegate, $ionicScrollDelegate) {

  $ionicSideMenuDelegate.canDragContent(true);


  // TABS
  $scope.tab = 1;
  $scope.activeMenu = 1;

  $scope.setTab = function(newTab){
    $scope.tab = newTab;
    $scope.activeMenu = newTab;
  };

  $scope.isSet = function(tabNum){
    return $scope.tab === tabNum;
  };


  // ACCORDIONS
  // initiate an array to hold all active tabs
  $scope.activeTabs = [];

  // check if the tab is active
  $scope.isOpenTab = function (tab) {
    // check if this tab is already in the activeTabs array
    if ($scope.activeTabs.indexOf(tab) > -1) {
      // if so, return true
      return true;
    } else {
      // if not, return false
      return false;
    }
  }

  // function to 'open' a tab
  $scope.openTab = function (tab) {
    // check if tab is already open
    if ($scope.isOpenTab(tab)) {
      //if it is, remove it from the activeTabs array
      $scope.activeTabs.splice($scope.activeTabs.indexOf(tab), 1);
    } else {
      // if it's not, add it!
      $scope.activeTabs = [];
      $scope.activeTabs.push(tab);
    }
  }


})




app.controller('BlogCtrl', function($scope, $ionicLoading, $stateParams, Blog, $cordovaSocialSharing) {

  $ionicLoading.show({
    template: 'Loading posts...'
  });


  $scope.categShow = false;
  $scope.showCategories = function() {
    if($scope.categShow == false) {
      $scope.categShow = true;
    } else {
      $scope.categShow = false;
    }
  }


// WORDPRESS CATEGORIES
  Blog.categories().then(
    function(data){
      $scope.categories = data.data.categories;
      $ionicLoading.hide();
    },
    function(error){
    }
  )




// WORDPRESS POSTS
  $scope.getPosts = function() {
    Blog.posts($stateParams.id).then(
      function(data){
        $scope.posts = data.data.posts;
        $ionicLoading.hide();
      },
      function(error){
      }
    )
  }


// WORDPRESS SINGLE POST
  $scope.getPost = function() {
    Blog.post($stateParams.id).then(
      function(data){
        $scope.post = firebase(ref.userInfo(id));
        $ionicLoading.hide();
      },
      function(error){
      }
    )
  }


// SHARE
  $scope.shareTwitter = function(message, image) {
    $cordovaSocialSharing
      .shareViaTwitter(message, image, 'linkhere')
      .then(function(result) {
        // Success!
      }, function(err) {
        // An error occurred. Show a message to the user
      });
  }
  $scope.shareFacebook = function(message, image) {
    $cordovaSocialSharing
      .shareViaFacebook(message, image, 'link')
      .then(function(result) {
        // Success!
      }, function(err) {
        // An error occurred. Show a message to the user
      });
  }
  $scope.shareWhatsApp = function(message, image) {
    $cordovaSocialSharing
      .shareViaWhatsApp(message, image, 'link')
      .then(function(result) {
        // Success!
      }, function(err) {
        // An error occurred. Show a message to the user
      });
  }




})


app.controller('FirebaseCtrl', function($scope, $ionicLoading, $filter, $ionicSlideBoxDelegate, Firebase, $firebaseObject, $firebaseArray, $stateParams) {


  $ionicLoading.show({
    template: 'Loading Firebase data...'
  });

  // FIREBASE



  $scope.articleID = $stateParams.id;
  $scope.selectedArticle = {};
  // object
  var URL = Firebase.url();

  /*var refObject = firebase.database().ref().child("data"); // work with firebase url + object named 'data'
  // download the data into a local object
  var syncObject = $firebaseObject(refObject);
  // synchronize the object with a three-way data binding
  syncObject.$bindTo($scope, "firebaseObject"); // $scope.firebaseObject is your data from Firebase - you can edit/save/remove
  */
  $ionicLoading.hide();

  // array
  var refArrayMessages = firebase.database().ref().child("messages");
  // create a synchronized array
  $scope.messages = $firebaseArray(refArrayMessages); // $scope.messages is your firebase array, you can add/remove/edit
  // add new items to the array
  // the message is automatically added to our Firebase database!
  $scope.addMessage = function(message) {
    $scope.newMessageText = null;
    $scope.messages.$add({
      text: message
    });

  };

// array
  var refArray = firebase.database().ref().child("userInfo");
// create a synchronized array
  var articleListRef = $firebaseArray(refArray); // $scope.messages is your firebase array, you can add/remove/edit
// add new items to the array
// the message is automatically added to our Firebase database!
  articleListRef.$loaded()
    .then(function(x) {
      $scope.articles = x;
      if($scope.articleID){
        $scope.articles.forEach(function (d, i) {
          if(d.$id == $scope.articleID){
            $scope.selectedArticle = d;
          }
        })
      }
    })
    .catch(function(error) {
      console.log("Error:", error);
    });
  $scope.addMessage = function(message) {
    $scope.newMessageText = null;
    $scope.articles.$add({
      text: message
    });

  };

})


app.controller('ElementsCtrl', function($scope) {

})


app.controller('PluginsCtrl', function($scope, $ionicLoading, $ionicPlatform, $cordovaToast, $cordovaAppRate, $cordovaBarcodeScanner, $cordovaDevice) {




  // toast message
  $scope.showToast = function() {
    $ionicPlatform.ready(function() {
      $cordovaToast.showLongBottom('Here is a toast message').then(function(success) {
        // success
      }, function (error) {
        // error
      });
    })
  }




  // rate my app
  $scope.showApprate = function() {

    $ionicPlatform.ready(function() {

      $cordovaAppRate.promptForRating(true).then(function (result) {
        // success
      });

    })

  }



  // barcode scanner
  $scope.showBarcode = function() {

    $ionicPlatform.ready(function() {

      $cordovaBarcodeScanner
        .scan()
        .then(function(barcodeData) {
          // Success! Barcode data is here
          alert(barcodeData.text);
          console.log("Barcode Format -> " + barcodeData.format);
          console.log("Cancelled -> " + barcodeData.cancelled);
        }, function(error) {
          // An error occurred
          console.log("An error happened -> " + error);
        });

    })

  }




  // device info
  $scope.showDeviceinfo = function() {

    $ionicPlatform.ready(function() {

      var device = $cordovaDevice.getDevice();
      var cordova = $cordovaDevice.getCordova();
      var model = $cordovaDevice.getModel();
      var platform = $cordovaDevice.getPlatform();
      var uuid = $cordovaDevice.getUUID();
      var version = $cordovaDevice.getVersion();

      alert('Your device has ' + platform);

    })

  }

  $ionicSideMenuDelegate.canDragContent(true);


  // TABS
  $scope.tab = 1;
  $scope.activeMenu = 1;

  $scope.setTab = function(newTab){
    $scope.tab = newTab;
    $scope.activeMenu = newTab;
  };

  $scope.isSet = function(tabNum){
    return $scope.tab === tabNum;
  };


  // ACCORDIONS
  // initiate an array to hold all active tabs
  $scope.activeTabs = [];

  // check if the tab is active
  $scope.isOpenTab = function (tab) {
    // check if this tab is already in the activeTabs array
    if ($scope.activeTabs.indexOf(tab) > -1) {
      // if so, return true
      return true;
    } else {
      // if not, return false
      return false;
    }
  }

  // function to 'open' a tab
  $scope.openTab = function (tab) {
    // check if tab is already open
    if ($scope.isOpenTab(tab)) {
      //if it is, remove it from the activeTabs array
      $scope.activeTabs.splice($scope.activeTabs.indexOf(tab), 1);
    } else {
      // if it's not, add it!
      $scope.activeTabs = [];
      $scope.activeTabs.push(tab);
    }
  }


});


// rate my app preferences
app.config(function ($cordovaAppRateProvider) {

  document.addEventListener("deviceready", function () {

    var prefs = {
      language: 'en',
      appName: 'SBFC',
      iosURL: '<my_app_id>',
      androidURL: 'market://details?id=<package_name>',
      windowsURL: 'ms-windows-store:Review?name=<...>'
    };

    $cordovaAppRateProvider.setPreferences(prefs)

  }, false);

})

app.controller('ChatCtrl', function($scope, $rootScope, $state, $timeout, $ionicLoading, $firebaseAuth, $firebaseArray, FirebaseUser, ngQuillConfig) {

  $scope.getUserStatus();

  $scope.user = {
    published:'',
    publish_date: new Date(),
    title:''
  }

  /* datepicker */
  $scope.valuationDate = new Date();
  $scope.valuationDatePickerIsOpen = false;

  $scope.valuationDatePickerOpen = function () {

    $scope.valuationDatePickerIsOpen = true;
  };

  /* /datepicker */

  $scope.message = '';

  var downloadUrl = '';

  $scope.showToolbar = true;

  $scope.categoryDropDown = {
    selected:null,
    categoryOptions: [
      {id:0,name:'No Category',value:''},
      {id:1,name:'Ask an Expert',value:'ask-an-expert'},
      {id:2,name:'Marketplace',value:'marketplace'},
      {id:3,name:'Baby Photo',value:'baby-photo'}
    ]
  };

  /*$scope.translations = angular.extend({}, ngQuillConfig.translations, {
   15: 'smallest'
   });*/

  /*$scope.toggle = function() {
   $scope.showToolbar = !$scope.showToolbar;
   };*/
  // Own callback after Editor-Creation
  /*$scope.editorCallback = function (editor, name) {
   console.log('createCallback', editor, name);
   };*/

  $scope.readOnly = false;

  $scope.isReadonly = function () {
    return $scope.readOnly;
  };

  $scope.clear = function () {
    return $scope.message = '';
  };

  // Event after an editor is created --> gets the editor instance on optional the editor name if set
  $scope.$on('editorCreated', function (event, editor, name) {
    console.log('createEvent', editor, name);
  });

  $timeout(function () {
    $scope.message = '';
    console.log($scope.message);
  }, 3000);
  $scope.getMessages = function() {

    //$scope.version = textAngularManager.getVersion();
    //$scope.versionNumber = $scope.version.substring(1);
    /*$scope.orightml = '<h2>Try me!</h2><p>textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</p><p><img class="ta-insert-video" ta-insert-video="http://www.youtube.com/embed/2maA1-mvicY" src="" allowfullscreen="true" width="300" frameborder="0" height="250"/></p><p><b>Features:</b></p><ol><li>Automatic Seamless Two-Way-Binding</li><li>Super Easy <b>Theming</b> Options</li><li style="color: green;">Simple Editor Instance Creation</li><li>Safely Parses Html for Custom Toolbar Icons</li><li class="text-danger">Doesn&apos;t Use an iFrame</li><li>Works with Firefox, Chrome, and IE9+</li></ol><p><b>Code at GitHub:</b> <a href="https://github.com/fraywing/textAngular">Here</a> </p><h4>Supports non-latin Characters</h4><p>昮朐 魡 燚璒瘭 譾躒鑅, 皾籈譧 紵脭脧 逯郹酟 煃 瑐瑍, 踆跾踄 趡趛踠 顣飁 廞 熥獘 豥 蔰蝯蝺 廦廥彋 蕍蕧螛 溹溦 幨懅憴 妎岓岕 緁, 滍 蘹蠮 蟷蠉蟼 鱐鱍鱕, 阰刲 鞮鞢騉 烳牼翐 魡 骱 銇韎餀 媓幁惁 嵉愊惵 蛶觢, 犝獫 嶵嶯幯 縓罃蔾 魵 踄 罃蔾 獿譿躐 峷敊浭, 媓幁 黐曮禷 椵楘溍 輗 漀 摲摓 墐墆墏 捃挸栚 蛣袹跜, 岓岕 溿 斶檎檦 匢奾灱 逜郰傃</p>';
     $scope.htmlcontent = $scope.orightml;*/
    //$scope.disabled = false;


    $timeout(function() {
      // set firebase refference for messages - if user is logged in, set to match user uid, if there is no user, show public messages
      var refArray = firebase.database().ref().child("chat/"+$rootScope.userUid);
      // create a synchronized array
      $scope.messages = $firebaseArray(refArray); // $scope.messages is your firebase array, you can add/remove/edit
    }, 100)
  };

  $scope.getMessages();

  // send message
  $scope.send = function(message) {

    $scope.getMessages();

    // set a random image as user avatar - change this to match your structure
    var randomIndex = Math.round( Math.random() * (4) );
    randomIndex++;
    $scope.avatar = 'img/users/'+randomIndex+'.jpg';
    // add new items to the array
    // the message is automatically added to our Firebase database!
    $scope.messages.$add({
      text: message,
      email: $rootScope.user,
      user: $rootScope.userUid,
      avatar: $scope.avatar
    });
    $scope.message = '';
  };

  $scope.storeImageToDB = function(file, resolve){

    /*var file = document.querySelector('input[type=file]').files[0];
     console.log(file);*/
    var storageRef = firebase.storage().ref().child('images');
    // Get a reference to store file at photos/<FILENAME>.jpg
    var photoRef = storageRef.child(file.name);
    // Upload file to Firebase Storage
    var uploadTask = photoRef.putString(file.base64,'data_url');
    uploadTask.on('state_changed', null, null, function (snapshot) {
      console.log('success');
      console.log(snapshot);
      // When the image has successfully uploaded, we get its download URL
      downloadUrl = uploadTask.snapshot.downloadURL;
      console.log(downloadUrl);
      resolve(downloadUrl);
      // Set the download URL to the message box, so that the user can send it to the database
      //$scope.userDisplayPic = downloadUrl;
    });
  };

  $scope.saveData = function (user,msg,b64) {
    var userData = {};
    userData = $scope.user;
    console.log(user,msg);
    userData.body = msg;
    userData.publish_date = new Date(userData.publish_date).getTime();
    userData.author = $rootScope.user;
    userData.category = $scope.categoryDropDown.selected;

    imgObj.base64 = b64;

    var uploadPromiseImgs = new Promise(function(resolve, reject) {
      $scope.storeImageToDB(imgObj,resolve);
    });
    Promise.all([uploadPromiseImgs]).then(function (data) {
      userData.img = downloadUrl;
      var ref = firebase.database().ref().child("userInfo");
      var userNode = $firebaseArray(ref);
      userNode.$add(userData).then(function (success) {
        var addedObjDetails = success.path.o;
        var addedObj = addedObjDetails[1];
        $state.go('app.edit',{'id': addedObj})
        console.log(success);
        console.log(addedObj[1]);
      });
    }).catch(function (err) {
      console.log(err);
    })
  };
  var imgObj = {};
  $scope.myImage='';
  $scope.myCroppedImage='';

  var handleFileSelect=function(evt) {
    var file=evt.currentTarget.files[0];
    imgObj.name = file.name;
    var reader = new FileReader();
    reader.onload = function (evt) {
      $scope.$apply(function($scope){
        $scope.myImage=evt.target.result;
      });
    };
    reader.readAsDataURL(file);
  };
  angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);

})


app.controller('EditCtrl', function($scope, $rootScope, $state, $stateParams, $timeout, $ionicLoading, $firebaseAuth, $firebaseObject, $firebaseArray, FirebaseUser, ngQuillConfig, ionicToast) {


  $scope.articleID = $stateParams.id;
  $scope.getUserStatus();

  $scope.user = {
    published:'',
    publish_date: new Date(),
    title:''
  }

  // array
  var refArray = firebase.database().ref().child("userInfo").child($scope.articleID);
// create a synchronized array
  var articleListRef = $firebaseObject(refArray); // $scope.messages is your firebase array, you can add/remove/edit
// add new items to the array
// the message is automatically added to our Firebase database!
  articleListRef.$loaded()
    .then(function(x) {
      $scope.user = x;
      $scope.categoryDropDown.selected = $scope.user.category;
      $scope.user.publish_date = new Date($scope.user.publish_date);
      $scope.message = $scope.user.body;
      ngQuillConfig.setHTML($scope.user.body);
    })
    .catch(function(error) {
      console.log("Error:", error);
    });

  $scope.$on("editorCreated", function (event, quillEditor) {
    quillEditor.setHTML($scope.user.body);
  });

  /* datepicker */
  $scope.valuationDate = new Date();
  $scope.valuationDatePickerIsOpen = false;

  $scope.valuationDatePickerOpen = function () {

    $scope.valuationDatePickerIsOpen = true;
  };

  /* /datepicker */

  $scope.message = 'Your Body Text ';

  var downloadUrl = '';

  $scope.showToolbar = true;

  $scope.categoryDropDown = {
    selected:null,
    categoryOptions: [
      {id:0,name:'No Category',value:''},
      {id:1,name:'Ask an Expert',value:'ask-an-expert'},
      {id:2,name:'Marketplace',value:'marketplace'},
      {id:3,name:'Baby Photo',value:'baby-photo'}
    ]
  };

  $scope.showToast = function(){
    <!-- ionicToast.show(message, position, stick, time); -->
    ionicToast.show('This is a toast at the top.', 'top', false, 2500);
  };

  $scope.hideToast = function(){
    ionicToast.hide();
  };

  /*$scope.translations = angular.extend({}, ngQuillConfig.translations, {
   15: 'smallest'
   });*/

  /*$scope.toggle = function() {
   $scope.showToolbar = !$scope.showToolbar;
   };*/
  // Own callback after Editor-Creation
  /*$scope.editorCallback = function (editor, name) {
   console.log('createCallback', editor, name);
   };*/


  $scope.readOnly = false;

  $scope.isReadonly = function () {
    return $scope.readOnly;
  };

  $scope.clear = function () {
    return $scope.message = '';
  };

  $scope.getMessages = function() {

    //$scope.version = textAngularManager.getVersion();
    //$scope.versionNumber = $scope.version.substring(1);
    /*$scope.orightml = '<h2>Try me!</h2><p>textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</p><p><img class="ta-insert-video" ta-insert-video="http://www.youtube.com/embed/2maA1-mvicY" src="" allowfullscreen="true" width="300" frameborder="0" height="250"/></p><p><b>Features:</b></p><ol><li>Automatic Seamless Two-Way-Binding</li><li>Super Easy <b>Theming</b> Options</li><li style="color: green;">Simple Editor Instance Creation</li><li>Safely Parses Html for Custom Toolbar Icons</li><li class="text-danger">Doesn&apos;t Use an iFrame</li><li>Works with Firefox, Chrome, and IE9+</li></ol><p><b>Code at GitHub:</b> <a href="https://github.com/fraywing/textAngular">Here</a> </p><h4>Supports non-latin Characters</h4><p>昮朐 魡 燚璒瘭 譾躒鑅, 皾籈譧 紵脭脧 逯郹酟 煃 瑐瑍, 踆跾踄 趡趛踠 顣飁 廞 熥獘 豥 蔰蝯蝺 廦廥彋 蕍蕧螛 溹溦 幨懅憴 妎岓岕 緁, 滍 蘹蠮 蟷蠉蟼 鱐鱍鱕, 阰刲 鞮鞢騉 烳牼翐 魡 骱 銇韎餀 媓幁惁 嵉愊惵 蛶觢, 犝獫 嶵嶯幯 縓罃蔾 魵 踄 罃蔾 獿譿躐 峷敊浭, 媓幁 黐曮禷 椵楘溍 輗 漀 摲摓 墐墆墏 捃挸栚 蛣袹跜, 岓岕 溿 斶檎檦 匢奾灱 逜郰傃</p>';
     $scope.htmlcontent = $scope.orightml;*/
    //$scope.disabled = false;


    $timeout(function() {
      // set firebase refference for messages - if user is logged in, set to match user uid, if there is no user, show public messages
      var refArray = firebase.database().ref().child("chat/"+$rootScope.userUid);
      // create a synchronized array
      $scope.messages = $firebaseArray(refArray); // $scope.messages is your firebase array, you can add/remove/edit
    }, 100)
  };

  $scope.getMessages();

  // send message
  $scope.send = function(message) {

    $scope.getMessages();

    // set a random image as user avatar - change this to match your structure
    var randomIndex = Math.round( Math.random() * (4) );
    randomIndex++;
    $scope.avatar = 'img/users/'+randomIndex+'.jpg';
    // add new items to the array
    // the message is automatically added to our Firebase database!
    $scope.messages.$add({
      text: message,
      email: $rootScope.user,
      user: $rootScope.userUid,
      avatar: $scope.avatar
    });
    $scope.message = '';
  };

  $scope.storeImageToDB = function(file, resolve){

    /*var file = document.querySelector('input[type=file]').files[0];
     console.log(file);*/
    var storageRef = firebase.storage().ref().child('images');
    // Get a reference to store file at photos/<FILENAME>.jpg
    var photoRef = storageRef.child(file.name);
    // Upload file to Firebase Storage
    var uploadTask = photoRef.putString(file.base64,'data_url');
    uploadTask.on('state_changed', null, null, function (snapshot) {
      console.log('success');
      console.log(snapshot);
      // When the image has successfully uploaded, we get its download URL
      downloadUrl = uploadTask.snapshot.downloadURL;
      console.log(downloadUrl);
      resolve(downloadUrl);
      // Set the download URL to the message box, so that the user can send it to the database
      //$scope.userDisplayPic = downloadUrl;
    });
  };

  $scope.saveData = function (user,msg,b64) {
    var userData = {};
    userData = $scope.user;
    console.log(user,msg);
    //userData.body = msg;
    userData.publish_date = new Date(userData.publish_date).getTime();
    userData.author = $rootScope.user;
    userData.category = $scope.categoryDropDown.selected;
    articleListRef = userData;
    imgObj.base64 = b64;
    articleListRef.$save().then(function(ref) {
       // true
      ionicToast.show('Success!.', 'bottom', false, 2500);
      console.log('Successfully updates the object',ref);
    }, function(error) {
      console.log("Error:", error);
    });


    /*var uploadPromiseImgs = new Promise(function(resolve, reject) {
      $scope.storeImageToDB(imgObj,resolve);
    });
    Promise.all([uploadPromiseImgs]).then(function (data) {
      userData.img = downloadUrl;
      var ref = firebase.database().ref().child("userInfo");
      var userNode = $firebaseArray(ref);
      userNode.$add(userData).then(function (success) {
        console.log(success);
      });
    }).catch(function (err) {
      console.log(err);
    })*/
  };
  $scope.deleteEdited = function () {
    articleListRef.$remove().then(function(ref) {
      console.log("Successfully removed the Object:", ref);
      $state.go('app.home')
    }, function(error) {
      console.log("Error:", error);
    });
  }
  var imgObj = {};
  $scope.myImage='';
  $scope.myCroppedImage='';

  var handleFileSelect=function(evt) {
    var file=evt.currentTarget.files[0];
    imgObj.name = file.name;
    var reader = new FileReader();
    reader.onload = function (evt) {
      $scope.$apply(function($scope){
        $scope.myImage=evt.target.result;
      });
    };
    reader.readAsDataURL(file);
  };
  angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);

})


app.controller('WeatherCtrl', function($scope, $ionicLoading, weatherService) {

  $scope.getWeather = function() {
    weatherService.get().then(function(data) {
      $scope.weather = data;
    });
  }

})


app.controller('ContactCtrl', function($scope) {


})



app.controller('YoutubeCtrl', function ($scope, $window, $sce, googleService, $stateParams, $ionicLoading) {

  $ionicLoading.show({
    template: 'Loading videos...'
  });

  $window.initGapi = function() {
    $scope.$apply($scope.getChannel);
  };

  $scope.getChannel = function () {
    googleService.googleApiClientReady().then(function (data) {
      $scope.videos = data.items;
      $scope.channel = data.items[0].snippet.channelTitle;
      $ionicLoading.hide();
    }, function (error) {
      console.log('Failed: ' + error)
    });
  };

  $scope.getVideoId = function() {
    $ionicLoading.show({
      template: 'Loading video...'
    });
    document.getElementById('video').src = 'https://www.youtube.com/embed/'+$stateParams.id;
    googleService.googleApiClientReady().then(function (data) {
      $scope.video = data.items[$stateParams.index];
      $ionicLoading.hide();
    }, function (error) {
      console.log('Failed: ' + error)
    });
  }

});



app.controller('MapsCtrl', function($scope) {


})


app.controller('AdmobCtrl', function($scope) {


  $scope.showBanner = function() {
    if(AdMob) AdMob.showBanner();
  }
  $scope.hideBanner = function() {
    if(AdMob) AdMob.hideBanner();
  }
  $scope.showInterstitial = function() {
    if(AdMob) AdMob.showInterstitial();
  }




})

app.controller('AskanexpertCtrl', function($scope, $rootScope, $ionicLoading, FirebaseUser, Firebase, $firebaseObject, $firebaseArray) {


  $ionicLoading.show({
      template: 'Loading Firebase data...'
    });

    if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

  // FIREBASE

  // object
  var URL = Firebase.url();

  var refObject = firebase.database().ref().child("questions"); // work with firebase url + object named 'data'
  // download the data into a local object
  var syncObject = $firebaseObject(refObject);
  // synchronize the object with a three-way data binding
  syncObject.$bindTo($scope, "firebaseObject"); // $scope.firebaseObject is your data from Firebase - you can edit/save/remove
    $ionicLoading.hide();


    // array
    var refArray = firebase.database().ref().child("questions");
    // create a synchronized array
    $scope.messages = $firebaseArray(refArray); // $scope.messages is your firebase array, you can add/remove/edit
    // add new items to the array
    // the message is automatically added to our Firebase database!
    $scope.addMessage = function(message) {
      $scope.newMessageText = null;
      $scope.messages.$add({
        question: message,
        email: $rootScope.user,
        date: Date(),
        user: $rootScope.userUid
      });


    };

})
