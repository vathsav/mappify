const d3 = require('d3');
const fs = require('fs');
const https = require('https');

var key = "<YOUR-GOOGLE-MAPS-API-KEY";

fs.readFile('data.csv', 'utf8', function (err, data) {
  if(err) console.log("An error occurred");

  var columnData = d3.csvParseRows(data);
  var cities = [];
  var countries = [];
  var urls = [];
  var latitudes = [];
  var longitudes = [];
  var responses = [];

  var parseCount = 2500; // Limitter

  // Fetch the cities and the countries
  for (var i = 1; i <= parseCount; i++) {
    countries.push(columnData[i][5]); // Choose the column that contains countries
    cities.push(columnData[i][6]); // Choose the column that contains cities
  }

  // Generate the urls
  for (var i = 0; i <= parseCount; i++) {
    var address = cities[i] + '+' + countries[i];
    if (cities[i]) urls.push('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + key);
  }

  var originalCount = 0; // starting point to parse from in the CSV - Modify to start with an offset
  var count = originalCount;

  fetchCoordinates();

  function fetchCoordinates() {
    if (count < parseCount) {
      https.get(urls[count], function(res){
        var body = '';

        res.on('data', function(chunk){
          body += chunk;
        });

        res.on('end', function(){
          var data = JSON.parse(body);
          if (data.results[0]) {
            latitudes.push(data.results[0].geometry.location.lat);
            longitudes.push(data.results[0].geometry.location.lng);
          } else {
            latitudes.push('error'); // data.results returns undefined
            longitudes.push('error');
          }
          count++;


          console.log(count);

          if (count < parseCount)
            fetchCoordinates();
          else {
            console.log("Done.");

            // Write output to file
            var output = "";

            for (var i = 0; i < parseCount - originalCount; i++) {
              output += latitudes[i] + "," + longitudes[i] + "\n";
            }

            console.log(output);
          }
        });
      }).on('error', function(e){
        console.log("Got an error: ", e);
      });
    }
  }

  // Async function
  // for (i in urls) {
  //   https.get(urls[i], function(res) {
  //     responses.push(res);
  //     count++;
  //
  //     if (count == urls.length) {
  //       responses.forEach(response => {
  //         var body = '';
  //         response.on('data', function(chunk) {
  //           body += chunk;
  //         });
  //
  //         response.on('end', function() {
  //           var data = JSON.parse(body).results[0].geometry.location;
  //           latitudes.push(data.lat);
  //           longitudes.push(data.lng);
  //
  //           if (latitudes.length == parseCount - 1) {
  //             // Parse complete
  //             console.log(latitudes);
  //             console.log(longitudes);
  //           }
  //         });
  //       });
  //     }
  //   })
  //   .on('error', function(e) {
  //     console.log(e.message);
  //   });
  // }
});
