let deferredPrompt; // 存储 PWA 安装提示事件

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // 阻止默认安装提示
  deferredPrompt = e; // 存储事件
  document.getElementById('installButton').style.display = 'block'; // 显示按钮
});

document.getElementById('installButton').addEventListener('click', async () => {
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