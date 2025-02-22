const head = document.querySelector(".head");
const container = document.querySelector(".container");
const text = document.querySelector(".text");
const sendBtn = document.querySelector("button.send-btn");
const chat = document.querySelector(".chat");
const apiKey = "AIzaSyCHzki4Tg60hKKHkBnpuvEbT-JPxOJJZNc";
const apiLink = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
const addFile = document.querySelector("#addFile");
//  toggle chat
head.addEventListener("click", () => {
  container.classList.toggle("chat-active");
});

const sendUserMsg = () => {
  let userMsg = text.value;
  if (userMsg === "") return;
  let msg = document.createElement("p");
  msg.classList.add("user-msg");
  msg.textContent = userMsg;
  chat.appendChild(msg);
  api(userMsg);
  text.value = "";
  chat.scrollTop = chat.scrollHeight;
};
sendBtn.addEventListener("click", () => {
  sendUserMsg();
});
text.addEventListener("keypress", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendUserMsg();
  }
});

// get gemini api

const api = async (userMsg) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application / json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: userMsg }],
        },
      ],
    }),
  };

  try {
    const response = await fetch(apiLink, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    let apiRes = data.candidates[0].content.parts[0].text.trim();
    msgBot(apiRes);
  } catch (error) {
    console.log(data.error.message);
  }
};

const msgBot = (apiRes) => {
  let botMsg = document.createElement("p");
  botMsg.classList.add("bot-msg");
  botMsg.innerHTML = `<span></span><span></span><span></span>`;
  chat.appendChild(botMsg);
  setTimeout(() => {
    botMsg.textContent = apiRes;
  }, 600);
};

// handling image

document.querySelector(".add-file-btn").addEventListener("click", () => {
  addFile.click();
  // مستمع حدث "change" يتم إضافته مرة واحدة فقط
  addFile.addEventListener("change", (event) => {
    let data = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target.result;
      img.classList.add("user-msg");
      img.width = 250;
      img.height = 200;
      chat.appendChild(img);
      // إذا كنت تريد إرسال الصورة للـ API، تأكد من أن الـ API يدعم ذلك
      // api(img);
    };
    reader.readAsDataURL(data);
  });

  // عند النقر على زر إضافة الملف، يتم فقط فتح نافذة اختيار الملف
  document.querySelector(".add-file-btn").addEventListener("click", () => {
    addFile.click();
  });
});
