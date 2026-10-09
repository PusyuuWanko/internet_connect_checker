/*****************************************
  *----------------------------------
  |  ThisStyleVersion: 1.3.0      |
  |  © ISAMI ABE                  |
  |  LastUpdate: 2026-07-30       |
  |  License: MIT License         |
  |  internet_checker (ES5 only)  |
----------------------------------*
  IEのような古いブラウザでも動作するよう、意図的にES5構文のみで書く
  (const/let、アロー関数、テンプレートリテラル、デフォルト引数、
  String.prototype.startsWith/includes、fetch/Promiseは使用しない。
  通信はXMLHttpRequestで行う)。
******************************************/
window.addEventListener("DOMContentLoaded", function() {
  function generateURL() {
    var currentUrl = window.location.href;
    var useParam = 'P-internetChecker=プシュッとな！！';
    return (window.location.search.indexOf("?") === 0) ? currentUrl + '&' + useParam : currentUrl + '?' + useParam;
  }
  var targetURL = generateURL();
  var lastOnlineState = true; // 解釈としては、このJSが呼び出せてるなら最終のオンラインの状態は、ハイになる。そのため初期値をtrue
  var consoleId = null;
  var dispEle = document.body;
  var msgEleWrap = document.createElement("div");
  msgEleWrap.innerHTML = "";
  dispEle.appendChild(msgEleWrap);

  if (typeof Element.prototype.remove !== 'function') {
    Element.prototype.remove = function() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }

  function onSiteMsg(dispHtml) {
    if (typeof dispHtml === "undefined") {
      dispHtml = "表示するHTMLが指定されていません。";
    }
    var statusDisp = document.createElement("div");
    statusDisp.style.position = "fixed";
    statusDisp.style.bottom = "15%";
    statusDisp.style.left = "5%";
    statusDisp.style.right = "5%";
    statusDisp.style.color = "#ff0000";
    statusDisp.style.borderRadius = "10px";
    statusDisp.style.background = "rgba(255,255,255,0.5)";
    statusDisp.style.transition = "0.3s";
    statusDisp.style.backdropFilter = "blur(3px)";
    statusDisp.style.padding = "15px";
    statusDisp.style.pointerEvents = "none";
    statusDisp.innerHTML = dispHtml;
    msgEleWrap.appendChild(statusDisp);
    setInterval(function () {
      if (lastOnlineState) {
        setTimeout(function() {
          statusDisp.style.left = "-100%";
          statusDisp.style.opacity = "0";
          setTimeout(function () {
            statusDisp.remove();
          }, 500);
        }, 5000);
      }
    }, 1000);
  }

  function createMsg(dispContent, whyMsg, curentConsoleId) {
    if (typeof dispContent === "undefined") { dispContent = "表示値が設定されていません。"; }
    if (typeof whyMsg === "undefined") { whyMsg = "normal"; }
    if (typeof curentConsoleId === "undefined") { curentConsoleId = null; }
    var msgEle = document.createElement("div");

    function removeMsg() {
      setTimeout(function() {
        msgEle.style.bottom = "-10%";
        msgEle.style.opacity = "0";
        setTimeout(function () {
          msgEle.remove();
        }, 500);
      }, 5000);
    }

    if (whyMsg === "normal") {
      msgEle.style.backgroundColor = "rgba(100,255,100,0.5)";
      removeMsg();
    } else if (whyMsg === "warning") {
      msgEle.style.backgroundColor = "rgba(255,255,100,0.5)";
      removeMsg();
    } else if (whyMsg === "error") {
      msgEle.style.backgroundColor = "rgba(255,100,100,0.5)";
      onSiteMsg(
        '<div>' +
          '<i>現在サーバーとの接続が切断されています。”元に戻れなくなるためオンラインに戻るまでリロードに注意してください。”</i>' +
        '</div>'
      );
      removeMsg();
    } else {
      console.error("色の指定に誤りがあるため色付けできませんでした。");
    }

    if (consoleId !== curentConsoleId) {
      consoleId = curentConsoleId;
      msgEle.style.position = "fixed";
      msgEle.style.transition = "all 0.3s";
      msgEle.style.bottom = "-10%";
      msgEle.style.left = "0";
      msgEle.style.right = "0";
      msgEle.style.zIndex = "100";
      msgEle.style.textAlign = "center";
      msgEle.style.backdropFilter = "blur(5px)";
      msgEle.style.webkitBackdropFilter = "blur(5px)";
      msgEle.style.padding = "10px";
      setTimeout(function() {
        msgEle.style.bottom = "0";
      }, 500);
      msgEle.textContent = dispContent;
      msgEleWrap.appendChild(msgEle);
    }
  }

  // fetchはIEに存在しないため、XMLHttpRequest(古いIE向けにActiveXObjectの
  // フォールバックも含む)で同等の疎通確認を行う。
  function checkConnection() {
    var xhr = null;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      try {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e) {
        xhr = null;
      }
    }
    if (!xhr) {
      return; // 通信手段が無い環境では何もできないため何もしない
    }

    try {
      xhr.open("HEAD", targetURL, true);
    } catch (openError) {
      return;
    }

    try {
      xhr.setRequestHeader("X-App-Source", "P-interntChecker");
    } catch (headerError) {
      // ヘッダー設定に失敗しても通信自体は続行する
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status === 0) {
        // ネットワーク自体に到達できなかった場合(オフライン相当)
        if (lastOnlineState) {
          createMsg("接続状態: オフライン", "error", "error1");
          lastOnlineState = false;
        }
        return;
      }
      var isOnline = xhr.status >= 200 && xhr.status < 300;
      if (isOnline !== lastOnlineState) { //最初のアクセスはオンライン扱いに決まっている、なぜならばこのJSが呼べてるから、そのためelse節
        if (isOnline) {
          if (!lastOnlineState) {
            createMsg("接続状態: オンライン", "normal", xhr.status);
          }
        } else {
          createMsg("コンテンツ表示エラー：接続はオンラインですがコンテンツの表示に問題があるようです、エラーの内容は：" + xhr.status + "です。", "warning", xhr.status);
        }
        lastOnlineState = isOnline;
      }
    };

    try {
      xhr.send();
    } catch (sendError) {
      if (lastOnlineState) {
        createMsg("接続状態: オフライン", "error", "error1");
        lastOnlineState = false;
      }
    }
  }

  setInterval(checkConnection, 1000);
  checkConnection();
});
