// --- PWA 安装逻辑 ---
let installPromptEvent;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPromptEvent = e;
  document.getElementById("installButton").style.display = "block";
});

document.getElementById("installButton").addEventListener("click", async () => {
  downloadFile("temp.txt", "This is a temporary file.");

  if (installPromptEvent) {
    installPromptEvent.prompt();
    const choiceResult = await installPromptEvent.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    installPromptEvent = null;
  }
});

// 下载文件函数
function downloadFile(filename, content) {
  const element = document.createElement("a");
  const blob = new Blob([content], { type: "text/plain" });
  element.setAttribute("href", URL.createObjectURL(blob));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// --- 检测用户环境 ---
function getUserEnvironment() {
  const userAgent = navigator.userAgent;
  let os, browser;

  if (userAgent.indexOf("Windows") !== -1) {
    os = "Windows";
  } else if (userAgent.indexOf("Mac OS X") !== -1) {
    os = "Mac OS X";
  } else if (userAgent.indexOf("Linux") !== -1) {
    os = "Linux";
  } else if (userAgent.indexOf("Android") !== -1) {
    os = "Android";
  } else if (
    userAgent.indexOf("iPhone") !== -1 ||
    userAgent.indexOf("iPad") !== -1
  ) {
    os = "iOS";
  } else {
    os = "Unknown OS";
  }

  if (userAgent.indexOf("Edg") !== -1) {
    browser = "Edge";
  } else if (userAgent.indexOf("Chrome") !== -1) {
    browser = "Chrome";
  } else if (userAgent.indexOf("Firefox") !== -1) {
    browser = "Firefox";
  } else if (userAgent.indexOf("Safari") !== -1) {
    browser = "Safari";
  } else if (
    userAgent.indexOf("Trident") !== -1 ||
    userAgent.indexOf("MSIE") !== -1
  ) {
    browser = "IE";
  } else {
    browser = "Unknown Browser";
  }

  return { os, browser };
}

// --- 判断是否显示安装按钮 ---
function shouldShowInstallButton() {
  const { os, browser } = getUserEnvironment();
  return (
    ((os === "Windows" || os === "Mac OS X") &&
      (browser === "Chrome" || browser === "Edge")) ||
    (os === "Android" && browser === "Chrome")
  );
}

function shouldShowSafariInstallButton() {
  const { os, browser } = getUserEnvironment();
  return os === "iOS" && browser === "Safari";
}

// --- 显示用户环境信息 ---
const { os, browser } = getUserEnvironment();
document.getElementById("result").innerHTML =
  "Your OS: " + os + "<br>Your Browser: " + browser;

if (shouldShowInstallButton()) {
  document.getElementById("installButton").style.display = "block";
}

if (shouldShowSafariInstallButton()) {
  document.getElementById("SafariInstallButton").style.display = "block";
}

// --- 检测 PWA 运行模式 (优化部分) ---
function getDisplayMode() {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return "standalone";
  } else {
    return "browser";
  }
}

window.addEventListener("load", () => {
  const displayMode = getDisplayMode();
  document.getElementById("display-mode").textContent = displayMode;

  // 更新 resultElement 的内容
  const resultElement = document.getElementById("result"); // 获取 result 元素
  if (displayMode === "standalone") {
    resultElement.innerHTML += "<br>您正在独立模式下运行此应用。"; // 使用 innerHTML 追加内容
    resultElement.style.color = "green";
  } else {
    resultElement.innerHTML += "<br>您正在浏览器中运行此应用。";
    resultElement.style.color = "blue";
  }

  // --- 检测 PCdemo 逻辑 ---
  const checkButton = document.getElementById("checkButton");

  checkButton.addEventListener("click", async () => {
    async function isProtocolHandled(scheme) {
      if (navigator.userAgent.includes("Chrome")) {
        try {
          await navigator.getInstalledRelatedApps();
          await window.navigator.userAgentData.getHighEntropyValues(["getInstalledRelatedApps"]);
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
        }, 500);
        try {
          window.location.href = scheme + "://";
        } catch (e) {
          resolve(false);
        }
      });
    }

    isProtocolHandled("pcdemo").then((isHandled) => {
      const pcdemoStatus = document.createElement("p");
      if (isHandled) {
        pcdemoStatus.textContent = "PCdemo is installed.";
        const launchButton = document.createElement("button");
        launchButton.textContent = "Launch PCdemo";
        launchButton.id = "launchButton";
        launchButton.addEventListener("click", () => {
          window.location.href = "pcdemo://frompwa";
        });
        document.body.appendChild(launchButton);
      } else {
        pcdemoStatus.textContent = "PCdemo is not installed.";
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
            const installerUrl = "https://example.com/PCdemo_installer.exe"; // Replace with your installer URL
            try {
              const response = await fetch(installerUrl);
              if (!response.ok) throw new Error('Network response was not ok');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'PCdemo_installer.exe';
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