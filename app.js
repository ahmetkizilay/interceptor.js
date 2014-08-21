(function() {
    "use strict";

    var express = require('express');
    var app = express();

    app.get('/callme', function(req, res){
      res.status(200).json({ msg: 'your app is speaking'});
    });

    console.log('localhost:2424');
    app.listen(2424);
}());