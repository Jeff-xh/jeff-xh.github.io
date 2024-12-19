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
  if (document.referrer.startsWith("android-app://")) {
    return "twa"; // 可信网络活动 (Trusted Web Activity)
  } else if (navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) {
    return "standalone"; // 独立模式
  }
  return "browser"; // 浏览器模式
}

window.addEventListener("load", () => {
  const displayMode = getDisplayMode();
  document.getElementById("display-mode").textContent = displayMode;

  // 获取 "Check for PCdemo" 按钮
  const checkButton = document.getElementById("checkButton");

  checkButton.addEventListener("click", async () => {
    // 检测 PCdemo 是否存在的逻辑
    async function isProtocolHandled(scheme) {
      if (navigator.userAgent.includes("Chrome")) {
        // Workaround to detect in recent Chrome versions
        // See: https://developer.chrome.com/docs/web-platform/detect-installed-pwa/
        try {
          await navigator.getInstalledRelatedApps(); // Needs to be a PWA
          await window.navigator.userAgentData.getHighEntropyValues(["getInstalledRelatedApps"]); // Needs to be a secure context (HTTPS)
        } catch (e) {
          // Not a PWA or not a secure context, let's use the blur approach
        }
      }
      return new Promise((resolve) => {
        const onBlur = () => {
          resolve(true);
          clearTimeout(timeout);
          window.removeEventListener("blur", onBlur);
        };
        window.addEventListener("blur", onBlur);
        const timeout = setTimeout(() => {
          resolve(false);
          window.removeEventListener("blur", onBlur);
        }, 500); // 500ms has been a good timeout, but you can increase it.
        try {
          window.location.href = scheme + "://";
        } catch (e) {
          resolve(false);
        }
      });
    }

    // Check if the "pcdemo" protocol is handled
    isProtocolHandled("pcdemo").then((isHandled) => {
      const pcdemoStatus = document.createElement("p");
      if (isHandled) {
        pcdemoStatus.textContent = "PCdemo is installed.";
        // If installed, add a button to launch it
        const launchButton = document.createElement("button");
        launchButton.textContent = "Launch PCdemo";
        launchButton.id = "launchButton";
        launchButton.addEventListener("click", () => {
          window.location.href = "pcdemo://frompwa";
        });
        document.body.appendChild(launchButton);
      } else {
        pcdemoStatus.textContent = "PCdemo is not installed.";
        // If not installed, check for the installer in the Downloads folder
        checkForInstaller();
      }
      document.body.appendChild(pcdemoStatus);
    });

    async function checkForInstaller() {
      try {
        const dirHandle = await window.showDirectoryPicker({
          startIn: 'downloads',
          mode: 'read'
        });

        // Look for the installer file
        let installerFound = false;
        for await (const entry of dirHandle.values()) {
          if (entry.kind === "file" && entry.name === "PCdemo_installer.exe") {
            installerFound = true;
            const file = await entry.getFile();
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.textContent = 'Right-click here and choose "Show in folder" to open the installer location.';
            link.id = "installerLink";
            document.body.appendChild(link);
            break;
          }
        }

        if (!installerFound) {
          const downloadButton = document.createElement("button");
          downloadButton.textContent = "Download PCdemo Installer";
          downloadButton.id = "downloadButton";
          downloadButton.addEventListener("click", async () => {
            // Replace with your actual download logic
            const installerUrl = "https://example.com/PCdemo_installer.exe"; // Replace with your installer URL
            try {
              const response = await fetch(installerUrl);
              if (!response.ok) throw new Error('Network response was not ok');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'PCdemo_installer.exe'; // Or any other filename you prefer
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } catch (error) {
              console.error('Error downloading the installer:', error);
              alert('Failed to download installer.');
            }
          });
          document.body.appendChild(downloadButton);
        }
      } catch (error) {
        console.error("Error accessing the directory:", error);
        alert("An error occurred while accessing the Downloads directory.");
      }
    }
  });
});