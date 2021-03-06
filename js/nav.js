const center = { x: 325, y: 175 };
const serv_dist = 250;
const pointer_dist = 172;
const pointer_distB = 10;
const pointer_time = 2;
const icon_size = 42;
const circle_radius = 38;
const text_top_margin = 18;
const tspan_delta = 16;
let last_index = 0;

//Array describes points for a whole circle in order to get
//the right curve
let half_circle = [
  { x: -serv_dist, y: 0 },
  { x: 0, y: serv_dist },
  { x: serv_dist, y: 0 },
  { x: 0, y: -serv_dist },
  { x: -serv_dist, y: 0 },
];

//A simple object is used in the tween to retrieve its values
var pivot_path = { x: half_circle[0].x, y: half_circle[0].y };
//name is used as the title for the bubble
//icon is the id of the corresponding svg symbol
const services_data = [
  { name: "about_me", icon: "about_me" },
  { name: "Portfolio", icon: "portfolio " },
  { name: "Engineering", icon: "engineering" },
  { name: "Project\nManagement", icon: "management" },
  { name: "Manufacturing\nIT", icon: "manufacturing" },
  { name: "Skill", icon: "skill" },
  { name: "Todo List", icon: "todo_list" },
];

const services = document.getElementById("service-collection");
const nav_container = document.getElementById("circle-nav-services");
const symbol_copy = document.getElementById("circle-nav-copy");
const use_copy = document.querySelector("use.nav-copy");

//Keeps code DRY avoiding namespace for element creation
function createSVGElement(el) {
  return document.createElementNS("http://www.w3.org/2000/svg", el);
}

//Quick setup for multiple attributes
function setAttributes(el, options) {
  Object.keys(options).forEach(function (attr) {
    el.setAttribute(attr, options[attr]);
  });
}

//Service bubbles are created dynamically
function addService(serv, index) {
  let group = createSVGElement("g");
  group.setAttribute("class", "service serv-" + index);

  /* This group is needed to apply animations in
    the icon and its background at the same time */
  let icon_group = createSVGElement("g");
  icon_group.setAttribute("class", "icon-wrapper");

  let circle = createSVGElement("circle");
  setAttributes(circle, {
    r: circle_radius,
    cx: center.x,
    cy: center.y,
  });
  let circle_shadow = circle.cloneNode();
  setAttributes(circle, {
    class: "shadow",
  });
  icon_group.appendChild(circle_shadow);
  icon_group.appendChild(circle);

  let symbol = createSVGElement("use");
  setAttributes(symbol, {
    x: center.x - icon_size / 2,
    y: center.y - icon_size / 2,
    width: icon_size,
    height: icon_size,
  });
  symbol.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    "#" + serv.icon
  );
  icon_group.appendChild(symbol);

  group.appendChild(icon_group);

  let text = createSVGElement("text");
  setAttributes(text, {
    x: center.x,
    y: center.y + circle_radius + text_top_margin,
  });

  let tspan = createSVGElement("tspan");
  if (serv.name.indexOf("\n") >= 0) {
    let tspan2 = tspan.cloneNode();
    let name = serv.name.split("\n");
    jQuery(tspan).text(name[0]);
    jQuery(tspan2).text(name[1]);

    setAttributes(tspan2, {
      x: center.x,
      dy: tspan_delta,
    });

    text.appendChild(tspan);
    text.appendChild(tspan2);
  } else {
    jQuery(tspan).text(serv.name);
    text.appendChild(tspan);
  }

  let service_bubble = jQuery(".serv-" + index);

  //Uses tween to look for right position
  twn_pivot_path.seek(index);
  TweenLite.set(service_bubble, {
    x: pivot_path.x,
    y: pivot_path.y,
    transformOrigin: "center center",
  });

  service_bubble.click(serviceClick);
}

//Creates pointer
function createPointer() {
  let service_pointer = createSVGElement("circle");
  service_pointer = document.querySelector("svg .pointer");
  let pointer_circle = [
    { x: 0, y: 0 },
    { x: pointer_dist, y: pointer_dist },
    { x: pointer_dist * 2, y: 0 },
    { x: pointer_dist, y: -pointer_dist },
    { x: 0, y: 0 },
  ];
  twn_pointer_path.to(service_pointer, pointer_time, {
    bezier: {
      values: pointer_circle,
      curviness: 1.5,
    },
    ease: Power0.easeNone,
    transformOrigin: "center center",
  });
}

//Defines behavior for service bubbles
function serviceClick(ev) {
  //There's always an active service
  jQuery(".service.active").removeClass("active");
  let current = jQuery(ev.currentTarget);
  current.addClass("active");

  //There's a "serv-*" class for each bubble
  let current_class = current.attr("class").split(" ")[1];
  let class_index = current_class.split("-")[1];

  //Hides current text of the main bubble
  jQuery(use_copy).addClass("changing");

  //Sets pointer to the right position
  twn_pointer_path.tweenTo(class_index * (pointer_time / (2 * 6)));
  //twn_pointerB_path.tweenTo(class_index * (pointer_time / (2 * 6)));
  let littleCircleRotate = document.getElementById("littleCircleRotate");
  let currentAngle = 0;
  let angle = 0;
  if (last_index == 0) currentAngle = 0;
  if (last_index == 1) currentAngle = 330;
  if (last_index == 5) currentAngle = 200;
  if (last_index == 6) currentAngle = 160;
  let range = Math.abs(last_index - class_index);
  if (range > 2) range -= 2;

  if (range == 4) mul = 2;
  if (last_index > class_index) {
    if (class_index == 0) angle = 360 + 720;
    if (class_index == 1) angle = 320 + 720;
    if (class_index == 5) angle = 200 + 720;
  } else {
    if (class_index == 1) angle = -410 - 360;
    if (class_index == 5) angle = -160 - 720;
    if (class_index == 6) {
      angle = -200 - 720;
      if (last_index == 5) angle = angle + 360;
    }
  }

  last_index = class_index;
  littleCircleRotate.setAttribute("dur", range * 0.3 + 0.8 + "s");
  littleCircleRotate.setAttribute("from", currentAngle + " 153 175");
  littleCircleRotate.setAttribute("to", angle + " 153 175");
  littleCircleRotate.beginElement();
  //After it's completely hidden, the text changes and becomes visible
  setTimeout(() => {
    let viewBoxY = 300 * class_index;
    symbol_copy.setAttribute("viewBox", "0 " + viewBoxY + " 300 300");
    jQuery(use_copy).removeClass("changing");
  }, 250);
}

window.addEventListener(
  "resize",
  function () {
    let height = document.getElementById("chart-container").clientHeight;
    document
      .getElementById("chart-container")
      .setAttribute("style", "width:" + height + "px");
  },
  true
);

function InitChange(class_index) {
  //Hides current text of the main bubble
  $("#nav-fullscreen").removeClass("open");
  $("#nav-overlay").removeClass("open");
  $("#mobile_nav_button").removeClass("open");
  $("#mobile_nav").removeClass("open");
  ChangePageFunction(class_index);
  jQuery(".service.active").removeClass("active");
  jQuery(".serv-" + class_index).addClass("active");
  jQuery(use_copy).addClass("changing");

  //Sets pointer to the right position
  twn_pointer_path.tweenTo(class_index * (pointer_time / (2 * 6)));
  //twn_pointerB_path.tweenTo(class_index * (pointer_time / (2 * 6)));
  let littleCircleRotate = document.getElementById("littleCircleRotate");
  let currentAngle = 0;
  let angle = 0;
  if (last_index == 0) currentAngle = 0;
  if (last_index == 1) currentAngle = 330;
  if (last_index == 5) currentAngle = 200;
  if (last_index == 6) currentAngle = 160;
  let range = Math.abs(last_index - class_index);
  if (range > 2) range -= 2;

  if (range == 4) mul = 2;
  if (last_index > class_index) {
    if (class_index == 0) angle = 360 + 720;
    if (class_index == 1) angle = 320 + 720;
    if (class_index == 5) angle = 200 + 720;
  } else {
    if (class_index == 1) angle = -410 - 360;
    if (class_index == 5) angle = -160 - 720;
    if (class_index == 6) {
      angle = -200 - 720;
      if (last_index == 5) angle = angle + 360;
    }
  }

  last_index = class_index;
  littleCircleRotate.setAttribute("dur", range * 0.3 + 0.8 + "s");
  littleCircleRotate.setAttribute("from", currentAngle + " 153 175");
  littleCircleRotate.setAttribute("to", angle + " 153 175");
  littleCircleRotate.beginElement();
}

function MusicControl() {
  if (this.wave.playing) {
    this.wave.onended();
    return;
  }
  this.wave.play();
}
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty("--vh", `${vh}px`);

function ChangePageFunction(pageNumber) {
  let page;
  document.getElementById("about_me_content").classList.add("hide_page");
  document.getElementById("portfolio_content").classList.add("hide_page");
  document.getElementById("skill_content").classList.add("hide_page");
  document.getElementById("todo_content").classList.add("hide_page");
  if (pageNumber == 0) {
    page = "about_me";
    document.getElementById("about_me_content").classList.remove("hide_page");
  }
  if (pageNumber == 1) {
    page = "portfolio";
    document.getElementById("portfolio_content").classList.remove("hide_page");
  }
  if (pageNumber == 5 || pageNumber == 2) {
    page = "skill";
    document.getElementById("skill_content").classList.remove("hide_page");
  }
  if (pageNumber == 6 || pageNumber == 3) {
    page = "todo";
    document.getElementById("todo_content").classList.remove("hide_page");
  }
  setTimeout(() => {
    location.href = "#" + page;
  }, 200);
}
function mobileNavOnclick() {
  $("#nav-fullscreen").toggleClass("open");
  $("#nav-overlay").toggleClass("open");
  $("#mobile_nav_button").toggleClass("open");
  $("#mobile_nav").toggleClass("open");
}

window.addEventListener("resize", () => {
  // We execute the same script as before
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
});
var twn_pivot_path = TweenMax.to(pivot_path, 12, {
  bezier: {
    values: half_circle,
    curviness: 1.5,
  },
  ease: Linear.easeNone,
});
var twn_pointer_path = new TimelineMax({ paused: true });
function NavInit() {
  //The object is animated with a duration based on how many bubbles
  //should be placed

  services_data.reduce((count, serv) => {
    addService(serv, count);
    return ++count;
  }, 0);

  //The variable is modified inside the function
  //but its also used later to toggle its class

  createPointer();

  //Adding it immediately triggers a bug for the transform
  setTimeout(
    () => jQuery("#service-collection .serv-0").addClass("active"),
    200
  );
  setTimeout(() => {
    let path = window.location.hash.substr(1);
    //console.log(path);
    if (path.search("portfolio") != -1) {
      InitChange(1);
    } else if (path.search("skill") != -1) {
      InitChange(5);
    } else if (path.search("todo") != -1) {
      InitChange(6);
    } else {
      InitChange(0);
    }
    document.getElementById("name").classList.add("afterAnim");
    $("#mobile_nav_button").removeClass("non_click");
  }, 0);
  setTimeout(() => {
    document.getElementById("contact_me").classList.remove("hide_page_two");
    document
      .getElementById("about_me_content")
      .classList.remove("hide_page_two");
    document
      .getElementById("portfolio_content")
      .classList.remove("hide_page_two");
    document.getElementById("skill_content").classList.remove("hide_page_two");
    document.getElementById("todo_content").classList.remove("hide_page_two");
  }, 0);
  setTimeout(() => {
    document.getElementById("big_bg_back").classList.remove("hide_page_two");
  }, 0);
  setTimeout(() => {
    const tempHeight = 500;
    document
      .getElementById("chart-container")
      .setAttribute(
        "style",
        "width:" + tempHeight + "px; height: " + tempHeight + "px;"
      );
  }, 0);
  setTimeout(() => {
    const tempHeight = document.getElementById("box").clientHeight;
    document
      .getElementById("chart-container")
      .setAttribute("style", "width:" + tempHeight + "px");
  }, 0);
}
