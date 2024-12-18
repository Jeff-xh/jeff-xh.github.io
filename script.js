let installPromptEvent; // 用于存储 PWA 安装提示事件

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); // 阻止默认安装提示
  installPromptEvent = e; // 存储事件
  document.getElementById("installButton").style.display = "block"; // 显示安装按钮
});

document.getElementById("installButton").addEventListener("click", async () => {
  // 触发下载文件
  downloadFile("temp.txt", "This is a temporary file.");

  if (installPromptEvent) {
    installPromptEvent.prompt(); // 显示安装提示
    const choiceResult = await installPromptEvent.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    installPromptEvent = null; // 重置事件
  }
});

// 下载文件函数
function downloadFile(filename, content) {
  const element = document.createElement("a");
  // 使用 Blob 对象处理数据，可以处理更多类型的数据
  const blob = new Blob([content], { type: "text/plain" });
  element.setAttribute("href", URL.createObjectURL(blob));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// 获取 PWA 显示模式
function getDisplayMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (document.referrer.startsWith('android-app://')) {
    return 'twa'; // 可信网络活动 (Trusted Web Activity)
  } else if (navigator.standalone || isStandalone) {
    return 'standalone'; // 独立模式
  }
  return 'browser'; // 浏览器模式
}

window.addEventListener("load", () => {
  const displayMode = getDisplayMode();
  document.getElementById("display-mode").textContent = displayMode;

  // 创建检查按钮
  const checkButton = document.createElement("button");
  checkButton.textContent = "Check for temp.txt";
  checkButton.id = "checkButton";
  document.body.appendChild(checkButton);

  checkButton.addEventListener("click", async () => {
    try {
      const dirHandle = await window.showDirectoryPicker({
        startIn: "downloads", // 建议起始目录为下载目录
        mode: "read", // 只读模式
      });

      // 遍历目录中的所有文件
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file" && entry.name === "temp.txt") {
          console.log("temp.txt exists in Downloads!");
          alert("temp.txt exists in Downloads!");
          return; // 找到文件后退出循环
        }
      }

      // 循环结束未找到文件
      console.log("temp.txt does not exist in Downloads.");
      alert("temp.txt does not exist in Downloads.");
    } catch (error) {
      console.error("Error checking for file:", error);
      alert("An error occurred while checking for the file.");
    }
  });
});
