require("../css/styles.scss");
d3 = require("d3")
_ = require("underscore")

var city_average

d3.json("http://airquality.hindustantimes.com/widget/map/data",function(error,data){

  $('#city_selector').on('change',function(){
        var city = ($('#city_selector').val())
        delhi_list = _.chain(data.reports)
                    .filter(function(e){return (e.station.city == city) && 
                      (e.recent.pollutants.pm25)
                    })
                    .pluck('recent')
                    .pluck('pollutants')
                    .pluck('pm25')
                    .pluck('concentration')
                    .value()

        city_average = Math.round(d3.sum(delhi_list)/delhi_list.length)
        $('.current-level').html(city_average + current_exposure)
        d3.select('.current-level-line')
                   .transition()
                   .duration(1000)
                   .attr('x1',xScale(city_average+current_exposure))
                   .attr('x2',xScale(city_average+current_exposure))
                   $('.current-level').html(city_average+Math.round(current_exposure));
        d3.select('.cal-arrow-label')
          .transition()
          .duration(1000)
          .attr('style', "left:"+xScale(city_average+current_exposure)+"px;")
        updateShareText()

  })
  delhi_list = _.chain(data.reports)
                    .filter(function(e){return (e.station.city == "Delhi") && 
                      (e.recent.pollutants.pm25)
                    })
                    .pluck('recent')
                    .pluck('pollutants')
                    .pluck('pm25')
                    .pluck('concentration')
                    .value()

  city_average = Math.round(d3.sum(delhi_list)/delhi_list.length)
  updateShareText()
  var current_exposure = 0

  // name our categories
  var scales = [
     {
         'name':'good',
         'min':0,
         'max': 36,
         'color':'#76C2AC'
     },
     {
        'name':'moderate',
        'min':36.5,
        'max':66,
        'color': '#FAE290'
     },
     {
        'name':'severe',
        'min':105,
        'color': '#D67E7D'
     }
  ]

  // set the width and height of the meter
  var windowWidth = $(window).width()
  var bar = {width: (windowWidth<850)?(windowWidth*0.9):800, height: 30, max: 400}
  var margin = {top: 5, bottom: 5, left: 5, right: 10}
  // code for my scale

  var xScale = d3.scaleLinear()
                 .domain([0,bar.max])
                 .range([0,bar.width])

  // x axis
  xAxis = d3.axisBottom(xScale)
           .ticks((windowWidth<850)?(5):8);

  // let's create a chart
  var chart = d3.select('.pollution-meter')
                .append('svg')
                .attr('height',bar.height*2)
                .attr('width',bar.width+margin.left+margin.right)
                .append('g')
                .attr('class','chart')
                .style('fill','#ccc')
                .attr('transform','translate('+margin.left+',0)')

  // append color ranges for the base
  chart.selectAll('.marker')
        .data(scales)
        .enter()
        .append('rect')
        .attr('class',function(d){return 'marker '+d.name})
        .attr('height',bar.height)
        .style('fill',function(d){return d.color})
        .attr('width',function(d,i){
              if (i>0){
                 if (i==(scales.length-1)){
                    return xScale(bar.max - scales[i-1].max)
                 } else {
                     return xScale(d.max - scales[i-1].max)
                 }
                
              } else {
                 return xScale(d.max)
              }
           })
        .attr('transform',function(d,i){
              if (i>0){
                  return 'translate('+xScale(scales[i-1].max)+',0)'
              }
           })


  // line for the current meter
  chart.append('line')
        .attr('class','current-level-line')
        .attr('x1',xScale(city_average+current_exposure))
        .attr('x2',xScale(city_average+current_exposure))
        .attr('y1',0)
        .attr('y2',bar.height)
        .style('stroke','#fff')
        .style('stroke-width','5')

  // append the axis
  chart.append("g")
     .attr('class','axis')
     .attr("transform", "translate(0,30)")
     .call(xAxis);

  // append the marker
  d3.select('.cal-arrow-label')
        .attr('style', "left:"+xScale(city_average+current_exposure)+"px;")

  // update the pm meter with the level
  $('.current-level').html(city_average+current_exposure)

  // our lovely crackers
  var cracker_data = [
      {
          'cracker': 'anar',
          'pol': 4860,
          'effect': 3,
          'burning': 0.2
      },
      {
          'cracker':'ladi',
          'pol':38540,
          'effect':6,
          'burning':0.8
      },
      {
          'cracker':'snake',
          'pol':38540,
          'effect':6,
          'burning':0.8
      },
      {
          'cracker':'pulpul',
          'pol':28950,
          'effect':3,
          'burning':0.5
      },
      {
          'cracker':'fuljhadi',
          'pol':10390,
          'effect':2,
          'burning':0.3
      },
      {
          'cracker':'chakri',
          'pol':9490,
          'effect':5,
          'burning':0.2
      }
  ]

  // empty array for the intervals
  var intervals = []

  // cracker counter that maintains a total count of all our stuff
  var crackerCounter = {
          'ladi':0,
          'chakri':0,
          'fuljhadi':0,
          'pulpul':0,
          'snake':0,
          'anar':0
      }

  // what happens when you click on a cracker
  $('.cracker-con').on('click',function(){
    
    // find the cracker that you just clicked on
     var obj = _.findWhere(cracker_data,{cracker: ($(this).attr('data-which'))})
      
     crackerCounter[obj.cracker]++;

     current_exposure = current_exposure + obj.pol;
      
     bar.max = current_exposure+2000;
     
     xScale.domain([0,bar.max ])

     updateShareText(obj)
     d3.select('.axis')
     .transition()
     .duration(2000)
     .call(xAxis);

     d3.selectAll('.marker')
        .transition()
        .duration(2000)
        .attr('width',function(d,i){
           if (i>0){
              if (i==(scales.length-1)){
                 return xScale(bar.max - scales[i-1].max)
              } else {
                  return xScale(d.max - scales[i-1].max)
              }
           } else {
              return xScale(d.max)
           }
        })
        .attr('transform',function(d,i){
           if (i>0){
               return 'translate('+xScale(scales[i-1].max)+',0)'
           }
        })
     
      setTimeout(function(){ 
          console.log(obj.cracker,'finished burning'); 
      }, (obj.burning * 60 * 1000));

      setTimeout(function(){ 
          intervals[sum(crackerCounter)-1]={
            interval: setInterval(function(){
          
              current_exposure = current_exposure - ( obj.pol / ( obj.effect * 60 * (10) ) )

              d3.select('.current-level-line')
                   .transition()
                   .duration(100)
                   .attr('x1',xScale(city_average+current_exposure))
                   .attr('x2',xScale(city_average+current_exposure))
                   $('.current-level').html(city_average+Math.round(current_exposure));

                $('.cal-arrow-label').css('left',xScale(city_average+current_exposure))

              }, 100)
          }
          cleartimer(intervals[sum(crackerCounter)-1].interval,obj)
      }, 2000);

     d3.select('.current-level-line')
        .transition()
        .duration(1500)
        .attr('x1',xScale(city_average+current_exposure))
        .attr('x2',xScale(city_average+current_exposure))

     d3.select('.cal-arrow-label')
        .transition()
        .duration(1500)
        .attr('style', "left:"+xScale(city_average+current_exposure)+"px;")

      var back_pos = parseInt($(this).css('background-position').split(' ')[1].split('px')[0])
     var cracker = $(this).attr('data-which')
     var minus = parseInt($(this).attr('data-minus'))
     var myint = setInterval(function(){
        back_pos = back_pos-minus
        if (back_pos >= -(minus*5)){
           $('.cracker-con[data-which="'+cracker+'"]').addClass('playing')
           $('.cracker-con[data-which="'+cracker+'"]').css('background-position',('0 '+back_pos+'px'))
        } else {
           $('.cracker-con[data-which="'+cracker+'"]').removeClass('playing')
           $('.cracker-con[data-which="'+cracker+'"]').css('background-position',('0 0'))
           clearInterval(myint)
        }
     },500)

  })

  $('.cracker-con').on('mouseover',function(e){
     var minus = parseInt($(this).attr('data-minus'))
     $(this).css('background-position',('0 -'+minus+'px'))
  })

  $('.cracker-con').on('mouseout',function(e){
     $(this).css('background-position',('0 0'))
  })

  // functions go here

  function sum(obj) {
    var sum = 0;
    for( var el in obj ) {
      if( obj.hasOwnProperty( el ) ) {
        sum += parseFloat( obj[el] );
      }
    }
    return sum;
  }

  function cleartimer(e,obj){
    console.log(e,obj)
    setTimeout(function(){
        console.log(obj.cracker,'finished effect')
        clearInterval(e)
    },obj.effect * 60 * 1000)
  }

  $('.crackers-container').slick({
    dots: false,
    infinite: true,
    speed: 300,
    arrow: true,
    slidesToShow: 6,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 982,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 550,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });

  function updateShareText(obj){
    var option
    if (!obj){
      if (city_average>200){
        option = "The pollution in your city is alarmingly high and you haven't even burnt any crackers."
      } else if (city_average>100){
        option = "The pollution in your city is already really bad and you haven't even burnt any crackers."
      } else if (city_average>50){
        option = "The pollution in your city is way above safe levels and you haven't even burnt any crackers."
      } else {
        option = "The pollution in your city might not be that high, but choose wisely."
      }
    }else{
      if (sum(crackerCounter)==1){
        option = 'With that one '+obj.cracker+' you just spiked your pollution levels almost '+Math.round(current_exposure/city_average)+' times.'
      } else if (sum(crackerCounter)>5){
        option = 'How many crackers will you burn? You have already lighted up '+ sum(crackerCounter)+" of them."
      }
    }
    $('.share-text').html(option+'<i class="fa fa-twitter" aria-hidden="true"></i>')
  }
  $('.clean-air').on('click',function(){
    intervals.forEach(function(e){
      clearInterval(e.interval)
    })

    $.each(crackerCounter, function(key, value) {
      value = 0
    });
    current_exposure=0
    $('.current-level').html(city_average)
    d3.select('.current-level-line')
               .transition()
               .duration(1000)
               .attr('x1',xScale(city_average))
               .attr('x2',xScale(city_average))
               $('.current-level').html(city_average);
    d3.select('.cal-arrow-label')
      .transition()
      .duration(1000)
      .attr('style', "left:"+xScale(city_average)+"px;")
    updateShareText()
  })

});

