"use strict";

const socket = io();
const usersEl = document.querySelector("#users");
const messages = document.querySelector("#messages");
const form = document.querySelector("#message-form");
const input = document.querySelector("#message-form input");
const sendGeolocation = document.querySelector("#send-geolocation");
let messageValue;

input.addEventListener("change", e => {
  messageValue = e.target.value;
});

socket.on("connect", () => {
  socket.emit("join", deParam(), function(err) {
    if (err) {
      alert(err);
      location.href = "/";
    } else {
      console.log(`No err`);
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    socket.emit(
      "createMessage",
      {
        text: messageValue
      },
      res => {
        console.log(res);
        input.value = "";
      }
    );
  });
});

socket.on("disconnect", () => {
  console.log(`Disconnected from the server`);
});

socket.on("updateUsersList", function(users) {
  const ol = document.createElement("ol");
  users.forEach(user => {
    const li = document.createElement("li");
    li.innerText = user;
    ol.appendChild(li);
  });
  usersEl.appendChild(ol);
});

socket.on("newMessage", message => {
  const li = document.createElement("li");
  li.setAttribute("class", "message");
  const messageTitle = document.createElement("div");
  messageTitle.setAttribute("class", "message__title");
  const messageTitleH4 = document.createElement("h4");
  messageTitleH4.innerText = message.from;
  const messageTitleSpan = document.createElement("span");
  messageTitleSpan.innerText = message.createdAt;
  messageTitle.appendChild(messageTitleH4);
  messageTitle.appendChild(messageTitleSpan);
  li.appendChild(messageTitle);
  const messageBody = document.createElement("div");
  messageBody.setAttribute("class", "message__body");
  const messageBodyP = document.createElement("p");
  messageBodyP.innerText = message.text;
  messageBody.appendChild(messageBodyP);
  li.appendChild(messageBody);
  messages.appendChild(li);
  scrollToBottom();
});

socket.on("newLocationMessage", message => {
  const li = document.createElement("li");
  const messageBody = document.createElement("div");
  messageBody.setAttribute("class", "message__body");
  const a = document.createElement("a");
  a.setAttribute("href", message.url);
  a.setAttribute("target", "_blank");
  a.innerText = `My Current Location`;
  messageBody.appendChild(a);
  li.setAttribute("class", "message");
  const messageTitle = document.createElement("div");
  messageTitle.setAttribute("class", "message__title");
  const messageTitleH4 = document.createElement("h4");
  messageTitleH4.innerText = message.from;
  const messageTitleSpan = document.createElement("span");
  messageTitleSpan.innerText = message.createdAt;
  messageTitle.appendChild(messageTitleH4);
  messageTitle.appendChild(messageTitleSpan);
  li.appendChild(messageTitle);
  li.appendChild(messageBody);
  messages.appendChild(li);
  scrollToBottom();
});

socket.on("greetingMessage", message => {
  const li = document.createElement("li");
  li.setAttribute("class", "message");
  const messageTitle = document.createElement("div");
  messageTitle.setAttribute("class", "message__title");
  const messageTitleH4 = document.createElement("h4");
  messageTitleH4.innerText = message.from;
  const messageTitleSpan = document.createElement("span");
  messageTitleSpan.innerText = message.createdAt;
  messageTitle.appendChild(messageTitleH4);
  messageTitle.appendChild(messageTitleSpan);
  li.appendChild(messageTitle);
  const messageBody = document.createElement("div");
  messageBody.setAttribute("class", "message__body");
  const messageBodyP = document.createElement("p");
  messageBodyP.innerText = message.text;
  messageBody.appendChild(messageBodyP);
  li.appendChild(messageBody);
  messages.appendChild(li);
});

sendGeolocation.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Your browser doesn't support GeoLocation");
  navigator.geolocation.getCurrentPosition(
    position => {
      socket.emit("createLocationMessage", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    () => {
      alert("Unable to fetch GeoLocation");
    }
  );
});

function scrollToBottom() {
  const messages = document.querySelector("#messages");
  const scrollHeight = messages.scrollHeight;
  const clientHeight = messages.clientHeight;
  const scrollTop = messages.scrollTop;
  if (clientHeight + scrollTop != scrollHeight) {
    messages.scrollTop = scrollHeight;
  }
}

function deParam() {
  const object = {};
  let fullPath = location.search.split("?")[1];
  fullPath = fullPath.split("&");
  fullPath.forEach(path => {
    const middlePath = path.split("=");
    object[middlePath[0]] = middlePath[1].replace("+", " ");
  });
  return object;
}
