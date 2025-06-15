/*
  createBY: ©ISAMI ABE 
  lastUpdate: 2025/06/15
  varsion: 1.0.0
*/  
  
window.addEventListener("DOMContentLoaded", ()=> {
  let targetURL = window.location.href; // use currentURL
 
  let lastOnlineState = true;

  function checkConnection() {
    const statusDispCanvas = document.body;
    function createInternetConnectionNoti(isOnlineInfo, otherMsg = "") {
      if (typeof isOnlineInfo === "boolean") {
        let bgColor, message = "unset";
        if (!isOnlineInfo) {
          message = "オンラインになりました";
          bgColor = "rgba(0,255,0,0.5)";
        } else {
          message = "オフラインになりました";
          bgColor = "rgba(255,0,0,0.5)";
        }

        const internetConnectStateDisp = document.createElement("connectState");
        Object.assign(internetConnectStateDisp.style, {
          display: "block",
          backgroundColor: bgColor,
          color: "#FFF",
          padding: "10px",
          position: "absolute",
          left: "0",
          right: "0",
          bottom: "0",
          overflowX: "auto",
          zIndex: "1000",
          webkitBackdropFilter: "blur(10px)",
          backdropFilter: "blur(10px)",
          textAlign: "center"
        });
        internetConnectStateDisp.textContent = message + otherMsg;

        setTimeout(()=> {
          internetConnectStateDisp.remove();
        }, 3000);

        statusDispCanvas.appendChild(internetConnectStateDisp);
      } else {
        console.error("error: this is deveropment miss function of use at problemd.");
      }
    }

    fetch(targetURL, { method: 'HEAD', cache: 'no-cache' })
      .then(response => {
        const isOnline = response.ok;

        if (isOnline !== lastOnlineState) {
          if (isOnline) {
            if (!lastOnlineState) {
              createInternetConnectionNoti(lastOnlineState);
            }
          } else {
            createInternetConnectionNoti(lastOnlineState);
          }

          lastOnlineState = isOnline;
        }
      })
      .catch(error => {
        if (lastOnlineState) {
          createInternetConnectionNoti(lastOnlineState, "その他の接続問題があるようです：" + error);
          lastOnlineState = false;
        }
      });
  }

  // 一定間隔ごとに接続状態をチェック
  setInterval(checkConnection, 1000);

  // 初期状態での接続状態をチェック
  checkConnection();
});