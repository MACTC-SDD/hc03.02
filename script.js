// We use setInterval to run this every 30ms
function moveImage() {
  // TODO: Add xSpeed to x
  // TODO: Add ySpeed to y

  // Check left/right edges
  if (x + img.width >= container.offsetWidth ||
     x <= 0)
  {
    // Things to do if we hit the edge
    // reverse X direction
  }
  
  // Check top/bottom edges
  if (y + img.height >= container.offsetHeight ||
      y <= 0)
  {
    // Things to do if we hit the edge
    // reverse Y direction 

  }


  // TODO: Set the 'left' property
  // TODO: Set the 'top' property
}

// Take an element as a parameter
// Generate three random 0-255 values and use those for RGB
function rndC(element)
{
  let r = Math.floor(Math.random() * 255);
  let g = Math.floor(Math.random() * 255);
  let b = Math.floor(Math.random() * 255);

  element.style.setProperty('background-color', `rgb(${r},${g},${b})`);
}

// Change speed settings. This is useful because the speed might 
// be negative and we want to adjust for that.
// Not needed until Stage 6
function setXSpeed(newValue)
{
  xSpeed = Math.abs(xSpeed) / xSpeed * newValue;
}

function setYSpeed(newValue)
{
  xSpeed = Math.abs(ySpeed) / ySpeed * newValue;
}

// Change how long we delay between frames (Stage 6)
function resetInterval()
{
  clearInterval(intervalId);
  intervalId = setInterval(moveImage, Number(delay.value));
  updateFpsDisp();
}

// Update frames/second display (Stage 6)
function updateFpsDisp()
{
  fpsDisp.innerHTML = Math.floor(1000 / delay.value) + "fps";  
}

