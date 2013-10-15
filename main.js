var tweets= [];



var fetchTweets = function(){
  d3.xhr("http://mickproxy.herokuapp.com/?url="+encodeURIComponent("https://api.twitter.com/1.1/search/tweets.json?q=@codeforamerica+OR+%23cfasummit&count=100&result_type=recent")+"&addauth=true", "application/json", function(resp){
    var data = JSON.parse(resp.responseText);
    var tmpArray = [];
    for(s in data.statuses){
      tmpArray.push(data.statuses[s])
    }
    tweets = tmpArray;
    showTweets(tweets)

    highlightTweet(tweets[0])
  });

}

var highlightedTweet = 0;

setInterval(function(){

  highlightTweet(tweets[highlightedTweet]);
  highlightedTweet = (highlightedTweet+1 >= tweets.length) ? 0 : highlightedTweet +1;

}, 10000);


setInterval(fetchTweets, 120000);
fetchTweets();

function showTweets(tweets){

  d3.select("div.tweeters").selectAll("img").remove();

  d3.select("div.tweeters").selectAll("img")
    .data(tweets)
    .enter().append("img")
    .attr("class", "tweeter")
    .attr("src", function(d){ return d.user.profile_image_url; });

}

function highlightTweet(tweet){
  var tweetel = d3.select("div.tweet")
    .data([tweet]);

  tweetel
    .select("div.name")
    .html(function(d){
      return " <img src='"+d.user.profile_image_url+"' /> "+d.user.screen_name;
    });

  tweetel
    .select("div.content")
    .text(function(d){ return d.text });

}

function addChart(el, propId){
  
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y-%m-%d").parse;

  var x = d3.time.scale()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(3);

  var area = d3.svg.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.pageviews); });

  var svg = el.select("div.chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("/api/metrics/"+propId, function(data){


    data.metrics.forEach(function(d) {
      d.date = parseDate(d.date);
      d.pageviews = +d.pageviews;
    });
  

el.select("div.totals").html("<span>"+data.pageviews+"</span> | <span>"+data.visits+"</span>")

    x.domain(d3.extent(data.metrics, function(d) { return d.date; }));
    y.domain([0, 50000]); //d3.max(data.metrics, function(d) { return d.pageviews; })]);

    svg.append("path")
      .datum(data.metrics)
      .attr("class", "area")
      .attr("d", area);

/*  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);*/

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")

  });
}


d3.selectAll("li.data")[0].forEach(function(el){

  el = d3.select(el);

  addChart(el, el.attr("data-propid"));


});
