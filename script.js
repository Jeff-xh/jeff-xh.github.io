let deferredPrompt; // 存储 PWA 安装提示事件

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // 阻止默认安装提示
  deferredPrompt = e; // 存储事件
  document.getElementById('installButton').style.display = 'block'; // 显示按钮
});

document.getElementById('installButton').addEventListener('click', async () => {
  // 触发下载
  downloadFile("temp.txt");

  if (deferredPrompt) {
    deferredPrompt.prompt(); // 显示安装提示
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('用户接受安装');
    } else {
      console.log('用户取消安装');
    }
    deferredPrompt = null; // 重置事件
  }
});

// 下载文件函数
function downloadFile(filename, content) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function getDisplayMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (document.referrer.startsWith('android-app://')) {
    return 'twa'; // 可信网络活动 (Trusted Web Activity)
  } else if (navigator.standalone || isStandalone) {
    return 'standalone'; // 独立模式
  }
  return 'browser'; // 浏览器模式
}

window.addEventListener('load', () => {
  const displayMode = getDisplayMode();
  const displayModeElement = document.getElementById('display-mode');
  displayModeElement.textContent = displayMode;
});
// ... (existing code in script.js)

const checkButton = document.createElement('button');
checkButton.textContent = 'Check for temp.txt';
checkButton.id = 'checkButton';
document.body.appendChild(checkButton);


checkButton.addEventListener('click', async () => {
    try {
        const dirHandle = await window.showDirectoryPicker({
            startIn: 'downloads', // Suggest starting in Downloads
            mode: 'read' // Ensure read-only access
        });

        const fileHandle = await dirHandle.getFileHandle('temp.txt', {create: false}); // Don't create if it doesn't exist

        // File exists!
        console.log("temp.txt exists in Downloads!");
        alert("temp.txt exists in Downloads!");
    } catch (error) {
        if (error.name === 'NotFoundError') {
            console.log("temp.txt does not exist in Downloads.");
            alert("temp.txt does not exist in Downloads.");
        } else {
          console.error("Error checking for file:", error);
          alert("An error occurred while checking for the file.");
        }

    }
});