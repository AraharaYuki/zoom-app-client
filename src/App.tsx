import "./App.css";
import { ZoomMtg } from "@zoom/meetingsdk";

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

function App() {
  const authEndpoint = "http://localhost:4000"; // http://localhost:4000
  const sdkKey = "Nn2I_8mgTDWkEtA7dVlLg";
  const meetingNumber = "83162166212";
  const passWord = "rcn4B7";
  const role = 1;
  const userName = "React";
  const userEmail = "";
  const registrantToken = "";
  const zakToken = "";
  const leaveUrl = "http://localhost:5173";

  const getSignature = async () => {
    try {
      const req = await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingNumber: meetingNumber,
          role: role,
        }),
      });
      const res = await req.json()
      const signature = res.signature as string;
      startMeeting(signature)
    } catch (e) {
      console.log(e);
    }
  };

  function startMeeting(signature: string) {
    document.getElementById("zmmtg-root")!.style.display = "block";

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      patchJsMedia: true,
      leaveOnPageUnload: true,
      success: (success: unknown) => {
        console.log(success);
        // can this be async?
        ZoomMtg.join({
          signature: signature,
          sdkKey: sdkKey,
          meetingNumber: meetingNumber,
          passWord: passWord,
          userName: userName,
          userEmail: userEmail,
          tk: registrantToken,
          zak: zakToken,
          success: (success: unknown) => {
            console.log(success);
            const footer = document.getElementById('foot-bar');
            const fireBtn = document.createElement('button');
            fireBtn.textContent = '弾幕モード';
            fireBtn.onclick = () => {
              showChatPanel();
              fire();
            }
            footer?.appendChild(fireBtn);
          },
          error: (error: unknown) => {
            console.log(error);
          },
        });
      },
      error: (error: unknown) => {
        console.log(error);
      },
    });
  }

  return (
    <div className="App">
      <main>
        <h1>Hi!SHINGIへようこそ</h1>
        <button onClick={getSignature}>SHINGIを始める</button>
      </main>
    </div>
  );
}

const createText = (text: string) => {
  console.log("Display text : ", text);
  const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)
  var id = "video-share-layout"
  var textbox_element = document.getElementsByClassName(id)[0] as HTMLElement;

  if (textbox_element) {
    const height = parseFloat(textbox_element.style.height.replace("px", ""));
    var new_element = document.createElement('p');
    new_element.textContent = text;
    new_element.className = 'mytext';
    new_element.style.cssText = `top: ${randomNum(0, height)}px;`;
    textbox_element.appendChild(new_element);

    setTimeout(() => {
      textbox_element.removeChild(new_element);
    }, 6500);

  } else {
    console.error("テキストボックス要素が見つかりません");
  }
}

const showChatPanel = () => {
    const chatBtn = document.querySelector('[aria-label="open the chat panel"]') as HTMLElement;
    if (chatBtn) {
      chatBtn.click();
    } else {
      console.error("チャットボタンが見つかりませんでした");
    }
  // document.getElementById("wc-container-left").style.cssText = "width: 100%;"
}

let processedMessageIds = new Set();

function fire() {
  console.log("fire func executed!")

  setInterval(() => {
    let chatContainer = document.getElementsByClassName('ReactVirtualized__Grid__innerScrollContainer')[0];
    if (!chatContainer) {
      console.error("チャットコンテナが見つかりません");
      return;
    }

    let chatMessages = chatContainer.children;
    for(let i = chatMessages.length -1 ; i >= 0 ; i-- ) {
      const messageElement = chatMessages[i];
      const messageId = messageElement.id || `message-${i}`;
      const textElement = chatMessages[i].lastElementChild;

      if (processedMessageIds.has(messageId)) {
        continue;
      }
      
      if (textElement && textElement.textContent) {
        const text = textElement.textContent.trim();
        // const timestamp = new Date().getTime();
        // const messageId = `${text}-${i}-${timestamp}`;
 
        // console.log("生成されたmessageId: ", messageId);
        // console.log("現在のprocessMessageIds: ", processedMessageIds);

        console.log("新しい弾幕を表示: ", text);
        createText(text);
        processedMessageIds.add(messageId);
        console.log("追加後のprocessedMessageIds: ", Array.from(processedMessageIds));

        if (processedMessageIds.size > 100) {
          processedMessageIds.delete(processedMessageIds.values().next().value);
        }
      }
    }
  }, 1000)
}

export default App;
