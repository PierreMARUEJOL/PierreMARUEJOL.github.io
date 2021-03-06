document.getElementById("bgp").style.height = 100 + "vh"
document.body.onresize = function resize() {
  document.getElementById("bgp").style.height = 100 + "vh"
}


'use strict';

const textWriter = (() => {

  const intro = document.querySelector('.intro');

  let arr = [];
  let value = intro.firstChild.nodeValue;
  let current = 0;
  let intervalTime = 0;
  let ttour = 0;
  intro.firstChild.nodeValue = '';
  document.querySelector('.intro2').firstChild.nodeValue = '';

  const text = () => {
    for (let i = 0, len = value.length; i < len; i++) {
      arr.push(value.charAt(i));
    }



    const textWriter = () => {
      if (ttour == 0) {
        intro.firstChild.nodeValue += arr[current];
      } else {
        document.querySelector('.intro2').firstChild.nodeValue += arr[current];
      }

      current++;
      if (current === arr.length) {

        if (ttour == 0) {
          ttour = 1;
          current = 0;
          arr = [];
          value = "Pierre Maruejol";
          for (let i = 0, len = value.length; i < len; i++) {
            arr.push(value.charAt(i));
          }
        } else {
          clearInterval(duration);
        }

      }

    };

    const duration = setInterval(textWriter, intervalTime);
  };

  const loadFunction = (callback) => {
    if (addEventListener) {
      window.addEventListener('load', callback, false);
    }
  };

  return {
    init: (time) => {
      intervalTime = time;

      loadFunction(text);
    }
  };

})();
textWriter.init(75);

$('#boop').on("click", function(e) {
  $(".centerBox").css({
    "display": "none"
  });
  $(".ca3-scroll-down-link").css({
    "display": "block"
  });
  $("#imageG").css({
    "position": "absolute"
  });
  $("#imageD").css({
    "position": "absolute"
  });

  $("#imageG").animate({
    "right": "0vw"
  });
  $("#imageD").animate({
    "left": "0vw"
  });
  setTimeout(() => {
    $("body").css({
      "overflow": "auto"
    });
  }, 500);

});



class NoiseMap {
  constructor(width, height) {
    //Dimensions
    this.width = width;
    this.height = height;
    //This array will be filled with 'barriers' for poisson disk sample
    this.bar = [];
    //This array will be filled with more arrays that will hold noisemaps
    this.noise = [];
    //This object holds all the info needed to combine octaves into more interesting noise
    this.funct1 = {};
    this.funct1.source = this;
    this.funct1.oct = 5;
    //The actual combine function
    this.funct1.val = function(x, y) { //Gets vall at a point for 5 octaves, adds together
      var oct1 = this.source.getVal(0, x, y);
      var oct2 = this.source.getVal(1, x, y);
      var oct3 = this.source.getVal(2, x, y);
      var oct4 = this.source.getVal(3, x, y);
      var oct5 = this.source.getVal(4, x, y);
      return oct1 + oct2 / 2 + oct3 / 4 + oct4 / 6 + oct5 / 8;
    }
  }
  clear() { //Clears the poisson barrier grid and initiates a new octave
    this.bar = [];
    this.noise.unshift([]);
    for (var x = 0; x < this.width; x++) {
      this.bar.push([]);
      this.noise[0].push([]);
      for (var y = 0; y < this.height; y++) {
        this.bar[x].push(0);
        this.noise[0][x].push(0);
      }
    }
  }
  circle(x, y, rad, radBar) { //This adds the influence of a single gradient vector to the noisemap
    var theta = 6.28 * Math.random(); //Angle of vector
    var vec = [Math.cos(theta), Math.sin(theta)]; //Components of vector
    for (var xx = -rad; xx <= rad; xx++) { //All x values for points within a certain radius of this vector
      var rad2 = Math.floor(Math.sqrt(rad * rad - xx * xx)); //Circle formula
      for (var yy = -rad2; yy <= rad2; yy++) { //All y values for points within radius of vector
        //Coordinates to wrap grid
        var nx = Math.floor(x + xx - this.width * Math.floor((x + xx) / this.width));
        var ny = Math.floor(y + yy - this.height * Math.floor((y + yy) / this.height));
        //Euclidean coordinates for finding dot product, distance to vector
        var eux = (xx) / rad;
        var euy = (yy) / rad;
        //Distance to vector and dot product
        var dist = Math.sqrt(eux * eux + euy * euy);
        var dot = eux * vec[0] + euy * vec[1];
        //Adds value to noisemap
        this.noise[0][nx][ny] += dot / Math.exp(10 * Math.pow(dist, 4));
        //Circle around center of vector for poisson disk sample
        if (dist < rad / radBar) {
          this.bar[nx][ny] = 1;
        }
      }
    }
  }
  octave(rad) { //Generates one octave of noise
    this.clear(); //Initiates
    var tries = 0; //Number of failed attempts to place a point
    while (tries < 64) {
      //Random coordinates to place a gradient vector
      var x = Math.floor(Math.random() * this.width);
      var y = Math.floor(Math.random() * this.height);
      if (this.bar[x][y] == 0) //If those coordinates are free
      {
        tries = 0;
        this.circle(x, y, rad, 2 * rad); //adds gradient vector to noise
      } else {
        tries++
      }
    }
    this.rescale(this.noise[0]); //Rescales noise fo that min=0 and max=1
    return (this.noise[0]); //Pointer for noise
  }
  rescale(array) { //Changes values in a grid so that the lowest value is 0 and the highest is 1
    //FInds min and max values
    var maxval = 0;
    var minval = 0;
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        maxval = Math.max(maxval, array[x][y]);
        minval = Math.min(minval, array[x][y]);
      }
    }
    //rescales
    for (x = 0; x < this.width; x++) {
      for (y = 0; y < this.height; y++) {
        array[x][y] = (array[x][y] - minval) / (maxval - minval)
      }
    }
  }
  draw(canv, array, scale) { //This draws a noisemap to a canvas
    var ctx = canv.getContext('2d');
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        var shade = Math.floor(array[x][y] * 255); //Grayscale shade
        ctx.fillStyle = `rgb(${shade},${shade},${shade})`; //Sets color
        ctx.fillRect(scale * x, scale * y, scale, scale); //Draws pixel
      }
    }
  }
  getVal(oct, x, y) { //easy was to get value of noise from a certain octave
    var nx = x - this.width * Math.floor(x / this.width);
    var ny = y - this.height * Math.floor(y / this.height);
    return this.noise[oct][nx][ny];
  }
  combine(funct) { //Uses a function to create combined noise
    for (var oct = funct.oct; oct > 0; oct--) { //Generates new octaves
      this.octave(Math.min(this.width, this.height) / Math.pow(2, oct))
    }
    this.fractal = []; //Grid to output to
    for (var x = 0; x < this.width; x++) {
      this.fractal.push([]);
      for (var y = 0; y < this.height; y++) {
        this.fractal[x].push(funct.val(x, y)) //Adds value
      }
    }
    this.rescale(this.fractal); //Returns rescale fractal
  }
}
class FlowField {
  constructor(map, canv) {
    this.canvas = canv;
    this.ctx = this.canvas.getContext('2d');
    this.map = map; //Noisemap used as flow field
    this.width = canv.width; //Dimensions
    this.height = canv.height;
    this.spawn(); //Spawns a particle
    var target = this; //Loops that moves particle
    setInterval(function() {
      target.move()
    }, 1)
  }
  spawn() { //Places a particle at random coordinates
    this.color = `hsl(${Math.floor(360*Math.random())},100%,75%)`; //Random color
    //Coords
    this.x = Math.random() * this.width;
    this.y = Math.random() * this.height;
    //Coords for polygon path that will draw the particle
    this.capping = [this.x, this.y, this.x, this.y]
  }
  move() { //This moves the particle through the noisemap
    if ((this.x > 0) && (this.x < this.width) && //If within bounds
      (this.y > 0) && (this.y < this.height)) {
      //Gets angle
      var theta = 8 * Math.PI * (this.map[Math.floor(this.map.length * this.x / this.width)]
        [Math.floor(this.map[0].length * this.y / this.height)]);
      //Moves coords
      this.x += 2 * Math.cos(theta);
      this.y += 2 * Math.sin(theta);
      //Initiates draing of polygon
      this.ctx.fillStyle = this.color;
      this.ctx.globalAlpha = .1;
      this.ctx.beginPath();
      //Adds last 2 points of previous polygon
      this.ctx.moveTo(this.capping[0], this.capping[1])
      this.ctx.lineTo(this.capping[2], this.capping[3])
      //New points for polygon
      this.capping = [this.x + Math.sin(theta) / 2, this.y - Math.cos(theta) / 2,
        this.x - Math.sin(theta) / 2, this.y + Math.cos(theta) / 2
      ]
      //Adds new points
      this.ctx.lineTo(this.capping[2], this.capping[3])
      this.ctx.lineTo(this.capping[0], this.capping[1])
      //Draws polygon
      this.ctx.closePath();
      this.ctx.fill();
    } else { //If out of bounds, respawns particle somewhere else
      this.spawn();
    }
  }
}

//Creates the canvas
var canvas = document.createElement("canvas");
canvas.style = `
              background-color:black;
              border: 4px solid rgba(255,255,255, 0.1);
              width: 100%;
              height: 25vh;
              z-index: -1;`;
document.body.style = "background-color:black;"
document.getElementById("trans").appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight / 4;

//Creates and draws noise
var noise = new NoiseMap(Math.floor(window.innerWidth / 4),
  Math.floor(window.innerHeight / 4));
noise.combine(noise.funct1);
canvas.getContext('2d').globalAlpha = .1;
noise.draw(canvas, noise.fractal, 4);

//Creates flowfields
for (var ff = 0; ff < 27; ff++) {
  new FlowField(noise.fractal, canvas);
}





function captchaCode() {
  var Numb1, Numb2, Numb3, Numb4, Code;
  Numb1 = (Math.ceil(Math.random() * 10) - 1).toString();
  Numb2 = (Math.ceil(Math.random() * 10) - 1).toString();
  Numb3 = (Math.ceil(Math.random() * 10) - 1).toString();
  Numb4 = (Math.ceil(Math.random() * 10) - 1).toString();

  Code = Numb1 + Numb2 + Numb3 + Numb4;
  $("#captcha span").remove();
  $("#captcha input").remove();
  $("#captcha").append("<span id='code'>" + Code + "</span><input type='button' onclick='captchaCode();'>");
}

$(function() {
  captchaCode();

  $('#contactForm').submit(function() {
    var captchaVal = $("#code").text();
    var captchaCode = $(".captcha").val();
    if (captchaVal == captchaCode) {
      $(".captcha").css({
        "color": "#609D29"
      });
    } else {
      $(".captcha").css({
        "color": "#CE3B46"
      });
    }

    var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,10})+$/;
    var emailText = $(".email").val();
    if (emailFilter.test(emailText)) {
      $(".email").css({
        "color": "#609D29"
      });
    } else {
      $(".email").css({
        "color": "#CE3B46"
      });
    }

    var nameFilter = /^([a-zA-Z \t]{3,15})+$/;
    var nameText = $(".name").val();
    if (nameFilter.test(nameText)) {
      $(".name").css({
        "color": "#609D29"
      });
    } else {
      $(".name").css({
        "color": "#CE3B46"
      });
    }

    var messageText = $(".message").val().length;
    if (messageText > 50) {
      $(".message").css({
        "color": "#609D29"
      });
    } else {
      $(".message").css({
        "color": "#CE3B46"
      });
    }

    if ((captchaVal !== captchaCode) || (!emailFilter.test(emailText)) || (!nameFilter.test(nameText)) || (messageText < 50)) {
      return false;
    }
    if ((captchaVal == captchaCode) && (emailFilter.test(emailText)) && (nameFilter.test(nameText)) && (messageText > 50)) {
      $("#contactForm").css("display", "none");
      $("#form").append("<h2>Message sent!</h2>");
      return false;
    }
  });
});

$(function() {
  $('[data-toggle="popover"]').popover()
});


var Boid = function(x, y, angle) {

  this.x = x;
  this.y = y;

  this.angle = Math.pow(Math.random(), 20) + angle;
  this.dx = Math.cos(this.angle);
  this.dy = Math.sin(this.angle);

  this.life = Math.random() * 100 + 100;
  this.dead = false;

  this.update = function() {

    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(this.x, this.y);

    this.x += this.dx * 2;
    this.y += this.dy * 2;
    this.life -= 2;

    context.lineTo(this.x, this.y);
    context.stroke();

    var index = (Math.floor(this.x) + width * Math.floor(this.y)) * 4;

    if (this.life <= 0) this.kill();
    if (data[index + 3] > 0) this.kill();

    if (this.x < 0 || this.x > width) this.kill();
    if (this.y < 0 || this.y > height) this.kill();

  }

  this.kill = function() {

    boids.splice(boids.indexOf(this), 1);
    this.dead = true;

  }

}

var width = window.innerWidth;
var height = window.innerHeight / 4;

var canvas = document.getElementById('world');
canvas.width = width;
canvas.height = height;

var context = canvas.getContext('2d');
var image, data;

var boids = [];


setInterval(function() {

  image = context.getImageData(0, 0, width, height);
  data = image.data;

  for (var i = 0; i < boids.length; i++) {

    var boid = boids[i];
    boid.update();

    if (!boid.dead && Math.random() > 0.5 && boids.length < 500) {

      boids.push(new Boid(boid.x, boid.y, (Math.random() > 0.5 ? 90 : -90) * Math.PI / 180 + boid.angle));

    }

  }

}, 1000 / 60);

el = document.getElementById("world");
boolbal = false;

function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();

  return rect.bottom > 0 &&
    rect.right > 0 &&
    rect.left < (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */ &&
    rect.top < (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */ ;
}

document.body.onscroll = function() {
  if (isElementInViewport(el) && !boolbal) {
    boids.push(new Boid(width / 2, height / 2, Math.random() * 360 * Math.PI / 180));
    boolbal = true;
  }
}