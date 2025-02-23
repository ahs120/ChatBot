document.addEventListener("DOMContentLoaded", function () {
  // جميع عناصر الDOM
  const head = document.querySelector(".head");
  const container = document.querySelector(".container");
  const text = document.querySelector(".text");
  const sendBtn = document.querySelector("button.send-btn");
  const chat = document.querySelector(".chat");
  const emojiBtn = document.querySelector(".emoji-btn");
  const emojiPicker = document.querySelector(".emoji-picker");
  const previewContainer = document.querySelector(".preview-container");
  const fileInput = document.querySelector("#fileInput");
  let filesArray = [];
  const apiKey = "AIzaSyCHzki4Tg60hKKHkBnpuvEbT-JPxOJJZNc";
  const apiLink = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // تأكيد وجود العناصر قبل إضافة Event Listeners
  if (
    head &&
    container &&
    text &&
    sendBtn &&
    chat &&
    emojiBtn &&
    emojiPicker &&
    previewContainer &&
    fileInput
  ) {
    // Toggle chat
    head.addEventListener("click", () => {
      container.classList.toggle("chat-active");
    });

    // Emoji picker logic
    emojiBtn.addEventListener("click", () => {
      emojiPicker.classList.toggle("hidden");
    });

    emojiPicker.addEventListener("click", (e) => {
      if (e.target.tagName === "SPAN") {
        text.value += e.target.textContent;
        emojiPicker.classList.add("hidden");
      }
    });

    // File handling
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      filesArray = [...filesArray, ...files];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const previewItem = document.createElement("div");
          previewItem.className = "preview-item";
          previewItem.innerHTML = `
                      <img src="${event.target.result}" alt="${file.name}">
                      <div class="remove-btn">×</div>
                  `;
          previewContainer.appendChild(previewItem);

          previewItem
            .querySelector(".remove-btn")
            .addEventListener("click", () => {
              previewItem.remove();
              filesArray = filesArray.filter((f) => f !== file);
            });
        };
        reader.readAsDataURL(file);
      });
    });

    // Send message
    const sendUserMsg = async () => {
      const userMsg = text.value.trim();
      const images = filesArray;

      if (userMsg === "" && images.length === 0) return;

      if (userMsg) displayMessage(userMsg, "user");
      images.forEach((file) => displayImage(file));

      const parts = [];
      if (userMsg) parts.push({ text: userMsg });

      for (const file of images) {
        const base64 = await readFileAsBase64(file);
        parts.push({
          inline_data: {
            mime_type: file.type,
            data: base64.split(",")[1],
          },
        });
      }

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts }] }),
      };

      api(requestOptions);

      text.value = "";
      filesArray = [];
      previewContainer.innerHTML = "";
      chat.scrollTop = chat.scrollHeight;
    };

    // Event listeners
    sendBtn.addEventListener("click", sendUserMsg);
    text.addEventListener("keypress", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendUserMsg();
      }
    });

    document.querySelector(".file-btn").addEventListener("click", () => {
      fileInput.click();
    });
  } else {
    console.error("One or more elements are missing in the DOM");
  }

  // Helper functions
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function displayMessage(content, type) {
    const msg = document.createElement("p");
    msg.className = `${type}-msg`;
    msg.textContent = content;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  function displayImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.classList.add("user-msg");
      img.style.cssText = "width: 250px; margin-top: 5px;";
      chat.appendChild(img);
    };
    reader.readAsDataURL(file);
  }

  // API handling
  async function api(requestOptions) {
    try {
      const response = await fetch(apiLink, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const apiRes = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (apiRes) displayMessage(apiRes, "bot");
    } catch (error) {
      console.error("API Error:", error);
      displayMessage(
        "عذرًا، حدث خطأ في الإرسال. يرجى المحاولة مرة أخرى.",
        "bot"
      );
    }
  }
});
