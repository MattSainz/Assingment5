var express = require('express'),
    http    = require('http'),
    path    = require('path'),
    _       = require('lodash');

var rl = require('readline').createInterface({
  input: require('fs').createReadStream('./data/yelp_academic_dataset_business.json')
});

var jsonData = [];
var dumbCat = ['message']

rl.on('line', function(line){
  jsonData.push(JSON.parse(line));
});

rl.on('close', function(){

  //var tax = createTax(jsonData, {});
  var root = {name:'root', children:[]};

  _.forIn(_.groupBy(jsonData, function(o){
      return Math.floor(o.stars);
  }), function(val,  key){
    root.children.push({name:key + ' stars', children: createTax(val, [])})
  });

  console.log('Done processing');
    
  var app = express();

  app.use(express.static('public'));

  app.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));
  });

  app.get('/data', function(req, res){
    //Go through each var and group by most common 
    console.log("Request made");
    res.status(200).send({
      message: root 
    });
  });

  app.listen(3000);
  console.log("Server is running on port 3000");

});

function createTax(objects, result){
  var cat = topCat(objects);

  var part = _.partition(objects, function(o){
    return _.includes(o.categories, cat);
  });

  var newTerminal = {name:cat, size:0} 
  part[0] = _.map(part[0], function(o){
      o.categories = _.reject(o.categories, function(n){
        return n == cat;
      });
      if(o.categories.length == 0) result.push(newTerminal);
    return o;
  });
  newTerminal.size = part[0].length;

  if(cat){
    var newObj = {name:cat, children:[]};
    result.push(newObj);
    createTax(part[0], newObj.children);
    createTax(part[1], result);
  }

  return result;
}

function topCat(objects){
  var catCounts = _.countBy( _.flatten(_.pluck(objects,'categories')));
  var maxCat = '';
  var max = 0;
  _.forIn(catCounts, function(value, key){
      if(value > max){
         max = value;    
         maxCat = key;
      }   
   });
  
  return maxCat;
}


