function connectWebSocket (url, message, callback, handleError) {
  if ('WebSocket' in window) {
    const ws = new WebSocket(url);
    ws.onopen = function () {
      ws.send(message);
    };
    ws.onmessage = function (event) {
      callback && callback(event.data);
      ws.close();
    };
    ws.onclose = function () {
    };
    ws.onerror = function (e) {
      handleError && handleError(e);
    };
  } else {
    callback && callback('WebSocket NOT supported by your Browser!');
  }
}

const wsUrl = 'wss://127.0.0.1:8987';

function vgcaGetVersion (callback, handleError) {
  connectWebSocket(`${ wsUrl }/GetVersion`, 'version', callback, handleError);
}

function vgcaGetCertinfo (callback, handleError) {
  connectWebSocket(`${ wsUrl }/GetCertInfo`, 'certinfo', callback, handleError);
}

function vgcaShowConfig() {
  connectWebSocket(`${wsUrl}/Config`, 'config');
}

function vgcaSignMsg (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/SignMsg`, message, callback, handleError);
}

function vgcaVerifyMsg (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/VerifyMsg`, message, callback, handleError);
}

function vgcaSignIncome (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/SignIncome`, message, callback, handleError);
}

function vgcaComment (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/Comment`, message, callback, handleError);
}

function vgcaSignApproved (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/SignApproved`, message, callback, handleError);
}

function vgcaSignIssued (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/SignIssued`, message, callback, handleError);
}

function vgcaSignAppendix (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/SignAppendix`, message, callback, handleError);
}

function vgcaSignCopy (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/SignCopy`, message, callback, handleError);
}

function vgcaSignXml (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/SignXML`, message, callback, handleError);
}

function vgcaVerifyXml (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/VerifyXML`, message, callback, handleError);
}

function vgcaSignJson (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/SignJson`, message, callback, handleError);
}

function vgcaVerifyJson (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/VerifyJson`, message, callback, handleError);
}

function vgcaSignFiles (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/SignFiles`, message, callback, handleError);
}

function vgcaSignLylich (message, callback, handleError) {
  connectWebSocket(`${ wsUrl }/SignLyLich`, message, callback, handleError);
}

export {
  vgcaComment,
  vgcaGetCertinfo,
  vgcaGetVersion,
  vgcaShowConfig,
  vgcaSignAppendix,
  vgcaSignApproved,
  vgcaSignCopy,
  vgcaSignFiles,
  vgcaSignIncome,
  vgcaSignIssued,
  vgcaSignJson,
  vgcaSignLylich,
  vgcaSignMsg,
  vgcaSignXml,
  vgcaVerifyJson,
  vgcaVerifyMsg,
  vgcaVerifyXml,
};
